// 운영자 텔레그램 알림. TELEGRAM_BOT_TOKEN·TELEGRAM_CHAT_ID가 모두 있을 때만 전송, 없으면 no-op.
// !! 토큰은 URL에 들어가므로 에러 객체/메시지를 로그에 그대로 찍지 않는다(이름만 기록).

export const telegramConfigured = () => !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

// 알림 실패는 삼킨다 — 요청 처리를 깨뜨리면 안 됨. 전송 성공 여부 반환.
export async function notifyOperator(text: string, f: typeof fetch = fetch): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN, chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
  try {
    // parse_mode 미지정 = plain text. 텔레그램 한도 4096자.
    const res = await f(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: text.slice(0, 4096) }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      // 텔레그램의 description 은 원인 문구("bot was blocked by the user" 등)라 토큰이 들어 있지 않다
      const why = ((await res.json().catch(() => null)) as { description?: string } | null)?.description;
      console.error(`[notify] 텔레그램 응답 ${res.status}${why ? ` — ${why}` : ""}`);
    }
    return res.ok;
  } catch (e) {
    // 네트워크 실패의 원인 코드(ENOTFOUND·ETIMEDOUT 등)는 e.cause 에 있다. 메시지·URL 은 토큰이 들어 있어 남기지 않는다.
    const code = e instanceof Error ? (e.cause as { code?: string } | undefined)?.code : undefined;
    console.error(`[notify] 전송 실패: ${e instanceof Error ? e.name : "Error"}${code ? ` (${code})` : ""}`);
    return false;
  }
}

// 같은 메시지는 10분에 1번만 알림(스팸 방지). 메모리 기반이라 재시작 시 초기화.
const lastSent = new Map<string, number>();
export const ERROR_DEDUP_MS = 10 * 60 * 1000;
export function notifyOnce(text: string, now = Date.now(), f: typeof fetch = fetch): Promise<boolean> {
  if (now - (lastSent.get(text) ?? -Infinity) < ERROR_DEDUP_MS) return Promise.resolve(false);
  lastSent.set(text, now);
  if (lastSent.size > 500) for (const [k, t] of lastSent) if (now - t >= ERROR_DEDUP_MS) lastSent.delete(k);
  return notifyOperator(text, f);
}
