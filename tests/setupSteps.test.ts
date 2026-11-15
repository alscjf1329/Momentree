import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { getSchemaForTemplate } from "@/lib/templateSchemas";
import { TEMPLATE_NAMES } from "@/lib/templateNames";
import { buildSteps, missingRequired, resolveIndex, stepForView, moveIndex, stepOf, COLOR_KEYS } from "@/lib/setupSteps";

const ids = Object.keys(TEMPLATE_NAMES);
const keysOf = (id: string) => getSchemaForTemplate(id).sections.flatMap((s) => s.fields.map((f) => f.key));

test("9개 템플릿 모두 스키마의 모든 항목이 정확히 한 단계에 속한다 (색상 항목은 상단 패널이라 제외)", () => {
  assert.equal(ids.length, 9);
  for (const id of ids) {
    const got = buildSteps(getSchemaForTemplate(id)).flatMap((st) => st.sections.flatMap((s) => s.fields.map((f) => f.key)));
    assert.deepEqual([...got].sort(), keysOf(id).filter((k) => !COLOR_KEYS.includes(k)).sort(), `${id}: 누락 또는 중복`);
  }
});

test("단계 매핑: 계좌는 5, 사진은 4, 이름·일정·인사말은 1~3, 나머지는 6", () => {
  for (const id of ids) {
    const steps = buildSteps(getSchemaForTemplate(id));
    const at = (key: string) => steps.find((st) => st.sections.some((s) => s.fields.some((f) => f.key === key)))?.n;
    assert.equal(at("groom.name"), 1);
    assert.equal(at("bride.fatherName"), 1);
    assert.equal(at("date"), 2);
    assert.equal(at("venue.address"), 2);
    assert.equal(at("greeting"), 3);
    for (const k of ["introBg", "gallery"]) assert.equal(at(k), 4);
    for (const k of ["groom.accounts", "bride.accounts", "contactNotice"]) assert.equal(at(k), 5);
    for (const k of ["info", "bgm.src", "rsvpNotice"]) assert.equal(at(k), 6);
    assert.ok(!steps.find((s) => s.n === 1)!.sections.flatMap((s) => s.fields).some((f) => f.key.endsWith(".accounts")));
  }
  assert.equal(stepOf("처음 보는 섹션", "x"), 6); // 명시되지 않은 섹션은 6단계
});

test("비어 있는 단계는 건너뛴다", () => {
  const steps = buildSteps({ name: "t", sections: [{ title: "인사말", fields: [{ key: "greeting", type: "array", label: "인사말" }] }] });
  assert.deepEqual(steps.map((s) => s.n), [3]);
});

test("필수 남음 계산·단계 이동", () => {
  const steps = buildSteps(getSchemaForTemplate("minimal"));
  assert.equal(missingRequired(steps[0], { groom: { name: "" }, bride: { name: "김" } }), 1);
  assert.equal(missingRequired(steps[0], { groom: { name: "홍" }, bride: { name: "김" } }), 0);
  assert.equal(resolveIndex(steps, null), 0);
  assert.equal(steps[resolveIndex(steps, 4)].n, 4);
  assert.equal(resolveIndex(steps, 99), steps.length - 1);
  assert.equal(stepForView("photos"), 4);
  assert.equal(stepForView("accounts"), 5);
  assert.equal(stepForView(null), null);
  assert.equal(moveIndex(0, -1, 6), 0);
  assert.equal(moveIndex(5, 1, 6), 5);
  assert.equal(moveIndex(2, 1, 6), 3);
});

test("고객·운영자 모두 같은 위저드를 쓰고, 옛 폼은 남아 있지 않다", () => {
  const src = readFileSync("src/app/admin/setup/SetupForm.tsx", "utf8");
  assert.equal((src.match(/<SetupWizard/g) ?? []).length, 1); // role 분기 없이 하나
  assert.ok(!/AdminForm/.test(src));
  assert.ok(!existsSync("src/components/admin/AdminForm.tsx"));
  assert.match(readFileSync("src/app/admin/setup/SetupWizard.tsx", "utf8"), /renderField/);
  // 운영자 전용 요소는 그대로
  assert.match(src, /role === "admin"/);
  assert.match(src, /\+ 새 고객/);
  assert.match(src, /<ClientSearch/);
});

test("옛 view=photos·accounts 링크는 ④·⑤ 단계로 간다", () => {
  assert.match(readFileSync("src/app/admin/setup/SetupWizard.tsx", "utf8"), /stepForView\(sp\.get\("view"\)\)/);
});

test("색상: 팔레트는 변수 10개를 모두 채우고, 색상 항목은 위저드 단계가 아니라 상단 패널에서 다룬다", async () => {
  const { PALETTES } = await import("@/themes");
  for (const [id, p] of Object.entries(PALETTES)) {
    if (id) assert.equal(Object.keys(p.vars).length, 10, id); // 변수 9개 + 구분 배경(--section-alt)
  }
  const schemaKeys = keysOf("mono");
  assert.ok(schemaKeys.includes("palette") && schemaKeys.includes("customColors")); // 폼 상단 '색상' 패널이 쓴다
  const inSteps = buildSteps(getSchemaForTemplate("mono")).flatMap((st) => st.sections.flatMap((s) => s.fields.map((f) => f.key)));
  assert.ok(!inSteps.includes("palette") && !inSteps.includes("customColors")); // 위저드 단계에는 없다
});

test("직접 고른 색: 어떤 조합도 글자·포인트가 배경과 대비 4.5 이상, 배경은 밝게, 잘못된 값은 무시", async () => {
  const { customPaletteVars, paletteVars, contrast } = await import("@/themes");
  const pick = ["#000000", "#ffffff", "#ffff00", "#0000ff", "#ff69b4", "#222222", "#f5e6d3"];
  for (const bg of pick) for (const text of pick) for (const point of pick) {
    const v = customPaletteVars({ bg, text, point })!;
    assert.equal(Object.keys(v).length, 10);
    assert.ok(contrast(v["--color-text"], v["--color-cream"]) >= 4.5, `text ${bg}/${text}`);
    assert.ok(contrast(v["--color-primary"], v["--color-cream"]) >= 4.5, `point ${bg}/${point}`);
    assert.ok(contrast("#ffffff", v["--color-cream"]) < 3, `밝은 배경 ${bg}`);
  }
  assert.equal(customPaletteVars({ bg: "red", text: "#000000", point: "#000000" }), null);
  assert.deepEqual(paletteVars("custom", undefined), {});
  assert.deepEqual(paletteVars("", undefined), {});
  assert.ok(paletteVars("rose", undefined)["--color-primary"]);
});
