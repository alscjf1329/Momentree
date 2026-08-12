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
  "--color-primary": "#3a3a3a",
  "--color-primary-light": "#888",
  "--color-primary-dark": "#111",
  "--color-accent": "#e8e8e8",
  "--color-gold": "#b8954a",
  "--color-cream": "#f8f8f8",
  "--color-warm-gray": "#aaa",
  "--color-text": "#1c1c1c",
  "--color-text-light": "#888",
} as React.CSSProperties;

function Hero() {
  const w = useWedding();
  return (
    <section style={{ minHeight: "100dvh", background: "#fff" }}
      className="flex flex-col px-8 pt-16 pb-0">
      <motion.p className="text-[9px] tracking-[0.6em] text-gray-300 mb-12"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        WEDDING INVITATION
      </motion.p>
      <motion.div className="flex-1 flex flex-col justify-center"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.9 }}>
        <h1 className="font-serif text-gray-900 leading-tight mb-8">
          <span className="block text-[2.8rem] font-light tracking-wider">{w.groom.nameFull}</span>
          <span className="block text-gray-200 text-2xl my-3 tracking-[0.4em] font-light">+</span>
          <span className="block text-[2.8rem] font-light tracking-wider">{w.bride.nameFull}</span>
        </h1>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-8 h-px bg-gray-200" />
          <span className="text-[10px] tracking-[0.3em] text-gray-400">
            {w.date.year} · {String(w.date.month).padStart(2,"0")} · {String(w.date.day).padStart(2,"0")}
          </span>
        </div>
        <p className="text-[11px] tracking-wider text-gray-400 font-light">
          {w.date.dayOfWeek} {w.date.time}
        </p>
        <p className="text-[11px] tracking-wide text-gray-400 mt-1 font-light">{w.venue.name}</p>
      </motion.div>
      {/* 하단 사진 */}
      <motion.div className="relative overflow-hidden"
        style={{ height: "38vh", marginLeft: -32, marginRight: -32 }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1 }}>
        <Image src={w.introBg} alt="wedding" fill className="object-cover object-top" sizes="480px" priority />
        <div className="absolute inset-0 bg-white/10" />
      </motion.div>
    </section>
  );
}

function GridGallery() {
  const w = useWedding();
  return (
    <section className="py-16 bg-white">
      <motion.div className="px-8 mb-8 text-center"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <p className="text-[9px] tracking-[0.5em] text-gray-300 mb-3">GALLERY</p>
        <div className="w-8 h-px bg-gray-200 mx-auto" />
      </motion.div>
      <div className="grid grid-cols-2 gap-0.5">
        {w.gallery.map((img, i) => (
          <motion.div key={i} className="relative"
            style={{ aspectRatio: i % 3 === 0 ? "1/1.2" : "1/1" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.5 }}>
            <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="240px" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default function MinimalTemplate() {
  return (
    <div style={VARS}>
      <Hero />
      <GreetingSection />
      <CalendarSection />
      <GridGallery />
      <LocationSection />
      <ContactSection />
      <RSVPSection />
    </div>
  );
}