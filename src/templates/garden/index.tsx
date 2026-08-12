"use client";

import Image from "next/image";
import { useWedding } from "@/context/WeddingContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { submitRSVP } from "@/lib/rsvp";
import GreetingSection from "@/components/sections/GreetingSection";
import CalendarSection from "@/components/sections/CalendarSection";
import LocationSection from "@/components/sections/LocationSection";
import ContactSection from "@/components/sections/ContactSection";
import RSVPSection from "@/components/sections/RSVPSection";

const VARS = {
  "--color-primary": "#7c9670",
  "--color-primary-light": "#b3c8a8",
  "--color-primary-dark": "#4f6544",
  "--color-accent": "#f2f4ee",
  "--color-gold": "#c2b686",
  "--color-cream": "#fdfcf9",
  "--color-warm-gray": "#a5ac9c",
  "--color-text": "#31352c",
  "--color-text-light": "#767d6d",
} as React.CSSProperties;

type Step = "intro" | "form" | "done";
type Attendance = "attending" | "not_attending" | "";

function RSVPIntroModal() {
  const w = useWedding();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance>("");
  const [guests, setGuests] = useState("1");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("garden-rsvp-intro-seen")) return;
    const t = setTimeout(() => setShow(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setShow(false);
    sessionStorage.setItem("garden-rsvp-intro-seen", "1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !attendance) return;
    setLoading(true);
    setError(false);
    try {
      await submitRSVP({ name, attendance, guests, message, slug: w.slug });
      setStep("done");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0" style={{ background: "rgba(30,32,24,0.45)" }}
            onClick={close} />
          <motion.div className="relative bg-white rounded-3xl w-full max-w-sm max-h-[85vh] overflow-y-auto p-8 text-center shadow-xl"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease: "easeOut" }}>

            {step === "intro" && (
              <>
                <p className="font-serif text-lg text-[var(--color-text)] mb-4">참석여부</p>
                <p className="text-[13px] text-[var(--color-text-light)] leading-relaxed">
                  참석에 부담 가지지 말아주시고,<br />편하게 알려주세요.<br />
                  저희의 정성을 다하는 준비에 도움이 될 것 같아<br />참석 여부를 알려주시면 감사하겠습니다.
                </p>
                <div className="h-px bg-[var(--color-accent)] my-6" />
                <p className="text-sm text-[var(--color-text)]">
                  신랑 {w.groom.name}님 <span className="text-[var(--color-primary)]">♥</span> 신부 {w.bride.name}님
                </p>
                <p className="font-serif text-2xl text-[var(--color-text)] mt-3">
                  {w.date.month}/{w.date.day}
                </p>
                <p className="text-xs text-[var(--color-text-light)] mt-1">
                  {w.date.dayOfWeek} {w.date.time}
                </p>
                <p className="text-xs text-[var(--color-text-light)]">
                  {w.venue.name} {w.venue.hall}
                </p>
                <button onClick={() => setStep("form")}
                  className="w-full mt-7 py-3.5 rounded-xl bg-[var(--color-text)] text-white text-sm tracking-widest">
                  참석여부 전달하기
                </button>
                <button onClick={close}
                  className="mt-4 text-xs text-[var(--color-text-light)] tracking-widest">
                  닫기
                </button>
              </>
            )}

            {step === "form" && (
              <form onSubmit={handleSubmit} className="text-left">
                <p className="font-serif text-lg text-[var(--color-text)] mb-5 text-center">참석여부 전달하기</p>

                <label className="text-xs tracking-widest text-[var(--color-warm-gray)] block mb-1.5">이름</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="성함을 입력해주세요" required
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)] bg-white text-gray-800 text-sm outline-none focus:border-[var(--color-primary)] transition-colors mb-4" />

                <label className="text-xs tracking-widest text-[var(--color-warm-gray)] block mb-1.5">참석 여부</label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { value: "attending", label: "참석합니다" },
                    { value: "not_attending", label: "참석이 어렵습니다" },
                  ].map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setAttendance(value as Attendance)}
                      className={`py-3 rounded-xl text-sm border transition-colors ${
                        attendance === value
                          ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                          : "border-[var(--color-accent)] text-[var(--color-text-light)]"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>

                {attendance === "attending" && (
                  <div className="mb-4">
                    <label className="text-xs tracking-widest text-[var(--color-warm-gray)] block mb-1.5">참석 인원</label>
                    <select value={guests} onChange={(e) => setGuests(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)] bg-white text-gray-800 text-sm outline-none focus:border-[var(--color-primary)]">
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}명</option>)}
                    </select>
                  </div>
                )}

                <label className="text-xs tracking-widest text-[var(--color-warm-gray)] block mb-1.5">축하 메시지 (선택)</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="두 분께 전하고 싶은 말을 남겨주세요" rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)] bg-white text-gray-800 text-sm outline-none focus:border-[var(--color-primary)] transition-colors resize-none mb-2" />

                {error && <p className="text-xs text-red-500 text-center mb-2">전송에 실패했습니다. 다시 시도해주세요.</p>}

                <button type="submit" disabled={!name || !attendance || loading}
                  className="w-full mt-3 py-3.5 rounded-xl bg-[var(--color-text)] text-white text-sm tracking-widest disabled:opacity-40 transition-opacity">
                  {loading ? "전송 중..." : "전달하기"}
                </button>
                <button type="button" onClick={close}
                  className="w-full mt-3 text-xs text-[var(--color-text-light)] tracking-widest text-center">
                  닫기
                </button>
              </form>
            )}

            {step === "done" && (
              <>
                <p className="text-3xl mb-4">♥</p>
                <p className="font-serif text-[var(--color-primary)] text-lg">감사합니다</p>
                <p className="text-sm text-[var(--color-text-light)] mt-2">소중한 마음 잘 전달받았습니다.</p>
                <button onClick={close}
                  className="w-full mt-7 py-3.5 rounded-xl bg-[var(--color-text)] text-white text-sm tracking-widest">
                  확인
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FloralDivider() {
  return (
    <svg viewBox="0 0 160 40" className="mx-auto" width="120" fill="none"
      style={{ color: "#7c9670", opacity: 0.5 }}>
      <path d="M80 33 Q54 24 28 28 Q40 14 68 20" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M80 33 Q106 24 132 28 Q120 14 92 20" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M68 20 Q64 8 80 2 Q96 8 92 20" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="80" cy="33" r="1.6" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function Hero() {
  const w = useWedding();
  return (
    <section className="relative" style={{ height: "100dvh" }}>
      <Image src={w.introBg} alt="bg" fill className="object-cover" priority sizes="480px" />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg,rgba(30,35,20,0.05) 0%,rgba(20,25,12,0.15) 55%,rgba(15,20,10,0.55) 100%)"
      }} />

      <motion.p className="absolute top-10 left-0 right-0 text-center text-[9px] tracking-[0.5em] text-white/70"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.9 }}>
        WE ARE GETTING
      </motion.p>

      <motion.p
        className="absolute top-1/2 left-0 right-0 text-center leading-none -translate-y-1/2"
        style={{ fontFamily: "'Sacramento', cursive", fontSize: "clamp(56px,18vw,96px)", color: "#e8dfa0" }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}>
        married
      </motion.p>

      <div className="absolute bottom-10 left-7 right-7 flex items-end justify-between">
        <motion.span className="font-serif text-white text-sm tracking-[0.15em]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }}>
          {w.groom.name}
        </motion.span>
        <motion.div className="text-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }}>
          <p className="text-[10px] tracking-[0.2em] text-white/75">
            {w.date.year}.{String(w.date.month).padStart(2, "0")}.{String(w.date.day).padStart(2, "0")}
          </p>
        </motion.div>
        <motion.span className="font-serif text-white text-sm tracking-[0.15em]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }}>
          {w.bride.name}
        </motion.span>
      </div>
    </section>
  );
}

function GardenGallery() {
  const w = useWedding();
  return (
    <section className="py-16 px-3 bg-[var(--color-cream)]">
      <motion.div className="text-center mb-8"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <p className="font-serif text-lg text-[var(--color-text)] tracking-wide mb-3">웨딩 갤러리</p>
        <FloralDivider />
      </motion.div>
      <div className="grid grid-cols-2 gap-1.5">
        {w.gallery.map((img, i) => (
          <motion.div key={i} className="relative overflow-hidden rounded-sm"
            style={{ aspectRatio: i % 3 === 0 ? "3/4" : "1/1" }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.6 }}>
            <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="240px" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default function GardenTemplate() {
  return (
    <div style={VARS}>
      <RSVPIntroModal />
      <Hero />
      <GreetingSection />
      <CalendarSection />
      <GardenGallery />
      <LocationSection />
      <ContactSection />
      <RSVPSection />
    </div>
  );
}
