import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

// MMKV 대신 AsyncStorage: MMKV는 네이티브 모듈이라 Expo Go에서 못 돈다(dev client 필요).
// 이 프로젝트는 아직 Expo Go로 굴러가서(P8에서 dev build 전환 예정) 지금은 AsyncStorage로
// 같은 "쿼리 캐시 영속화" 개념을 구현 — P8 전환 시 storage만 MMKV로 교체하면 됨.
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "rn-sandbox-query-cache",
});
