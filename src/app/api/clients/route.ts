import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { WeddingData } from "@/types";
import { WEDDING } from "@/content";
import { applyToEncryptedFields, decrypt, encrypt } from "@/lib/accountCrypto";
import { getSchemaForTemplate } from "@/lib/templateSchemas";
import { getSession } from "@/lib/session";
import { isValidClientFilename } from "@/lib/newClient";
import { DATA_DIR } from "@/lib/paths";
import { buildMeta, splitMeta, type ClientMeta } from "@/lib/clientMeta";

const CLIENTS_DIR = path.join(DATA_DIR, "clients");

async function ensureDir() {
  await fs.mkdir(CLIENTS_DIR, { recursive: true });
}

// GET /api/clients               → 파일 목록 (customer는 자기 파일만)
// GET /api/clients?detail=1      → 목록 + 메타데이터(표시 이름·소유자·예식일·수정일)
// GET /api/clients?file=x        → 특정 파일 읽기 (customer는 자기 파일만 허용)
export async function GET(req: NextRequest) {
  await ensureDir();
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const requested = req.nextUrl.searchParams.get("file");
  const file = session.role === "customer" ? session.file : requested;

  if (file) {
    if (!isValidClientFilename(file)) return NextResponse.json({ error: "invalid file" }, { status: 400 });
    try {
      const raw = await fs.readFile(path.join(CLIENTS_DIR, `${file}.json`), "utf-8");
      // 필드 추가 이전에 저장된 레거시 클라이언트 파일 대비 기본값과 병합 (_meta는 서버 전용이라 제외)
      const data = { ...WEDDING, ...splitMeta(JSON.parse(raw)).data } as WeddingData;
      const schema = getSchemaForTemplate(data.template);
      const decrypted = applyToEncryptedFields(data, schema, decrypt);
      return NextResponse.json(decrypted);
    } catch {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
  }

  let names: string[];
  if (session.role === "customer") {
    names = session.file ? [session.file] : [];
  } else {
    const files = await fs.readdir(CLIENTS_DIR).catch(() => [] as string[]);
    names = files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
  }
  if (!req.nextUrl.searchParams.has("detail")) return NextResponse.json(names);

  // 메타가 아직 없는 오래된 파일(다시 저장되기 전)은 label이 비고, 수정일은 파일 mtime으로 대체
  const detail = await Promise.all(
    names.map(async (file) => {
      const filePath = path.join(CLIENTS_DIR, `${file}.json`);
      try {
        const meta = splitMeta(JSON.parse(await fs.readFile(filePath, "utf-8"))).meta;
        const updatedAt = meta?.updatedAt ?? (await fs.stat(filePath)).mtime.toISOString();
        return { file, label: meta?.label ?? "", owner: meta?.owner ?? "", weddingDate: meta?.weddingDate ?? "", updatedAt };
      } catch {
        return { file, label: "", owner: "", weddingDate: "", updatedAt: "" };
      }
    })
  );
  return NextResponse.json(detail);
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

  const { data: clean } = splitMeta(data as WeddingData & { _meta?: ClientMeta }); // 클라이언트가 보낸 _meta는 무시
  const schema = getSchemaForTemplate(clean.template);
  const toSave = applyToEncryptedFields(clean, schema, encrypt);

  const filePath = path.join(CLIENTS_DIR, `${filename}.json`);
  const prev = await fs.readFile(filePath, "utf-8").then((raw) => splitMeta(JSON.parse(raw)).meta, () => undefined);
  // 고객 본인이 저장하면 세션 이메일이 소유자 (관리자가 대신 저장할 땐 기존 값 유지)
  const meta = buildMeta(clean, prev, session.role === "customer" ? session.file : undefined);

  await fs.writeFile(filePath, JSON.stringify({ ...toSave, _meta: meta }, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}

// DELETE /api/clients?file=x (admin 전용)
export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const file = req.nextUrl.searchParams.get("file");
  if (!file || !isValidClientFilename(file)) return NextResponse.json({ error: "file required" }, { status: 400 });
  try {
    await fs.unlink(path.join(CLIENTS_DIR, `${file}.json`));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
