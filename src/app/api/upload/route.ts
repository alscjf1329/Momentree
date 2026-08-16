import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { PUBLIC_DIR } from "@/lib/paths";

const LIMITS: Record<string, { dir: string; publicPath: string; mime: string; maxBytes: number }> = {
  image: { dir: "images", publicPath: "/images", mime: "image/", maxBytes: 10 * 1024 * 1024 },
  audio: { dir: "audio", publicPath: "/audio", mime: "audio/", maxBytes: 20 * 1024 * 1024 },
};

function safeExt(filename: string, fallback: string): string {
  const ext = path.extname(filename).toLowerCase().replace(/[^a-z0-9.]/g, "");
  return ext || fallback;
}

// 어드민 인증(proxy.ts)이 보호하는 라우트 — public/images, public/audio에만 쓴다
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
  if (!file.type.startsWith(limit.mime) || file.type === "image/svg+xml") {
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
  const dir = path.join(PUBLIC_DIR, limit.dir);
  await fs.mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);

  return NextResponse.json({ path: `${limit.publicPath}/${filename}` });
}
