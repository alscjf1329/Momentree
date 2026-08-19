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
import GuestbookSection from "@/components/sections/GuestbookSection";

const VARS = {
  "--color-primary": "#111111",
  "--color-primary-light": "#555555",
  "--color-primary-dark": "#000000",
  "--color-accent": "#e2e2e2",
  "--color-gold": "#111111",
  "--color-cream": "#ffffff",
  "--color-warm-gray": "#8a8a8a",
  "--color-text": "#111111",
  "--color-text-light": "#5c5c5c",
} as React.CSSProperties;

type Step = "intro" | "form" | "done";
type Attendance = "attending" | "not_attending" | "";
type Side = "groom" | "bride" | "";

// GIF는 next/image 최적화를 거치면 애니메이션이 정지 프레임으로 굳어버려서 원본 그대로 서빙해야 함
const isGif = (src: string) => src.toLowerCase().endsWith(".gif");

function RSVPIntroModal() {
  const w = useWedding();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [side, setSide] = useState<Side>("");
  const [attendance, setAttendance] = useState<Attendance>("");
  const [guests, setGuests] = useState("1");
  const [companionName, setCompanionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("mono-rsvp-intro-seen")) return;
    // 직접 지정한 시간이 있으면 그걸 쓰고, 없으면 히어로 애니메이션 길이에 맞춰 자동 계산
    const manualSec = parseFloat(w.rsvpPopupDelaySec ?? "");
    const delayMs = !isNaN(manualSec)
      ? manualSec * 1000
      : heroAnimationDuration(w.mainTitle, w.subInfo.length) * 1000 + 400;
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [w.mainTitle, w.subInfo.length, w.rsvpPopupDelaySec]);

  const close = () => {
    setShow(false);
    sessionStorage.setItem("mono-rsvp-intro-seen", "1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !attendance) return;
    setLoading(true);
    setError(false);
    try {
      await submitRSVP({ name, side, attendance, guests, companionName, slug: w.slug });
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
          <motion.div className="absolute inset-0" style={{ background: "#000000" }}
            onClick={close} />
          <motion.div className="relative bg-white rounded-3xl w-full max-w-sm max-h-[85vh] overflow-y-auto p-8 text-center"
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
                  신랑 {w.groom.name} <span className="text-[var(--color-primary)]">♥</span> 신부 {w.bride.name}
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

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { value: "groom", label: "신랑측" },
                    { value: "bride", label: "신부측" },
                  ].map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setSide(value as Side)}
                      className={`py-3 rounded-xl text-sm border transition-colors ${
                        side === value
                          ? "bg-[var(--color-text)] border-[var(--color-text)] text-white"
                          : "border-[var(--color-accent)] text-[var(--color-text-light)]"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>

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

function LineDivider() {
  return <div className="mx-auto" style={{ width: 40, height: 1, background: "#111", opacity: 0.5 }} />;
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

function Hero() {
  const w = useWedding();
  return (
    <section className="relative overflow-hidden bg-white" style={{ height: "100svh" }}>
      {w.introBg && (
        <div className="absolute inset-0">
          <Image src={w.introBg} alt="bg" fill className="object-cover" priority sizes="480px" unoptimized={isGif(w.introBg)} />
        </div>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        {w.mainTitle.split("\n").map((line, i) => (
          <span
            key={i}
            className={`block ${w.introBg ? "text-white" : "text-black"}`}
            style={{
              fontFamily: "'Noto Serif KR', serif",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontSize: "clamp(24px,7vw,40px)",
              lineHeight: 1.4,
              overflowWrap: "break-word",
            }}
          >
            {line}
          </span>
        ))}

        {w.subInfo.map((line, i) => (
          <p key={i}
            className={`text-xs tracking-[0.3em] mt-3 ${w.introBg ? "text-white/80" : "text-black/60"}`}>
            {line}
          </p>
        ))}
      </div>

      <div className={`absolute bottom-8 left-0 right-0 flex justify-center ${w.introBg ? "text-white/70" : "text-black/50"}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}

function MonoGallery() {
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

  if (w.gallery.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <motion.div className="px-6 mb-6 text-center"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <p className="text-xs tracking-[0.3em] text-black font-medium">GALLERY</p>
      </motion.div>

      {/* 메인 뷰어 — 한 장씩 스와이프 */}
      <div ref={mainRef} onScroll={handleScroll}
        className="no-scrollbar flex overflow-x-auto"
        style={{ scrollSnapType: "x mandatory" }}>
        {w.gallery.map((img, i) => (
          <div key={i}
            className="relative flex-none overflow-hidden"
            style={{
              width: "100%",
              aspectRatio: "3/4",
              scrollSnapAlign: "center",
              background: "#fff",
            }}>
            {/* 세로 사진 기준 박스 — 가로 사진은 상하 여백 생김 */}
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
            className="relative flex-none overflow-hidden transition-opacity"
            style={{
              width: 56,
              height: 56,
              opacity: active === i ? 1 : 0.4,
              outline: active === i ? "2px solid #111" : "none",
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

  const handleScroll = () => {
    const el = mainRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let min = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const c = (child as HTMLElement).offsetLeft + (child as HTMLElement).offsetWidth / 2;
      const d = Math.abs(c - center);
      if (d < min) { min = d; closest = i; }
    });
    setActive(closest);
  };

  const goTo = (i: number) => {
    const el = mainRef.current;
    const target = el?.children[i] as HTMLElement | undefined;
    if (!el || !target) return;
    el.scrollTo({ left: target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2, behavior: "smooth" });
  };

  if (w.info.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <motion.div className="px-6 mb-6 text-center"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <p className="text-xs tracking-[0.3em] text-black font-medium">INFORMATION</p>
      </motion.div>

      {/* 안내사항 — 카드 사이 여백을 두고 다음/이전 카드가 살짝 흐리게 보이는 peek 캐러셀 */}
      <div ref={mainRef} onScroll={handleScroll}
        className="no-scrollbar flex gap-3 overflow-x-auto px-6 items-stretch"
        style={{ scrollSnapType: "x mandatory" }}>
        {w.info.map((item, i) => (
          <div key={i}
            className="flex-none rounded-lg p-8 transition-all duration-300"
            style={{
              width: "85%",
              scrollSnapAlign: "center",
              background: "#fafafa",
              boxShadow: "0 2px 24px rgba(0,0,0,0.06)",
              opacity: active === i ? 1 : 0.4,
              transform: active === i ? "scale(1)" : "scale(0.94)",
            }}>
            <p className="font-serif text-lg text-black tracking-wide">{item.title}</p>
            <div className="w-6 h-px bg-black/20 my-4" />
            <p className="text-sm text-black/55 leading-loose whitespace-pre-wrap">
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
                background: active === i ? "#111" : "var(--color-accent)",
              }} />
          ))}
        </div>
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
    <section className="py-16 px-6 bg-white">
      <motion.div className="text-center mb-8"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6 }}>
        <p className="text-xs tracking-[0.3em] text-black font-medium mb-3">MESSAGES</p>
        <LineDivider />
      </motion.div>
      <div className="space-y-3 max-w-sm mx-auto">
        {messages.map((m, i) => (
          <motion.div key={i} className="bg-white border border-[var(--color-accent)] p-4"
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
        className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full flex items-center justify-center text-white"
        style={{ background: "#111111" }}
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

export default function MonoTemplate() {
  return (
    <div style={VARS}>
      <BgmPlayer />
      <RSVPIntroModal />
      <Hero />
      <GreetingSection />
      <CalendarSection />
      <MonoGallery />
      <LocationSection />
      <InfoSection />
      <ContactSection />
      <RSVPSection />
      <GuestbookSection />
      {/* <MessageWall /> */}
    </div>
  );
}
