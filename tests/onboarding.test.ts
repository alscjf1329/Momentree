import { test } from "node:test";
import assert from "node:assert/strict";
import { computeOnboarding } from "@/lib/onboarding";
import { DEFAULT_WEDDING_DATA } from "@/lib/newClient";

const none = { templatePicked: false, shared: false };
const done = (d = DEFAULT_WEDDING_DATA, f = none) => computeOnboarding(d, f).steps.map((s) => s.done);

test("온보딩: 빈 기본 데이터는 모두 미완료", () => {
  assert.deepEqual(done(), [false, false, false, false]);
});

test("온보딩: 이름·장소가 모두 있어야 1단계 완료", () => {
  const d = structuredClone(DEFAULT_WEDDING_DATA);
  d.groom.name = "민철"; d.bride.name = "  ";
  d.venue.name = "웨딩홀";
  assert.equal(done(d)[0], false);
  d.bride.name = "지수";
  assert.equal(done(d)[0], true);
  d.venue.name = "";
  assert.equal(done(d)[0], false);
});

test("온보딩: 사진은 갤러리 또는 대표 이미지", () => {
  const d = structuredClone(DEFAULT_WEDDING_DATA);
  d.gallery = [{ src: "", alt: "" }];
  assert.equal(done(d)[1], false);
  d.gallery = [{ src: "/a.jpg", alt: "" }];
  assert.equal(done(d)[1], true);
  d.gallery = []; d.introBg = "/b.jpg";
  assert.equal(done(d)[1], true);
});

test("온보딩: 템플릿은 기본값이 아니거나 직접 고른 기록이 있을 때", () => {
  const d = structuredClone(DEFAULT_WEDDING_DATA);
  assert.equal(done(d)[2], false);
  assert.equal(done(d, { templatePicked: true, shared: false })[2], true);
  d.template = "modern";
  assert.equal(done(d)[2], true);
});

test("온보딩: 모두 끝나면 allDone", () => {
  const d = structuredClone(DEFAULT_WEDDING_DATA);
  d.groom.name = "a"; d.bride.name = "b"; d.venue.name = "v"; d.introBg = "/x.jpg";
  assert.equal(computeOnboarding(d, { templatePicked: true, shared: false }).allDone, false);
  const r = computeOnboarding(d, { templatePicked: true, shared: true });
  assert.equal(r.allDone, true);
  assert.equal(r.doneCount, 4);
});
