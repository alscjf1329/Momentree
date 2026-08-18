"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWedding } from "@/context/WeddingContext";
import { submitGuestbook, fetchGuestbook, type GuestbookEntry } from "@/lib/guestbook";

export default function GuestbookSection() {
  const wedding = useWedding();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchGuestbook(wedding.slug).then(setEntries);
  }, [wedding.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setLoading(true);
    setError(false);
    try {
      await submitGuestbook({ name, message, slug: wedding.slug });
      setEntries((prev) => [{ name, message, submittedAt: new Date().toISOString() }, ...prev]);
      setName("");
      setMessage("");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-6 bg-[var(--color-cream)]">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-xs tracking-[0.3em] text-[var(--color-primary-dark)] font-semibold mb-3">GUESTBOOK</p>
        <h2 className="font-serif text-xl text-[var(--color-text)]">축하 메시지</h2>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="mt-8 space-y-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="성함을 입력해주세요"
          required
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)] bg-white text-gray-800 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="두 분께 전하고 싶은 말을 남겨주세요"
          rows={3}
          required
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)] bg-white text-gray-800 text-sm outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
        />

        {error && (
          <p className="text-xs text-red-500 text-center">
            전송에 실패했습니다. 다시 시도해주세요.
          </p>
        )}

        <button
          type="submit"
          disabled={!name || !message || loading}
          className="w-full py-4 rounded-xl bg-[var(--color-primary)] text-white text-sm tracking-widest font-medium disabled:opacity-40 transition-opacity active:opacity-80"
        >
          {loading ? "전송 중..." : "메시지 남기기"}
        </button>
      </motion.form>

      {entries.length > 0 && (
        <motion.div
          className="mt-10 space-y-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {entries.map((e, i) => (
            <div key={i} className="rounded-xl border border-[var(--color-accent)] bg-white px-4 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-[var(--color-text)]">{e.name}</span>
                <span className="text-[10px] text-[var(--color-warm-gray)] shrink-0">
                  {new Date(e.submittedAt).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-light)] mt-1.5 leading-relaxed whitespace-pre-wrap">
                {e.message}
              </p>
            </div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
