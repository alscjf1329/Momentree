import ScrollReset from "@/components/ScrollReset";

export default function InviteLayout({ children }: { children: React.ReactNode }) {
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
        }}
      >
        {children}
      </div>
    </div>
  );
}
