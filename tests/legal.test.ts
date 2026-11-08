import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { config } from "@/proxy";

// 테스트 러너가 .tsx 를 못 읽어 페이지를 렌더하지는 않고, 공개 경로·초안 표기만 확인한다.
test("프록시 matcher 는 /privacy·/terms 를 보호하지 않는다 (비로그인 공개)", () => {
  const protectedPrefixes = config.matcher.map((m) => m.replace("/:path*", ""));
  for (const p of ["/privacy", "/terms"]) assert.ok(!protectedPrefixes.some((m) => p.startsWith(m)));
});

test("/privacy·/terms 페이지 파일에 '법률 검토 전 초안' 주석이 있고 로그인·RSVP 화면에서 링크된다", () => {
  for (const f of ["src/app/privacy/page.tsx", "src/app/terms/page.tsx"]) {
    assert.match(fs.readFileSync(f, "utf8"), /법률 검토 전 초안/);
  }
  assert.match(fs.readFileSync("src/app/admin/login/page.tsx", "utf8"), /href="\/privacy"/);
  assert.match(fs.readFileSync("src/components/PrivacyNote.tsx", "utf8"), /href="\/privacy"/);
});
