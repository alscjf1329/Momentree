import { Suspense } from "react";
import ShareView from "./ShareView";

export default function SharePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-sub">불러오는 중…</div>}>
      <ShareView />
    </Suspense>
  );
}
