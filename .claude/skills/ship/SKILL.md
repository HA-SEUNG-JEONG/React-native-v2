---
name: ship
description: 작업이 끝나면 변경분을 커밋 → 푸시 → PR 생성까지 한 번에 진행한다. "커밋 푸쉬 PR", "ship", "작업 끝 PR 올려줘" 요청 시 활성화.
triggers:
  - 커밋 푸쉬 PR
  - 커밋 푸시 PR
  - PR까지 올려줘
  - 작업 끝났으니 PR
  - ship
---

# ship

작업이 끝난 현재 브랜치의 변경분을 커밋하고, 푸시하고, PR을 연다. 사용자가 이 스킬을 호출했거나 "끝나면 커밋/푸쉬/PR"이라고 말한 경우에만 실행한다. 호출 자체가 커밋·푸시·PR 승인이다.

## 절대 규칙

- `--no-verify`, `--force` 금지. 훅이 실패하면 원인을 고쳐서 새 커밋으로 진행한다.
- `.env`, 크리덴셜, 키 파일은 커밋하지 않는다. 의심 파일이 있으면 멈추고 보고한다.
- `main`(또는 기본 브랜치)에서는 직접 커밋·푸시하지 않는다. 먼저 `<type>/<요약-영문>` 브랜치를 만든다.
- 요청한 작업과 무관한 변경이 섞여 있으면 커밋에서 빼고 보고한다.
- 이 스킬이 승인하는 것은 현재 브랜치 푸시와 PR 생성뿐이다. 다른 브랜치 푸시, 태그 푸시, 머지, main 직접 반영은 따로 확인한다.

## 절차

### 1. 현재 상태 파악 (병렬)

```bash
git status --short --branch
git diff --stat
git log --oneline -5
gh repo view --json defaultBranchRef --jq .defaultBranchRef.name
```

- 브랜치가 기본 브랜치면 새 브랜치를 만든다.
- 푸시 안 된 이전 커밋이 있으면 PR에 같이 들어간다. `git log --oneline origin/<base>..HEAD`로 범위를 확인하고 PR 본문에 적는다.

### 2. 혼입 확인

`git status`의 untracked와 수정 파일을 훑어 `.omc/`, `hook-debug.log`, `node_modules/`, 빌드 산출물, 비밀 파일이 없는지 본다. 있으면 `.gitignore` 대상인지 확인하고 빼거나 보고한다.

### 3. 커밋

- 논리 단위로 나눈다. 삭제와 신규 작성처럼 성격이 다르면 커밋을 분리한다.
- 파일을 이름으로 지정해 `git add`한다. 무엇이 들어가는지 모를 때 `git add -A`를 쓰지 않는다.
- 메시지 형식: `<type>: <한국어 요약>` (50자 이내). type은 feat/fix/refactor/style/docs/test/chore.
- "WHAT"이 아니라 "WHY"를 본문에 적는다.
- 메시지 끝에 시스템 안내에 나온 `Co-Authored-By` 줄을 붙인다.
- heredoc으로 메시지를 넘긴다.

### 4. 푸시

```bash
git push -u origin <현재 브랜치>
```

upstream이 이미 있으면 `git push`. 거부되면 이유를 보고하고 멈춘다. force로 우회하지 않는다.

### 5. PR 생성

```bash
gh pr create --base <기본 브랜치> --head <현재 브랜치> --title "<type>: <요약>" --body "..."
```

본문 구성:

- `## 요약`: 변경 내용 2~4줄
- `## 범위 참고`: 다른 PR이나 브랜치에서 딸려 온 커밋이 있으면 적는다
- `## 검증`: 실행한 테스트·검수와 결과. 못 한 것은 못 했다고 적는다
- 끝줄: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`

같은 브랜치에 열린 PR이 이미 있으면 새로 만들지 않고 그 URL을 알려 준다 (`gh pr list --head <브랜치>`).

### 6. 보고

PR URL, 커밋 목록, PR에 딸려 간 이전 커밋, 아직 안 한 것(미검증 항목)을 한국어로 짧게 알린다.

## 이 저장소(React-native-v2) 메모

- 기본 브랜치는 `main`이다.
- 푸시하는 `archive/pre-reset` 같은 복구용 태그는 이 스킬 범위 밖이다. 필요하면 따로 묻는다.
