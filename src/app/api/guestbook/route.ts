import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { DATA_DIR } from "@/lib/paths";
import { withFileLock } from "@/lib/fileLock";
import { getSession } from "@/lib/session";

const GUESTBOOK_DIR = path.join(DATA_DIR, "guestbook");

export interface GuestbookEntry {
  name: string;
  message: string;
  submittedAt: string;
}

async function readFile(slug: string): Promise<GuestbookEntry[]> {
  try {
    const raw = await fs.readFile(path.join(GUESTBOOK_DIR, `${slug}.json`), "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// GET /api/guestbook?file=kim-minjun  → 해당 클라이언트 방명록 (공개)
export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file");
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
  return NextResponse.json(await readFile(file));
}

// POST /api/guestbook  body: { name, message, slug }
export async function POST(req: NextRequest) {
  await fs.mkdir(GUESTBOOK_DIR, { recursive: true });
  const { slug, name, message } = await req.json();
  if (!slug || !name || !message) {
    return NextResponse.json({ error: "slug, name, message required" }, { status: 400 });
  }

  await withFileLock(`guestbook:${slug}`, async () => {
    const entries = await readFile(slug);
    entries.push({ name, message, submittedAt: new Date().toISOString() });
    await fs.writeFile(
      path.join(GUESTBOOK_DIR, `${slug}.json`),
      JSON.stringify(entries, null, 2),
      "utf-8"
    );
  });
  return NextResponse.json({ ok: true });
}

// DELETE /api/guestbook?file=slug&index=n  → 항목 삭제 (본인 파일 또는 관리자만)
export async function DELETE(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("file");
  const indexParam = req.nextUrl.searchParams.get("index");
  const index = indexParam !== null ? Number(indexParam) : NaN;
  if (!slug || Number.isNaN(index)) {
    return NextResponse.json({ error: "file, index required" }, { status: 400 });
  }

  const session = await getSession(req);
  if (!session || (session.role !== "admin" && session.file !== slug)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const found = await withFileLock(`guestbook:${slug}`, async () => {
    const entries = await readFile(slug);
    if (index < 0 || index >= entries.length) return false;
    entries.splice(index, 1);
    await fs.writeFile(
      path.join(GUESTBOOK_DIR, `${slug}.json`),
      JSON.stringify(entries, null, 2),
      "utf-8"
    );
    return true;
  });
  if (!found) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
