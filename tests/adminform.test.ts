import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getSchemaForTemplate } from "@/lib/templateSchemas";
import { TEMPLATE_NAMES } from "@/lib/templateNames";

const form = readFileSync("src/components/admin/AdminForm.tsx", "utf8");

test("전용 옵션 탭은 템플릿 전용 항목이 있을 때만 그린다", () => {
  assert.match(form, /const hasSpecific = specificSections\.length > 0/);
  assert.match(form, /view === "main" && hasSpecific && \(/); // 탭 줄 렌더 조건
  assert.match(form, /const active = hasSpecific \? tab : "common"/); // 전용 항목이 없으면 기본 정보로 고정
});

test("현재 모든 템플릿의 기본 화면 전용 항목은 비어 있다(= 탭이 안 보인다)", () => {
  const MOVED = ["introBg", "envelopeClosed", "envelopeOpen", "gallery", "groom.accounts", "bride.accounts"]; // 사진·계좌 화면으로 분리된 항목
  for (const id of Object.keys(TEMPLATE_NAMES)) {
    const spec = getSchemaForTemplate(id).sections.flatMap((s) => s.fields).filter((f) => !f.common && !MOVED.includes(f.key));
    assert.equal(spec.length, 0, `${id}에 기본 화면 전용 항목이 생기면 이 테스트를 갱신하세요: ${spec.map((f) => f.key)}`);
  }
});
