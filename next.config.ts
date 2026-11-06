import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // 네이티브 모듈은 번들하지 않고 node_modules에서 그대로 로드
  serverExternalPackages: ["better-sqlite3"],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
