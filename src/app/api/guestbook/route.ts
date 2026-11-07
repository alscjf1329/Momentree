import { NextRequest, NextResponse } from "next/server";
import { isValidClientFilename } from "@/lib/newClient";
import { resolvePublicFile } from "@/lib/shareId";
import { getSession } from "@/lib/session";
import { can } from "@/lib/access";
import { addGuestbook, deleteGuestbook, listGuestbook } from "@/lib/entries";

export type { GuestbookEntry } from "@/lib/entries";

// GET /api/guestbook?file=<공유 ID>  → 해당 청첩장 방명록 (공개)
export async function GET(req: NextRequest) {
  const file = resolvePublicFile(req.nextUrl.searchParams.get("file"), await getSession(req));
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
  return NextResponse.json(listGuestbook(file));
}

// POST /api/guestbook  body: { name, message, slug(공유 ID) }
export async function POST(req: NextRequest) {
  const { slug: idOrFile, name, message } = await req.json();
  const slug = resolvePublicFile(idOrFile, await getSession(req));
  if (!slug || !name || !message) {
    return NextResponse.json({ error: "slug, name, message required" }, { status: 400 });
  }
  addGuestbook(slug, String(name), String(message));
  return NextResponse.json({ ok: true });
}

// DELETE /api/guestbook?file=slug&id=n  → 항목 삭제 (본인 파일 또는 관리자만)
export async function DELETE(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("file");
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!slug || !isValidClientFilename(slug) || !Number.isInteger(id)) {
    return NextResponse.json({ error: "file, id required" }, { status: 400 });
  }

  const session = await getSession(req);
  if (!session || (session.role !== "admin" && !(session.file === slug && can(session, "guests")))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return deleteGuestbook(slug, id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
}
