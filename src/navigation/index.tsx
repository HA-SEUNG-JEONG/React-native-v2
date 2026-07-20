import * as Linking from "expo-linking";
import type { LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type {
  HomeStackParamList,
  TabParamList,
  RootStackParamList,
  AuthStackParamList,
} from "./types";
import { useAuth } from "../auth/AuthContext";
import { styles, stackHeader } from "../theme/styles";
import { FeedListScreen } from "../screens/FeedListScreen";
import { FeedSectionsScreen } from "../screens/FeedSectionsScreen";
import { FeedDetailScreen } from "../screens/FeedDetailScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ComposeScreen } from "../screens/ComposeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { View, Text } from "react-native";
import { PhotoScreen } from "../screens/PhotoScreen";

// ---- 네비게이터 인스턴스 (제네릭으로 파라미터 타입 주입) ----
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

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
        name="FeedSections"
        component={FeedSectionsScreen}
        options={{ title: "구간별" }}
      />
      <HomeStack.Screen
        name="FeedDetail"
        component={FeedDetailScreen}
        options={{ title: "상세" }}
      />
      <HomeStack.Screen
        name="Photo"
        component={PhotoScreen}
        options={{ title: "사진" }}
      />
    </HomeStack.Navigator>
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

// ============================================================
// 루트: 인증 상태로 네비게이터 분기 (핵심 패턴)
// ============================================================
export function RootNavigator() {
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
export const linking: LinkingOptions<RootStackParamList> = {
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

// 딥링크 해석 중 잠깐 보일 fallback 화면
export function LinkingFallback() {
  return (
    <View style={[styles.screen, styles.center]}>
      <Text style={styles.hint}>링크 여는 중…</Text>
    </View>
  );
}
