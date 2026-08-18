import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { DATA_DIR } from "@/lib/paths";

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

  const entries = await readFile(slug);
  entries.push({ name, message, submittedAt: new Date().toISOString() });

  await fs.writeFile(
    path.join(GUESTBOOK_DIR, `${slug}.json`),
    JSON.stringify(entries, null, 2),
    "utf-8"
  );
  return NextResponse.json({ ok: true });
}
