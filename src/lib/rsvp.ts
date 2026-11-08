export type RSVPPayload = {
  name: string;
  side: "groom" | "bride" | "";
  attendance: "attending" | "not_attending" | "";
  guests: string;
  companionName?: string;
  slug: string;
};

export async function submitRSVP(payload: RSVPPayload) {
  const res = await fetch("/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  // 403 = 응답 마감 — 하객에게 보일 문구는 서버가 내려준다
  if (!res.ok) throw new Error(res.status === 403 ? (await res.json().catch(() => ({}))).error ?? "failed" : "failed");
}
