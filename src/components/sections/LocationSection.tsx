"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [mapFailed, setMapFailed] = useState(false);
  const { venue, shuttleTimetable } = wedding;
  const hasShuttle = shuttleTimetable.from.length > 0 || shuttleTimetable.to.length > 0;

  // next/script의 onLoad가 안정적으로 안 불릴 때가 있어서(이미 로드된 스크립트
  // 재사용 시 등) window.kakao 존재 여부를 직접 폴링 — sdkLoaded는 그 결과만 반영
  useEffect(() => {
    if (sdkLoaded) return;
    if (window.kakao?.maps) {
      setSdkLoaded(true);
      return;
    }
    const id = setInterval(() => {
      if (window.kakao?.maps) {
        setSdkLoaded(true);
        clearInterval(id);
      }
    }, 200);
    return () => clearInterval(id);
  }, [sdkLoaded]);

  // 주소가 있으면 주소로, 없으면 업체명(venue.name)으로 카카오 장소검색해서
  // 검색창/사이드바 없는 깔끔한 마커 지도를 직접 그림 — 위도/경도를 직접
  // 입력받지 않아도 이미 입력받는 주소 또는 웨딩홀명만으로 동작.
  // useRef+useEffect 조합은 ref가 붙는 시점과 effect 실행 시점이 어긋나는
  // 경우가 있어서(콜백 ref는 DOM 노드가 실제로 붙을 때만 확실히 호출됨) 콜백
  // ref 안에서 바로 처리 — sdkLoaded/address가 바뀌면 콜백 자체가 새로 만들어져
  // React가 알아서 재호출해줌
  const mapCallbackRef = useCallback((node: HTMLDivElement | null) => {
    const query = venue.address || venue.name;
    if (!node || !sdkLoaded || !query) return;
    window.kakao.maps.load(() => {
      const onResult = (result: { x: string; y: string }[], status: string) => {
        if (status !== window.kakao.maps.services.Status.OK || !result[0]) {
          setMapFailed(true);
          return;
        }
        const coords = new window.kakao.maps.LatLng(Number(result[0].y), Number(result[0].x));
        const map = new window.kakao.maps.Map(node, { center: coords, level: 4 });
        map.setDraggable(false);
        map.setZoomable(false);
        new window.kakao.maps.Marker({ position: coords, map });
      };
      if (venue.address) {
        new window.kakao.maps.services.Geocoder().addressSearch(venue.address, onResult);
      } else {
        new window.kakao.maps.services.Places().keywordSearch(query, onResult);
      }
    });
  }, [sdkLoaded, venue.address, venue.name]);

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
        <p className="text-sm tracking-[0.3em] text-[var(--color-primary-dark)] font-semibold mb-4">LOCATION</p>
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
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <div ref={mapCallbackRef} className="absolute inset-0" />
        {!venue.address && !venue.name && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-[var(--color-text-light)]">웨딩홀명 또는 주소가 입력되지 않았습니다</p>
          </div>
        )}
        {(venue.address || venue.name) && (!KAKAO_MAP_KEY || mapFailed) && (
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
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-xs tracking-[0.25em] text-[var(--color-text)]">셔틀버스 시간표</p>
            {wedding.shuttleInfo && (
              <p className="text-xs text-[var(--color-text-light)] tracking-normal font-normal">{wedding.shuttleInfo}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {shuttleTimetable.to.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--color-text)] mb-1.5">오는 편</p>
                <ul className="space-y-1">
                  {shuttleTimetable.to.map((line, i) =>
                    line === "" ? (
                      <li key={i} aria-hidden className="h-2" />
                    ) : (
                      <li key={i} className="text-xs text-[var(--color-text-light)]">{line}</li>
                    )
                  )}
                </ul>
              </div>
            )}
            {shuttleTimetable.from.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--color-text)] mb-1.5">가는 편</p>
                <ul className="space-y-1">
                  {shuttleTimetable.from.map((line, i) =>
                    line === "" ? (
                      <li key={i} aria-hidden className="h-2" />
                    ) : (
                      <li key={i} className="text-xs text-[var(--color-text-light)]">{line}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </section>
  );
}