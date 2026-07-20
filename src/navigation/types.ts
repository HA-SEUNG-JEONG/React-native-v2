// ---- 타입 안전 파라미터: 각 네비게이터의 화면→파라미터 맵 ----
// undefined = 파라미터 없음. 객체 = 필수 파라미터.
// (index.tsx가 screens를 import하고 screens가 이 파일을 import → 사이클 방지 위해 타입만 분리)
export type HomeStackParamList = {
  FeedList: undefined;
  FeedSections: undefined; // SectionList 데모 — 같은 목록을 id 구간별로 묶어 보여줌
  // title 옵셔널 — 앱 내 navigate는 넘기지만 딥링크(feed/:id)는 id만 줌. 화면은 id로 조회.
  FeedDetail: { id: string; title?: string };
  Photo: undefined; // 갤러리에서 사진 선택 (권한 플로우 데모)
};
export type TabParamList = {
  HomeTab: undefined;
  ProfileTab: undefined;
};
export type RootStackParamList = {
  Tabs: undefined;
  Compose: undefined; // 모달로 띄울 화면
};
export type AuthStackParamList = {
  Login: undefined;
};
