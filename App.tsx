import NetInfo from "@react-native-community/netinfo";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  AppState,
} from "react-native";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import {
  NavigationContainer,
  useFocusEffect,
  DarkTheme,
} from "@react-navigation/native";
import type { LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type {
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

// ============================================================
// P3 — 네비게이션 (앱 뼈대)
//
// 웹 라우팅과 다른 핵심:
//  1) URL/브라우저 history 없음. 화면을 "스택"에 push/pop. 뒤로가기 = 하드웨어/제스처.
//  2) 라우팅 = 리액트 컴포넌트 트리(NavigationContainer 안 네비게이터). <a href> 없음.
//  3) 인증 게이트 = redirect 아님. 로그인 상태에 따라 "다른 네비게이터를 렌더"
//     → 로그아웃 시 인증된 스택이 언마운트되어 뒤로가기로 못 돌아감(자동 보안).
//  4) params = URL 쿼리 아님. navigate('Detail', {id}) 로 넘기고 route.params로 받음. 타입 지정 필수.
//  5) 화면 생명주기: useEffect는 최초 마운트만. 탭 전환/뒤로 복귀 감지는 useFocusEffect.
// ============================================================

// ---- 타입 안전 파라미터: 각 네비게이터의 화면→파라미터 맵 ----
// undefined = 파라미터 없음. 객체 = 필수 파라미터.
type HomeStackParamList = {
  FeedList: undefined;
  // title 옵셔널 — 앱 내 navigate는 넘기지만 딥링크(feed/:id)는 id만 줌. 화면은 id로 조회.
  FeedDetail: { id: string; title?: string };
};
type TabParamList = {
  HomeTab: undefined;
  ProfileTab: undefined;
};
type RootStackParamList = {
  Tabs: undefined;
  Compose: undefined; // 모달로 띄울 화면
};
type AuthStackParamList = {
  Login: undefined;
};

// ---- 인증 상태: 라이브러리 없이 Context + useState (ponytail: 로그인 게이트 개념 학습이 목적) ----
type Auth = {
  user: string | null;
  signIn: (name: string) => void;
  signOut: () => void;
};
const AuthContext = createContext<Auth>({
  user: null,
  signIn: () => {},
  signOut: () => {},
});
const useAuth = () => useContext(AuthContext);

// ---- 네비게이터 인스턴스 (제네릭으로 파라미터 타입 주입) ----
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

// ============================================================
// 화면들
// ============================================================

// ============================================================
// P4 — TanStack Query 무한스크롤 (실 API)
//
// 웹과 다른 핵심: 스크롤 이벤트 직접 안 씀. FlatList onEndReached가 다음 페이지 트리거.
//  - useInfiniteQuery: data.pages = 페이지별 배열의 배열(2차원). flat()으로 펼쳐 FlatList에 전달.
//  - getNextPageParam: 다음 페이지 번호 리턴 = 계속, undefined = 끝.
//  - onEndReached 가드(hasNextPage && !isFetchingNextPage) 없으면 중복 호출 폭탄.
// ============================================================
const PAGE_SIZE = 10;
const API = "https://jsonplaceholder.typicode.com/posts";

type Post = { id: number; title: string; body: string };

async function fetchPosts(page: number): Promise<Post[]> {
  const res = await fetch(`${API}?_page=${page}&_limit=${PAGE_SIZE}`);
  if (!res.ok) throw new Error(`목록 불러오기 실패 (${res.status})`);
  return res.json();
}

async function fetchPost(id: string): Promise<Post> {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) throw new Error(`글 불러오기 실패 (${res.status})`);
  return res.json();
}

const queryClient = new QueryClient();
// onlineManager 연결하기
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});
focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener("change", (state) => {
    handleFocus(state === "active");
  });
  return () => sub.remove();
});

// 목록: FeedList → 항목 누르면 FeedDetail로 이동 (타입 안전 params)
function FeedListScreen({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "FeedList">) {
  // 탭을 떠났다 돌아올 때마다 로그 (useEffect는 최초 1회만이라 이걸 못 잡음)
  useFocusEffect(
    useCallback(() => {
      console.log("FeedList 포커스됨");
      return () => console.log("FeedList 블러됨");
    }, []),
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isPending,
    isPaused,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: 1,
    // 마지막 페이지가 PAGE_SIZE 미만 = 더 없음 → undefined로 종료
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length + 1,
  });

  // data.pages(2차원) → flat으로 1차원화. FlatList는 평평한 배열만 받음.
  const posts = data?.pages.flat() ?? [];

  // 4상태 ①최초 로딩 ②에러 (③빈 ④정상은 아래 FlatList가 처리)
  if (isPending) {
    return (
      <View style={[styles.screen, styles.center, styles.pad]}>
        {isPaused ? (
          // 오프라인이라 쿼리가 pause됨 → 스피너면 무한로딩처럼 보임. 안내로 대체.
          <Text style={styles.hint}>
            오프라인 — 연결되면 자동으로 불러옵니다
          </Text>
        ) : (
          <ActivityIndicator color="#93c5fd" />
        )}
      </View>
    );
  }
  if (isError) {
    return (
      <View style={[styles.screen, styles.pad, styles.center]}>
        <Text style={styles.h1}>에러</Text>
        <Text style={styles.hint}>{(error as Error).message}</Text>
        <Btn label="다시 시도" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* 데이터 있는데 새로고침이 오프라인으로 막힌 상태 = pause. 배너로 알림. */}
      {isPaused && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>오프라인 — 저장된 내용 표시 중</Text>
        </View>
      )}
      <FlatList
        style={styles.screen}
        contentContainerStyle={styles.pad}
        data={posts}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#93c5fd"
            colors={["#93c5fd"]}
          />
        }
        ListEmptyComponent={<Text style={styles.hint}>글이 없음</Text>}
        // 가드 2개 없으면 스크롤 튐마다 중복 호출
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color="#93c5fd"
              style={{ paddingVertical: 16 }}
            />
          ) : null
        }
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <>
            <Text style={styles.hint}>
              아래로 스크롤 = 다음 페이지 자동 로드. 당겨서 새로고침.
            </Text>
            {/* 모달은 조상 네비게이터(RootStack) 소유. getParent로 올라가 navigate.
                  navigate 액션은 처리 가능한 네비게이터까지 자동으로 버블링됨. */}
            <Btn
              label="＋ 새 글 (모달 열기)"
              onPress={() =>
                navigation
                  .getParent<NativeStackNavigationProp<RootStackParamList>>()
                  ?.navigate("Compose")
              }
            />
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            // navigate 인자가 HomeStackParamList['FeedDetail'] 모양이 아니면 컴파일 에러
            onPress={() =>
              navigation.navigate("FeedDetail", {
                id: String(item.id),
                title: item.title,
              })
            }
          >
            <Image
              source={{ uri: `https://picsum.photos/seed/${item.id}/100/100` }}
              style={styles.thumb}
              // ★ FlatList가 행 View를 재활용 → recyclingKey 없으면 스크롤 시
              //   이전 item 썸네일이 잠깐 남아 깜빡임. 키 바뀌면 즉시 리셋.
              recyclingKey={String(item.id)}
              cachePolicy="memory-disk" // 메모리+디스크 캐시 → 되돌아가도 재요청 없음
              transition={200} // 페이드인, 툭 튀는 느낌 제거
              contentFit="cover"
            />
            <Text
              style={[styles.rowTitle, styles.rowTitleFlex]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text style={styles.rowSub}>#{item.id}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

// 상세: route.params의 id로 단건 조회. 딥링크(picsel://feed/:id)로 목록 없이 바로
// 들어와도 자립하도록 목록 캐시가 아닌 자체 useQuery로 가져온다.
function FeedDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "FeedDetail">) {
  const { id } = route.params;
  const {
    data: post,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
  });

  if (isPending) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color="#93c5fd" />
      </View>
    );
  }
  if (isError) {
    return (
      <View style={[styles.screen, styles.pad, styles.center]}>
        <Text style={styles.h1}>에러</Text>
        <Text style={styles.hint}>{(error as Error).message}</Text>
        <Btn label="다시 시도" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, styles.pad]}>
      <Text style={styles.h1}>{post.title}</Text>
      <Text style={styles.body}>{post.body}</Text>
      <Text style={styles.rowSub}>딥링크: picsel://feed/{id}</Text>
      <Btn
        label="같은 화면 push (스택 쌓기)"
        onPress={() => navigation.push("FeedDetail", route.params)}
      />
      <Btn
        label="← 뒤로 (pop)"
        onPress={() => navigation.goBack()}
        kind="ghost"
      />
    </View>
  );
}

// Home 탭 내부 스택: List ↔ Detail. (탭 하나가 자체 네비게이션 히스토리를 가짐 = 중첩)
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={stackHeader}>
      <HomeStack.Screen
        name="FeedList"
        component={FeedListScreen}
        options={{ title: "피드" }}
      />
      <HomeStack.Screen
        name="FeedDetail"
        component={FeedDetailScreen}
        options={{ title: "상세" }}
      />
    </HomeStack.Navigator>
  );
}

// Profile 탭: 로그아웃 → 인증 네비게이터로 자동 전환됨 (redirect 코드 없음)
function ProfileScreen(_: BottomTabScreenProps<TabParamList, "ProfileTab">) {
  const { user, signOut } = useAuth();
  return (
    <View style={[styles.screen, styles.pad]}>
      <Text style={styles.h1}>{user}</Text>
      <Text style={styles.hint}>
        로그아웃하면 이 스택 전체가 언마운트 → 뒤로가기로 못 돌아옴.
      </Text>
      <Btn label="로그아웃" onPress={signOut} kind="danger" />
    </View>
  );
}

// 탭 네비게이터 (Home 스택 + Profile)
function TabsScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: "#fff",
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#93c5fd",
        tabBarInactiveTintColor: "#8a92a6",
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          title: "홈",
          headerShown: false, // 내부 스택이 헤더 담당 → 중복 방지
          tabBarLabel: "홈",
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: "프로필", tabBarLabel: "프로필" }}
      />
    </Tab.Navigator>
  );
}

// 모달 화면 (RootStack에서 presentation:'modal'로 등록 → 아래에서 위로 슬라이드)

const AVATAR_SOURCE = { uri: "https://picsum.photos/200" };
function ComposeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Compose">) {
  const [isLoading, setIsLoading] = useState(true);
  const bodyRef = useRef<TextInput>(null);
  const headerHeight = useHeaderHeight();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const insets = useSafeAreaInsets();
  return (
    // 바깥 = screen(flex:1, 배경). 화면 꽉 채움.
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={headerHeight as number}
    >
      {/* 내용 = flex:1로 자라서 footer를 바닥으로 밀어냄 (sticky footer 원리) */}
      <ScrollView
        contentContainerStyle={[styles.pad, styles.modal, { flexGrow: 1 }]}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.h1}>새 글 (모달)</Text>
        <Text style={styles.hint}>
          {
            "presentation:'modal' → 카드가 아래서 위로. 스와이프 다운으로 닫힘(iOS)."
          }
        </Text>
        <TextInput
          value={title}
          autoCorrect
          onChangeText={setTitle} // ← 웹 onChange 아님. 문자열 바로 옴
          placeholder="제목"
          placeholderTextColor="#8a92a6" // 다크배경 → 회색 직접 (#8a92a6 등)
          style={styles.input}
          returnKeyType="next"
          onSubmitEditing={() => bodyRef.current?.focus()}
          submitBehavior="submit"
        />
        <TextInput
          ref={bodyRef}
          value={body}
          onChangeText={setBody}
          placeholder="본문"
          placeholderTextColor="#8a92a6"
          multiline
          style={[styles.input, styles.inputMultiline]}
          autoCorrect
          maxLength={20}
        />
        <Text style={styles.length}>{body.length} / 20</Text>
        <View style={{ width: 200, height: 200 }}>
          <Image
            cachePolicy="disk"
            source={AVATAR_SOURCE}
            style={{ width: 200, height: 200 }}
            contentFit="cover"
            onLoadStart={() => setIsLoading(true)}
            onLoad={() => setIsLoading(false)}
            onLoadEnd={() => setIsLoading(false)}
            onError={(error) => {
              setIsLoading(false);
              console.error(error.error);
            }}
          />
          {isLoading && (
            <ActivityIndicator
              style={{ position: "absolute", top: 90, left: 90 }}
            />
          )}
        </View>
      </ScrollView>
      {/* 바닥 바 = 버튼만. inset은 정적 스타일 아니므로 inline으로 덧댐. */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.btn_ghost,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => {
            navigation.goBack();
          }}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          android_ripple={{ color: "#2b3446", radius: 80 }}
        >
          <Text style={[styles.btnText, { color: "#93c5fd" }]}>닫기</Text>
        </Pressable>
        <Btn
          label="저장"
          onPress={() => {
            console.log("저장:", title, body); // ponytail: 실제 저장 로직(서버/스토어) 없음. 학습 목적
            navigation.goBack();
          }}
          disabled={title.trim() === "" || body.trim() === ""}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// 로그인 화면 (미인증 시 유일 화면)
function LoginScreen(_: NativeStackScreenProps<AuthStackParamList, "Login">) {
  const { signIn } = useAuth();
  return (
    <View style={[styles.screen, styles.pad, styles.center]}>
      <Text style={styles.h1}>로그인</Text>
      <Text style={styles.hint}>
        로그인하면 인증 네비게이터 → 앱 네비게이터로 트리가 교체됨.
      </Text>
      <Btn label="하승으로 로그인" onPress={() => signIn("하승")} />
    </View>
  );
}

// ============================================================
// 루트: 인증 상태로 네비게이터 분기 (핵심 패턴)
// ============================================================
function RootNavigator() {
  const { user } = useAuth();

  // 미인증: 인증 스택만 렌더. 앱 트리(탭/모달)는 존재조차 안 함.
  if (user == null) {
    return (
      <AuthStack.Navigator screenOptions={stackHeader}>
        <AuthStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "시작" }}
        />
      </AuthStack.Navigator>
    );
  }

  // 인증: 탭 + 모달. 로그아웃 시 이 전체가 언마운트되고 위 인증 스택으로 교체됨.
  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="Tabs"
        component={TabsScreen}
        options={{ headerShown: false }}
      />
      {/* 모달 그룹: presentation:'modal' → 아래서 위로 슬라이드 */}
      <RootStack.Group
        screenOptions={{ presentation: "modal", ...stackHeader }}
      >
        <RootStack.Screen
          name="Compose"
          component={ComposeScreen}
          options={{ title: "작성" }}
        />
      </RootStack.Group>
    </RootStack.Navigator>
  );
}

// ============================================================
// 딥링크: URL → 화면 매핑
//  - prefixes: 어떤 URL을 이 앱 링크로 인식할지.
//    Linking.createURL('/') = Expo Go dev용(exp://.../--/) + 빌드용(picsel://) 자동 생성.
//  - config.screens: 중첩 구조를 그대로 반영해야 함. 경로가 트리 깊이를 따라 내려감.
//    예) picsel://feed/2  → Tabs > HomeTab > FeedDetail(id='2')
//  - :id = 경로 파라미터 → route.params.id 로 들어옴.
//  주의: 로그아웃 상태(AuthStack만 마운트)에서 보호 화면 링크는 매칭 대상이 없어 무시됨.
//        (실무는 로그인 후 재적용 로직을 따로 붙임. 여기선 개념까지.)
// ============================================================
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/"), "picsel://"],
  config: {
    screens: {
      Tabs: {
        screens: {
          HomeTab: {
            screens: {
              FeedList: "feed",
              FeedDetail: "feed/:id",
            },
          },
          ProfileTab: "profile",
        },
      },
      Compose: "compose",
    },
  },
};

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const auth = useMemo<Auth>(
    () => ({
      user,
      signIn: (name) => setUser(name),
      signOut: () => setUser(null),
    }),
    [user],
  );
  return (
    // QueryClientProvider: 트리 최상단 1개. 하위 어디서든 useQuery/useInfiniteQuery 사용 가능.
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        {/* NavigationContainer: 트리 최상단 1개. DarkTheme = 배경/텍스트 기본 어둡게.
            linking = 딥링크 매핑. fallback = 링크 해석 중 잠깐 보일 화면. */}
        <NavigationContainer
          theme={DarkTheme}
          linking={linking}
          fallback={
            <View style={[styles.screen, styles.center]}>
              <Text style={styles.hint}>링크 여는 중…</Text>
            </View>
          }
        >
          <RootNavigator />
        </NavigationContainer>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

// ---- 공용 ----
const stackHeader = {
  headerStyle: { backgroundColor: "#0f1115" },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "700" as const },
};

function Btn({
  label,
  onPress,
  kind = "primary",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  kind?: "primary" | "ghost" | "danger";
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        styles[`btn_${kind}`],
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text style={[styles.btnText, kind === "ghost" && { color: "#93c5fd" }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0f1115" },
  pad: { padding: 20, gap: 14 },
  center: { justifyContent: "center" },
  modal: { paddingTop: 28 },
  header: { backgroundColor: "#0f1115" },
  tabBar: { backgroundColor: "#161b26", borderTopColor: "#232a38" },

  h1: { color: "#fff", fontSize: 22, fontWeight: "700" },
  body: { color: "#c4c9d4", fontSize: 15, lineHeight: 22 },
  hint: { color: "#8a92a6", fontSize: 13, lineHeight: 19 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#181d27",
    padding: 16,
    borderRadius: 12,
  },
  rowTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  rowTitleFlex: { flex: 1 },
  // 고정 크기 = placeholder 대용 배경색. 로드 전 회색 박스로 자리 유지(레이아웃 안 튐).
  thumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#2b3446" },
  rowSub: { color: "#8a92a6", fontSize: 13, fontFamily: "monospace" },

  btn: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  btn_primary: { backgroundColor: "#2563eb" },
  btn_ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2b3446",
  },
  btn_danger: { backgroundColor: "#7f1d1d" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#232a38",
    flexDirection: "row",
    gap: 12,
  },
  input: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2b3446",
    backgroundColor: "#181d27",
    marginBottom: 16,
  },
  inputMultiline: {
    minHeight: 100,
    maxHeight: 300,
    textAlignVertical: "top",
  },
  length: {
    color: "#8a92a6",
  },
  offlineBar: {
    backgroundColor: "#7f1d1d",
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  offlineText: { color: "#fff", fontSize: 13, textAlign: "center" },
});
