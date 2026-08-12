"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useWedding } from "@/context/WeddingContext";

export default function IntroSection() {
  const wedding = useWedding();
  const [phase, setPhase] = useState<"loading" | "names" | "date" | "done">("loading");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("names"), 600);
    const t2 = setTimeout(() => setPhase("date"), 2000);
    const t3 = setTimeout(() => setPhase("done"), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden" style={{ height: "100dvh" }}>
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-[-8%]"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
        >
          <Image
            src={wedding.introBg}
            alt="wedding background"
            fill
            priority
            className="object-cover"
            sizes="480px"
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50" />
      </div>

      <div className="relative z-10 text-center text-white px-8">
        <AnimatePresence>
          {phase !== "loading" && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-16 h-px bg-white/60 mx-auto mb-8"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(phase === "names" || phase === "date" || phase === "done") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="font-serif"
            >
              <p className="text-sm tracking-[0.3em] text-white/70 mb-3">WEDDING INVITATION</p>
              <h1 className="text-4xl font-light tracking-widest leading-loose">
                {wedding.groom.nameFull}
                <span className="block text-2xl text-white/50 my-2 font-light">♥</span>
                {wedding.bride.nameFull}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(phase === "date" || phase === "done") && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mt-8"
            >
              <div className="w-8 h-px bg-white/40 mx-auto mb-6" />
              <p className="text-sm tracking-[0.25em] text-white/80 font-light">
                {wedding.date.year}.{String(wedding.date.month).padStart(2, "0")}.{String(wedding.date.day).padStart(2, "0")}
              </p>
              <p className="text-xs tracking-widest text-white/60 mt-2 font-light">
                {wedding.date.dayOfWeek} {wedding.date.time}
              </p>
              <p className="text-xs tracking-wider text-white/50 mt-1 font-light">
                {wedding.venue.name}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="mt-12"
            >
              <div className="w-16 h-px bg-white/60 mx-auto" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {phase === "done" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] tracking-[0.3em]">SCROLL</span>
            <motion.div
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="w-px h-8 bg-white/30"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}