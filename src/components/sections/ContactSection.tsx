"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWedding } from "@/context/WeddingContext";

type Side = "groom" | "bride";
type CopiedKey = string | null;

export default function ContactSection() {
  const wedding = useWedding();
  const [tab, setTab] = useState<Side>("groom");
  const [copied, setCopied] = useState<CopiedKey>(null);
  const [openAccount, setOpenAccount] = useState<number | null>(0);

  const copyText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const changeTab = (side: Side) => {
    setTab(side);
    setOpenAccount(0);
  };

  const current = tab === "groom" ? wedding.groom : wedding.bride;

  return (
    <section className="py-20 bg-[var(--color-cream)]">
      <motion.div
        className="text-center px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-xs tracking-[0.3em] text-[var(--color-primary-dark)] font-semibold mb-2">CONTACT</p>
        <div className="section-divider mb-8" />

        <div className="flex rounded-full border border-[var(--color-primary-light)] overflow-hidden mx-8">
          {(["groom", "bride"] as Side[]).map((side) => (
            <button
              key={side}
              onClick={() => changeTab(side)}
              className={`flex-1 py-2.5 text-sm tracking-widest transition-colors ${
                tab === side
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-primary)]"
              }`}
            >
              {side === "groom" ? "신랑측" : "신부측"}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        key={tab}
        className="mt-8 px-6 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="rounded-2xl border border-[var(--color-accent)] p-5 space-y-3">
          <p className="text-xs tracking-[0.25em] text-[var(--color-warm-gray)]">연락처</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-serif text-[var(--color-text)] text-lg">{current.name}</p>
              <p className="text-sm text-[var(--color-text-light)] mt-0.5">{current.phone}</p>
            </div>
            <a
              href={`tel:${current.phone}`}
              className="px-4 py-2 rounded-full bg-[var(--color-primary)] text-white text-xs tracking-wide"
            >
              전화하기
            </a>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs tracking-[0.25em] text-[var(--color-warm-gray)] px-1">계좌번호</p>
          {current.accounts.map((acc, i) => {
            const multiple = current.accounts.length > 1;
            const isOpen = !multiple || openAccount === i;
            const key = `${tab}-account-${i}`;
            return (
              <div key={i} className="rounded-2xl border border-[var(--color-accent)] overflow-hidden">
                <button
                  type="button"
                  disabled={!multiple}
                  onClick={() => setOpenAccount(isOpen ? null : i)}
                  className={`w-full flex items-center justify-between px-5 py-4 text-left ${multiple ? "" : "cursor-default"}`}
                >
                  <span className="text-sm text-[var(--color-text)]">{acc.name || current.name}</span>
                  {multiple && (
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-[var(--color-warm-gray)] text-xs"
                    >
                      ▾
                    </motion.span>
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="px-5 pb-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-[var(--color-text-light)]">{acc.bank}</p>
                          <p className="font-serif text-[var(--color-text)] tracking-widest mt-0.5">
                            {acc.number}
                          </p>
                          <p className="text-xs text-[var(--color-text-light)] mt-0.5">{acc.holder}</p>
                        </div>
                        <button
                          onClick={() => copyText(acc.number, key)}
                          className="px-4 py-2 rounded-full border border-[var(--color-primary-light)] text-[var(--color-primary)] text-xs tracking-wide shrink-0"
                        >
                          {copied === key ? "복사됨 ✓" : "복사"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}