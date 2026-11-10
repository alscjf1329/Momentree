"use client";

import { useEffect, useRef, useState } from "react";
import { useWedding } from "@/context/WeddingContext";

// 배경음악 — 화면 고정 재생·정지 버튼. 자동재생이 막히면 첫 터치·클릭 때 재생한다.
export default function BgmPlayer() {
  const w = useWedding();
  const src = w.bgm?.src;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch((e) => console.error("BGM 재생 실패:", e));
    }
  };

  useEffect(() => {
    if (!src) return;
    const audio = audioRef.current;
    if (!audio) return;
    const events = ["click", "touchstart", "keydown"] as const;
    const unlock = () => {
      audio.play().then(() => setPlaying(true)).catch(() => {});
      events.forEach((e) => document.removeEventListener(e, unlock));
    };
    audio.play().then(() => setPlaying(true)).catch(() => {
      events.forEach((e) => document.addEventListener(e, unlock));
    });
    return () => events.forEach((e) => document.removeEventListener(e, unlock));
  }, [src]);

  if (!src) return null;

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="metadata" />
      <button
        onClick={toggle}
        aria-label={playing ? "배경음악 정지" : "배경음악 재생"}
        className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full flex items-center justify-center shadow-lg text-white"
        style={{ background: "var(--color-primary-dark)" }}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="4" width="5" height="16" rx="1" />
            <rect x="14" y="4" width="5" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="18" r="3" fill="currentColor" />
            <circle cx="18" cy="16" r="3" fill="currentColor" />
          </svg>
        )}
      </button>
    </>
  );
}
