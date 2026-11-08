import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// 확정 팔레트가 globals.css에 그대로 있어야 한다 (MOM-17)
test("brand palette tokens", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  for (const t of ["--color-ink: #111111", "--color-sub: #6b6b6b", "--color-line: #ebebeb", "--color-soft: #fafafa", "--color-rose: #c2255c"])
    assert.ok(css.includes(t), t);
});
