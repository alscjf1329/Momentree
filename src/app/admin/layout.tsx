import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", width: "100%", background: "#ffffff" }}>
      <AdminNav />
      {/* 아래 탭(모바일)이 내용을 가리지 않게 */}
      <div className="pb-20 sm:pb-0">{children}</div>
    </div>
  );
}
