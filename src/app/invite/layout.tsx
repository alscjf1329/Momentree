export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return (
    // 데스크탑: 다크 배경에 폰 카드 중앙 정렬
    // 모바일: 그냥 풀스크린
    <div
      className="min-h-screen flex justify-center"
      style={{ background: "var(--invite-bg, #1c1c1e)" }}
    >
      <style>{`
        @media (min-width: 500px) {
          :root { --invite-bg: #1c1c1e; }
        }
        @media (max-width: 499px) {
          :root { --invite-bg: transparent; }
        }
      `}</style>
      <div
        className="w-full relative"
        style={{
          maxWidth: 480,
          background: "#fff",
          minHeight: "100dvh",
          boxShadow: "0 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
