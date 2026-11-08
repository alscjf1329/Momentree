"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import SubPageHeader from "@/components/admin/SubPageHeader";
import { useInviteQuery } from "@/lib/useShareId";
import { TEMPLATE_NAMES } from "@/lib/templateNames";

// 청첩장 공유: QR · 링크 복사 · 공유 시트(카카오톡 등) · 문자
export default function ShareView() {
  const fileParam = useSearchParams().get("file") ?? "";
  const [file, setFile] = useState(fileParam);
  const [info, setInfo] = useState<{ template: string; label: string; date: string } | null>(null);
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const query = useInviteQuery(file);

  useEffect(() => {
    fetch("/api/admin/auth/me").then(r => r.ok ? r.json() : null).then(me => {
      if (me?.role === "customer" && me.file) setFile(me.file);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!file) return;
    fetch(`/api/clients?file=${encodeURIComponent(file)}`).then(r => r.ok ? r.json() : null).then(d => {
      if (!d) return;
      const label = [d.groom?.name, d.bride?.name].filter(Boolean).join(" ♥ ");
      setInfo({ template: d.template, label, date: d.date?.iso ?? "" });
    }).catch(() => {});
  }, [file]);

  const url = info && typeof window !== "undefined" ? `${window.location.origin}/invite/${info.template}?${query}` : "";
  useEffect(() => {
    if (url) QRCode.toDataURL(url, { width: 480, margin: 1 }).then(setQr).catch(() => {});
  }, [url]);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ url, title: "청첩장" }); } catch { /* 공유 시트를 닫음 */ } return; }
    copy();
  };

  const act = "h-[52px] rounded-full flex items-center justify-center gap-2.5 text-[15px] box-border";
  const back = fileParam ? `/admin/setup?file=${fileParam}` : "/admin/setup";

  return (
    <div className="bg-white min-h-[calc(100dvh-56px)]">
      <SubPageHeader title="청첩장 공유" back={back} />
      <div className="max-w-md mx-auto px-5 pt-6 pb-10 flex flex-col gap-[22px]">
        {!info || !url ? <p className="text-sm text-sub">{file ? "불러오는 중…" : "고객을 먼저 선택해 주세요."}</p> : (
          <>
            <div className="flex flex-col items-center gap-4 bg-soft border border-line rounded-3xl px-5 py-6">
              <div className="text-center">
                <b className="text-[15px]">{info.label || "청첩장"}</b>
                <p className="text-xs text-sub mt-0.5">{[info.date.slice(0, 10).replaceAll("-", "."), TEMPLATE_NAMES[info.template] ?? info.template].filter(Boolean).join(" · ")}</p>
              </div>
              {qr && (
                // eslint-disable-next-line @next/next/no-img-element -- 클라이언트에서 만든 data URL
                <img src={qr} alt="청첩장 QR 코드" width={188} height={188} className="rounded-2xl bg-white border border-line p-3" />
              )}
              <span className="text-xs text-sub">식장 입구나 청첩장 카드에 인쇄해도 좋아요</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[13px] text-sub">내 청첩장 링크</span>
              <div className="h-[52px] box-border border border-[#d4d4d4] rounded-[14px] pl-4 pr-1.5 flex items-center justify-between gap-2">
                <span className="text-sm truncate">{url.replace(/^https?:\/\//, "")}</span>
                <button onClick={copy} className="h-10 px-4 rounded-full bg-ink text-white text-[13px] font-bold shrink-0">{copied ? "복사됨" : "복사"}</button>
              </div>
              <span className="text-xs text-sub">링크를 아는 사람만 볼 수 있어요</span>
            </div>

            <div className="flex flex-col gap-2.5">
              <button onClick={share} className={`${act} bg-ink text-white font-bold`}>카카오톡·메신저로 보내기</button>
              <div className="flex gap-2.5">
                <a href={qr} download="청첩장-QR.png" className={`${act} flex-1 border border-[#d4d4d4] font-medium text-sm`}>QR 저장</a>
                <a href={`sms:?body=${encodeURIComponent(url)}`} className={`${act} flex-1 border border-[#d4d4d4] font-medium text-sm`}>문자로 보내기</a>
              </div>
              <a href={url} target="_blank" rel="noreferrer" className="h-11 flex items-center justify-center text-sm text-sub underline underline-offset-4">내 청첩장 미리 열어보기</a>
            </div>

            <Link href="/admin" className="h-11 flex items-center justify-center text-sm underline underline-offset-4">보낸 뒤 하객 응답 확인하기</Link>
          </>
        )}
      </div>
    </div>
  );
}
