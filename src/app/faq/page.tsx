import { SERVICE_NAME } from "@/lib/brand";
// 주의: 답변은 작성 시점 코드의 실제 기능 기준입니다. 기능이 바뀌면 함께 갱신하세요. 요금·문의 이메일은 [확정 필요] 표기.
import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Tbd } from "@/components/LegalPage";
import SupportLink from "@/components/SupportLink";
import ContactForm from "@/components/ContactForm";
import { telegramConfigured } from "@/lib/notify";

// 텔레그램 설정 여부를 요청 시점 env로 판단(빌드 시 고정 방지)
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: `자주 묻는 질문 — ${SERVICE_NAME}` };

const FAQS: { q: string; a: ReactNode }[] = [
  { q: "청첩장은 어떻게 만드나요?", a: <>로그인 후 편집 화면에서 신랑·신부 이름, 예식 일시·장소, 사진 등을 입력하고 저장하면 됩니다. 처음 로그인하면 이름·일시·장소, 사진, 템플릿, 공유 4단계 체크리스트가 안내해 줘요.</> },
  { q: "템플릿(디자인)은 나중에 바꿀 수 있나요?", a: <>네. 어드민의 &quot;템플릿&quot; 메뉴에서 언제든 바꿀 수 있고, 입력한 정보는 그대로 유지됩니다. 공유 화면에서는 같은 정보로 디자인만 다르게 한 링크를 따로 만들 수도 있어요.</> },
  { q: "청첩장은 어떻게 보내나요?", a: <>어드민의 공유 화면(상단 공유 아이콘)에서 링크 복사, 공유 시트(카카오톡 등), 문자, QR 코드를 쓸 수 있습니다. 링크 하나만 보내면 하객이 바로 열어볼 수 있어요.</> },
  { q: "사진은 어떻게 올리나요?", a: <>편집 화면의 &quot;사진 · 갤러리&quot;에서 업로드합니다. 올린 사진은 청첩장 갤러리에 표시돼요.</> },
  { q: "하객의 참석 응답과 방명록은 어디서 보나요?", a: <>어드민 첫 화면(&quot;하객&quot;)의 &quot;참석 여부&quot;와 &quot;축하 메시지&quot; 탭에서 확인하고 관리할 수 있습니다. 하객 응답은 암호화되어 저장돼요.</> },
  { q: "같이 준비하는 사람과 함께 편집할 수 있나요?", a: <>청첩장 주인이 편집 화면의 &quot;함께 편집&quot;에서 상대방 이메일로 초대 메일을 보내면, 초대받은 분이 같은 청첩장을 함께 수정할 수 있습니다. 초대 재발송과 제외도 같은 화면에서 해요.</> },
  { q: "비밀번호가 없는데 어떻게 로그인하나요?", a: <>이메일 주소를 입력하면 6자리 인증 코드를 보내드립니다. 5분 안에 입력하면 로그인되고, 처음이면 계정이 자동으로 만들어져요. 메일이 안 오면 &quot;코드 다시 받기&quot;를 눌러 주세요.</> },
  { q: "내 정보나 청첩장을 삭제하고 싶어요.", a: <>편집 화면에서 청첩장 정보와 하객 응답을 직접 수정·삭제할 수 있습니다. 하객 응답·방명록은 예식일 6개월 후 하객에게 비공개되고 12개월 후 자동 삭제되며(삭제 30일 전 이메일 안내, 하객 화면에서 CSV 내려받기 가능), 청첩장 정보와 계정은 이 자동 삭제의 대상이 아닙니다. 계정·청첩장 전체 삭제는 아래 문의 채널로 요청해 주세요. 자세한 내용은 <Link href="/privacy" className="underline underline-offset-4">개인정보처리방침</Link>을 참고하세요. 처리 기한: <Tbd>삭제 요청 처리 기한</Tbd></> },
  { q: "요금은 얼마인가요?", a: <>무료와 유료(1회 결제) 두 가지이고, 구독은 없어요. 무료는 일부 템플릿, 사진 5장, 하객 응답 30건까지 쓸 수 있고 청첩장 하단에 작은 문구가 들어갑니다. 유료(1회 결제)는 모든 템플릿, 사진·응답 무제한, 함께 편집, 문구 없음이에요. 가격은 19,900원입니다. 유료는 예식일 후 3개월까지 쓸 수 있고, 그 뒤에는 무료로 전환돼요. 청첩장은 그대로 유지됩니다.</> },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <article className="max-w-xl sm:max-w-2xl mx-auto px-6 py-10 sm:py-16 overflow-x-hidden">
        <Link href="/" className="text-xs text-sub underline underline-offset-4">← {SERVICE_NAME}</Link>
        <h1 className="font-serif font-semibold text-[28px] leading-[1.3] tracking-tight mt-4">자주 묻는 질문</h1>

        <div className="mt-6 border-t border-line">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group border-b border-line">
              <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden min-h-12 py-3 flex items-center gap-3 text-[15px] font-bold break-words">
                <span className="flex-1 min-w-0">{q}</span>
                <span aria-hidden="true" className="text-sub shrink-0 transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="pb-4 text-sm leading-relaxed text-sub break-words">{a}</div>
            </details>
          ))}
        </div>

        <section className="mt-10 bg-soft border border-line rounded-lg px-4 py-4 text-sm leading-relaxed break-words">
          <p className="font-bold">원하는 답을 못 찾으셨나요?</p>
          <p className="mt-1"><SupportLink className="text-rose font-bold underline underline-offset-4" /></p>
          {/* 운영자 알림 채널이 없으면 폼을 숨겨 접수된 척하지 않는다 */}
          {telegramConfigured() && <><p className="mt-4 font-bold">메일로 문의</p><ContactForm /></>}
        </section>

        <footer className="mt-12 pt-5 border-t border-line text-xs text-sub flex gap-4">
          <Link href="/terms" className="underline underline-offset-4">이용약관</Link>
          <Link href="/privacy" className="underline underline-offset-4">개인정보처리방침</Link>
        </footer>
      </article>
    </main>
  );
}
