export type GuestbookPayload = {
  name: string;
  message: string;
  slug: string;
};

export type GuestbookEntry = {
  name: string;
  message: string;
  submittedAt: string;
};

export async function submitGuestbook(payload: GuestbookPayload) {
  const res = await fetch("/api/guestbook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("failed");
}

export async function fetchGuestbook(slug: string): Promise<GuestbookEntry[]> {
  const res = await fetch(`/api/guestbook?file=${slug}`);
  if (!res.ok) return [];
  return res.json();
}
