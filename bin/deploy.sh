cd /app/Momentree
git pull origin main

# Next.js standalone 멀티스테이지 빌드라 static/public 복사가 이미지 안에서
# 자동으로 처리됨 (pm2 시절엔 수동 복사가 필요했음)
docker compose build
docker compose up -d

# 이전 이미지/캐시 레이어 정리 (디스크 누적 방지)
docker image prune -f
# 빌드 캐시는 image prune으로 안 지워지는 별도 항목이라 방치하면 계속 쌓임 —
# 1주일 넘은 것만 정리해서 최근 캐시는 살려 빌드 속도 유지
docker builder prune -f --filter until=168h
