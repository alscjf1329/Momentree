cd /app/Momentree
git pull origin main
npm install
rm -rf .next/
npm run build

# standalone 모드는 static/public을 자동으로 안 넣어줘서 수동으로 복사해야 함
# (안 하면 서버는 뜨지만 /_next/static/chunks/*.js가 전부 404남)
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

pm2 startOrReload ecosystem.config.js --update-env