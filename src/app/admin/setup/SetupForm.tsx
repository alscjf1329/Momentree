"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { WeddingData } from "@/types";

const DEFAULT_DATA: WeddingData = {
  slug: "",
  template: "classic",
  theme: "classic-cream",
  groom: { name: "", nameFull: "", fatherName: "", motherName: "", phone: "",
    account: { bank: "", number: "", holder: "" } },
  bride: { name: "", nameFull: "", fatherName: "", motherName: "", phone: "",
    account: { bank: "", number: "", holder: "" } },
  date: { year: 2025, month: 10, day: 18, dayOfWeek: "토요일", time: "오후 2시 30분", iso: "2025-10-18" },
  venue: { name: "", hall: "", address: "", addressShort: "", kakaoMapUrl: "", naverMapUrl: "", lat: 0, lng: 0 },
  greeting: ["서로가 마주보며 다져온 사랑을", "이제 함께 걸어갈 큰 사랑으로 키우고자 합니다.", "", "오시는 모든 분들을 환영합니다."],
  gallery: [
    { src: "/images/gallery-1.jpg", alt: "" },
    { src: "/images/gallery-2.jpg", alt: "" },
    { src: "/images/gallery-3.jpg", alt: "" },
    { src: "/images/gallery-4.jpg", alt: "" },
    { src: "/images/gallery-5.jpg", alt: "" },
  ],
  introBg: "/images/intro-bg.jpg",
  envelopeClosed: "/images/envelope-closed.jpg",
  envelopeOpen: "/images/envelope-open.jpg",
};

const TEMPLATES = ["classic", "editorial", "minimal", "romantic"] as const;
const LS_KEY = "momentree_last_file";

const INPUT = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white transition-colors";

function generateFilename() {
  return `client-${Date.now().toString(36)}`;
}

function namesToSlug(groom: string, bride: string) {
  const clean = (s: string) => s.trim().replace(/\s/g, "").replace(/[^a-z0-9가-힣]/gi, "");
  const g = clean(groom); const b = clean(bride);
  if (!g || !b) return generateFilename();
  const toSlug = (s: string) => /[가-힣]/.test(s)
    ? (s.codePointAt(0)! - 0xAC00).toString(36)
    : s.toLowerCase().slice(0, 8);
  return `${toSlug(g)}-${toSlug(b)}`;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-gray-500 mb-1">{children}</label>;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/60">
        <h2 className="text-xs font-semibold text-gray-500 tracking-widest uppercase">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

export default function SetupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileParam = searchParams.get("file") ?? "";

  // 서버/클라이언트 동일한 초기값 — Date.now() 는 useEffect 에서만 호출
  const [filename, setFilename] = useState(fileParam);
  const [data, setData] = useState<WeddingData>(DEFAULT_DATA);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [clientList, setClientList] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClientList).catch(() => {});
  }, []);

  const loadFile = useCallback(async (f: string) => {
    if (!f) return;
    const res = await fetch(`/api/clients?file=${f}`);
    if (res.ok) {
      setData(await res.json());
      setFilename(f);
      localStorage.setItem(LS_KEY, f);
    }
  }, []);

  useEffect(() => {
    if (fileParam) {
      loadFile(fileParam);
    } else {
      const last = localStorage.getItem(LS_KEY);
      if (last) loadFile(last);
      else setFilename(generateFilename()); // Date.now() — 클라이언트 전용
    }
  }, [fileParam, loadFile]);

  const set = (path: string, value: unknown) => {
    setData(prev => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let cur: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]] as Record<string, unknown>;
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, data: { ...data, slug: filename } }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      localStorage.setItem(LS_KEY, filename);
      setClientList(prev => prev.includes(filename) ? prev : [...prev, filename]);
      setTimeout(() => setSaved(false), 2500);
      router.push(`/admin/setup?file=${filename}`);
    }
  };

  const handleNewClient = () => {
    localStorage.removeItem(LS_KEY);
    setData(DEFAULT_DATA);
    setFilename(generateFilename());
    router.push("/admin/setup");
  };

  // 날짜 iso 동기화 헬퍼
  const setDate = (field: "year" | "month" | "day", val: number) => {
    const next = { ...data.date, [field]: val };
    set(`date.${field}`, val);
    set("date.iso", `${next.year}-${String(next.month).padStart(2, "0")}-${String(next.day).padStart(2, "0")}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 상단 액션바 */}
      <div className="sticky top-14 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm font-semibold text-gray-700 truncate">고객 정보 설정</h1>
            {filename && (
              <span className="text-[10px] font-mono bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full truncate max-w-[140px] hidden sm:block">
                {filename}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleNewClient}
              className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 bg-white">
              + 새 고객
            </button>
            <a href={`/admin/templates?file=${filename}`}
              className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 bg-white hidden sm:block">
              템플릿 →
            </a>
            <button onClick={handleSave} disabled={saving}
              className="text-xs px-4 py-1.5 rounded-lg font-medium text-white disabled:opacity-50 transition-colors"
              style={{ background: saved ? "#16a34a" : "#111" }}>
              {saving ? "저장 중…" : saved ? "✓ 저장됨" : "저장"}
            </button>
          </div>
        </div>
      </div>

      {/* 본문 — 사이드바 + 폼 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6 items-start">

        {/* ── 왼쪽 사이드바 ── */}
        <aside className="w-56 shrink-0 sticky top-[104px] hidden lg:flex flex-col gap-4">

          {/* 파일 관리 */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
              <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">파일 관리</p>
            </div>
            <div className="p-3 space-y-2">
              <input
                className="w-full px-2.5 py-2 text-[11px] font-mono border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
                placeholder="파일명 (영문·숫자·-)"
                value={filename}
                onChange={e => setFilename(e.target.value.replace(/[^a-z0-9-_]/gi, "").toLowerCase())}
              />
              <button
                onClick={() => setFilename(namesToSlug(data.groom.name, data.bride.name))}
                className="w-full text-[11px] py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-100">
                이름으로 자동생성
              </button>
            </div>
          </div>

          {/* 고객 목록 */}
          {clientList.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">고객 목록</p>
              </div>
              <div className="p-2 space-y-0.5 max-h-48 overflow-y-auto">
                {clientList.map(f => (
                  <button key={f} onClick={() => loadFile(f)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-mono transition-colors ${
                      filename === f
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 공유 링크 */}
          {filename && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">공유 링크</p>
              </div>
              <div className="p-3 space-y-1">
                {TEMPLATES.map(t => (
                  <a key={t} href={`/invite/${t}?file=${filename}`} target="_blank"
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 group">
                    <span className="text-[11px] text-gray-500 capitalize">{t}</span>
                    <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── 오른쪽 폼 ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* 모바일 전용: 파일 선택 + 고객 목록 */}
          <div className="lg:hidden space-y-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-3">파일 관리</p>
              <div className="flex gap-2 mb-2">
                <input
                  className={INPUT + " flex-1 font-mono text-xs"}
                  placeholder="파일명 자동생성됨"
                  value={filename}
                  onChange={e => setFilename(e.target.value.replace(/[^a-z0-9-_]/gi, "").toLowerCase())}
                />
                <button
                  onClick={() => setFilename(namesToSlug(data.groom.name, data.bride.name))}
                  className="px-3 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 whitespace-nowrap">
                  자동생성
                </button>
              </div>
              {clientList.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {clientList.map(f => (
                    <button key={f} onClick={() => loadFile(f)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded-full border transition-colors ${
                        filename === f ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600"
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 신랑 / 신부 나란히 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="신랑 정보">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>이름</Label>
                  <input className={INPUT} value={data.groom.name} placeholder="홍길동"
                    onChange={e => { set("groom.name", e.target.value); if (!fileParam) setFilename(namesToSlug(e.target.value, data.bride.name)); }} />
                </div>
                <div>
                  <Label>전체이름</Label>
                  <input className={INPUT} value={data.groom.nameFull} placeholder="홍 길 동"
                    onChange={e => set("groom.nameFull", e.target.value)} />
                </div>
                <div>
                  <Label>부친</Label>
                  <input className={INPUT} value={data.groom.fatherName} onChange={e => set("groom.fatherName", e.target.value)} />
                </div>
                <div>
                  <Label>모친</Label>
                  <input className={INPUT} value={data.groom.motherName} onChange={e => set("groom.motherName", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>전화번호</Label>
                <input className={INPUT} value={data.groom.phone} placeholder="010-0000-0000"
                  onChange={e => set("groom.phone", e.target.value)} />
              </div>
              <div>
                <Label>계좌 (은행 / 번호 / 예금주)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <input className={INPUT} value={data.groom.account.bank} placeholder="은행" onChange={e => set("groom.account.bank", e.target.value)} />
                  <input className={INPUT} value={data.groom.account.number} placeholder="계좌번호" onChange={e => set("groom.account.number", e.target.value)} />
                  <input className={INPUT} value={data.groom.account.holder} placeholder="예금주" onChange={e => set("groom.account.holder", e.target.value)} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="신부 정보">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>이름</Label>
                  <input className={INPUT} value={data.bride.name} placeholder="김지수"
                    onChange={e => { set("bride.name", e.target.value); if (!fileParam) setFilename(namesToSlug(data.groom.name, e.target.value)); }} />
                </div>
                <div>
                  <Label>전체이름</Label>
                  <input className={INPUT} value={data.bride.nameFull} placeholder="김 지 수"
                    onChange={e => set("bride.nameFull", e.target.value)} />
                </div>
                <div>
                  <Label>부친</Label>
                  <input className={INPUT} value={data.bride.fatherName} onChange={e => set("bride.fatherName", e.target.value)} />
                </div>
                <div>
                  <Label>모친</Label>
                  <input className={INPUT} value={data.bride.motherName} onChange={e => set("bride.motherName", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>전화번호</Label>
                <input className={INPUT} value={data.bride.phone} placeholder="010-0000-0000"
                  onChange={e => set("bride.phone", e.target.value)} />
              </div>
              <div>
                <Label>계좌 (은행 / 번호 / 예금주)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <input className={INPUT} value={data.bride.account.bank} placeholder="은행" onChange={e => set("bride.account.bank", e.target.value)} />
                  <input className={INPUT} value={data.bride.account.number} placeholder="계좌번호" onChange={e => set("bride.account.number", e.target.value)} />
                  <input className={INPUT} value={data.bride.account.holder} placeholder="예금주" onChange={e => set("bride.account.holder", e.target.value)} />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* 날짜 + 장소 나란히 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="날짜 / 시간">
              <div>
                <Label>날짜</Label>
                <div className="grid grid-cols-3 gap-2">
                  <input className={INPUT} type="number" value={data.date.year} onChange={e => setDate("year", +e.target.value)} />
                  <input className={INPUT} type="number" min={1} max={12} value={data.date.month} onChange={e => setDate("month", +e.target.value)} />
                  <input className={INPUT} type="number" min={1} max={31} value={data.date.day} onChange={e => setDate("day", +e.target.value)} />
                </div>
                <div className="flex gap-1 mt-1">
                  <p className="text-[10px] text-gray-400 w-1/3 text-center">연</p>
                  <p className="text-[10px] text-gray-400 w-1/3 text-center">월</p>
                  <p className="text-[10px] text-gray-400 w-1/3 text-center">일</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>요일</Label>
                  <input className={INPUT} value={data.date.dayOfWeek} placeholder="토요일" onChange={e => set("date.dayOfWeek", e.target.value)} />
                </div>
                <div>
                  <Label>시간</Label>
                  <input className={INPUT} value={data.date.time} placeholder="오후 2시 30분" onChange={e => set("date.time", e.target.value)} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="장소">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>웨딩홀명</Label>
                  <input className={INPUT} value={data.venue.name} onChange={e => set("venue.name", e.target.value)} />
                </div>
                <div>
                  <Label>홀명</Label>
                  <input className={INPUT} value={data.venue.hall} onChange={e => set("venue.hall", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>주소</Label>
                <input className={INPUT} value={data.venue.address} onChange={e => set("venue.address", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>위도</Label>
                  <input className={INPUT} type="number" step="0.0001" value={data.venue.lat} onChange={e => set("venue.lat", +e.target.value)} />
                </div>
                <div>
                  <Label>경도</Label>
                  <input className={INPUT} type="number" step="0.0001" value={data.venue.lng} onChange={e => set("venue.lng", +e.target.value)} />
                </div>
              </div>
              <div>
                <Label>카카오맵 URL</Label>
                <input className={INPUT} value={data.venue.kakaoMapUrl} onChange={e => set("venue.kakaoMapUrl", e.target.value)} />
              </div>
              <div>
                <Label>네이버맵 URL</Label>
                <input className={INPUT} value={data.venue.naverMapUrl} onChange={e => set("venue.naverMapUrl", e.target.value)} />
              </div>
            </SectionCard>
          </div>

          {/* 인사말 + 이미지 나란히 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="인사말">
              <p className="text-[10px] text-gray-400 -mt-2">빈 줄 = 문단 구분</p>
              <textarea
                className={INPUT + " resize-none"}
                rows={7}
                value={data.greeting.join("\n")}
                onChange={e => set("greeting", e.target.value.split("\n"))}
              />
            </SectionCard>

            <SectionCard title="이미지 경로">
              <div>
                <Label>인트로 배경</Label>
                <input className={INPUT} value={data.introBg} onChange={e => set("introBg", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>봉투 (닫힘)</Label>
                  <input className={INPUT} value={data.envelopeClosed} onChange={e => set("envelopeClosed", e.target.value)} />
                </div>
                <div>
                  <Label>봉투 (열림)</Label>
                  <input className={INPUT} value={data.envelopeOpen} onChange={e => set("envelopeOpen", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>갤러리 (5장)</Label>
                <div className="space-y-2">
                  {data.gallery.map((g, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-[10px] text-gray-300 w-4 shrink-0">{i + 1}</span>
                      <input className={INPUT + " flex-1"} placeholder={`gallery-${i + 1}.jpg`}
                        value={g.src} onChange={e => { const next = [...data.gallery]; next[i] = { ...next[i], src: e.target.value }; set("gallery", next); }} />
                      <input className="w-20 px-2 py-2.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white shrink-0"
                        placeholder="설명" value={g.alt}
                        onChange={e => { const next = [...data.gallery]; next[i] = { ...next[i], alt: e.target.value }; set("gallery", next); }} />
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* 모바일 전용: 공유 링크 */}
          {filename && (
            <div className="lg:hidden bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/60">
                <h2 className="text-xs font-semibold text-gray-500 tracking-widest uppercase">공유 링크</h2>
              </div>
              <div className="p-4 space-y-2">
                {TEMPLATES.map(t => (
                  <div key={t} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 capitalize">{t}</span>
                    <a href={`/invite/${t}?file=${filename}`} target="_blank"
                      className="text-blue-500 hover:underline font-mono text-[11px]">
                      /invite/{t}?file={filename}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>{/* /right */}
      </div>{/* /layout */}
    </div>
  );
}
