#!/bin/bash
# data/(clients, rsvp, uploads) 백업 — 타임스탬프 tar.gz로 저장하고 오래된 것은 삭제한다.
# 사용: bin/backup.sh                      (기본: /data/momentree → /data/momentree-backups, 14개 보관)
#       DATA_DIR=... BACKUP_DIR=... KEEP=30 bin/backup.sh
# cron 예시 (매일 04:00): 0 4 * * * /app/Momentree/bin/backup.sh >> /var/log/momentree-backup.log 2>&1
set -euo pipefail

DATA_DIR="${DATA_DIR:-/data/momentree}"
BACKUP_DIR="${BACKUP_DIR:-/data/momentree-backups}"
KEEP="${KEEP:-14}"

[ -d "$DATA_DIR" ] || { echo "DATA_DIR 없음: $DATA_DIR" >&2; exit 1; }
mkdir -p "$BACKUP_DIR"

out="$BACKUP_DIR/momentree-$(date +%Y%m%d-%H%M%S).tar.gz"
# otp/는 5분짜리 로그인 코드라 백업 불필요
tar -czf "$out" --exclude='./otp' -C "$DATA_DIR" .
tar -tzf "$out" >/dev/null   # 아카이브 무결성 확인
echo "백업 완료: $out ($(du -h "$out" | cut -f1))"

# 최신 KEEP개만 남기고 삭제
ls -1t "$BACKUP_DIR"/momentree-*.tar.gz | tail -n +$((KEEP + 1)) | xargs -r rm --
