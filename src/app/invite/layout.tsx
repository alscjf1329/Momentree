import { headers } from "next/headers";
import ScrollReset from "@/components/ScrollReset";

export default async function InviteLayout({ children }: { children: React.ReactNode }) {
  // 카카오톡 인앱브라우저는 자체 상단바로 이미 노치/상태바 영역을 확보해주기 때문에
  // env(safe-area-inset-top)까지 더하면 이중으로 여백이 생김 — UA로 감지해서 제외
  const ua = (await headers()).get("user-agent") ?? "";
  const isKakaoInApp = /KAKAOTALK/i.test(ua);

  return (
    <div
      className="min-h-screen flex justify-center"
      style={{ background: "var(--invite-bg, #1c1c1e)" }}
    >
      <style>{`
        @media (min-width: 500px) {
          :root { --invite-bg: #1c1c1e; }
          html, body { scrollbar-width: none; -ms-overflow-style: none; }
          html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
        }
        @media (max-width: 499px) { :root { --invite-bg: transparent; } }
      `}</style>
      <ScrollReset />
      <div
        className="w-full relative"
        style={{
          maxWidth: 480,
          background: "#fff",
          minHeight: "100svh",
          overflowAnchor: "none",
          paddingTop: isKakaoInApp ? 0 : "env(safe-area-inset-top)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
