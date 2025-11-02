import { NextResponse } from "next/server";
import { upsertUser, readUsers } from "@/lib/saveUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await readUsers();
  return NextResponse.json(data);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await upsertUser(body);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
