#!/bin/bash
# 고객 파일 찾기 (읽기 전용) — 표시 이름·소유자 이메일·파일명·예식일로 검색한다.
# 사용: bin/find-client.sh [키워드]     (키워드 없으면 전체 목록)
#       DATA_DIR=/data/momentree bin/find-client.sh 홍길동
# 메타데이터(_meta)는 고객이 저장할 때 채워진다. 아직 저장 안 한 오래된 파일은 이름이 '-'로 나온다.
set -euo pipefail

DIR="${DATA_DIR:-/data/momentree}/clients"
KEYWORD="${1:-}"
[ -d "$DIR" ] || { echo "고객 폴더 없음: $DIR" >&2; exit 1; }

for f in "$DIR"/*.json; do
  [ -e "$f" ] || continue
  field() { sed -n 's/^ *"'"$1"'": "\(.*\)",\{0,1\}$/\1/p' "$f" | tail -1; }
  label=$(field label); owner=$(field owner); date=$(field weddingDate); updated=$(field updatedAt)
  printf '%s\t%s\t%s\t%s\t%s\n' "$(basename "$f" .json)" "${label:--}" "${owner:--}" "${date:0:10}" "${updated:0:10}"
done | { [ -n "$KEYWORD" ] && grep -i -- "$KEYWORD" || cat; } | sort -t$'\t' -k5 -r | { printf '파일명\t표시 이름\t소유자\t예식일\t수정일\n'; cat; }
