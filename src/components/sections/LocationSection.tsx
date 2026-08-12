"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWedding } from "@/context/WeddingContext";

export default function LocationSection() {
  const wedding = useWedding();
  const [copied, setCopied] = useState(false);
  const { venue } = wedding;

  const copyAddress = async () => {
    await navigator.clipboard.writeText(venue.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 bg-[var(--color-cream)]">
      <motion.div
        className="text-center px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-xs tracking-[0.3em] text-[var(--color-warm-gray)] mb-2">LOCATION</p>
        <div className="section-divider mb-6" />
        <h2 className="font-serif text-xl text-[var(--color-text)] mb-1">{venue.name}</h2>
        <p className="text-sm text-[var(--color-text-light)] tracking-wide">{venue.hall}</p>
        <p className="text-sm text-[var(--color-text-light)] mt-2">{venue.address}</p>
      </motion.div>

      <motion.div
        className="mt-6 mx-4 rounded-2xl overflow-hidden shadow-md"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <iframe
          src={`https://map.kakao.com/link/map/${venue.name},${venue.lat},${venue.lng}`}
          width="100%"
          height="260"
          style={{ border: 0 }}
          loading="lazy"
          title="웨딩홀 위치"
        />
      </motion.div>

      <motion.div
        className="mt-4 px-4 flex gap-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <button
          onClick={copyAddress}
          className="flex-1 py-3 rounded-xl border border-[var(--color-primary-light)] text-[var(--color-primary)] text-sm tracking-wide transition-colors active:bg-[var(--color-primary)] active:text-white"
        >
          {copied ? "복사됨 ✓" : "주소 복사"}
        </button>
        <a
          href={venue.kakaoMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 rounded-xl bg-[#FEE500] text-[#3C1E1E] text-sm tracking-wide text-center font-medium"
        >
          카카오맵
        </a>
        <a
          href={venue.naverMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 rounded-xl bg-[#03C75A] text-white text-sm tracking-wide text-center font-medium"
        >
          네이버맵
        </a>
      </motion.div>
    </section>
  );
}