#!/bin/bash
# DATA_DIR(DB + uploads)을 타임스탬프 tar.gz로 백업하고 오래된 것은 삭제한다.
# DB는 쓰는 도중 파일을 그냥 복사하면 깨질 수 있어서 SQLite의 온라인 백업으로 일관된 스냅샷을 뜬다
# (sqlite3 CLI가 있으면 그걸, 없으면 실행 중인 컨테이너의 better-sqlite3를 사용).
# 사용: bin/backup.sh                      (기본: /data/momentree → /data/momentree-backups, 14개 보관)
#       DATA_DIR=... BACKUP_DIR=... KEEP=30 bin/backup.sh
# cron 예시 (매일 04:00): 0 4 * * * /app/Momentree/bin/backup.sh >> /var/log/momentree-backup.log 2>&1
set -euo pipefail

DATA_DIR="${DATA_DIR:-/data/momentree}"
BACKUP_DIR="${BACKUP_DIR:-/data/momentree-backups}"
KEEP="${KEEP:-14}"
CONTAINER="${CONTAINER:-momentree}"
CONTAINER_DATA_DIR="${CONTAINER_DATA_DIR:-$DATA_DIR}"   # 컨테이너 안에서 본 DATA_DIR 경로
SQLITE3_BIN="${SQLITE3_BIN:-sqlite3}"

[ -d "$DATA_DIR" ] || { echo "DATA_DIR 없음: $DATA_DIR" >&2; exit 1; }
mkdir -p "$BACKUP_DIR"

STAGE_NAME=".backup-stage"
STAGE="$DATA_DIR/$STAGE_NAME"
trap 'rm -rf "$STAGE"' EXIT
rm -rf "$STAGE"; mkdir -p "$STAGE"
chmod 777 "$STAGE"   # 컨테이너(node 유저)가 쓸 수 있게

if [ -f "$DATA_DIR/momentree.db" ]; then
  if command -v "$SQLITE3_BIN" >/dev/null 2>&1; then
    "$SQLITE3_BIN" "$DATA_DIR/momentree.db" ".backup '$STAGE/momentree.db'"
  else
    docker exec "$CONTAINER" node -e '
      const D = require("better-sqlite3");
      const [src, dest] = process.argv.slice(1);
      new D(src, { readonly: true }).backup(dest).then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
    ' "$CONTAINER_DATA_DIR/momentree.db" "$CONTAINER_DATA_DIR/$STAGE_NAME/momentree.db"
  fi
  # 백업본이 열리고 비어있지 않은지 확인
  [ -s "$STAGE/momentree.db" ] || { echo "DB 백업 실패" >&2; exit 1; }
fi

out="$BACKUP_DIR/momentree-$(date +%Y%m%d-%H%M%S).tar.gz"
# DATA_DIR 최상위 항목 중 실행 중인 DB 파일(-wal/-shm 포함)·스테이징·otp(5분짜리 로그인 코드)만 빼고 담고, DB는 위 스냅샷으로 담는다.
# (tar --exclude는 스냅샷 이름(momentree.db)까지 같이 제외해 버려서, 포함할 항목을 직접 나열한다)
entries=()
for e in "$DATA_DIR"/* "$DATA_DIR"/.[!.]*; do
  [ -e "$e" ] || continue
  case "$(basename "$e")" in momentree.db|momentree.db-wal|momentree.db-shm|otp|"$STAGE_NAME") continue ;; esac
  entries+=("$(basename "$e")")
done
snapshot=()
[ -f "$STAGE/momentree.db" ] && snapshot=(-C "$STAGE" momentree.db)
tar -czf "$out" -C "$DATA_DIR" "${entries[@]+"${entries[@]}"}" "${snapshot[@]+"${snapshot[@]}"}"
# DB가 있었다면 아카이브에 반드시 들어 있어야 한다 (조용히 빠진 백업 방지)
if [ -f "$DATA_DIR/momentree.db" ] && ! tar -tzf "$out" | grep -qx 'momentree.db'; then
  echo "백업에 DB가 빠졌습니다" >&2; rm -f "$out"; exit 1
fi
tar -tzf "$out" >/dev/null   # 아카이브 무결성 확인
echo "백업 완료: $out ($(du -h "$out" | cut -f1))"

# 최신 KEEP개만 남기고 삭제
ls -1t "$BACKUP_DIR"/momentree-*.tar.gz | tail -n +$((KEEP + 1)) | xargs -r rm --
