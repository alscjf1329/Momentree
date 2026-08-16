import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { Readable } from "stream";
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
//
// Range 요청을 지원해야 함 — 브라우저의 <audio>/<video>는 재생 시작 전에
// Range 프로브를 보내고, 206으로 응답 안 하면(특히 큰 파일) readyState가
// 0에서 멈춰 영영 재생되지 않는 경우가 있음.
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

  const filePath = path.join(DATA_DIR, "uploads", kind, filename);
  let size: number;
  try {
    size = (await fs.promises.stat(filePath)).size;
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const range = req.headers.get("range");
  const baseHeaders = {
    "Content-Type": mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match?.[1] ? parseInt(match[1], 10) : 0;
    const end = match?.[2] ? parseInt(match[2], 10) : size - 1;
    const chunkSize = end - start + 1;

    const stream = Readable.toWeb(
      fs.createReadStream(filePath, { start, end })
    ) as ReadableStream;

    return new NextResponse(stream, {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Content-Length": String(chunkSize),
      },
    });
  }

  const stream = Readable.toWeb(fs.createReadStream(filePath)) as ReadableStream;
  return new NextResponse(stream, {
    headers: { ...baseHeaders, "Content-Length": String(size) },
  });
}
