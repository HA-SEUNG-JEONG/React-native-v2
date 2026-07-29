import { StyleSheet } from "react-native";

// 공용 StyleSheet — 모든 화면이 공유. RN은 cascade/상속이 없어 각 컴포넌트가
// 여기서 직접 스타일을 골라 배열로 합쳐 쓴다.
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0f1115" },
  map: { width: "100%", height: 240, borderRadius: 12 },
  pad: { padding: 20, gap: 14 },
  center: { justifyContent: "center" },
  modal: { paddingTop: 28 },
  header: { backgroundColor: "#0f1115" },
  tabBar: { backgroundColor: "#161b26", borderTopColor: "#232a38" },

  h1: { color: "#fff", fontSize: 22, fontWeight: "700" },
  body: { color: "#c4c9d4", fontSize: 15, lineHeight: 22 },
  hint: { color: "#8a92a6", fontSize: 13, lineHeight: 19 },
  location: { color: "#ffffff", fontSize: 14, lineHeight: 22 },
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
  sectionHeader: {
    color: "#93c5fd",
    fontSize: 13,
    fontWeight: "700",
    backgroundColor: "#0f1115", // sticky 시 아래 행이 비쳐 보이지 않게 배경 채움
    paddingVertical: 8,
  },

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
  // 선택한 사진 미리보기. 비율 고정 = 로드 전후 레이아웃 안 튐.
  // (맞춤 방식은 expo-image의 contentFit prop으로 지정)
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    backgroundColor: "#2b3446",
  },
});

// 네비게이터 헤더 공통 옵션 (native-stack/auth 스택이 공유)
export const stackHeader = {
  headerStyle: { backgroundColor: "#0f1115" },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "700" as const },
};
