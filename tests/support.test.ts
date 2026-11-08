import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { supportChannel } from "@/lib/support";

test("카카오 채널 URL 이 http(s) 면 kakao, 없거나 이상하면 이메일 대체", () => {
  assert.deepEqual(supportChannel("http://pf.kakao.com/_xxxx"), { kind: "kakao", href: "http://pf.kakao.com/_xxxx" });
  assert.deepEqual(supportChannel(" https://pf.kakao.com/_a "), { kind: "kakao", href: "https://pf.kakao.com/_a" });
  for (const v of [undefined, "", "  ", "javascript:alert(1)", "pf.kakao.com/_x"]) assert.deepEqual(supportChannel(v), { kind: "email" });
});

test("/faq 페이지 파일은 <details> 아코디언과 요금 placeholder 를 갖고 푸터에서 링크된다", () => {
  const faq = fs.readFileSync("src/app/faq/page.tsx", "utf8");
  assert.match(faq, /<details/);
  assert.match(faq, /<Tbd>가격<\/Tbd>/);
  assert.match(fs.readFileSync("src/app/page.tsx", "utf8"), /href="\/faq"/);
});
