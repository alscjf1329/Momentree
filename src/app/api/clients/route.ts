import { NextRequest, NextResponse } from "next/server";
import type { WeddingData } from "@/types";
import { getSession } from "@/lib/session";
import { isValidClientFilename } from "@/lib/newClient";
import { deleteCustomer, getCustomer, listCustomers, saveCustomer } from "@/lib/customers";

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

  const body = await req.json();
  const filename = session.role === "customer" ? session.file : body.filename;

  if (!filename || !isValidClientFilename(filename)) {
    return NextResponse.json({ error: "invalid filename" }, { status: 400 });
  }

  // 새로 만들 때만 소유자 이메일을 기록 (고객 본인이 저장하는 경우 세션 이메일)
  saveCustomer(filename, body.data as WeddingData, session.role === "customer" ? session.file : null);
  return NextResponse.json({ ok: true });
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
