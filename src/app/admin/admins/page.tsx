import { Suspense } from "react";
import AdminsManager from "./AdminsManager";

export default function AdminsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-sub">Loading...</div>}>
      <AdminsManager />
    </Suspense>
  );
}
