"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WeddingProvider } from "@/context/WeddingContext";
import { TEMPLATE_MAP } from "@/templates/registry";
import type { WeddingData } from "@/types";

// 어드민 폼의 실시간 미리보기 전용 라우트. 저장 없이 postMessage로 받은 데이터만 렌더링한다.
// 파일을 읽지 않고 postMessage로만 데이터를 받으므로 별도 인증 없이 열어도 노출되는 정보가 없다.
export default function PreviewPage() {
  const params = useParams<{ template: string }>();
  const [data, setData] = useState<WeddingData | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "wedding-data") return;
      setData(event.data.data as WeddingData);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", handler);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-gray-400 px-6 text-center">
        미리보기 데이터를 기다리는 중…
      </div>
    );
  }

  const Template = TEMPLATE_MAP[params.template] ?? TEMPLATE_MAP.classic;

  return (
    <WeddingProvider data={data}>
      <Template />
    </WeddingProvider>
  );
}
