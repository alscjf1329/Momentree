import path from "path";

// PM2/standalone 배포 환경에 따라 process.cwd()가 기대한 프로젝트 루트와
// 달라질 수 있어(예: .next/standalone에서 기동) 절대경로로 오버라이드 가능하게 함.
export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
