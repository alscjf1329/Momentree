import type { Metadata } from "next";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";
import PreventPinchZoom from "@/components/PreventPinchZoom";

export const metadata: Metadata = {
  title: "Momentree — 모바일 청첩장",
  description: "두 분의 하루를 링크 하나로. 모바일 청첩장을 만들고 하객 응답까지 한곳에서 관리하세요.",
  appleWebApp: {
    capable: true,
    title: "Momentree",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#5c4035" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500;600&family=Noto+Sans+KR:wght@300;400;500;700&family=Sacramento&family=Permanent+Marker&family=Mrs+Saint+Delafield&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ minHeight: "100svh" }} suppressHydrationWarning>
        {children}
        <RegisterSW />
        <PreventPinchZoom />
      </body>
    </html>
  );
}
