"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function ShareLinkCard({ template, filename }: { template: string; filename: string }) {
  const [url, setUrl] = useState("");
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!filename) return;
    const u = `${window.location.origin}/invite/${template}?file=${filename}`;
    setUrl(u);
    QRCode.toDataURL(u, { width: 200, margin: 1 }).then(setQr).catch(() => {});
  }, [template, filename]);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url, title: "청첩장" });
      } catch {
        // 사용자가 공유 시트를 취소한 경우 등 — 무시
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!filename || !url) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
        <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">내 청첩장 QR / 공유</p>
      </div>
      <div className="p-4 flex flex-col items-center gap-3">
        {qr && (
          // eslint-disable-next-line @next/next/no-img-element -- 클라이언트에서 생성한 data URL, next/image 최적화 대상 아님
          <img src={qr} alt="청첩장 QR 코드" width={140} height={140} className="rounded-lg border border-gray-100" />
        )}
        <a href={url} target="_blank" rel="noreferrer"
          className="text-[11px] text-blue-500 font-mono break-all text-center hover:underline">
          {url}
        </a>
        <button onClick={share}
          className="w-full py-2 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          {copied ? "✓ 링크 복사됨" : "공유하기"}
        </button>
      </div>
    </div>
  );
}
