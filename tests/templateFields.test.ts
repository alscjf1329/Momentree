import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getSchemaForTemplate } from "@/lib/templateSchemas";
import { TEMPLATE_NAMES } from "@/lib/templateNames";

test("안내사항·배경음악은 모든 템플릿 스키마에 나오고, 8개 템플릿 화면이 공용 부품을 쓴다", () => {
  for (const id of Object.keys(TEMPLATE_NAMES)) {
    const keys = getSchemaForTemplate(id).sections.flatMap((s) => s.fields).map((f) => f.key);
    for (const k of ["info", "bgm.title", "bgm.src"]) assert.ok(keys.includes(k), `${id}에 ${k} 없음`);
  }
  for (const id of ["classic", "editorial", "minimal", "romantic", "twilight", "blossom", "modern", "luxury"]) {
    const src = readFileSync(`src/templates/${id}/index.tsx`, "utf8");
    assert.match(src, /sections\/InfoSection/, id);
    assert.match(src, /sections\/BgmPlayer/, id);
    assert.match(src, /<InfoSection \/>\s*<ContactSection \/>/, id);
  }
  // 옛 데이터(info·bgm 없음)와 빈 항목에서도 안전해야 한다
  assert.match(readFileSync("src/components/sections/InfoSection.tsx", "utf8"), /w\.info \?\? \[\]/);
  assert.match(readFileSync("src/components/sections/BgmPlayer.tsx", "utf8"), /w\.bgm\?\.src/);
});
