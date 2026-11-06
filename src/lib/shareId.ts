import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { DATA_DIR } from "@/lib/paths";
import { withFileLock } from "@/lib/fileLock";
import { isValidClientFilename } from "@/lib/newClient";
import type { SessionPayload } from "@/lib/adminAuth";

// 청첩장 공유 링크에 파일명(= 가입 이메일) 대신 쓰는 공개용 ID.
// 서버 전용. ponytail: JSON 인덱스 + 역방향 선형 탐색 — 고객이 수천 명을 넘으면 DB로 (MOM-3 검토 참고).
const INDEX_FILE = path.join(DATA_DIR, "share-index.json");

type Index = Record<string, string>; // shareId → 고객 파일명

async function readIndex(): Promise<Index> {
  try {
    return JSON.parse(await fs.readFile(INDEX_FILE, "utf-8"));
  } catch {
    return {};
  }
}

export function getOrCreateShareId(file: string): Promise<string> {
  return withFileLock("share-index", async () => {
    const index = await readIndex();
    const existing = Object.keys(index).find((id) => index[id] === file);
    if (existing) return existing;

    let id: string;
    do id = crypto.randomBytes(6).toString("base64url");
    while (id in index);
    index[id] = file;

    // 쓰는 도중 중단돼도 인덱스가 깨지지 않게 임시 파일 → rename
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${INDEX_FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(index, null, 2), "utf-8");
    await fs.rename(tmp, INDEX_FILE);
    return id;
  });
}

export async function resolveShareId(id: string): Promise<string | null> {
  if (!isValidClientFilename(id)) return null;
  const index = await readIndex();
  return Object.hasOwn(index, id) ? index[id] : null;
}

// 공개 API(RSVP·방명록)가 받은 값을 실제 파일명으로 바꾼다.
// 로그인한 본인/관리자는 파일명을 그대로 쓸 수 있고, 비로그인은 공유 ID(또는 데모 슬러그)만 허용 —
// 이메일을 알아도 하객 응답에 접근하지 못하게 한다.
export async function resolvePublicFile(idOrFile: unknown, session: SessionPayload | null): Promise<string | null> {
  if (typeof idOrFile !== "string" || !isValidClientFilename(idOrFile)) return null;
  if (session && (session.role === "admin" || session.file === idOrFile)) return idOrFile;
  const file = await resolveShareId(idOrFile);
  if (file) return file;
  return idOrFile.startsWith("demo-") ? idOrFile : null;
}
