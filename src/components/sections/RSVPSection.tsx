"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWedding } from "@/context/WeddingContext";
import { submitRSVP } from "@/lib/rsvp";

type Attendance = "attending" | "not_attending" | "";

export default function RSVPSection() {
  const wedding = useWedding();
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance>("");
  const [guests, setGuests] = useState("1");
  const [companionName, setCompanionName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !attendance) return;
    setLoading(true);
    setError(false);
    try {
      await submitRSVP({ name, attendance, guests, companionName, message, slug: wedding.slug });
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="rsvp" className="py-20 px-6 bg-[var(--color-cream)]">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-xs tracking-[0.3em] text-[var(--color-primary-dark)] font-semibold mb-2">RSVP</p>
        <div className="section-divider mb-4" />
        <h2 className="font-serif text-xl text-[var(--color-text)]">참석 의사 전달</h2>
        {wedding.rsvpNotice && (
          <p className="text-sm text-[var(--color-text-light)] mt-3 leading-relaxed whitespace-pre-wrap">
            {wedding.rsvpNotice}
          </p>
        )}
        <p className="text-sm text-[var(--color-text-light)] mt-2">
          {wedding.rsvpDeadlineText}
        </p>
      </motion.div>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-10 text-center py-12"
        >
          <p className="text-3xl mb-4">♥</p>
          <p className="font-serif text-[var(--color-primary)] text-lg">감사합니다</p>
          <p className="text-sm text-[var(--color-text-light)] mt-2">소중한 마음 잘 전달받았습니다.</p>
        </motion.div>
      ) : (
        <motion.form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div>
            <label className="text-xs tracking-widest text-[var(--color-warm-gray)] block mb-1.5">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="성함을 입력해주세요"
              required
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)] bg-white text-gray-800 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs tracking-widest text-[var(--color-warm-gray)] block mb-1.5">
              참석 여부
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "attending", label: "참석합니다" },
                { value: "not_attending", label: "참석이 어렵습니다" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAttendance(value as Attendance)}
                  className={`py-3 rounded-xl text-sm border transition-colors ${
                    attendance === value
                      ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                      : "border-[var(--color-accent)] text-[var(--color-text-light)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {attendance === "attending" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <label className="text-xs tracking-widest text-[var(--color-warm-gray)] block mb-1.5">
                참석 인원
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)] bg-white text-gray-800 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}명
                  </option>
                ))}
              </select>
            </motion.div>
          )}

          <div>
            <label className="text-xs tracking-widest text-[var(--color-warm-gray)] block mb-1.5">
              동반인 이름 (선택)
            </label>
            <input
              type="text"
              value={companionName}
              onChange={(e) => setCompanionName(e.target.value)}
              placeholder="함께 오시는 분의 성함"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)] bg-white text-gray-800 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs tracking-widest text-[var(--color-warm-gray)] block mb-1.5">
              축하 메시지 (선택)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="두 분께 전하고 싶은 말을 남겨주세요"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)] bg-white text-gray-800 text-sm outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center">
              전송에 실패했습니다. 다시 시도해주세요.
            </p>
          )}

          <button
            type="submit"
            disabled={!name || !attendance || loading}
            className="w-full py-4 rounded-xl bg-[var(--color-primary)] text-white text-sm tracking-widest font-medium disabled:opacity-40 transition-opacity active:opacity-80"
          >
            {loading ? "전송 중..." : "전달하기"}
          </button>
        </motion.form>
      )}

      <div className="mt-20 text-center">
        <div className="section-divider mb-6" />
        <p className="font-serif text-[var(--color-text-light)] text-sm tracking-widest">
          {wedding.groom.name} · {wedding.bride.name}
        </p>
        <p className="text-xs text-[var(--color-warm-gray)] mt-2 tracking-widest">
          {wedding.date.year}.{String(wedding.date.month).padStart(2, "0")}.{String(wedding.date.day).padStart(2, "0")}
        </p>
      </div>
    </section>
  );
}