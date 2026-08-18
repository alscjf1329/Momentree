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
  "--color-primary": "#b8758a",
  "--color-primary-light": "#d9aab9",
  "--color-primary-dark": "#8a4a60",
  "--color-accent": "#f0dde3",
  "--color-gold": "#c9a96e",
  "--color-cream": "#fdf5f6",
  "--color-warm-gray": "#b09098",
  "--color-text": "#3d1f28",
  "--color-text-light": "#8a5a64",
} as React.CSSProperties;

// 보태니컬 SVG 장식
function Botanical({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 50 Q40 35 20 40 Q30 25 55 30" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4"/>
      <path d="M60 50 Q80 35 100 40 Q90 25 65 30" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4"/>
      <path d="M55 30 Q50 15 60 8 Q70 15 65 30" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.35"/>
      <path d="M40 38 Q35 28 42 22" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.3"/>
      <path d="M80 38 Q85 28 78 22" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.3"/>
      <circle cx="60" cy="50" r="2" fill="currentColor" opacity="0.3"/>
      <circle cx="42" cy="22" r="1.5" fill="currentColor" opacity="0.25"/>
      <circle cx="78" cy="22" r="1.5" fill="currentColor" opacity="0.25"/>
    </svg>
  );
}

function Hero() {
  const w = useWedding();
  return (
    <section className="relative overflow-hidden" style={{ height: "100dvh" }}>
      <Image src={w.introBg} alt="bg" fill className="object-cover" priority sizes="480px" />
      {/* 소프트 그라디언트 오버레이 */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(253,245,246,0.55) 0%, rgba(253,245,246,0.3) 40%, rgba(61,31,40,0.7) 100%)" }} />

      {/* 상단 보태니컬 */}
      <motion.div className="absolute top-8 left-1/2 -translate-x-1/2 w-40"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}>
        <Botanical className="text-[#b8758a] w-full" />
      </motion.div>

      {/* 중앙 콘텐츠 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}>
          <p className="text-[9px] tracking-[0.5em] mb-6"
            style={{ color: "#b8758a" }}>WEDDING INVITATION</p>
          <h1 className="font-serif leading-snug" style={{ color: "#3d1f28" }}>
            <span className="block text-[2.6rem] font-light tracking-widest">{w.groom.nameFull}</span>
            <span className="block my-3" style={{ color: "#c9a96e", fontSize: "1.5rem" }}>♥</span>
            <span className="block text-[2.6rem] font-light tracking-widest">{w.bride.nameFull}</span>
          </h1>
        </motion.div>
      </div>

      {/* 하단 날짜 + 보태니컬 */}
      <motion.div className="absolute bottom-12 left-0 right-0 text-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }}>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-8 h-px" style={{ background: "#c9a96e", opacity: 0.6 }} />
          <p className="text-[11px] tracking-[0.3em] text-white/80">
            {w.date.year} · {String(w.date.month).padStart(2,"0")} · {String(w.date.day).padStart(2,"0")}
          </p>
          <div className="w-8 h-px" style={{ background: "#c9a96e", opacity: 0.6 }} />
        </div>
        <p className="text-[10px] text-white/60 tracking-wider">
          {w.date.dayOfWeek} {w.date.time}
        </p>
      </motion.div>
    </section>
  );
}

const ROTATIONS = [-3, 2, -2, 4, -1];

function PolaroidGallery() {
  const w = useWedding();
  if (w.gallery.length === 0) return null;
  return (
    <section className="py-16 bg-[#fdf5f6]">
      <motion.div className="text-center mb-10"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <p className="text-[9px] tracking-[0.5em] mb-3" style={{ color: "#b09098" }}>GALLERY</p>
        <Botanical className="text-[#b8758a] w-24 mx-auto" />
      </motion.div>
      <div className="px-6 space-y-8">
        {w.gallery.map((img, i) => (
          <motion.div key={i}
            className="mx-auto"
            style={{
              maxWidth: 260,
              transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)`,
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.1, duration: 0.6 }}>
            {/* 폴라로이드 카드 */}
            <div className="bg-white p-3 pb-8 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
              <div className="relative" style={{ aspectRatio: "4/3" }}>
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="260px" />
              </div>
              <p className="text-center text-[10px] mt-3 font-serif"
                style={{ color: "#b09098" }}>{img.alt}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default function RomanticTemplate() {
  return (
    <div style={VARS}>
      <Hero />
      <GreetingSection />
      <CalendarSection />
      <PolaroidGallery />
      <LocationSection />
      <ContactSection />
      <RSVPSection />
      <GuestbookSection />
    </div>
  );
}