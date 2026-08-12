"use client";

import Image from "next/image";
import { useWedding } from "@/context/WeddingContext";
import { motion } from "framer-motion";
import GreetingSection from "@/components/sections/GreetingSection";
import CalendarSection from "@/components/sections/CalendarSection";
import GallerySection from "@/components/sections/GallerySection";
import LocationSection from "@/components/sections/LocationSection";
import ContactSection from "@/components/sections/ContactSection";
import RSVPSection from "@/components/sections/RSVPSection";

const VARS = {
  "--color-primary": "#c4758a",
  "--color-primary-light": "#e0a8ba",
  "--color-primary-dark": "#9a4a62",
  "--color-accent": "#fae8ec",
  "--color-gold": "#d4a07a",
  "--color-cream": "#fdf6f8",
  "--color-warm-gray": "#b08890",
  "--color-text": "#3a2030",
  "--color-text-light": "#8a5868",
} as React.CSSProperties;

const PETAL_DATA = [
  { x: 12, d: 4.2, size: 9, delay: 0 },
  { x: 28, d: 5.1, size: 6, delay: 0.7 },
  { x: 45, d: 3.8, size: 10, delay: 1.4 },
  { x: 62, d: 4.8, size: 7, delay: 0.3 },
  { x: 78, d: 5.5, size: 8, delay: 1.1 },
  { x: 20, d: 4.0, size: 6, delay: 2.0 },
  { x: 55, d: 5.2, size: 9, delay: 0.5 },
  { x: 88, d: 3.9, size: 7, delay: 1.8 },
  { x: 35, d: 4.6, size: 5, delay: 2.5 },
  { x: 70, d: 5.0, size: 8, delay: 0.9 },
];

function Petals() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {PETAL_DATA.map((p, i) => (
        <motion.div key={i} className="absolute"
          style={{ left: `${p.x}%`, top: -16 }}
          initial={{ y: 0, rotate: 0, x: 0 }}
          animate={{ y: "110vh", rotate: [0, 180, 360], x: [0, 25, -15, 8, 0] }}
          transition={{ duration: p.d, delay: p.delay, repeat: Infinity, ease: "linear", repeatDelay: p.delay * 0.5 }}>
          <svg width={p.size} height={p.size * 1.5} viewBox="0 0 10 15" fill="none">
            <ellipse cx="5" cy="7.5" rx="4.5" ry="6.5" fill="rgba(220,140,165,0.45)" transform="rotate(15 5 7.5)" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

function Hero() {
  const w = useWedding();
  return (
    <section className="relative overflow-hidden flex flex-col items-center justify-center"
      style={{ height: "100dvh", background: "#fdf0f4" }}>
      <Image src={w.introBg} alt="bg" fill className="object-cover"
        style={{ opacity: 0.22 }} priority sizes="480px" />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg,rgba(253,240,244,0.2) 0%,rgba(253,238,242,0.55) 60%,rgba(252,232,238,0.92) 100%)"
      }} />
      <Petals />

      <div className="relative z-10 text-center px-9">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3 }}>
          <svg viewBox="0 0 160 64" className="mx-auto mb-5" width="108" fill="none"
            style={{ color: "#c4758a", opacity: 0.38 }}>
            <path d="M80 54 Q52 37 24 45 Q38 24 72 32" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M80 54 Q108 37 136 45 Q122 24 88 32" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M72 32 Q66 12 80 4 Q94 12 88 32" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M48 42 Q40 30 50 22" stroke="currentColor" strokeWidth="0.9" fill="none" opacity="0.6" />
            <path d="M112 42 Q120 30 110 22" stroke="currentColor" strokeWidth="0.9" fill="none" opacity="0.6" />
            <circle cx="50" cy="22" r="1.5" fill="currentColor" opacity="0.5" />
            <circle cx="110" cy="22" r="1.5" fill="currentColor" opacity="0.5" />
            <circle cx="80" cy="54" r="2" fill="currentColor" opacity="0.4" />
          </svg>
        </motion.div>

        <motion.p className="text-[8px] tracking-[0.55em] mb-6" style={{ color: "rgba(154,74,98,0.45)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
          WEDDING INVITATION
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1.1 }}>
          <h1 className="font-serif" style={{ color: "#3a2030" }}>
            <span className="block font-light leading-snug" style={{ fontSize: "clamp(26px,8vw,36px)", letterSpacing: "0.18em" }}>
              {w.groom.nameFull}
            </span>
            <motion.span className="block my-3" style={{ color: "#c4758a", fontSize: 22 }}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>
              ♡
            </motion.span>
            <span className="block font-light leading-snug" style={{ fontSize: "clamp(26px,8vw,36px)", letterSpacing: "0.18em" }}>
              {w.bride.nameFull}
            </span>
          </h1>
        </motion.div>

        <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.9 }}>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-px" style={{ background: "rgba(196,117,138,0.28)" }} />
            <p className="text-[10px] tracking-[0.28em]" style={{ color: "rgba(58,32,48,0.5)" }}>
              {w.date.year}.{String(w.date.month).padStart(2, "0")}.{String(w.date.day).padStart(2, "0")}
            </p>
            <div className="w-8 h-px" style={{ background: "rgba(196,117,138,0.28)" }} />
          </div>
          <p className="text-[10px] tracking-wider" style={{ color: "rgba(138,88,104,0.45)" }}>
            {w.venue.name}
          </p>
        </motion.div>
      </div>

      <motion.p className="absolute bottom-10 text-[8px] tracking-[0.5em]"
        style={{ color: "rgba(196,117,138,0.4)" }}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2.2, repeat: Infinity }}>
        SCROLL ↓
      </motion.p>
    </section>
  );
}

export default function BlossomTemplate() {
  return (
    <div style={VARS}>
      <Hero />
      <GreetingSection />
      <CalendarSection />
      <GallerySection />
      <LocationSection />
      <ContactSection />
      <RSVPSection />
    </div>
  );
}
