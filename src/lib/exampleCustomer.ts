import { EXAMPLE } from "@/example";
import { getDb } from "@/lib/db";
import { customerExists, saveCustomer, setPlan } from "@/lib/customers";
import { EXAMPLE_FILE } from "@/lib/exampleInfo";

// 서버 기동 시 호출 — 랜딩 예시용 고객 파일을 없을 때만 만든다(있으면 운영자가 고친 내용을 절대 덮어쓰지 않음).
// 소유자(이메일·멤버)는 없다. 템플릿 mono, 유료, 공유 ID도 "example"로 고정.
export function ensureExampleCustomer(): boolean {
  if (customerExists(EXAMPLE_FILE)) return false;
  saveCustomer(EXAMPLE_FILE, EXAMPLE);
  getDb().prepare("update customers set share_id = ? where file = ?").run(EXAMPLE_FILE, EXAMPLE_FILE);
  setPlan(EXAMPLE_FILE, "paid");
  return true;
}

// 랜딩용: DB를 못 읽어도 랜딩이 깨지지 않게 false
export function exampleLive(): boolean {
  try { return customerExists(EXAMPLE_FILE); } catch { return false; }
}
