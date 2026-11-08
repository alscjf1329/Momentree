import { SUPPORT } from "@/lib/support";
import { Tbd } from "@/components/LegalPage";

// 문의 링크 — 카카오톡 채널 URL 이 있으면 링크, 없으면 이메일 안내(운영자 이메일 미확정).
export default function SupportLink({ className = "underline underline-offset-4" }: { className?: string }) {
  if (SUPPORT.kind === "kakao") {
    return <a href={SUPPORT.href} target="_blank" rel="noopener noreferrer" className={className}>카카오톡으로 문의</a>;
  }
  return <span>문의: <Tbd>문의 이메일</Tbd></span>;
}
