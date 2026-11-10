import ContactForm from "@/components/ContactForm";
import { telegramConfigured } from "@/lib/notify";

// 설정 여부를 요청 시점 env로 판단(빌드 시 고정 방지). 로그인은 proxy가 보장한다.
export const dynamic = "force-dynamic";

export default function ContactPage() {
  return (
    <main className="max-w-xl mx-auto px-6 py-8 text-sm leading-relaxed break-words">
      <h1 className="text-xl font-bold text-ink">문의하기</h1>
      <p className="mt-2 text-sub">궁금한 점을 남겨 주세요. 가입하신 이메일로 답변드릴게요.</p>
      {telegramConfigured()
        ? <ContactForm />
        : <p className="mt-4 rounded-lg border border-line bg-soft px-4 py-3">지금은 문의를 받을 수 없어요. 문의가 접수되지 않으니 나중에 다시 이용해 주세요.</p>}
    </main>
  );
}
