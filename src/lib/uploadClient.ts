// 어드민 파일 업로드 공용 — 서버나 앞단 프록시가 JSON이 아닌 응답(413 등)을 줘도 읽을 수 있는 문구로 바꿔 던진다.
export async function uploadFile(file: File, kind: "image" | "audio"): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);
  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body: form });
  } catch {
    throw new Error("네트워크 연결을 확인하고 다시 시도해 주세요");
  }
  const json = await res.json().catch(() => null); // 프록시 오류 응답은 본문이 비었거나 HTML
  if (res.ok && json?.path) return json.path as string;
  if (json?.error) throw new Error(json.error);
  if (res.status === 413) throw new Error("파일이 너무 커요. 더 작은 파일로 올려 주세요");
  throw new Error("서버에 문제가 생겨 올리지 못했어요. 잠시 후 다시 시도해 주세요");
}
