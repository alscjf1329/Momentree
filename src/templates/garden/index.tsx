"use client";

import Image from "next/image";
import { useWedding } from "@/context/WeddingContext";
import { motion } from "framer-motion";
import GreetingSection from "@/components/sections/GreetingSection";
import CalendarSection from "@/components/sections/CalendarSection";
import LocationSection from "@/components/sections/LocationSection";
import ContactSection from "@/components/sections/ContactSection";
import RSVPSection from "@/components/sections/RSVPSection";

const VARS = {
  "--color-primary": "#6e8a5e",
  "--color-primary-light": "#a8c49a",
  "--color-primary-dark": "#455c3b",
  "--color-accent": "#eaf0e4",
  "--color-gold": "#b8a75a",
  "--color-cream": "#fbfaf7",
  "--color-warm-gray": "#93a087",
  "--color-text": "#2c3226",
  "--color-text-light": "#6b7663",
} as React.CSSProperties;

function FloralDivider() {
  return (
    <svg viewBox="0 0 160 40" className="mx-auto" width="120" fill="none"
      style={{ color: "#6e8a5e", opacity: 0.5 }}>
      <path d="M80 33 Q54 24 28 28 Q40 14 68 20" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M80 33 Q106 24 132 28 Q120 14 92 20" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M68 20 Q64 8 80 2 Q96 8 92 20" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="80" cy="33" r="1.6" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function Hero() {
  const w = useWedding();
  return (
    <section className="relative" style={{ height: "100dvh" }}>
      <Image src={w.introBg} alt="bg" fill className="object-cover" priority sizes="480px" />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg,rgba(30,35,20,0.05) 0%,rgba(20,25,12,0.15) 55%,rgba(15,20,10,0.55) 100%)"
      }} />

      <motion.p className="absolute top-10 left-0 right-0 text-center text-[9px] tracking-[0.5em] text-white/70"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.9 }}>
        WE ARE GETTING
      </motion.p>

      <motion.p
        className="absolute top-1/2 left-0 right-0 text-center leading-none -translate-y-1/2"
        style={{ fontFamily: "'Sacramento', cursive", fontSize: "clamp(56px,18vw,96px)", color: "#e8dfa0" }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}>
        married
      </motion.p>

      <div className="absolute bottom-10 left-7 right-7 flex items-end justify-between">
        <motion.span className="font-serif text-white text-sm tracking-[0.15em]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }}>
          {w.groom.name}
        </motion.span>
        <motion.div className="text-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }}>
          <p className="text-[10px] tracking-[0.2em] text-white/75">
            {w.date.year}.{String(w.date.month).padStart(2, "0")}.{String(w.date.day).padStart(2, "0")}
          </p>
        </motion.div>
        <motion.span className="font-serif text-white text-sm tracking-[0.15em]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }}>
          {w.bride.name}
        </motion.span>
      </div>
    </section>
  );
}

function GardenGallery() {
  const w = useWedding();
  return (
    <section className="py-16 px-3 bg-[var(--color-cream)]">
      <motion.div className="text-center mb-8"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <p className="font-serif text-lg text-[var(--color-text)] tracking-wide mb-3">웨딩 갤러리</p>
        <FloralDivider />
      </motion.div>
      <div className="grid grid-cols-2 gap-1.5">
        {w.gallery.map((img, i) => (
          <motion.div key={i} className="relative overflow-hidden rounded-sm"
            style={{ aspectRatio: i % 3 === 0 ? "3/4" : "1/1" }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.6 }}>
            <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="240px" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default function GardenTemplate() {
  return (
    <div style={VARS}>
      <Hero />
      <GreetingSection />
      <CalendarSection />
      <GardenGallery />
      <LocationSection />
      <ContactSection />
      <RSVPSection />
    </div>
  );
}
