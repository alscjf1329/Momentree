"use client";

import Image from "next/image";
import { useWedding } from "@/context/WeddingContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
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
  "--color-cream": "#faf7f0",
  "--color-warm-gray": "#a5ac9c",
  "--color-text": "#31352c",
  "--color-text-light": "#767d6d",
} as React.CSSProperties;

type Step = "intro" | "form" | "done";
type Attendance = "attending" | "not_attending" | "";

// GIF는 next/image 최적화를 거치면 애니메이션이 정지 프레임으로 굳어버려서 원본 그대로 서빙해야 함
const isGif = (src: string) => src.toLowerCase().endsWith(".gif");

function RSVPIntroModal() {
  const w = useWedding();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance>("");
  const [guests, setGuests] = useState("1");
  const [companionName, setCompanionName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("garden-rsvp-intro-seen")) return;
    // 히어로 타이핑/보조정보 애니메이션이 다 끝난 뒤 팝업 노출
    const delayMs = heroAnimationDuration(w.mainTitle, w.subInfo.length) * 1000 + 400;
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [w.mainTitle, w.subInfo.length]);

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
      await submitRSVP({ name, attendance, guests, companionName, message, slug: w.slug });
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
          <motion.div className="absolute inset-0" style={{ background: "#14160f" }}
            onClick={close} />
          <motion.div className="relative bg-white rounded-3xl w-full max-w-sm max-h-[85vh] overflow-y-auto p-8 text-center shadow-xl"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease: "easeOut" }}>

            {step === "intro" && (
              <>
                <p className="font-serif text-lg text-[var(--color-text)] mb-4">참석여부</p>
                <p className="text-[13px] text-[var(--color-text-light)] leading-relaxed">
                  {w.rsvpMessage.map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
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
                <div className="mb-5">
                  <p className="font-serif text-lg text-[var(--color-text)] text-center">참석여부 전달하기</p>
                  {w.rsvpNotice && (
                    <p className="text-[12px] text-[var(--color-text-light)] leading-relaxed text-center mt-2 whitespace-pre-wrap">
                      {w.rsvpNotice}
                    </p>
                  )}
                </div>

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

                <AnimatePresence initial={false}>
                  {attendance === "attending" && (
                    <motion.div className="mb-4" style={{ overflow: "hidden" }}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}>
                      <label className="text-xs tracking-widest text-[var(--color-warm-gray)] block mb-1.5">참석 인원</label>
                      <select value={guests} onChange={(e) => setGuests(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)] bg-white text-gray-800 text-sm outline-none focus:border-[var(--color-primary)]">
                        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}명</option>)}
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>

                <label className="text-xs tracking-widest text-[var(--color-warm-gray)] block mb-1.5">동반인 이름 (선택)</label>
                <input type="text" value={companionName} onChange={(e) => setCompanionName(e.target.value)}
                  placeholder="함께 오시는 분의 성함"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)] bg-white text-gray-800 text-sm outline-none focus:border-[var(--color-primary)] transition-colors mb-4" />

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

// 히어로 타이핑/보조정보 애니메이션 타이밍 — RSVP 팝업이 이 애니메이션 종료 후 뜨도록 공유
const HERO_TITLE_DELAY = 0.4;
const HERO_TITLE_STAGGER = 0.06;
const HERO_TITLE_CHAR_DURATION = 0.45;
const HERO_SUBINFO_START = 2.2;
const HERO_SUBINFO_STAGGER = 0.25;
const HERO_SUBINFO_DURATION = 0.8;

function heroAnimationDuration(mainTitle: string, subInfoCount: number): number {
  const charCount = Array.from(mainTitle).length;
  const titleFinish = charCount > 0
    ? HERO_TITLE_DELAY + (charCount - 1) * HERO_TITLE_STAGGER + HERO_TITLE_CHAR_DURATION
    : 0;
  const subInfoFinish = subInfoCount > 0
    ? HERO_SUBINFO_START + (subInfoCount - 1) * HERO_SUBINFO_STAGGER + HERO_SUBINFO_DURATION
    : 0;
  return Math.max(titleFinish, subInfoFinish);
}

function TypedText({
  text,
  delay = 0,
  className,
  style,
}: {
  text: string;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const letters = Array.from(text);
  return (
    <motion.span
      className={className}
      style={style}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: HERO_TITLE_STAGGER, delayChildren: delay } } }}
    >
      {letters.map((char, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: HERO_TITLE_CHAR_DURATION, ease: "easeOut" } },
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

function Hero() {
  const w = useWedding();
  return (
    <section className="relative overflow-hidden" style={{ height: "100dvh" }}>
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.09 }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
      >
        <Image src={w.introBg} alt="bg" fill className="object-cover" priority sizes="480px" unoptimized={isGif(w.introBg)} />
      </motion.div>
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg,rgba(10,12,8,0.35) 0%,rgba(10,12,8,0.4) 55%,rgba(10,12,8,0.65) 100%)"
      }} />

      <div className="absolute inset-0 flex flex-col items-center justify-start pt-16 sm:pt-20 px-6 text-center">
        <div className="self-start pl-2 sm:pl-4">
          {(() => {
            const lines = w.mainTitle.split("\n");
            let charsBefore = 0;
            return lines.map((line, i) => {
              const delay = HERO_TITLE_DELAY + charsBefore * HERO_TITLE_STAGGER;
              charsBefore += Array.from(line).length;
              return (
                <div key={i} style={{ marginLeft: `${i * 9}%`, marginTop: i === 0 ? 0 : "-0.12em" }}>
                  <TypedText
                    text={line}
                    delay={delay}
                    className="block text-white text-left"
                    style={{
                      fontFamily: "'Mrs Saint Delafield', 'Noto Serif KR', serif",
                      fontSize: "clamp(28px,8vw,48px)",
                      lineHeight: 1.1,
                      overflowWrap: "break-word",
                      textShadow: "0 2px 16px rgba(0,0,0,0.5)",
                    }}
                  />
                </div>
              );
            });
          })()}
        </div>

        {w.subInfo.map((line, i) => (
          <motion.p key={i} className="text-xs tracking-[0.15em] text-white/80 mt-2"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: HERO_SUBINFO_START + i * HERO_SUBINFO_STAGGER, duration: HERO_SUBINFO_DURATION }}>
            {line}
          </motion.p>
        ))}
      </div>

      <motion.div className="absolute bottom-8 left-0 right-0 flex justify-center text-white/70"
        animate={{ y: [0, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  );
}

function GardenGallery() {
  const w = useWedding();
  const mainRef = useRef<HTMLDivElement>(null);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const isFirstRender = useRef(true);

  // 슬라이드 실제 폭(컨테이너 좌우 패딩만큼 clientWidth보다 작음)
  const slideWidth = () =>
    (mainRef.current?.firstElementChild as HTMLElement | null)?.offsetWidth || mainRef.current?.clientWidth || 1;

  const handleScroll = () => {
    const el = mainRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / slideWidth()));
  };

  const goTo = (i: number) => {
    const el = mainRef.current;
    if (!el) return;
    el.scrollTo({ left: i * slideWidth(), behavior: "smooth" });
  };

  // 썸네일 스트립 내부에서만 스크롤 — scrollIntoView는 세로 스크롤 컨테이너까지 타고 올라가
  // 마운트 시 페이지 전체를 갤러리 위치까지 끌어내리는 버그가 있어 직접 계산으로 대체
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const strip = thumbStripRef.current;
    const thumb = thumbRefs.current[active];
    if (!strip || !thumb) return;
    const target = thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2;
    strip.scrollTo({ left: target, behavior: "smooth" });
  }, [active]);

  return (
    <section className="py-16 bg-[var(--color-cream)]">
      <motion.div className="px-6 mb-6"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <p className="font-serif text-lg text-[var(--color-text)] tracking-wide">웨딩 갤러리</p>
        <div className="section-divider mt-3" style={{ margin: 0 }} />
      </motion.div>

      {/* 메인 뷰어 — 한 장씩 스와이프 */}
      <div ref={mainRef} onScroll={handleScroll}
        className="no-scrollbar flex overflow-x-auto px-6"
        style={{ scrollSnapType: "x mandatory" }}>
        {w.gallery.map((img, i) => (
          <div key={i}
            className="relative flex-none overflow-hidden rounded-2xl"
            style={{
              width: "100%",
              aspectRatio: "4/3",
              scrollSnapAlign: "center",
              background: "var(--color-accent)",
            }}>
            {/* 가로/세로 사진 모두 대응 — 잘리지 않게 contain, 세로 사진은 좌우 여백 생김 */}
            <Image src={img.src} alt={img.alt} fill className="object-contain" sizes="480px" priority={i === 0} unoptimized={isGif(img.src)} />
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-[var(--color-warm-gray)] tracking-[0.2em] mt-3">
        {active + 1} / {w.gallery.length}
      </p>

      {/* 썸네일 목록 — 횡스크롤, 다 들어가면 가운데 정렬 */}
      <div ref={thumbStripRef} className="no-scrollbar flex gap-2 overflow-x-auto px-6 mt-4"
        style={{ justifyContent: "safe center" }}>
        {w.gallery.map((img, i) => (
          <button key={i}
            ref={(el) => { thumbRefs.current[i] = el; }}
            onClick={() => goTo(i)}
            aria-label={`${i + 1}번째 사진 보기`}
            className="relative flex-none overflow-hidden rounded-lg transition-opacity"
            style={{
              width: 56,
              height: 56,
              opacity: active === i ? 1 : 0.5,
              outline: active === i ? "2px solid var(--color-primary)" : "none",
              outlineOffset: 2,
            }}>
            <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="56px" unoptimized={isGif(img.src)} />
          </button>
        ))}
      </div>
    </section>
  );
}

function InfoSection() {
  const w = useWedding();
  const mainRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const slideWidth = () =>
    (mainRef.current?.firstElementChild as HTMLElement | null)?.offsetWidth || mainRef.current?.clientWidth || 1;

  const handleScroll = () => {
    const el = mainRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / slideWidth()));
  };

  const goTo = (i: number) => {
    mainRef.current?.scrollTo({ left: i * slideWidth(), behavior: "smooth" });
  };

  const hasInfo = w.info.length > 0;
  const hasFlower = !!w.flowerNotice;
  const hasDirections = w.directionsFromSeoul.length > 0;

  if (!hasInfo && !hasFlower && !hasDirections) return null;

  return (
    <section className="py-16 bg-[var(--color-cream)]">
      <motion.div className="px-6 mb-6 text-center"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <p className="text-xs tracking-[0.3em] text-[var(--color-primary-dark)] font-semibold mb-2">INFORMATION</p>
        <div className="section-divider" />
      </motion.div>

      {hasInfo && (
        <>
          {/* 안내사항 — 한 장씩 스와이프 */}
          <div ref={mainRef} onScroll={handleScroll}
            className="no-scrollbar flex overflow-x-auto px-6 items-stretch"
            style={{ scrollSnapType: "x mandatory" }}>
            {w.info.map((item, i) => (
              <div key={i}
                className="flex-none rounded-2xl border border-[var(--color-accent)] p-6"
                style={{ width: "100%", scrollSnapAlign: "center" }}>
                <p className="font-serif text-lg text-[var(--color-text)] mb-3">{item.title}</p>
                <p className="text-sm text-[var(--color-text-light)] leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </p>
              </div>
            ))}
          </div>

          {/* 점 인디케이터 */}
          {w.info.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-5">
              {w.info.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} aria-label={`${i + 1}번째 안내사항 보기`}
                  className="rounded-full transition-all"
                  style={{
                    width: active === i ? 16 : 6,
                    height: 6,
                    background: active === i ? "var(--color-primary)" : "var(--color-accent)",
                  }} />
              ))}
            </div>
          )}
        </>
      )}

      {hasFlower && (
        <>
          {hasInfo && <div className="h-px bg-[var(--color-accent)] mx-6 my-8" />}
          <div className="px-6 text-center">
            <p className="text-xs tracking-[0.25em] text-[var(--color-warm-gray)] mb-2">화환 안내</p>
            <p className="text-sm text-[var(--color-text-light)] leading-relaxed whitespace-pre-wrap">
              {w.flowerNotice}
            </p>
          </div>
        </>
      )}

      {hasDirections && (
        <>
          {(hasInfo || hasFlower) && <div className="h-px bg-[var(--color-accent)] mx-6 my-8" />}
          <div className="px-6">
            <p className="text-xs tracking-[0.25em] text-[var(--color-warm-gray)] mb-4 text-center">
              서울에서 오시는 길
            </p>
            <div className="space-y-4 max-w-sm mx-auto">
              {w.directionsFromSeoul.map((d, i) => (
                <div key={i} className="rounded-2xl border border-[var(--color-accent)] p-5">
                  <p className="font-serif text-[var(--color-text)] mb-2">{d.route}</p>
                  <ol className="space-y-1">
                    {d.steps.map((step, j) => (
                      <li key={j} className="text-sm text-[var(--color-text-light)] leading-relaxed">
                        {j + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

type GuestMessage = { name: string; message: string };

function MessageWall() {
  const w = useWedding();
  const [messages, setMessages] = useState<GuestMessage[]>([]);

  useEffect(() => {
    fetch(`/api/rsvp?file=${w.slug}`)
      .then((r) => r.json())
      .then((entries: GuestMessage[]) => {
        setMessages(entries.filter((e) => e.message?.trim()).reverse());
      })
      .catch(() => {});
  }, [w.slug]);

  if (messages.length === 0) return null;

  return (
    <section className="py-16 px-6 bg-[var(--color-cream)]">
      <motion.div className="text-center mb-8"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6 }}>
        <p className="font-serif text-lg text-[var(--color-text)] tracking-wide mb-3">축하 메시지</p>
        <FloralDivider />
      </motion.div>
      <div className="space-y-3 max-w-sm mx-auto">
        {messages.map((m, i) => (
          <motion.div key={i} className="rounded-2xl bg-white border border-[var(--color-accent)] p-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: Math.min(i, 6) * 0.06 }}>
            <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">{m.message}</p>
            <p className="text-xs text-[var(--color-text-light)] mt-3 text-right">- {m.name}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function BgmPlayer() {
  const w = useWedding();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play()
        .then(() => setPlaying(true))
        .catch((e) => console.error("BGM 재생 실패:", e));
    }
  };

  // 브라우저 자동재생 정책상 사용자 상호작용 없이 소리 있는 오디오를 강제
  // 재생할 방법은 없음 — 마운트 직후 재생을 시도하고, 막히면 페이지 첫
  // 클릭/터치/키 입력 시점에 바로 재생되도록 한다 (사실상의 자동재생).
  useEffect(() => {
    if (!w.bgm.src) return;
    const audio = audioRef.current;
    if (!audio) return;

    const unlock = () => {
      audio.play().then(() => setPlaying(true)).catch(() => {});
      document.removeEventListener("click", unlock);
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("keydown", unlock);
    };

    audio.play().then(() => setPlaying(true)).catch(() => {
      document.addEventListener("click", unlock);
      document.addEventListener("touchstart", unlock);
      document.addEventListener("keydown", unlock);
    });

    return () => {
      document.removeEventListener("click", unlock);
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, [w.bgm.src]);

  if (!w.bgm.src) return null;

  return (
    <>
      <audio ref={audioRef} src={w.bgm.src} loop preload="auto" />
      <button
        onClick={toggle}
        aria-label={playing ? "배경음악 정지" : "배경음악 재생"}
        className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full flex items-center justify-center shadow-lg text-white"
        style={{ background: "var(--color-primary-dark)" }}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="4" width="5" height="16" rx="1" />
            <rect x="14" y="4" width="5" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="18" r="3" fill="currentColor" />
            <circle cx="18" cy="16" r="3" fill="currentColor" />
          </svg>
        )}
      </button>
    </>
  );
}

export default function GardenTemplate() {
  return (
    <div style={VARS}>
      <BgmPlayer />
      <RSVPIntroModal />
      <Hero />
      <GreetingSection />
      <CalendarSection />
      <GardenGallery />
      <LocationSection />
      <InfoSection />
      <ContactSection />
      <RSVPSection />
      <MessageWall />
    </div>
  );
}
