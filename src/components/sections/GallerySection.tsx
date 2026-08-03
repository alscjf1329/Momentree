"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useWedding } from "@/context/WeddingContext";

export default function GallerySection() {
  const wedding = useWedding();
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current || !sectionRef.current) return;

      const images = containerRef.current.querySelectorAll<HTMLElement>(".gallery-slide");
      const count = images.length;

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${count * 100}%`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        images.forEach((img, i) => {
          const progress = i / count;
          const nextProgress = (i + 1) / count;

          gsap.fromTo(
            img,
            { scale: 1.1, opacity: i === 0 ? 1 : 0, zIndex: i },
            {
              scale: 1,
              opacity: 1,
              zIndex: i + 1,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: `top+=${progress * count * 100}% top`,
                end: `top+=${(progress + 0.5 / count) * count * 100}% top`,
                scrub: 2,
                invalidateOnRefresh: true,
              },
            }
          );

          if (i < count - 1) {
            gsap.to(img, {
              scale: 0.93,
              opacity: 0,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: `top+=${(nextProgress - 0.5 / count) * count * 100}% top`,
                end: `top+=${nextProgress * count * 100}% top`,
                scrub: 2,
                invalidateOnRefresh: true,
              },
            });
          }
        });
      }, sectionRef);
    };

    init();
    return () => { ctx?.revert(); };
  }, []);

  const images = wedding.gallery;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ height: "100dvh", background: "var(--color-text)" }}
    >
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 text-center">
        <p className="text-xs tracking-[0.3em] text-white/50">GALLERY</p>
        <div className="w-8 h-px bg-white/20 mx-auto mt-2" />
      </div>

      <div ref={containerRef} className="absolute inset-0">
        {images.map((img, i) => (
          <div
            key={i}
            className="gallery-slide absolute inset-0"
            style={{ opacity: i === 0 ? 1 : 0, zIndex: i, willChange: "transform, opacity" }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="480px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest">
              {String(i + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}