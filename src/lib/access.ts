import { getDb } from "@/lib/db";
import type { SessionPayload } from "@/lib/adminAuth";

// 청첩장(file)별 멤버 권한. 새 역할/동작은 아래 표만 고치면 된다.
export type Action = "view" | "edit" | "guests" | "members";

const PERMS: Record<string, Action[]> = {
  owner: ["view", "edit", "guests", "members"],
  editor: ["view", "edit", "guests"],
  viewer: ["view", "guests"], // 아직 초대 불가 (INVITABLE에 추가하면 열림)
};
export const INVITABLE = ["editor"];
const MAX_MEMBERS = 10;

export interface Member { email: string; role: string }

export function memberRole(file: string, email: string): string | null {
  const row = getDb().prepare("select role from customer_members where file = ? and email = ?").get(file, email) as { role: string } | undefined;
  return row?.role ?? null;
}

// 관리자는 전부 가능. 고객은 getSession이 채운 memberRole 기준.
export function can(session: SessionPayload | null, action: Action): boolean {
  if (!session) return false;
  if (session.role === "admin") return true;
  return !!session.memberRole && !!PERMS[session.memberRole]?.includes(action);
}

// 로그인 시 열 청첩장: 내가 소유한 것 우선, 없으면 초대받은 첫 번째, 그것도 없으면 null(신규 가입)
export function filesOf(email: string): { file: string; role: string; label: string }[] {
  return getDb()
    .prepare(`select m.file, m.role, c.label from customer_members m join customers c on c.file = m.file
              where m.email = ? order by m.role = 'owner' desc, m.added_at`)
    .all(email) as { file: string; role: string; label: string }[];
}

export function listMembers(file: string): Member[] {
  return getDb().prepare("select email, role from customer_members where file = ? order by role = 'owner' desc, added_at").all(file) as Member[];
}

export function addMember(file: string, email: string, role: string): "ok" | "full" {
  const db = getDb();
  if (role !== "owner" && (db.prepare("select count(*) from customer_members where file = ?").pluck().get(file) as number) >= MAX_MEMBERS) return "full";
  db.prepare("insert or ignore into customer_members (file, email, role, added_at) values (?, ?, ?, ?)").run(file, email, role, new Date().toISOString());
  return "ok";
}

// 소유자는 제거할 수 없다
export function removeMember(file: string, email: string): boolean {
  return getDb().prepare("delete from customer_members where file = ? and email = ? and role != 'owner'").run(file, email).changes > 0;
}
