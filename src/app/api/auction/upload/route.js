import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    // ---- ตรวจสอบ session ----
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ---- ดึง user จาก DB ตาม email ----
    const email = session.user.email;
    const [user] = await db.query(
      "SELECT user_id, Role_role_id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (!user || user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role_id = user[0].Role_role_id;
    if (role_id !== "R003") {
      return NextResponse.json({ error: "You do not have permission to upload" }, { status: 403 });
    }

    const formData = await req.formData();
    const auction_id = formData.get("auction_id");

    if (!auction_id) {
      return NextResponse.json({ error: "Missing auction_id" }, { status: 400 });
    }

    const files = formData.getAll("images");
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    if (files.length > 10) {
      return NextResponse.json({ error: "Cannot upload more than 10 files" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "auctions", `auction_${auction_id}`);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const savedFiles = [];

    for (let file of files) {
      if (!file) continue;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length > 1024 * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name} exceeds 1GB` }, { status: 400 });
      }

      const filePath = path.join(uploadDir, file.name);
      fs.writeFileSync(filePath, buffer);

      // บันทึกลง DB
      await db.query(
        "INSERT INTO auction_image (image_id, image_name, Auctions_auction_id) VALUES (?, ?, ?)",
        [`IMG_${Date.now()}_${Math.floor(Math.random() * 1000)}`, file.name, auction_id]
      );

      savedFiles.push(`/uploads/auctions/auction_${auction_id}/${file.name}`);
    }

    return NextResponse.json({ success: true, files: savedFiles });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
