import { Suspense } from "react";
import MembersView from "./MembersView";

export default function MembersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-sub">불러오는 중…</div>}>
      <MembersView />
    </Suspense>
  );
}
