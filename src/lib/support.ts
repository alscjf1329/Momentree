// 고객 지원 채널 판정 — NEXT_PUBLIC_KAKAO_CHANNEL_URL 이 http(s) URL 이면 카카오톡, 아니면 이메일 대체.
export type SupportChannel = { kind: "kakao"; href: string } | { kind: "email" };

export function supportChannel(url: string | undefined): SupportChannel {
  const v = url?.trim();
  return v && /^https?:\/\/\S+$/.test(v) ? { kind: "kakao", href: v } : { kind: "email" };
}

// NEXT_PUBLIC_ 값은 빌드 시 리터럴 치환되므로 process.env 를 동적으로 읽지 말고 이 상수를 쓴다.
export const SUPPORT = supportChannel(process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL);
