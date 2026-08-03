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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 tracking-wide">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      {children}
    </div>
  );
}

const INPUT = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white";
const LS_KEY = "momentree_last_file";

function generateFilename() {
  return `client-${Date.now().toString(36)}`;
}

// 신랑+신부 이름 → 파일명 슬러그 (한글 초성 코드 포인트 기반)
function namestoSlug(groom: string, bride: string) {
  const clean = (s: string) => s.trim().replace(/\s/g, "").replace(/[^a-z0-9가-힣]/gi, "");
  const g = clean(groom);
  const b = clean(bride);
  if (!g || !b) return generateFilename();
  // 한글이면 유니코드 인덱스로 단순 식별, 영문이면 그대로
  const toSlug = (s: string) => /[가-힣]/.test(s)
    ? (s.codePointAt(0)! - 0xAC00).toString(36)
    : s.toLowerCase().slice(0, 8);
  return `${toSlug(g)}-${toSlug(b)}`;
}

export default function SetupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileParam = searchParams.get("file") ?? "";

  const [filename, setFilename] = useState(fileParam || generateFilename());
  const [data, setData] = useState<WeddingData>(DEFAULT_DATA);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [clientList, setClientList] = useState<string[]>([]);

  // 기존 파일 목록 로드
  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClientList).catch(() => {});
  }, []);

  // 파일명이 있으면 데이터 로드
  const loadFile = useCallback(async (f: string) => {
    if (!f) return;
    const res = await fetch(`/api/clients?file=${f}`);
    if (res.ok) {
      const loaded = await res.json();
      setData(loaded);
      setFilename(f);
      localStorage.setItem(LS_KEY, f);
    }
  }, []);

  useEffect(() => {
    if (fileParam) {
      loadFile(fileParam);
    } else {
      // localStorage에서 마지막 파일 복원
      const last = localStorage.getItem(LS_KEY);
      if (last) loadFile(last);
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
    const saveData = { ...data, slug: filename };
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, data: saveData }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      localStorage.setItem(LS_KEY, filename);
      setClientList(prev => prev.includes(filename) ? prev : [...prev, filename]);
      setTimeout(() => setSaved(false), 3000);
      router.push(`/admin/setup?file=${filename}`);
    }
  };

  const handleNewClient = () => {
    localStorage.removeItem(LS_KEY);
    setData(DEFAULT_DATA);
    setFilename(generateFilename());
    router.push("/admin/setup");
  };

  return (
    <div className="min-h-screen">
      {/* 페이지 액션 바 */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-lg font-semibold text-gray-800">고객 정보 설정</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleNewClient}
            className="px-3 py-1.5 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 bg-white">
            + 새 고객
          </button>
          {filename && (
            <a
              href={`/admin/templates?file=${filename}`}
              className="px-3 py-1.5 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 bg-white"
            >
              템플릿 선택 →
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-xs bg-gray-900 text-white rounded-lg disabled:opacity-50"
          >
            {saving ? "저장 중..." : saved ? "✓ 저장됨" : "저장"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <div className="max-w-xl">
        {/* 파일 선택/생성 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <p className="text-xs font-semibold text-gray-500 mb-3 tracking-wide">파일 관리</p>
          <div className="flex gap-2 mb-1">
            <input
              className={INPUT + " flex-1 font-mono text-xs"}
              placeholder="자동생성됨"
              value={filename}
              onChange={e => setFilename(e.target.value.replace(/[^a-z0-9-_]/gi, "").toLowerCase())}
            />
            <button
              onClick={() => setFilename(namestoSlug(data.groom.name, data.bride.name))}
              className="px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 whitespace-nowrap"
              title="신랑+신부 이름으로 파일명 재생성"
            >
              이름으로 생성
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mb-3">
            저장하면 localStorage에 기억됩니다 — 다음 방문 시 자동 복원
          </p>
          {clientList.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 mb-2">기존 파일 불러오기</p>
              <div className="flex flex-wrap gap-2">
                {clientList.map(f => (
                  <button key={f} onClick={() => loadFile(f)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                      filename === f
                        ? "bg-gray-900 text-white border-gray-900"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <Section title="신랑 정보">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="이름"><input className={INPUT} value={data.groom.name} onChange={e => {
                set("groom.name", e.target.value);
                // 파일이 아직 저장 전(URL에 file 파람 없음)이면 자동 slug 업데이트
                if (!fileParam) setFilename(namestoSlug(e.target.value, data.bride.name));
              }} placeholder="홍길동" /></Field>
              <Field label="전체이름 (띄어쓰기 포함)"><input className={INPUT} value={data.groom.nameFull} onChange={e => set("groom.nameFull", e.target.value)} placeholder="홍 길 동" /></Field>
              <Field label="부친"><input className={INPUT} value={data.groom.fatherName} onChange={e => set("groom.fatherName", e.target.value)} /></Field>
              <Field label="모친"><input className={INPUT} value={data.groom.motherName} onChange={e => set("groom.motherName", e.target.value)} /></Field>
            </div>
            <Field label="전화번호"><input className={INPUT} value={data.groom.phone} onChange={e => set("groom.phone", e.target.value)} placeholder="010-0000-0000" /></Field>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Field label="은행"><input className={INPUT} value={data.groom.account.bank} onChange={e => set("groom.account.bank", e.target.value)} placeholder="카카오뱅크" /></Field>
              <Field label="계좌번호"><input className={INPUT} value={data.groom.account.number} onChange={e => set("groom.account.number", e.target.value)} /></Field>
              <Field label="예금주"><input className={INPUT} value={data.groom.account.holder} onChange={e => set("groom.account.holder", e.target.value)} /></Field>
            </div>
          </Section>

          <Section title="신부 정보">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="이름"><input className={INPUT} value={data.bride.name} onChange={e => {
                set("bride.name", e.target.value);
                if (!fileParam) setFilename(namestoSlug(data.groom.name, e.target.value));
              }} placeholder="김지수" /></Field>
              <Field label="전체이름 (띄어쓰기 포함)"><input className={INPUT} value={data.bride.nameFull} onChange={e => set("bride.nameFull", e.target.value)} placeholder="김 지 수" /></Field>
              <Field label="부친"><input className={INPUT} value={data.bride.fatherName} onChange={e => set("bride.fatherName", e.target.value)} /></Field>
              <Field label="모친"><input className={INPUT} value={data.bride.motherName} onChange={e => set("bride.motherName", e.target.value)} /></Field>
            </div>
            <Field label="전화번호"><input className={INPUT} value={data.bride.phone} onChange={e => set("bride.phone", e.target.value)} placeholder="010-0000-0000" /></Field>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Field label="은행"><input className={INPUT} value={data.bride.account.bank} onChange={e => set("bride.account.bank", e.target.value)} /></Field>
              <Field label="계좌번호"><input className={INPUT} value={data.bride.account.number} onChange={e => set("bride.account.number", e.target.value)} /></Field>
              <Field label="예금주"><input className={INPUT} value={data.bride.account.holder} onChange={e => set("bride.account.holder", e.target.value)} /></Field>
            </div>
          </Section>

          <Section title="날짜 / 시간">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Field label="연도"><input className={INPUT} type="number" value={data.date.year} onChange={e => { const y = +e.target.value; set("date.year", y); set("date.iso", `${y}-${String(data.date.month).padStart(2,"0")}-${String(data.date.day).padStart(2,"0")}`); }} /></Field>
              <Field label="월"><input className={INPUT} type="number" min={1} max={12} value={data.date.month} onChange={e => { const m = +e.target.value; set("date.month", m); set("date.iso", `${data.date.year}-${String(m).padStart(2,"0")}-${String(data.date.day).padStart(2,"0")}`); }} /></Field>
              <Field label="일"><input className={INPUT} type="number" min={1} max={31} value={data.date.day} onChange={e => { const d = +e.target.value; set("date.day", d); set("date.iso", `${data.date.year}-${String(data.date.month).padStart(2,"0")}-${String(d).padStart(2,"0")}`); }} /></Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label="요일"><input className={INPUT} value={data.date.dayOfWeek} onChange={e => set("date.dayOfWeek", e.target.value)} placeholder="토요일" /></Field>
              <Field label="시간"><input className={INPUT} value={data.date.time} onChange={e => set("date.time", e.target.value)} placeholder="오후 2시 30분" /></Field>
            </div>
          </Section>

          <Section title="장소">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label="웨딩홀명"><input className={INPUT} value={data.venue.name} onChange={e => set("venue.name", e.target.value)} /></Field>
              <Field label="홀명"><input className={INPUT} value={data.venue.hall} onChange={e => set("venue.hall", e.target.value)} /></Field>
            </div>
            <Field label="주소"><input className={INPUT} value={data.venue.address} onChange={e => set("venue.address", e.target.value)} /></Field>
            <Field label="카카오맵 URL"><input className={INPUT} value={data.venue.kakaoMapUrl} onChange={e => set("venue.kakaoMapUrl", e.target.value)} /></Field>
            <Field label="네이버맵 URL"><input className={INPUT} value={data.venue.naverMapUrl} onChange={e => set("venue.naverMapUrl", e.target.value)} /></Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label="위도"><input className={INPUT} type="number" step="0.0001" value={data.venue.lat} onChange={e => set("venue.lat", +e.target.value)} /></Field>
              <Field label="경도"><input className={INPUT} type="number" step="0.0001" value={data.venue.lng} onChange={e => set("venue.lng", +e.target.value)} /></Field>
            </div>
          </Section>

          <Section title="인사말">
            <p className="text-[10px] text-gray-400">줄바꿈으로 구분 (빈 줄 = 문단 구분)</p>
            <textarea
              className={INPUT + " resize-none"}
              rows={5}
              value={data.greeting.join("\n")}
              onChange={e => set("greeting", e.target.value.split("\n"))}
            />
          </Section>

          <Section title="이미지 경로">
            <Field label="인트로 배경"><input className={INPUT} value={data.introBg} onChange={e => set("introBg", e.target.value)} /></Field>
            <Field label="봉투 (닫힘)"><input className={INPUT} value={data.envelopeClosed} onChange={e => set("envelopeClosed", e.target.value)} /></Field>
            <Field label="봉투 (열림)"><input className={INPUT} value={data.envelopeOpen} onChange={e => set("envelopeOpen", e.target.value)} /></Field>
            <p className="text-xs font-medium text-gray-500 mt-4 mb-2">갤러리 (5장)</p>
            {data.gallery.map((g, i) => (
              <div key={i} className="flex gap-2">
                <input className={INPUT + " flex-1"} placeholder={`gallery-${i+1}.jpg 경로`}
                  value={g.src} onChange={e => { const next = [...data.gallery]; next[i] = { ...next[i], src: e.target.value }; set("gallery", next); }} />
                <input className={INPUT} style={{ width: 120 }} placeholder="설명"
                  value={g.alt} onChange={e => { const next = [...data.gallery]; next[i] = { ...next[i], alt: e.target.value }; set("gallery", next); }} />
              </div>
            ))}
          </Section>
        </div>
        </div>{/* /max-xl */}

        {/* 저장 후 링크 */}
        {filename && (
          <div className="mt-4 max-w-xl bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-500 mb-3">공유 링크</p>
            <div className="space-y-2">
              {["classic","editorial","minimal","romantic"].map(t => (
                <div key={t} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 capitalize">{t}</span>
                  <a href={`/invite/${t}?file=${filename}`} target="_blank"
                    className="text-blue-500 hover:underline font-mono">
                    /invite/{t}?file={filename}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}