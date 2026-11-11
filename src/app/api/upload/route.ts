import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { DATA_DIR } from "@/lib/paths";
import { forceGifPlayOnce } from "@/lib/gifLoop";

const LIMITS: Record<string, { dir: string; mime: string; maxBytes: number }> = {
  image: { dir: "images", mime: "image/", maxBytes: 10 * 1024 * 1024 },
  audio: { dir: "audio", mime: "audio/", maxBytes: 20 * 1024 * 1024 },
};

// 폰 브라우저는 mp3 등의 종류(MIME)를 비우거나 octet-stream 으로 보내는 일이 있어, 그때만 확장자로 판정한다
const EXTS: Record<string, string[]> = {
  image: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
  audio: [".mp3", ".m4a", ".aac", ".wav", ".ogg"],
};
const typeOk = (file: File, kind: string, mime: string) =>
  file.type !== "image/svg+xml" &&
  (file.type.startsWith(mime) ||
    ((file.type === "" || file.type === "application/octet-stream") && EXTS[kind].includes(path.extname(file.name).toLowerCase())));

function safeExt(filename: string, fallback: string): string {
  const ext = path.extname(filename).toLowerCase().replace(/[^a-z0-9.]/g, "");
  return ext || fallback;
}

// 어드민 인증(proxy.ts)이 보호하는 라우트 — DATA_DIR/uploads 밑에 저장하고
// /uploads/[kind]/[filename] 라우트가 직접 읽어서 서빙한다 (public/ 의존 안 함 —
// standalone 빌드 재생성 시 날아가는 문제 방지)
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  const kind = form.get("kind");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 필요합니다" }, { status: 400 });
  }

  const limit = typeof kind === "string" ? LIMITS[kind] : undefined;
  if (!limit) {
    return NextResponse.json({ error: "지원하지 않는 업로드 종류입니다" }, { status: 400 });
  }
  if (!typeOk(file, kind as string, limit.mime)) {
    return NextResponse.json(
      { error: kind === "image" ? "이미지 파일만 업로드할 수 있습니다 (SVG 제외)" : "오디오 파일만 업로드할 수 있습니다" },
      { status: 400 }
    );
  }
  if (file.size > limit.maxBytes) {
    return NextResponse.json({ error: "파일 용량이 너무 큽니다" }, { status: 400 });
  }

  const ext = safeExt(file.name, kind === "image" ? ".jpg" : ".mp3");
  const filename = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}${ext}`;
  const dir = path.join(DATA_DIR, "uploads", limit.dir);
  await fs.mkdir(dir, { recursive: true });

  let buffer: Buffer = Buffer.from(await file.arrayBuffer());
  if (ext === ".gif") buffer = forceGifPlayOnce(buffer);
  await fs.writeFile(path.join(dir, filename), buffer);

  return NextResponse.json({ path: `/uploads/${limit.dir}/${filename}` });
}
