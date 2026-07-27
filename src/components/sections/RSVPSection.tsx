"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { WEDDING } from "@/content";

type Attendance = "attending" | "not_attending" | "";

export default function RSVPSection() {
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance>("");
  const [guests, setGuests] = useState("1");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !attendance) return;
    // ponytail: 실제 연동 시 API 호출로 교체 (현재는 로컬 상태만)
    console.log({ name, attendance, guests, message });
    setSubmitted(true);
  };

  return (
    <section className="py-20 px-6 bg-[var(--color-cream)]">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-xs tracking-[0.3em] text-[var(--color-warm-gray)] mb-2">RSVP</p>
        <div className="section-divider mb-4" />
        <h2 className="font-serif text-xl text-[var(--color-text)]">참석 의사 전달</h2>
        <p className="text-sm text-[var(--color-text-light)] mt-2">
          10월 10일까지 알려주시면 감사하겠습니다
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
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
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
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)] bg-white text-[var(--color-text)] text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
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
            >
              <label className="text-xs tracking-widest text-[var(--color-warm-gray)] block mb-1.5">
                참석 인원
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)] bg-white text-[var(--color-text)] text-sm outline-none focus:border-[var(--color-primary)]"
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
              축하 메시지 (선택)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="두 분께 전하고 싶은 말을 남겨주세요"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)] bg-white text-[var(--color-text)] text-sm outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!name || !attendance}
            className="w-full py-4 rounded-xl bg-[var(--color-primary)] text-white text-sm tracking-widest font-medium disabled:opacity-40 transition-opacity active:opacity-80"
          >
            전달하기
          </button>
        </motion.form>
      )}

      {/* 푸터 */}
      <div className="mt-20 text-center">
        <div className="section-divider mb-6" />
        <p className="font-serif text-[var(--color-text-light)] text-sm tracking-widest">
          {WEDDING.groom.name} · {WEDDING.bride.name}
        </p>
        <p className="text-xs text-[var(--color-warm-gray)] mt-2 tracking-widest">
          {WEDDING.date.year}.{String(WEDDING.date.month).padStart(2, "0")}.{String(WEDDING.date.day).padStart(2, "0")}
        </p>
      </div>
    </section>
  );
}
