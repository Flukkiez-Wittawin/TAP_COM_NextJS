import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid"; // สร้าง auction_id และ auction_date_id

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { name, desc, bid_min, bid_max, type_id, start_time, end_time } = body;

    if (!name || !bid_min || !start_time || !end_time || !type_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // เชื่อมต่อ DB
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    // ดึง user_id จาก session
    const [rows] = await connection.execute(
      "SELECT user_id, Role_role_id  FROM users WHERE email = ?",
      [session.user.email]
    );
    if (rows.length === 0) {
      await connection.end();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role_id = rows[0].Role_role_id;
    if (role_id !== "R003") {
      return NextResponse.json({ error: "You do not have permission to upload" }, { status: 403 });
    }
    const user_id = rows[0].user_id;

    // สร้าง auction_id และ auction_date_id
    const auction_id = uuidv4().replace(/-/g, "").slice(0, 16);
    const auction_date_id = uuidv4().replace(/-/g, "").slice(0, 16);

    // insert auction
    await connection.execute(
      `INSERT INTO auctions (auction_id, auction_name, auction_desc, auction_bid_min, auction_bid_max, Users_user_id, AuctionStatus_status_id, AuctionType_auction_type_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [auction_id, name, desc || null, bid_min, bid_max || null, user_id, "S01", type_id]
    );

    // insert auction_date
    await connection.execute(
      `INSERT INTO auction_date (auction_date_id, auction_id, start_time, end_time)
       VALUES (?, ?, ?, ?)`,
      [auction_date_id, auction_id, start_time, end_time]
    );

    await connection.end();

    return NextResponse.json({ message: "Auction created", auction_id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
