import fs from "fs/promises";
import path from "path";
import { DATA_DIR } from "@/lib/paths";

const ADMINS_PATH = path.join(DATA_DIR, "admins.json");

// 환경변수 ADMIN_EMAIL은 최상위 운영자(슈퍼 관리자) — 이 목록에는 들어가지 않고 항상 암묵적으로 admin.
export async function readAdmins(): Promise<string[]> {
  try {
    return JSON.parse(await fs.readFile(ADMINS_PATH, "utf-8"));
  } catch {
    return [];
  }
}

async function writeAdmins(admins: string[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ADMINS_PATH, JSON.stringify(admins, null, 2), "utf-8");
}

export function isSuperAdmin(email: string): boolean {
  return email === process.env.ADMIN_EMAIL;
}

export async function isAdmin(email: string): Promise<boolean> {
  if (isSuperAdmin(email)) return true;
  return (await readAdmins()).includes(email);
}

export async function addAdmin(email: string): Promise<void> {
  const admins = await readAdmins();
  if (!admins.includes(email)) {
    admins.push(email);
    await writeAdmins(admins);
  }
}

export async function removeAdmin(email: string): Promise<void> {
  const admins = await readAdmins();
  await writeAdmins(admins.filter((a) => a !== email));
}
