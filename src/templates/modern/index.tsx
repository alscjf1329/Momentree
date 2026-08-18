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
  "--color-primary": "#c47a5a",
  "--color-primary-light": "#e0a888",
  "--color-primary-dark": "#8a4a30",
  "--color-accent": "#ede0d4",
  "--color-gold": "#c4a060",
  "--color-cream": "#f5efe7",
  "--color-warm-gray": "#a08878",
  "--color-text": "#2d1e12",
  "--color-text-light": "#7a5a48",
} as React.CSSProperties;

function Hero() {
  const w = useWedding();
  return (
    <section className="relative" style={{ height: "100dvh" }}>
      <Image src={w.introBg} alt="bg" fill className="object-cover" priority sizes="480px" />
      {/* Warm gradient overlay — lighter top, darker bottom */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(160deg,rgba(245,239,231,0.08) 0%,rgba(45,30,18,0.72) 100%)"
      }} />

      {/* Top label */}
      <motion.div className="absolute top-10 left-8 right-8 flex justify-between items-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}>
        <span className="text-[8px] tracking-[0.5em]" style={{ color: "rgba(255,255,255,0.3)" }}>
          WEDDING
        </span>
        <span className="text-[8px] tracking-[0.4em]" style={{ color: "rgba(255,255,255,0.3)" }}>
          {w.date.year}
        </span>
      </motion.div>

      {/* Bottom left text block */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-14">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <h1 className="font-serif text-white font-light leading-none mb-5">
            <span className="block" style={{ fontSize: "clamp(30px,9vw,44px)", letterSpacing: "0.06em" }}>
              {w.groom.name}
            </span>
            <span className="block text-xl my-2.5" style={{ color: "rgba(255,255,255,0.28)", letterSpacing: "0.4em" }}>
              &amp;
            </span>
            <span className="block" style={{ fontSize: "clamp(30px,9vw,44px)", letterSpacing: "0.06em" }}>
              {w.bride.name}
            </span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.18)" }} />
            <span className="text-[10px] tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.45)" }}>
              {w.date.year}.{String(w.date.month).padStart(2, "0")}.{String(w.date.day).padStart(2, "0")} {w.date.dayOfWeek}
            </span>
          </div>
          <p className="text-[10px] tracking-wider mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
            {w.venue.name}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function InstagramGallery() {
  const w = useWedding();
  if (w.gallery.length === 0) return null;
  // 3-col square grid (Instagram style)
  return (
    <section className="py-12" style={{ background: "#f5efe7" }}>
      <div className="text-center mb-6">
        <p className="text-[8px] tracking-[0.55em]" style={{ color: "rgba(160,136,120,0.55)" }}>GALLERY</p>
      </div>
      <div className="grid grid-cols-3 gap-[2px]">
        {w.gallery.map((img, i) => (
          <motion.div key={i} className="relative overflow-hidden" style={{ paddingBottom: "100%" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.07 }}>
            <div className="absolute inset-0">
              <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="160px" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default function ModernTemplate() {
  return (
    <div style={VARS}>
      <Hero />
      <GreetingSection />
      <CalendarSection />
      <InstagramGallery />
      <LocationSection />
      <ContactSection />
      <RSVPSection />
    </div>
  );
}
