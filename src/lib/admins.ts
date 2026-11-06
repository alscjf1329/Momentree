import { getDb } from "@/lib/db";

// 환경변수 ADMIN_EMAIL은 최상위 운영자(슈퍼 관리자) — 이 목록에는 들어가지 않고 항상 암묵적으로 admin.
export async function readAdmins(): Promise<string[]> {
  return getDb().prepare("select email from admins order by email").pluck().all() as string[];
}

export function isSuperAdmin(email: string): boolean {
  return email === process.env.ADMIN_EMAIL;
}

export async function isAdmin(email: string): Promise<boolean> {
  if (isSuperAdmin(email)) return true;
  return !!getDb().prepare("select 1 from admins where email = ?").get(email);
}

export async function addAdmin(email: string): Promise<void> {
  getDb().prepare("insert or ignore into admins (email) values (?)").run(email);
}

export async function removeAdmin(email: string): Promise<void> {
  getDb().prepare("delete from admins where email = ?").run(email);
}
