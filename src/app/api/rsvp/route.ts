import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSession } from "@/lib/session";
import { DATA_DIR } from "@/lib/paths";
import { withFileLock } from "@/lib/fileLock";
import { isValidClientFilename } from "@/lib/newClient";
import { resolvePublicFile } from "@/lib/shareId";

const RSVP_DIR = path.join(DATA_DIR, "rsvp");

export interface RsvpEntry {
  name: string;
  side?: "groom" | "bride" | "";
  attendance: "attending" | "not_attending";
  guests: string;
  companionName?: string;
  message?: string;
  submittedAt: string;
}

async function ensureDir() {
  await fs.mkdir(RSVP_DIR, { recursive: true });
}

async function readFile(slug: string): Promise<RsvpEntry[]> {
  try {
    const raw = await fs.readFile(path.join(RSVP_DIR, `${slug}.json`), "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// GET /api/rsvp?file=<공유 ID>   → 해당 청첩장 RSVP (비로그인은 공유 ID로만, 본인/관리자는 파일명도 가능)
// GET /api/rsvp                  → 전체 파일 목록 (관리자 전용 — 파일명에 가입 이메일이 있음)
export async function GET(req: NextRequest) {
  await ensureDir();
  const file = req.nextUrl.searchParams.get("file");
  const session = await getSession(req);

  if (file) {
    const resolved = await resolvePublicFile(file, session);
    if (!resolved) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(await readFile(resolved));
  }

  if (session?.role !== "admin") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const files = await fs.readdir(RSVP_DIR).catch(() => [] as string[]);
  const slugs = files.filter(f => f.endsWith(".json")).map(f => f.replace(".json", ""));
  return NextResponse.json(slugs);
}

// POST /api/rsvp  body: { name, attendance, guests, message, slug }
export async function POST(req: NextRequest) {
  await ensureDir();
  const body = await req.json();
  const { slug: idOrFile, ...rest } = body;

  const slug = await resolvePublicFile(idOrFile, await getSession(req));
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  await withFileLock(`rsvp:${slug}`, async () => {
    const entries = await readFile(slug);
    entries.push({ ...rest, submittedAt: new Date().toISOString() } as RsvpEntry);
    await fs.writeFile(
      path.join(RSVP_DIR, `${slug}.json`),
      JSON.stringify(entries, null, 2),
      "utf-8"
    );
  });
  return NextResponse.json({ ok: true });
}

async function canEdit(req: NextRequest, slug: string): Promise<boolean> {
  const session = await getSession(req);
  if (!session) return false;
  return session.role === "admin" || session.file === slug;
}

// PATCH /api/rsvp  body: { slug, index, ...fields }  → 항목 수정 (본인 파일 또는 관리자만)
export async function PATCH(req: NextRequest) {
  await ensureDir();
  const { slug, index, ...updates } = await req.json();
  if (typeof slug !== "string" || !isValidClientFilename(slug) || typeof index !== "number") {
    return NextResponse.json({ error: "slug, index required" }, { status: 400 });
  }
  if (!(await canEdit(req, slug))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const found = await withFileLock(`rsvp:${slug}`, async () => {
    const entries = await readFile(slug);
    if (index < 0 || index >= entries.length) return false;
    entries[index] = { ...entries[index], ...updates };
    await fs.writeFile(
      path.join(RSVP_DIR, `${slug}.json`),
      JSON.stringify(entries, null, 2),
      "utf-8"
    );
    return true;
  });
  if (!found) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/rsvp?file=slug&index=n  → 항목 삭제 (본인 파일 또는 관리자만)
export async function DELETE(req: NextRequest) {
  await ensureDir();
  const slug = req.nextUrl.searchParams.get("file");
  const indexParam = req.nextUrl.searchParams.get("index");
  const index = indexParam !== null ? Number(indexParam) : NaN;
  if (!slug || !isValidClientFilename(slug) || Number.isNaN(index)) {
    return NextResponse.json({ error: "file, index required" }, { status: 400 });
  }
  if (!(await canEdit(req, slug))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const found = await withFileLock(`rsvp:${slug}`, async () => {
    const entries = await readFile(slug);
    if (index < 0 || index >= entries.length) return false;
    entries.splice(index, 1);
    await fs.writeFile(
      path.join(RSVP_DIR, `${slug}.json`),
      JSON.stringify(entries, null, 2),
      "utf-8"
    );
    return true;
  });
  if (!found) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
