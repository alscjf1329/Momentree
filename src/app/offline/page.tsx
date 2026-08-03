export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#faf6f1",
        fontFamily: "var(--font-sans)",
        gap: 16,
        textAlign: "center",
        padding: "0 24px",
      }}
    >
      <p style={{ fontSize: 48, lineHeight: 1 }}>✉️</p>
      <p
        className="font-serif"
        style={{ fontSize: 22, color: "var(--color-primary-dark)", fontWeight: 300 }}
      >
        오프라인 상태입니다
      </p>
      <p style={{ fontSize: 13, color: "var(--color-text-light)", lineHeight: 1.8 }}>
        인터넷 연결이 없습니다.<br />
        연결 후 다시 시도해주세요.
      </p>
    </div>
  );
}
