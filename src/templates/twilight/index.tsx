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
  "--color-primary": "#8b9ec4",
  "--color-primary-light": "#b4c2da",
  "--color-primary-dark": "#4a5a8a",
  "--color-accent": "#1e2035",
  "--color-gold": "#c9b896",
  "--color-cream": "#0e0f1c",
  "--color-warm-gray": "#6a7090",
  "--color-text": "#e8eaf0",
  "--color-text-light": "#9aa0b8",
} as React.CSSProperties;

function Stars() {
  const data = [
    { x: 8, y: 12, s: 2, d: 2.1 }, { x: 23, y: 5, s: 1, d: 3.2 },
    { x: 41, y: 18, s: 2, d: 1.8 }, { x: 57, y: 7, s: 1, d: 2.7 },
    { x: 72, y: 15, s: 2, d: 3.5 }, { x: 88, y: 4, s: 1, d: 2.0 },
    { x: 15, y: 30, s: 1, d: 4.0 }, { x: 34, y: 38, s: 2, d: 1.5 },
    { x: 62, y: 28, s: 1, d: 3.1 }, { x: 80, y: 35, s: 2, d: 2.4 },
    { x: 5, y: 48, s: 1, d: 2.9 }, { x: 47, y: 45, s: 2, d: 1.7 },
    { x: 93, y: 22, s: 1, d: 3.8 }, { x: 28, y: 55, s: 2, d: 2.2 },
    { x: 68, y: 50, s: 1, d: 3.0 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none">
      {data.map((star, i) => (
        <motion.div key={i}
          className="absolute rounded-full bg-white"
          style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.s, height: star.s }}
          initial={{ opacity: 0.15 }}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: star.d, repeat: Infinity, delay: i * 0.25 }} />
      ))}
    </div>
  );
}

function Hero() {
  const w = useWedding();
  return (
    <section className="relative overflow-hidden" style={{ height: "100dvh", background: "#080a14" }}>
      <Image src={w.introBg} alt="bg" fill className="object-cover" priority sizes="480px" />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg,rgba(8,10,30,0.55) 0%,rgba(12,14,38,0.82) 50%,rgba(6,8,18,0.98) 100%)"
      }} />
      <div className="absolute inset-x-0 bottom-0 h-2/3" style={{
        background: "linear-gradient(0deg,rgba(6,8,18,1) 0%,rgba(10,12,28,0.3) 50%,transparent 100%)"
      }} />
      <Stars />

      <div className="absolute inset-0 flex flex-col justify-center px-9">
        <motion.p className="text-[8px] tracking-[0.7em] mb-8"
          style={{ color: "rgba(139,158,196,0.45)" }}
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}>
          WEDDING INVITATION
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <h1 className="font-serif" style={{ color: "#dde2f0" }}>
            <span className="block font-light leading-snug" style={{ fontSize: "clamp(28px,9vw,40px)", letterSpacing: "0.12em" }}>
              {w.groom.nameFull}
            </span>
            <motion.span className="block my-3 font-serif" style={{ color: "rgba(139,158,196,0.55)", fontSize: 22 }}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity }}>
              ✦
            </motion.span>
            <span className="block font-light leading-snug" style={{ fontSize: "clamp(28px,9vw,40px)", letterSpacing: "0.12em" }}>
              {w.bride.nameFull}
            </span>
          </h1>
        </motion.div>

        <motion.div className="mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.9 }}>
          <div className="w-10 h-px mb-4" style={{ background: "rgba(139,158,196,0.25)" }} />
          <p className="text-xs tracking-[0.28em]" style={{ color: "rgba(200,210,232,0.45)" }}>
            {w.date.year}.{String(w.date.month).padStart(2, "0")}.{String(w.date.day).padStart(2, "0")}
          </p>
          <p className="text-[10px] tracking-wider mt-1.5" style={{ color: "rgba(139,158,196,0.35)" }}>
            {w.venue.name}
          </p>
        </motion.div>
      </div>

      <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }}>
        <motion.div className="w-px h-10" style={{ background: "linear-gradient(180deg,rgba(139,158,196,0.5),transparent)" }}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity }} />
      </motion.div>
    </section>
  );
}

function MoodyGallery() {
  const w = useWedding();
  if (w.gallery.length === 0) return null;
  return (
    <section className="py-14" style={{ background: "#080a14" }}>
      <div className="text-center mb-8">
        <p className="text-[8px] tracking-[0.6em]" style={{ color: "rgba(139,158,196,0.35)" }}>GALLERY</p>
        <div className="w-5 h-px mx-auto mt-2" style={{ background: "rgba(139,158,196,0.15)" }} />
      </div>
      <div className="grid grid-cols-2 gap-[3px] px-4">
        {w.gallery.map((img, i) => (
          <motion.div key={i} className="relative overflow-hidden"
            style={{ height: i % 4 === 0 || i % 4 === 3 ? 230 : 160 }}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.1 }}>
            <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="200px" />
            <div className="absolute inset-0" style={{
              background: "linear-gradient(180deg,transparent 30%,rgba(6,8,20,0.75) 100%)"
            }} />
            {/* Blue-purple tint overlay */}
            <div className="absolute inset-0" style={{ background: "rgba(20,28,70,0.22)", mixBlendMode: "color" }} />
            <span className="absolute bottom-2 right-3 text-[8px] font-mono"
              style={{ color: "rgba(139,158,196,0.35)" }}>
              0{i + 1}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default function TwilightTemplate() {
  return (
    <div style={VARS}>
      <Hero />
      <GreetingSection />
      <CalendarSection />
      <MoodyGallery />
      <LocationSection />
      <ContactSection />
      <RSVPSection />
      <GuestbookSection />
    </div>
  );
}
