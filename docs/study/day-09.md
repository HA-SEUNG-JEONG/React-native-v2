# Day 9 · 11/6 (금) — 버퍼 + 2주차 점검

## 오늘의 목표

2주차(Day 5~8)에서 배운 state, 입력, 키보드, 리스트를 퀴즈와 구술로 점검하고 밀린 Day를 흡수한다.

## 주간 점검 퀴즈(30분)

정답을 가리고 풀고, 맞은 뒤에도 "왜"를 한 문장으로 적는다. 결과는 `docs/quiz/2026-11-06-day-09.md`에 `AGENTS.md`의 상세 구조(문항별 상세, 종합 약점 패턴, 재복습 일정)로 기록한다.

1. 저장 버튼에서 `entries.push(newEntry); setEntries(entries);`로 쓰면 화면이 갱신되지 않는 이유와 올바른 코드는?
2. `TextInput`에 `onChangeText`만 있고 `value`가 없다. 저장 뒤 `setTitle('')`을 호출해도 입력창이 비워지지 않는 이유는?
3. 키보드가 올라온 상태에서 `ScrollView` 안의 저장 버튼을 처음 탭하면 반응하지 않는다. 원인과 해결 방법은? `KeyboardAvoidingView`의 `behavior`는 보통 플랫폼별로 어떻게 지정하는가?
4. `FlatList`에서 `keyExtractor`를 주지 않으면 key가 무엇으로 정해지는가? 이 key가 중요한 상황 한 가지는?
5. `RefreshControl`의 `refreshing`이 `false`로 고정되어 당기면 인디케이터가 바로 사라진다. 원인과 해결 방법은?

<details><summary>정답</summary>

1. React는 setter에 넘긴 값이 이전 값과 같은 참조인지 비교한다. `push`는 같은 배열을 수정하므로 같은 참조가 들어가 변경으로 인식하지 못한다. `setEntries([newEntry, ...entries])`처럼 새 배열을 만든다.
2. `value`가 없으면 비제어 입력이라 입력창의 글자는 네이티브 입력창이 쥐고 있고 state와 연결돼 있지 않다. `value={title}`를 주어 제어 입력으로 만들어야 state를 비울 때 입력창도 비워진다.
3. `ScrollView`의 `keyboardShouldPersistTaps` 기본값 `never` 때문에 첫 탭은 키보드만 닫고 자식은 받지 못한다. `keyboardShouldPersistTaps="handled"`를 준다. `behavior`는 보통 iOS는 `'padding'`, Android는 `'height'`로 시작하고 기기에서 확인해 맞춘다.
4. `item.key`, 그다음 `item.id`, 둘 다 없으면 index다. 항목이 삽입·삭제·재정렬되는 목록에서 key가 안정적이지 않으면 항목 상태가 엉키거나 불필요한 렌더가 생긴다.
5. `refreshing`은 부모가 제어하는 prop이라, `onRefresh`에서 `setRefreshing(true)`로 올려 주지 않으면 값이 계속 `false`다. 작업 시작에 `true`, 끝에 `false`를 호출한다.

</details>

## 구술 1주제(15분)

주제: 피드 목록에서 새 글을 추가했을 때 화면에 반영되기까지의 흐름(`setState` 호출부터 항목 렌더까지)을 소리 내어 3분 동안 설명한다. 막힌 지점을 아래에 적는다.

포함할 핵심어: 새 배열, 리렌더, `keyExtractor`, `memo`, `refreshing`

> 막힌 지점:

## 질문 목록 처리(15분)

`docs/questions.md`에 쌓인 항목을 연다. 항목마다 다음 중 하나로 처리한다.

- [ ] 오늘 답을 찾았다 → 질문 옆에 답을 한 줄 적고 지운다
- [ ] 아직 모르겠다 → 에러 원문과 시도한 것을 보강해 다음 주 금요일(Day 14)로 넘긴다
- [ ] 질문이 틀렸다(오타·환경 문제였다) → 원인을 적고 지운다

## 밀린 Day 흡수

달력이 아니라 Day 번호 기준이다. 밀린 Day가 있으면 남는 시간에 한다. 하루에 Day 둘을 하지 않는다는 규칙은 지킨다.

- [ ] Day 5 만들기(기록 작성 폼, `useState`)
- [ ] Day 6 만들기(`KeyboardAvoidingView`, 포커스 이동)
- [ ] Day 7 만들기(`data/mock-posts.ts`, 피드 `FlatList`, 기록/피드 임시 전환)
- [ ] Day 8 만들기(`SectionList`, `RefreshControl`, `memo`)
- [ ] 퀴즈에서 틀린 문항의 해당 Day 검증 실험을 다시 해 본다

## 기록(5분)

배운 것 3줄:

막힌 점:

다음 주(Day 10~13) 준비: `app/index.tsx`가 Day 8 상태로 커밋돼 있는지 `git status`로 확인한다. Day 10부터 이 파일을 타입과 컴포넌트로 나누기 시작한다.
