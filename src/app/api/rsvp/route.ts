import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "rsvp.json");

export interface RsvpEntry {
  name: string;
  attendance: "attending" | "not_attending";
  guests: string;
  message: string;
  slug: string;
  submittedAt: string;
}

async function readRsvps(): Promise<RsvpEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function GET() {
  const rsvps = await readRsvps();
  return NextResponse.json(rsvps);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rsvps = await readRsvps();
  const entry: RsvpEntry = {
    name: body.name,
    attendance: body.attendance,
    guests: body.guests ?? "1",
    message: body.message ?? "",
    slug: body.slug ?? "unknown",
    submittedAt: new Date().toISOString(),
  };
  rsvps.push(entry);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(rsvps, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}
