"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useWedding } from "@/context/WeddingContext";

export default function GallerySection() {
  const { gallery } = useWedding();

  return (
    <section style={{ background: "var(--color-text)" }}>
      <div className="py-10 text-center">
        <p className="text-xs tracking-[0.3em] text-white/50">GALLERY</p>
        <div className="w-8 h-px bg-white/20 mx-auto mt-2" />
      </div>
      <div className="space-y-[2px]">
        {gallery.map((img, i) => (
          <motion.div
            key={i}
            className="relative overflow-hidden"
            style={{ height: "70vh" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8 }}
          >
            <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="480px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <span className="absolute bottom-4 right-5 text-[10px] font-mono text-white/30">
              {String(i + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
