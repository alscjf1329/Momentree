"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWedding } from "@/context/WeddingContext";

type Side = "groom" | "bride";
type CopiedKey = string | null;

export default function ContactSection() {
  const wedding = useWedding();
  const [openSide, setOpenSide] = useState<Side | null>(null);
  const [copied, setCopied] = useState<CopiedKey>(null);

  const copyText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (wedding.groom.accounts.length === 0 && wedding.bride.accounts.length === 0) return null;

  return (
    <section className="py-20 bg-[var(--color-cream)]">
      <motion.div
        className="text-center px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-sm tracking-[0.3em] text-[var(--color-primary-dark)] font-semibold mb-4">마음 전하실 곳</p>
        {wedding.contactNotice && (
          <p className="text-sm text-[var(--color-text-light)] leading-relaxed whitespace-pre-wrap">
            {wedding.contactNotice}
          </p>
        )}

      </motion.div>

      <div className="mt-8 px-6 space-y-3">
        {(["groom", "bride"] as Side[]).map((side) => {
          const person = side === "groom" ? wedding.groom : wedding.bride;
          if (person.accounts.length === 0) return null;
          const isOpen = openSide === side;
          return (
            <div key={side} className="rounded-2xl border border-[var(--color-accent)] overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenSide(isOpen ? null : side)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm tracking-widest text-[var(--color-text)]"
              >
                <span>{side === "groom" ? "신랑측" : "신부측"}</span>
                <span
                  className="text-[var(--color-text-light)] transition-transform"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  ⌄
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-5 pb-5 space-y-3 border-t border-[var(--color-accent)] pt-4">
                      {person.accounts.map((acc, i) => {
                        const key = `${side}-account-${i}`;
                        return (
                          <div key={i} className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs text-[var(--color-text-light)] mb-0.5">{acc.name || person.name}</p>
                              <p className="text-sm font-serif text-[var(--color-text)] tracking-widest">
                                {acc.holder} {acc.number} {acc.bank}
                              </p>
                            </div>
                            <button
                              onClick={() => copyText(acc.number, key)}
                              className="px-4 py-2 rounded-full border border-[var(--color-primary-light)] text-[var(--color-primary)] text-xs tracking-wide shrink-0"
                            >
                              {copied === key ? "복사됨 ✓" : "복사"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}