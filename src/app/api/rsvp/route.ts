import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const RSVP_DIR = path.join(process.cwd(), "data", "rsvp");

export interface RsvpEntry {
  name: string;
  attendance: "attending" | "not_attending";
  guests: string;
  message: string;
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

// GET /api/rsvp?file=kim-minjun  → 해당 클라이언트 RSVP
// GET /api/rsvp                  → 전체 파일 목록
export async function GET(req: NextRequest) {
  await ensureDir();
  const file = req.nextUrl.searchParams.get("file");

  if (file) {
    return NextResponse.json(await readFile(file));
  }

  // 파일 목록만 반환 (어드민 셀렉터용)
  const files = await fs.readdir(RSVP_DIR).catch(() => [] as string[]);
  const slugs = files.filter(f => f.endsWith(".json")).map(f => f.replace(".json", ""));
  return NextResponse.json(slugs);
}

// POST /api/rsvp  body: { name, attendance, guests, message, slug }
export async function POST(req: NextRequest) {
  await ensureDir();
  const body = await req.json();
  const { slug, ...rest } = body;

  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const entries = await readFile(slug);
  entries.push({ ...rest, submittedAt: new Date().toISOString() } as RsvpEntry);

  await fs.writeFile(
    path.join(RSVP_DIR, `${slug}.json`),
    JSON.stringify(entries, null, 2),
    "utf-8"
  );
  return NextResponse.json({ ok: true });
}
