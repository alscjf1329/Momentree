"use client";

import Image from "next/image";
import { useWedding } from "@/context/WeddingContext";
import { motion } from "framer-motion";
import GreetingSection from "@/components/sections/GreetingSection";
import CalendarSection from "@/components/sections/CalendarSection";
import LocationSection from "@/components/sections/LocationSection";
import ContactSection from "@/components/sections/ContactSection";
import RSVPSection from "@/components/sections/RSVPSection";
import GuestbookSection from "@/components/sections/GuestbookSection";

const VARS = {
  "--color-primary": "#c9a96e",
  "--color-primary-light": "#dfcc94",
  "--color-primary-dark": "#a07f3c",
  "--color-accent": "#1a2440",
  "--color-gold": "#d4b878",
  "--color-cream": "#0c1422",
  "--color-warm-gray": "#7a8aa0",
  "--color-text": "#f0ece4",
  "--color-text-light": "#a8b0c0",
} as React.CSSProperties;

function Corner({ className }: { className: string }) {
  return (
    <div className={`absolute ${className}`} style={{ opacity: 0.22 }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M0 0 L16 0 L16 1.5 M0 0 L0 16 L1.5 16" stroke="#c9a96e" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

function GoldRule() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(201,169,110,0.35))" }} />
      <span style={{ color: "rgba(201,169,110,0.45)", fontSize: 7 }}>◆</span>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(201,169,110,0.35),transparent)" }} />
    </div>
  );
}

function Hero() {
  const w = useWedding();
  return (
    <section className="relative overflow-hidden" style={{ height: "100dvh", background: "#070d1a" }}>
      <Image src={w.introBg} alt="bg" fill className="object-cover" style={{ opacity: 0.18 }} priority sizes="480px" />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg,rgba(7,13,26,0.35) 0%,rgba(10,16,32,0.92) 100%)"
      }} />

      {/* Corner decorations */}
      <Corner className="top-7 left-7" />
      <div className="absolute top-7 right-7" style={{ opacity: 0.22, transform: "scaleX(-1)" }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M0 0 L16 0 L16 1.5 M0 0 L0 16 L1.5 16" stroke="#c9a96e" strokeWidth="1.2" />
        </svg>
      </div>
      <div className="absolute bottom-7 left-7" style={{ opacity: 0.22, transform: "scaleY(-1)" }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M0 0 L16 0 L16 1.5 M0 0 L0 16 L1.5 16" stroke="#c9a96e" strokeWidth="1.2" />
        </svg>
      </div>
      <div className="absolute bottom-7 right-7" style={{ opacity: 0.22, transform: "scale(-1,-1)" }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M0 0 L16 0 L16 1.5 M0 0 L0 16 L1.5 16" stroke="#c9a96e" strokeWidth="1.2" />
        </svg>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}>
          <p className="text-[7px] tracking-[0.9em] mb-5" style={{ color: "rgba(201,169,110,0.45)" }}>
            WEDDING INVITATION
          </p>
          <GoldRule />
        </motion.div>

        <motion.div className="py-8" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.7 }}>
          <h1 className="font-serif text-white font-light">
            <span className="block leading-snug" style={{ fontSize: "clamp(24px,7.5vw,34px)", letterSpacing: "0.22em" }}>
              {w.groom.nameFull}
            </span>
            <motion.span className="block my-2.5" style={{ color: "rgba(201,169,110,0.55)", fontSize: 18, letterSpacing: "0.4em" }}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 0.75, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity }}>
              ✦
            </motion.span>
            <span className="block leading-snug" style={{ fontSize: "clamp(24px,7.5vw,34px)", letterSpacing: "0.22em" }}>
              {w.bride.nameFull}
            </span>
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.1 }}>
          <GoldRule />
          <div className="mt-5 space-y-1.5">
            <p className="text-[10px] tracking-[0.28em]" style={{ color: "rgba(240,236,228,0.5)" }}>
              {w.date.year}년 {w.date.month}월 {w.date.day}일 {w.date.dayOfWeek}
            </p>
            <p className="text-[9px] tracking-widest" style={{ color: "rgba(201,169,110,0.42)" }}>
              {w.venue.name} · {w.venue.hall}
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
        <motion.div className="w-px h-8 mx-auto"
          style={{ background: "linear-gradient(180deg,rgba(201,169,110,0.45),transparent)" }}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity }} />
      </motion.div>
    </section>
  );
}

function LuxuryGallery() {
  const w = useWedding();
  if (w.gallery.length === 0) return null;
  return (
    <section className="py-14" style={{ background: "#0c1422" }}>
      <div className="text-center mb-8">
        <p className="text-[7px] tracking-[0.7em]" style={{ color: "rgba(201,169,110,0.35)" }}>GALLERY</p>
        <div className="w-5 h-px mx-auto mt-2" style={{ background: "rgba(201,169,110,0.18)" }} />
      </div>
      <div className="px-6 space-y-2">
        {/* Alternating sizes */}
        {w.gallery.map((img, i) => (
          <motion.div key={i} className="relative overflow-hidden"
            style={{ height: i % 2 === 0 ? 210 : 140 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.12 }}>
            <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="400px" />
            <div className="absolute inset-0" style={{
              background: "linear-gradient(180deg,transparent 40%,rgba(7,13,26,0.65) 100%)"
            }} />
            {/* Gold frame lines */}
            <div className="absolute top-2 left-2 right-2 bottom-2 pointer-events-none" style={{
              border: "1px solid rgba(201,169,110,0.1)"
            }} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default function LuxuryTemplate() {
  return (
    <div style={VARS}>
      <Hero />
      <GreetingSection />
      <CalendarSection />
      <LuxuryGallery />
      <LocationSection />
      <ContactSection />
      <RSVPSection />
      <GuestbookSection />
    </div>
  );
}
