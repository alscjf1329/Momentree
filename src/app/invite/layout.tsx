import ScrollReset from "@/components/ScrollReset";

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex justify-center"
      style={{ background: "var(--invite-bg, #1c1c1e)" }}
    >
      <style>{`
        @media (min-width: 500px) { :root { --invite-bg: #1c1c1e; } }
        @media (max-width: 499px) { :root { --invite-bg: transparent; } }
      `}</style>
      <ScrollReset />
      <div
        className="w-full relative"
        style={{
          maxWidth: 480,
          background: "#fff",
          minHeight: "100dvh",
          boxShadow: "0 0 60px rgba(0,0,0,0.5)",
          overflowAnchor: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
