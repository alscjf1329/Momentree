import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", width: "100%", background: "#f9fafb" }}>
      <AdminNav />
      {children}
    </div>
  );
}
