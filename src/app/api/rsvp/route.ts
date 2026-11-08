import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { can } from "@/lib/access";
import { isValidClientFilename } from "@/lib/newClient";
import { resolvePublicFile } from "@/lib/shareId";
import { isGuestDataHidden } from "@/lib/retention";
import { addRsvp, deleteRsvp, listRsvp, listRsvpSlugs, updateRsvp } from "@/lib/entries";

export type { RsvpEntry } from "@/lib/entries";

// GET /api/rsvp?file=<공유 ID>   → 해당 청첩장 RSVP (비로그인은 공유 ID로만, 본인/관리자는 파일명도 가능)
// GET /api/rsvp                  → RSVP가 있는 청첩장 목록 (관리자 전용 — 파일명에 가입 이메일이 있음)
export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file");
  const session = await getSession(req);

  if (file) {
    const resolved = resolvePublicFile(file, session);
    if (!resolved) return NextResponse.json({ error: "not found" }, { status: 404 });
    // 예식일 6개월 후엔 비공개 — 고객·편집자(관리자 포함)만 열람
    const editor = session?.role === "admin" || (session?.file === resolved && can(session, "guests"));
    return NextResponse.json(!editor && isGuestDataHidden(resolved) ? [] : listRsvp(resolved));
  }

  if (session?.role !== "admin") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(listRsvpSlugs());
}

// POST /api/rsvp  body: { slug(공유 ID), name, side, attendance, guests, companionName, message }
export async function POST(req: NextRequest) {
  const { slug: idOrFile, ...rest } = await req.json();

  const slug = resolvePublicFile(idOrFile, await getSession(req));
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  addRsvp(slug, rest);
  return NextResponse.json({ ok: true });
}

async function canEdit(req: NextRequest, slug: string): Promise<boolean> {
  const session = await getSession(req);
  if (!session) return false;
  return session.role === "admin" || (session.file === slug && can(session, "guests"));
}

// PATCH /api/rsvp  body: { slug, id, ...fields }  → 항목 수정 (본인 파일 또는 관리자만)
export async function PATCH(req: NextRequest) {
  const { slug, id, ...updates } = await req.json();
  if (typeof slug !== "string" || !isValidClientFilename(slug) || typeof id !== "number") {
    return NextResponse.json({ error: "slug, id required" }, { status: 400 });
  }
  if (!(await canEdit(req, slug))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return updateRsvp(slug, id, updates) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
}

// DELETE /api/rsvp?file=slug&id=n  → 항목 삭제 (본인 파일 또는 관리자만)
export async function DELETE(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("file");
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!slug || !isValidClientFilename(slug) || !Number.isInteger(id)) {
    return NextResponse.json({ error: "file, id required" }, { status: 400 });
  }
  if (!(await canEdit(req, slug))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return deleteRsvp(slug, id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
}
