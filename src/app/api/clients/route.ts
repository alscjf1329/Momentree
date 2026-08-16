import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { WeddingData } from "@/types";
import { WEDDING } from "@/content";
import { applyToEncryptedFields, decrypt, encrypt } from "@/lib/accountCrypto";
import { getSchemaForTemplate } from "@/lib/templateSchemas";
import { getSession } from "@/lib/session";
import { isValidClientFilename } from "@/lib/newClient";

const CLIENTS_DIR = path.join(process.cwd(), "data", "clients");

async function ensureDir() {
  await fs.mkdir(CLIENTS_DIR, { recursive: true });
}

// GET /api/clients         → 파일 목록 (customer는 자기 파일만)
// GET /api/clients?file=x  → 특정 파일 읽기 (customer는 자기 파일만 허용)
export async function GET(req: NextRequest) {
  await ensureDir();
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const requested = req.nextUrl.searchParams.get("file");
  const file = session.role === "customer" ? session.file : requested;

  if (file) {
    try {
      const raw = await fs.readFile(path.join(CLIENTS_DIR, `${file}.json`), "utf-8");
      // 필드 추가 이전에 저장된 레거시 클라이언트 파일 대비 기본값과 병합
      const data = { ...WEDDING, ...JSON.parse(raw) } as WeddingData;
      const schema = getSchemaForTemplate(data.template);
      const decrypted = applyToEncryptedFields(data, schema, decrypt);
      return NextResponse.json(decrypted);
    } catch {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
  }

  if (session.role === "customer") {
    return NextResponse.json(session.file ? [session.file] : []);
  }

  const files = await fs.readdir(CLIENTS_DIR).catch(() => [] as string[]);
  const names = files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
  return NextResponse.json(names);
}

// POST /api/clients  → { filename, data } 저장 (customer는 자기 파일로 강제)
export async function POST(req: NextRequest) {
  await ensureDir();
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { data } = body;
  const filename = session.role === "customer" ? session.file : body.filename;

  if (!filename || !isValidClientFilename(filename)) {
    return NextResponse.json({ error: "invalid filename" }, { status: 400 });
  }

  const schema = getSchemaForTemplate((data as WeddingData).template);
  const toSave = applyToEncryptedFields(data as WeddingData, schema, encrypt);

  await fs.writeFile(
    path.join(CLIENTS_DIR, `${filename}.json`),
    JSON.stringify(toSave, null, 2),
    "utf-8"
  );
  return NextResponse.json({ ok: true });
}

// DELETE /api/clients?file=x (admin 전용)
export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const file = req.nextUrl.searchParams.get("file");
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
  try {
    await fs.unlink(path.join(CLIENTS_DIR, `${file}.json`));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
