import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

const send = async (name: string, type: string, kind = "audio", size = 16) => {
  const { POST } = await import("@/app/api/upload/route");
  const form = new FormData();
  form.append("file", new File([new Uint8Array(size)], name, { type }));
  form.append("kind", kind);
  return POST(new NextRequest("http://x/api/upload", { method: "POST", body: form }));
};

test("업로드: 폰이 종류를 비우거나 octet-stream으로 보내도 오디오 확장자면 받는다", async () => {
  for (const type of ["audio/mpeg", "", "application/octet-stream"]) {
    const res = await send("song.MP3", type);
    assert.equal(res.status, 200, `type="${type}"`);
    assert.match((await res.json()).path, /^\/uploads\/audio\/.+\.mp3$/);
  }
});

test("업로드: 확장자 폴백은 종류가 비었을 때만 — 영상·다른 종류·SVG는 계속 거부", async () => {
  assert.equal((await send("clip.mp4", "video/mp4")).status, 400);
  assert.equal((await send("song.mp3", "video/mp4")).status, 400);
  assert.equal((await send("note.txt", "")).status, 400);
  assert.equal((await send("pic.svg", "image/svg+xml", "image")).status, 400);
  assert.equal((await send("pic.svg", "", "image")).status, 400);
  assert.equal((await send("photo.jpg", "", "image")).status, 200);
});

test("업로드: 용량 초과는 JSON 오류", async () => {
  const res = await send("big.mp3", "audio/mpeg", "audio", 20 * 1024 * 1024 + 1);
  assert.equal(res.status, 400);
  assert.ok((await res.json()).error);
});
