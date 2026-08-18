export type RSVPPayload = {
  name: string;
  side: "groom" | "bride" | "";
  attendance: "attending" | "not_attending" | "";
  guests: string;
  companionName?: string;
  message?: string;
  slug: string;
};

export async function submitRSVP(payload: RSVPPayload) {
  const res = await fetch("/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("failed");
}
