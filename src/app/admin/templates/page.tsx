import { Suspense } from "react";
import TemplateList from "./TemplateList";

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-sub">Loading...</div>}>
      <TemplateList />
    </Suspense>
  );
}