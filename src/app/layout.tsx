import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "김민준 ♥ 이서연 결혼합니다",
  description: "2025년 10월 18일 토요일 오후 2시 30분",
  openGraph: {
    title: "김민준 ♥ 이서연 결혼합니다",
    description: "2025년 10월 18일 토요일 오후 2시 30분",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* display=swap: 폰트 로딩 전 시스템 폰트 먼저 보여줌 → 초기 버벅임 방지 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500&family=Noto+Sans+KR:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ minHeight: "100dvh" }}>
        {children}
      </body>
    </html>
  );
}
