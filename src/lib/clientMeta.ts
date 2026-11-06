import type { WeddingData } from "@/types";

// 고객 파일(data/clients/*.json)의 `_meta` — 파일명(이메일·슬러그)만으로 누구 청첩장인지 알 수 없어서,
// 저장할 때마다 서버가 데이터에서 계산해 넣는다 (클라이언트가 보낸 값은 무시).
// 오래된 파일은 다시 저장될 때 채워진다. 공개 초대장 페이지로 내려가면 안 되므로(owner = 이메일) 읽을 때 반드시 떼어낸다.
export interface ClientMeta {
  owner?: string; // 고객이 가입한 이메일 (관리자가 만든 파일은 비어 있음)
  label: string; // 예: "홍길동 ♥ 김지수"
  weddingDate: string; // data.date.iso
  createdAt: string;
  updatedAt: string;
}

export function buildMeta(data: WeddingData, prev: ClientMeta | undefined, owner?: string, now = new Date()): ClientMeta {
  const names = [data.groom?.name, data.bride?.name].map((n) => n?.trim()).filter(Boolean);
  return {
    owner: owner ?? prev?.owner,
    label: names.join(" ♥ "),
    weddingDate: data.date?.iso ?? "",
    createdAt: prev?.createdAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function splitMeta<T extends object>(parsed: T & { _meta?: ClientMeta }): { data: T; meta?: ClientMeta } {
  const { _meta, ...data } = parsed;
  return { data: data as unknown as T, meta: _meta };
}
