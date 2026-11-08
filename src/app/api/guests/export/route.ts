import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { can } from "@/lib/access";
import { isValidClientFilename } from "@/lib/newClient";
import { guestsCsv } from "@/lib/guestCsv";

// GET /api/guests/export?type=rsvp|guestbook[&file=...]  → CSV (고객·편집자는 본인 청첩장만, 관리자는 file 지정)
export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !can(session, "guests")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const q = req.nextUrl.searchParams;
  const file = session.role === "admin" ? q.get("file") : session.file;
  const type = q.get("type") === "guestbook" ? "guestbook" : "rsvp";
  if (!file || !isValidClientFilename(file)) return NextResponse.json({ error: "file required" }, { status: 400 });
  return new NextResponse(guestsCsv(file, type), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
