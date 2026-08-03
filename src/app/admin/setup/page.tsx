import { Suspense } from "react";
import SetupForm from "./SetupForm";

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-400">Loading...</div>}>
      <SetupForm />
    </Suspense>
  );
}
