import { listRsvp, listGuestbook } from "@/lib/entries";

// CSV 셀: 수식 인젝션 방지(= + - @ 및 탭·CR로 시작하면 ' 접두) 후 필요 시 따옴표 처리
export function csvCell(v: unknown): string {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Excel 한글 깨짐 방지용 UTF-8 BOM 포함
export function toCsv(rows: unknown[][]): string {
  return "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

export function guestsCsv(file: string, type: "rsvp" | "guestbook"): string {
  if (type === "guestbook") {
    return toCsv([["이름", "메시지", "작성일시"], ...listGuestbook(file).map((g) => [g.name, g.message, g.submittedAt])]);
  }
  const side = { groom: "신랑측", bride: "신부측", "": "" };
  return toCsv([
    ["이름", "구분", "참석", "인원", "동반인", "메시지", "제출일시"],
    ...listRsvp(file).map((r) => [r.name, side[r.side ?? ""], r.attendance === "attending" ? "참석" : "불참", r.guests, r.companionName, r.message, r.submittedAt]),
  ]);
}
