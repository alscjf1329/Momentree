"use client";

import { useRef } from "react";
import Image from "next/image";
import { useWedding } from "@/context/WeddingContext";
import { motion, useScroll, useTransform } from "framer-motion";

export default function EnvelopeScrollSection() {
  const wedding = useWedding();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const closedOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const openOpacity   = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const hintOpacity   = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const cardY         = useTransform(scrollYProgress, [0.5, 0.9], [70, 0]);
  const cardOpacity   = useTransform(scrollYProgress, [0.5, 0.9], [0, 1]);

  return (
    <div ref={sectionRef} style={{ height: "300vh" }}>
      <div className="sticky top-0 overflow-hidden" style={{ height: "100dvh", background: "#1a1208" }}>
        <motion.div className="absolute inset-0" style={{ opacity: closedOpacity }}>
          <Image
            src={wedding.envelopeClosed}
            alt="closed envelope"
            fill
            priority
            className="object-cover"
            sizes="480px"
          />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        <motion.div className="absolute inset-0" style={{ opacity: openOpacity }}>
          <Image
            src={wedding.envelopeOpen}
            alt="open envelope"
            fill
            className="object-cover"
            sizes="480px"
          />
          <div className="absolute inset-0 bg-black/25" />
        </motion.div>

        <motion.div
          className="absolute inset-x-8 bottom-0 flex justify-center"
          style={{ opacity: cardOpacity, y: cardY }}
        >
          <div
            className="w-full max-w-xs text-center"
            style={{
              background: "rgba(250,246,241,0.96)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              padding: "32px 24px env(safe-area-inset-bottom, 48px)",
              paddingBottom: "max(48px, env(safe-area-inset-bottom))",
              boxShadow: "0 -4px 60px rgba(0,0,0,0.3)",
            }}
          >
            <p className="text-[10px] tracking-[0.35em]" style={{ color: "var(--color-warm-gray)" }}>
              WEDDING INVITATION
            </p>
            <div className="w-8 h-px mx-auto my-4" style={{ background: "var(--color-gold)" }} />
            <p className="font-serif text-xl tracking-[0.2em]" style={{ color: "var(--color-text)" }}>
              {wedding.groom.name}
            </p>
            <p className="text-sm my-2" style={{ color: "var(--color-gold)" }}>♥</p>
            <p className="font-serif text-xl tracking-[0.2em]" style={{ color: "var(--color-text)" }}>
              {wedding.bride.name}
            </p>
            <div className="w-8 h-px mx-auto my-4" style={{ background: "var(--color-gold)" }} />
            <p className="text-xs tracking-widest" style={{ color: "var(--color-text-light)" }}>
              {wedding.date.year} · {String(wedding.date.month).padStart(2, "0")} · {String(wedding.date.day).padStart(2, "0")}
            </p>
            <p className="text-xs mt-1 tracking-wide" style={{ color: "var(--color-text-light)" }}>
              {wedding.date.dayOfWeek} {wedding.date.time}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ opacity: hintOpacity }}
        >
          <p className="text-[10px] tracking-[0.35em] text-white/50">SCROLL</p>
          <div className="w-px h-8 bg-white/25 animate-pulse" />
        </motion.div>
      </div>
    </div>
  );
}
