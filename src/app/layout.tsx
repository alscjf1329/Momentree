import type { Metadata } from "next";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "Momentree",
  description: "웨딩 청첩장 플랫폼",
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
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#5c4035" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500&family=Noto+Sans+KR:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ minHeight: "100dvh" }}>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
