"use client";

import { useEffect, useState } from "react";

// BeforeInstallPromptEvent is not in standard TS types
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 이미 설치됐거나 standalone으로 실행 중이면 숨김
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt || dismissed) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-lg"
      style={{ background: "var(--color-primary-dark)", color: "#fff", maxWidth: 480, margin: "0 auto" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span style={{ fontSize: 22 }}>📲</span>
        <div className="min-w-0">
          <p className="text-xs font-medium truncate">Momentree 앱으로 설치</p>
          <p className="text-[10px] opacity-60">홈 화면에 추가해서 빠르게 열기</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={async () => {
            await prompt.prompt();
            setDismissed(true);
          }}
          className="text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ background: "var(--color-gold)", color: "#1a1208" }}
        >
          설치
        </button>
        <button onClick={() => setDismissed(true)} className="text-white/50 hover:text-white text-lg leading-none">
          ×
        </button>
      </div>
    </div>
  );
}
