// node --test 용: tsconfig의 "@/*" → src/* 별칭과 확장자 생략(.ts/.tsx)을 해석한다.
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const SRC = path.resolve("src");

export async function resolve(specifier, ctx, next) {
  if (specifier.startsWith("@/")) {
    const base = path.join(SRC, specifier.slice(2));
    for (const f of [base + ".ts", base + ".tsx", path.join(base, "index.ts")]) {
      if (existsSync(f)) return next(pathToFileURL(f).href, ctx);
    }
  }
  // next는 exports 맵이 없어 ESM에서 확장자까지 필요하다
  if (specifier === "next/server") return next("next/server.js", ctx);
  return next(specifier, ctx);
}
