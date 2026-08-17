module.exports = {
  apps: [
    {
      name: 'momentree',
      script: '.next/standalone/server.js',
      // script: 'npm',
      // args: 'start',
      cwd: `/app/Momentree`,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      // .env / .env.production 파일은 Next.js가 cwd 기준으로 알아서 읽음
      // 여기 env 블록은 필요한 값만 override하고 싶을 때 추가
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M'
    }
  ]
};