import { isValidClientFilename } from "@/lib/newClient";
import type { SessionPayload } from "@/lib/adminAuth";
import { fileByShareId } from "@/lib/customers";

export function resolveShareId(id: string): string | null {
  return isValidClientFilename(id) ? fileByShareId(id) : null;
}

// 공개 API(RSVP·방명록)가 받은 값을 실제 파일명으로 바꾼다.
// 로그인한 본인/관리자는 파일명을 그대로 쓸 수 있고, 비로그인은 공유 ID(또는 데모 슬러그)만 허용 —
// 이메일을 알아도 하객 응답에 접근하지 못하게 한다.
export function resolvePublicFile(idOrFile: unknown, session: SessionPayload | null): string | null {
  if (typeof idOrFile !== "string" || !isValidClientFilename(idOrFile)) return null;
  if (session && (session.role === "admin" || session.file === idOrFile)) return idOrFile;
  const file = resolveShareId(idOrFile);
  if (file) return file;
  return idOrFile.startsWith("demo-") ? idOrFile : null;
}
