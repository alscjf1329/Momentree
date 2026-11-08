"use client";

import { useEffect, useRef, useState } from "react";
import type { WeddingData } from "@/types";

// 미리보기 iframe + 실시간 데이터 전달 (데스크톱 패널과 모바일 전체화면이 공용)
function PreviewFrame({ template, data }: { template: string; data: WeddingData }) {
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
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return;
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
    <iframe
      ref={iframeRef}
      src={`/preview/${template}`}
      className="w-full h-full"
      style={{ border: 0 }}
      onLoad={() => { readyRef.current = false; }}
      title="실시간 미리보기"
    />
  );
}

export default function PreviewPane({ template, data }: { template: string; data: WeddingData }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 넓은 화면: 오른쪽 고정 패널 */}
      <div className="sticky top-[104px] hidden xl:block">
        <p className="text-[10px] font-semibold text-sub tracking-widest uppercase mb-2">실시간 미리보기</p>
        <div className="rounded-[32px] border-8 border-gray-800 overflow-hidden shadow-xl bg-white" style={{ width: 380, height: 720 }}>
          <PreviewFrame template={template} data={data} />
        </div>
      </div>

      {/* 모바일·태블릿: 떠 있는 버튼 → 전체화면 미리보기 (입력한 내용이 그대로 반영됨) */}
      <button onClick={() => setOpen(true)}
        className="xl:hidden fixed bottom-24 sm:bottom-6 right-4 z-40 px-5 py-3 rounded-full text-sm font-medium text-white shadow-lg"
        style={{ background: "var(--color-ink)" }}>
        미리보기
      </button>
      {open && (
        <div className="xl:hidden fixed inset-0 z-50 bg-black/60 flex flex-col" role="dialog" aria-label="청첩장 미리보기">
          <div className="flex items-center justify-between px-4 h-12 bg-white shrink-0">
            <span className="text-sm font-semibold text-ink">미리보기</span>
            <button onClick={() => setOpen(false)} className="text-sm px-3 py-1.5 text-ink">닫기 ✕</button>
          </div>
          <div className="flex-1 bg-white min-h-0">
            <PreviewFrame template={template} data={data} />
          </div>
        </div>
      )}
    </>
  );
}
