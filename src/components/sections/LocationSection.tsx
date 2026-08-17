"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { motion } from "framer-motion";
import { useWedding } from "@/context/WeddingContext";

const KAKAO_MAP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

declare global {
  interface Window {
    kakao: any; // eslint-disable-line @typescript-eslint/no-explicit-any -- 카카오맵 SDK, 공식 타입 패키지 없음
  }
}

export default function LocationSection() {
  const wedding = useWedding();
  const [copied, setCopied] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const { venue, shuttleTimetable } = wedding;
  const hasShuttle = shuttleTimetable.from.length > 0 || shuttleTimetable.to.length > 0;

  // 주소를 좌표로 지오코딩해서 검색창/사이드바 없는 깔끔한 마커 지도를 직접 그림 —
  // 위도/경도를 직접 입력받지 않아도 이미 입력받는 주소만으로 동작
  useEffect(() => {
    if (!sdkLoaded || !mapVisible || !mapRef.current || !venue.address) return;
    window.kakao.maps.load(() => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(venue.address, (result: { x: string; y: string }[], status: string) => {
        if (status !== window.kakao.maps.services.Status.OK || !result[0]) {
          setMapFailed(true);
          return;
        }
        const coords = new window.kakao.maps.LatLng(Number(result[0].y), Number(result[0].x));
        const map = new window.kakao.maps.Map(mapRef.current, { center: coords, level: 4 });
        new window.kakao.maps.Marker({ position: coords, map });
      });
    });
  }, [sdkLoaded, mapVisible, venue.address]);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(venue.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 bg-[var(--color-cream)]">
      <motion.div
        className="text-center px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-xs tracking-[0.3em] text-[var(--color-primary-dark)] font-semibold mb-2">LOCATION</p>
        <div className="section-divider mb-6" />
        <h2 className="font-serif text-xl text-[var(--color-text)] mb-1">{venue.name}</h2>
        <p className="text-sm text-[var(--color-text-light)] tracking-wide">{venue.hall}</p>
        <p className="text-sm text-[var(--color-text-light)] mt-2">{venue.address}</p>
      </motion.div>

      {KAKAO_MAP_KEY && (
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&libraries=services&autoload=false`}
          strategy="afterInteractive"
          onLoad={() => setSdkLoaded(true)}
        />
      )}

      <motion.div
        className="relative mt-6 mx-4 rounded-2xl overflow-hidden shadow-md"
        style={{ height: 260, background: "var(--color-accent)" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        onViewportEnter={() => setMapVisible(true)}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <div ref={mapRef} className="absolute inset-0" />
        {mapVisible && (!KAKAO_MAP_KEY || mapFailed) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-[var(--color-text-light)]">지도를 표시할 수 없습니다</p>
          </div>
        )}
      </motion.div>

      <motion.div
        className="mt-4 px-4 flex gap-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <button
          onClick={copyAddress}
          className="flex-1 py-3 rounded-xl border border-[var(--color-primary-light)] text-[var(--color-primary)] text-sm tracking-wide transition-colors active:bg-[var(--color-primary)] active:text-white"
        >
          {copied ? "복사됨 ✓" : "주소 복사"}
        </button>
        <a
          href={venue.kakaoMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 rounded-xl bg-[#FEE500] text-[#3C1E1E] text-sm tracking-wide text-center font-medium"
        >
          카카오맵
        </a>
        <a
          href={venue.naverMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 rounded-xl bg-[#03C75A] text-white text-sm tracking-wide text-center font-medium"
        >
          네이버맵
        </a>
      </motion.div>

      {hasShuttle && (
        <motion.div
          className="mt-8 mx-4 rounded-2xl border border-[var(--color-accent)] p-5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-xs tracking-[0.25em] text-[var(--color-warm-gray)] mb-3">셔틀버스 시간표</p>
          <div className="grid grid-cols-2 gap-4">
            {shuttleTimetable.from.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--color-text)] mb-1.5">가는 편</p>
                <ul className="space-y-1">
                  {shuttleTimetable.from.map((line, i) => (
                    <li key={i} className="text-xs text-[var(--color-text-light)]">{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {shuttleTimetable.to.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--color-text)] mb-1.5">오는 편</p>
                <ul className="space-y-1">
                  {shuttleTimetable.to.map((line, i) => (
                    <li key={i} className="text-xs text-[var(--color-text-light)]">{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </section>
  );
}