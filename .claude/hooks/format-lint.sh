#!/usr/bin/env bash
# Stop hook: format + lint changed TS/JS files. Non-blocking (never fails the turn).
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 22.21.1 >/dev/null 2>&1

# changed (tracked mod + untracked), code files only
files=$(
  {
    git diff --name-only --diff-filter=d HEAD -- '*.ts' '*.tsx' '*.js' '*.jsx'
    git ls-files --others --exclude-standard -- '*.ts' '*.tsx' '*.js' '*.jsx'
  } 2>/dev/null | sort -u | grep -vE 'node_modules|/dist/'
)
[ -z "$files" ] && exit 0

npx prettier --write $files >/dev/null 2>&1
out=$(npx eslint $files 2>&1)
if [ -n "$out" ]; then
  echo "[format-lint] eslint 잔여 이슈:"
  echo "$out"
fi
exit 0
