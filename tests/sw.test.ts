import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// public/sw.js 를 가짜 self·caches 로 실행해 fetch 핸들러만 검사한다.
function load() {
  const handlers: Record<string, (e: unknown) => void> = {};
  const puts: string[] = [];
  const cache = { put: async (r: { url: string }) => { puts.push(r.url); }, add: async () => {}, match: async () => undefined };
  const self = { location: { origin: "https://momentree.shop" }, addEventListener: (t: string, h: (e: unknown) => void) => { handlers[t] = h; }, skipWaiting() {}, clients: { claim() {} } };
  const ctx = vm.createContext({ self, caches: { open: async () => cache, match: async () => undefined, keys: async () => [], delete: async () => true }, URL, Headers, fetch: async () => new Response("ok") });
  vm.runInContext(fs.readFileSync("public/sw.js", "utf8"), ctx);
  const run = (url: string, headers: Record<string, string> = {}, destination = "") => {
    let handled = false;
    handlers.fetch({ request: { method: "GET", url, headers: new Headers(headers), destination }, respondWith: () => { handled = true; } });
    return handled;
  };
  return { run, puts };
}

test("sw: 확장 프로그램·외부 도메인·RSC 요청은 가로채지 않는다", () => {
  const { run } = load();
  assert.equal(run("chrome-extension://abc/inject.js"), false);
  assert.equal(run("https://fonts.googleapis.com/css2?family=Noto"), false);
  assert.equal(run("https://momentree.shop/admin/setup?step=2&_rsc=abc"), false);
  assert.equal(run("https://momentree.shop/admin/setup", { RSC: "1" }), false);
});

test("sw: 우리 도메인의 페이지·에셋은 처리하고, 캐시 저장은 200 응답만", async () => {
  const { run, puts } = load();
  assert.equal(run("https://momentree.shop/faq"), true);
  assert.equal(run("https://momentree.shop/_next/static/chunks/a.js"), true);
  assert.equal(run("https://momentree.shop/audio/a.mp3", { range: "bytes=0-" }, "audio"), true);
  await new Promise((r) => setTimeout(r, 20));
  assert.ok(puts.includes("https://momentree.shop/faq"));
});
