import { NextResponse } from "next/server";
<<<<<<< HEAD
import { upsertUser, readUsers } from "@/lib/saveUser";
=======
// import { upsertUser, readUsers } from "@/lib/saveUser";
>>>>>>> 4692864 (push from mac)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
<<<<<<< HEAD
  const data = await readUsers();
=======
  // const data = await readUsers();
>>>>>>> 4692864 (push from mac)
  return NextResponse.json(data);
}

export async function POST(req) {
  try {
    const body = await req.json();
<<<<<<< HEAD
    const result = await upsertUser(body);
=======
    // const result = await upsertUser(body);
>>>>>>> 4692864 (push from mac)
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
