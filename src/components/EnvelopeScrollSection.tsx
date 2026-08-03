"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useWedding } from "@/context/WeddingContext";

export default function EnvelopeScrollSection() {
  const wedding = useWedding();
  const sectionRef = useRef<HTMLElement>(null);
  const closedImgRef = useRef<HTMLDivElement>(null);
  const openImgRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!sectionRef.current) return;

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          pin: true,
          start: "top top",
          end: "+=200vh",
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        gsap.to(closedImgRef.current, {
          opacity: 0,
          scale: 1.04,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=100vh",
            scrub: 2,
            invalidateOnRefresh: true,
          },
        });

        gsap.fromTo(
          openImgRef.current,
          { opacity: 0, scale: 1.04 },
          {
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "+=100vh",
              scrub: 2,
              invalidateOnRefresh: true,
            },
          }
        );

        gsap.to(hintRef.current, {
          opacity: 0,
          y: 10,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=50vh",
            scrub: 1,
          },
        });

        gsap.fromTo(
          cardRef.current,
          { y: 70, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "+=100vh",
              end: "+=180vh",
              scrub: 1.5,
              invalidateOnRefresh: true,
            },
          }
        );
      }, sectionRef);
    };

    init();
    return () => { ctx?.revert(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ height: "100dvh", background: "#1a1208" }}
    >
      <div
        ref={closedImgRef}
        className="absolute inset-0"
        style={{ willChange: "transform, opacity" }}
      >
        <Image
          src={wedding.envelopeClosed}
          alt="closed envelope"
          fill
          priority
          className="object-cover"
          sizes="480px"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div
        ref={openImgRef}
        className="absolute inset-0"
        style={{ opacity: 0, willChange: "transform, opacity" }}
      >
        <Image
          src={wedding.envelopeOpen}
          alt="open envelope"
          fill
          className="object-cover"
          sizes="480px"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      <div
        ref={cardRef}
        className="absolute inset-x-8 bottom-0 flex justify-center"
        style={{ opacity: 0, willChange: "transform, opacity" }}
      >
        <div
          className="w-full max-w-xs text-center"
          style={{
            background: "rgba(250,246,241,0.96)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            padding: "32px 24px env(safe-area-inset-bottom, 48px)",
            paddingBottom: "max(48px, env(safe-area-inset-bottom))",
            boxShadow: "0 -4px 60px rgba(0,0,0,0.3)",
          }}
        >
          <p className="text-[10px] tracking-[0.35em]" style={{ color: "var(--color-warm-gray)" }}>
            WEDDING INVITATION
          </p>
          <div className="w-8 h-px mx-auto my-4" style={{ background: "var(--color-gold)" }} />
          <p className="font-serif text-xl tracking-[0.2em]" style={{ color: "var(--color-text)" }}>
            {wedding.groom.name}
          </p>
          <p className="text-sm my-2" style={{ color: "var(--color-gold)" }}>♥</p>
          <p className="font-serif text-xl tracking-[0.2em]" style={{ color: "var(--color-text)" }}>
            {wedding.bride.name}
          </p>
          <div className="w-8 h-px mx-auto my-4" style={{ background: "var(--color-gold)" }} />
          <p className="text-xs tracking-widest" style={{ color: "var(--color-text-light)" }}>
            {wedding.date.year} · {String(wedding.date.month).padStart(2, "0")} · {String(wedding.date.day).padStart(2, "0")}
          </p>
          <p className="text-xs mt-1 tracking-wide" style={{ color: "var(--color-text-light)" }}>
            {wedding.date.dayOfWeek} {wedding.date.time}
          </p>
        </div>
      </div>

      <div
        ref={hintRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <p className="text-[10px] tracking-[0.35em] text-white/50">SCROLL</p>
        <div className="w-px h-8 bg-white/25 animate-pulse" />
      </div>
    </section>
  );
}