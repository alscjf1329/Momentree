"use client";

import { useEffect, useRef } from "react";
import type { WeddingData } from "@/types";

export default function PreviewPane({ template, data }: { template: string; data: WeddingData }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dataRef = useRef(data);
  const readyRef = useRef(false);
  dataRef.current = data;

  const send = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "wedding-data", data: dataRef.current },
      window.location.origin
    );
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "preview-ready") {
        readyRef.current = true;
        send();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!readyRef.current) return;
    const t = setTimeout(send, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div className="sticky top-[104px] hidden xl:block">
      <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-2">실시간 미리보기</p>
      <div
        className="rounded-[32px] border-8 border-gray-800 overflow-hidden shadow-xl bg-white"
        style={{ width: 380, height: 720 }}
      >
        <iframe
          ref={iframeRef}
          src={`/preview/${template}`}
          className="w-full h-full"
          style={{ border: 0 }}
          onLoad={() => {
            readyRef.current = false;
          }}
          title="실시간 미리보기"
        />
      </div>
    </div>
  );
}
