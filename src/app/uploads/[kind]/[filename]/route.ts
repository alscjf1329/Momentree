import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { DATA_DIR } from "@/lib/paths";

const ALLOWED_KINDS = new Set(["images", "audio"]);
const SAFE_FILENAME_RE = /^[a-zA-Z0-9._-]+$/;

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
};

// 고객이 업로드한 이미지/오디오를 DATA_DIR/uploads에서 직접 읽어 서빙
// (public/에 안 두는 이유: standalone 빌드는 재생성될 때마다 public을 덮어써서
// 런타임에 저장한 파일이 날아감 — 여긴 데이터 저장소라 안전하게 유지됨)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kind: string; filename: string }> }
) {
  const { kind, filename } = await params;

  if (!ALLOWED_KINDS.has(kind) || !SAFE_FILENAME_RE.test(filename)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const mime = MIME_TYPES[ext];
  if (!mime) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    const buffer = await fs.readFile(path.join(DATA_DIR, "uploads", kind, filename));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
