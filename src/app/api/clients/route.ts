import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CLIENTS_DIR = path.join(process.cwd(), "data", "clients");

async function ensureDir() {
  await fs.mkdir(CLIENTS_DIR, { recursive: true });
}

// GET /api/clients         → 파일 목록
// GET /api/clients?file=x  → 특정 파일 읽기
export async function GET(req: NextRequest) {
  await ensureDir();
  const file = req.nextUrl.searchParams.get("file");

  if (file) {
    try {
      const raw = await fs.readFile(path.join(CLIENTS_DIR, `${file}.json`), "utf-8");
      return NextResponse.json(JSON.parse(raw));
    } catch {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
  }

  const files = await fs.readdir(CLIENTS_DIR).catch(() => [] as string[]);
  const names = files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
  return NextResponse.json(names);
}

// POST /api/clients  → { filename, data } 저장
export async function POST(req: NextRequest) {
  await ensureDir();
  const { filename, data } = await req.json();

  if (!filename || !/^[a-z0-9-_]+$/i.test(filename)) {
    return NextResponse.json({ error: "invalid filename" }, { status: 400 });
  }

  await fs.writeFile(
    path.join(CLIENTS_DIR, `${filename}.json`),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
  return NextResponse.json({ ok: true });
}

// DELETE /api/clients?file=x
export async function DELETE(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file");
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
  try {
    await fs.unlink(path.join(CLIENTS_DIR, `${file}.json`));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
