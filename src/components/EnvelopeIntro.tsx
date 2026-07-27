"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WEDDING } from "@/content";

type Phase = "closed" | "opening" | "open" | "exit";

export default function EnvelopeIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>("closed");

  const handleTap = () => {
    if (phase === "closed") {
      setPhase("opening");
      setTimeout(() => setPhase("open"), 950);
    } else if (phase === "open") {
      setPhase("exit");
      setTimeout(onComplete, 650);
    }
  };

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none"
          style={{ background: "var(--color-cream)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65 }}
          onClick={handleTap}
        >
          {/* 상단 레이블 */}
          <motion.p
            className="font-serif text-sm tracking-[0.35em]"
            style={{ color: "var(--color-text-light)", marginBottom: 56 }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            WEDDING INVITATION
          </motion.p>

          {/* 봉투 */}
          <div style={{ perspective: "900px", perspectiveOrigin: "50% 35%" }}>
            <div className="relative" style={{ width: 300, height: 200 }}>

              {/* 봉투 몸체 */}
              <div
                className="absolute inset-0"
                style={{
                  background: "#f0e6d8",
                  border: "1px solid #c4a898",
                  boxShadow: "0 8px 40px rgba(139,111,94,0.18)",
                }}
              >
                {/* 내부 삼각형 (장식) */}
                <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 0, 0 100%, 50% 55%)", background: "rgba(0,0,0,0.04)" }} />
                <div style={{ position: "absolute", inset: 0, clipPath: "polygon(100% 0, 100% 100%, 50% 55%)", background: "rgba(0,0,0,0.04)" }} />
                <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 100%, 100% 100%, 50% 55%)", background: "rgba(0,0,0,0.07)" }} />
              </div>

              {/* 카드 (봉투 안에서 위로 올라옴) */}
              <motion.div
                className="absolute"
                style={{
                  left: 20,
                  right: 20,
                  bottom: 10,
                  background: "white",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.14)",
                  padding: "22px 18px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  zIndex: 5,
                }}
                initial={{ y: 0, opacity: 0 }}
                animate={phase === "open" ? { y: -138, opacity: 1 } : { y: 0, opacity: 0 }}
                transition={{ duration: 0.75, ease: [0.34, 1.08, 0.64, 1], delay: 0.1 }}
              >
                <div style={{ width: 28, height: 1, background: "var(--color-gold)", marginBottom: 14 }} />
                <p className="font-serif tracking-[0.25em]" style={{ color: "var(--color-text)", fontSize: 16 }}>
                  {WEDDING.groom.name}
                </p>
                <p style={{ color: "var(--color-gold)", fontSize: 11, margin: "6px 0" }}>♥</p>
                <p className="font-serif tracking-[0.25em]" style={{ color: "var(--color-text)", fontSize: 16 }}>
                  {WEDDING.bride.name}
                </p>
                <div style={{ width: 28, height: 1, background: "var(--color-gold)", margin: "14px 0 10px" }} />
                <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--color-text-light)" }}>
                  {WEDDING.date.year} · {String(WEDDING.date.month).padStart(2, "0")} · {String(WEDDING.date.day).padStart(2, "0")}
                </p>
              </motion.div>

              {/* 봉투 뚜껑 (3D 회전) */}
              <motion.div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 112,
                  transformOrigin: "50% 0%",
                  transformStyle: "preserve-3d",
                  zIndex: 10,
                }}
                animate={phase !== "closed" ? { rotateX: -180 } : { rotateX: 0 }}
                transition={{ duration: 0.88, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* 앞면 */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    background: "linear-gradient(145deg, #d4b896, #c4a898)",
                    backfaceVisibility: "hidden",
                  }}
                />
                {/* 뒷면 (회전 중 잠깐 보임) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    background: "#e8d5c4",
                    backfaceVisibility: "hidden",
                    transform: "rotateX(180deg)",
                  }}
                />
              </motion.div>

              {/* 왁스 씰 */}
              <motion.div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 94,
                  transform: "translateX(-50%)",
                  zIndex: 20,
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 15,
                  boxShadow: "0 2px 10px rgba(92,64,53,0.35)",
                }}
                animate={
                  phase !== "closed"
                    ? { opacity: 0, scale: 0.4, transition: { duration: 0.25 } }
                    : { opacity: 1, scale: 1 }
                }
              >
                ♥
              </motion.div>
            </div>
          </div>

          {/* 힌트 텍스트 */}
          <motion.p
            key={phase}
            className="text-[11px] tracking-[0.35em]"
            style={{ color: "var(--color-warm-gray)", marginTop: 80 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {phase === "open" ? "터치하여 청첩장 보기" : "터치하여 열기"}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
