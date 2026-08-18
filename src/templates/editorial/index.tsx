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
  "--color-primary": "#1a1a1a",
  "--color-primary-light": "#555",
  "--color-primary-dark": "#000",
  "--color-accent": "#e0dbd5",
  "--color-gold": "#c8a96e",
  "--color-cream": "#f2ede8",
  "--color-warm-gray": "#999",
  "--color-text": "#1a1a1a",
  "--color-text-light": "#666",
} as React.CSSProperties;

function Hero() {
  const w = useWedding();
  return (
    <section className="relative overflow-hidden" style={{ height: "100dvh" }}>
      <Image src={w.introBg} alt="bg" fill className="object-cover" priority sizes="480px" />
      <div className="absolute inset-0 bg-black/72" />
      <motion.div
        className="absolute top-10 left-0 right-0 px-8 flex justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <span className="text-[9px] tracking-[0.5em] text-white/35">WEDDING</span>
        <span className="text-[9px] tracking-[0.5em] text-white/35">
          {w.date.year}.{String(w.date.month).padStart(2,"0")}.{String(w.date.day).padStart(2,"0")}
        </span>
      </motion.div>
      <div className="absolute inset-0 flex flex-col justify-center px-8">
        <motion.div className="w-full h-px bg-white/20 mb-8"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 1 }} style={{ transformOrigin: "left" }} />
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}>
          <p className="text-[8px] tracking-[0.6em] text-white/35 mb-5">INVITATION</p>
          <h1 className="font-serif text-white leading-none">
            <span className="block text-5xl font-light tracking-widest">{w.groom.name}</span>
            <span className="block text-white/20 text-3xl my-3 tracking-widest">&amp;</span>
            <span className="block text-5xl font-light tracking-widest">{w.bride.name}</span>
          </h1>
        </motion.div>
        <motion.div className="w-full h-px bg-white/20 mt-8"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 1 }} style={{ transformOrigin: "right" }} />
        <motion.p className="text-[10px] text-white/40 tracking-[0.3em] mt-5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          {w.venue.name} · {w.venue.hall}
        </motion.p>
      </div>
      <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
        <span className="text-[8px] tracking-[0.5em] text-white/25">SCROLL</span>
        <motion.div className="w-px h-8 bg-white/25"
          initial={{ opacity: 0.25 }}
          animate={{ opacity: [0.25, 0.9, 0.25] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} />
      </motion.div>
    </section>
  );
}

function FilmstripGallery() {
  const w = useWedding();
  if (w.gallery.length === 0) return null;
  return (
    <section className="py-14 bg-[#0d0d0d]">
      <motion.div className="px-8 mb-7 flex items-center gap-4"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <span className="text-[8px] tracking-[0.5em] text-white/25">GALLERY</span>
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[8px] text-white/20 font-mono">0{w.gallery.length}</span>
      </motion.div>
      <div className="flex gap-3 overflow-x-auto px-8 pb-4"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
        {w.gallery.map((img, i) => (
          <div key={i} className="relative flex-none"
            style={{ width: "72vw", maxWidth: 300, height: "50vh", scrollSnapAlign: "start" }}>
            <div className="absolute top-0 inset-x-0 h-5 bg-[#0d0d0d] z-10 flex items-center px-2 gap-1">
              {[...Array(7)].map((_,j) => (
                <div key={j} className="w-1.5 h-1.5 rounded-full border border-white/15 flex-shrink-0" />
              ))}
            </div>
            <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="300px" />
            <div className="absolute bottom-0 inset-x-0 h-5 bg-[#0d0d0d] z-10 flex items-center justify-between px-2">
              <div className="flex gap-1">
                {[...Array(7)].map((_,j) => (
                  <div key={j} className="w-1.5 h-1.5 rounded-full border border-white/15 flex-shrink-0" />
                ))}
              </div>
              <span className="text-[8px] text-white/25 font-mono">{String(i+1).padStart(2,"0")}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function EditorialTemplate() {
  return (
    <div style={VARS}>
      <Hero />
      <GreetingSection />
      <CalendarSection />
      <FilmstripGallery />
      <LocationSection />
      <ContactSection />
      <RSVPSection />
      <GuestbookSection />
    </div>
  );
}