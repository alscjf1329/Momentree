import { NextRequest, NextResponse } from "next/server";
import type { WeddingData } from "@/types";
import { getSession } from "@/lib/session";
import { can } from "@/lib/access";
import { isValidClientFilename } from "@/lib/newClient";
import { deleteCustomer, getCustomer, getPlan, listCustomers, newCustomerFile, saveCustomer } from "@/lib/customers";
import { canUseTemplate, photoLimit, PLAN_MSG } from "@/lib/plan";

// GET /api/clients               → 파일 목록 (customer는 자기 파일만)
// GET /api/clients?detail=1      → 목록 + 표시 이름·소유자·예식일·수정일 (검색: &q=이메일/이름/예식일)
// GET /api/clients?file=x        → 특정 청첩장 읽기 (customer는 자기 파일만 허용)
export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const requested = req.nextUrl.searchParams.get("file");
  const file = session.role === "customer" ? session.file : requested;

  if (file) {
    if (!isValidClientFilename(file)) return NextResponse.json({ error: "invalid file" }, { status: 400 });
    const data = getCustomer(file);
    return data ? NextResponse.json(data) : NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const list = listCustomers(req.nextUrl.searchParams.get("q") ?? "");
  return req.nextUrl.searchParams.has("detail") ? NextResponse.json(list) : NextResponse.json(list.map((c) => c.file));
}

// POST /api/clients  → { filename, data } 저장 (customer는 자기 파일로 강제)
export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!can(session, "edit")) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();
  // 운영자가 filename 없이 보내면 새 고객 — 서버가 c-YYYYMM-난수 파일명을 발급해 돌려준다
  const isNew = session.role === "admin" && !body.filename;
  const filename = session.role === "customer" ? session.file : isNew ? newCustomerFile() : body.filename;

  if (!filename || !isValidClientFilename(filename)) {
    return NextResponse.json({ error: "invalid filename" }, { status: 400 });
  }

  // 운영자가 지정한 파일명은 이미 있는 고객이어야 한다 (오타·덮어쓰기로 엉뚱한 고객이 생기지 않게)
  if (session.role === "admin" && !isNew && !getCustomer(filename)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // 플랜 제한(서버 강제). 관리자 대행 편집은 제한 없음. 새로 만드는 고객은 무료로 본다.
  if (session.role !== "admin") {
    const plan = getPlan(filename) ?? "free";
    const d = body.data as WeddingData;
    if (!canUseTemplate(plan, d?.template)) return NextResponse.json({ error: PLAN_MSG.template }, { status: 403 });
    if ((d?.gallery?.length ?? 0) > photoLimit(plan)) return NextResponse.json({ error: PLAN_MSG.photos(photoLimit(plan)) }, { status: 403 });
  }

  // 소유자(멤버십)는 최초 로그인 때 만들어진다 — 여기선 내용만 저장
  saveCustomer(filename, isNew ? { ...(body.data as WeddingData), slug: filename } : (body.data as WeddingData));
  return NextResponse.json({ ok: true, file: filename });
}

// DELETE /api/clients?file=x (admin 전용)
export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const file = req.nextUrl.searchParams.get("file");
  if (!file || !isValidClientFilename(file)) return NextResponse.json({ error: "file required" }, { status: 400 });
  return deleteCustomer(file) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
}
