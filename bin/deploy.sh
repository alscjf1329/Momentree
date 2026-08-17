cd /app/Momentree
git pull origin main
npm install
rm -rf .next/
npm run build
pm2 restart momentree