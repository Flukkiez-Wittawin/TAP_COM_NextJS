import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const auctionId = searchParams.get("auctionId");

  if (!auctionId) {
    return NextResponse.json({ error: "auctionId required" }, { status: 400 });
  }

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    // ✅ ดึงไฟล์รูปจาก DB ตาม auction_id
    const [rows] = await connection.execute(
      `SELECT image_name FROM auction_image WHERE Auctions_auction_id = ?`,
      [auctionId]
    );

    await connection.end();

    // ✅ แปลงเป็น URL ที่ frontend ใช้ได้เลย
    const images = rows.map((img) => `/uploads/auctions/${auctionId}/${img.image_name}`);

    return NextResponse.json({ images });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
