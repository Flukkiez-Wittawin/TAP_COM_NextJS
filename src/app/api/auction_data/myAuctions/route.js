import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    const [[user]] = await connection.execute(
      "SELECT user_id FROM users WHERE email = ?",
      [session.user.email]
    );
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Query เพิ่ม current bid
    const [auctions] = await connection.execute(
      `SELECT 
          a.auction_id AS id, 
          a.auction_name AS name, 
          ai.image_name AS image, 
          a.auction_bid_max AS max_price,
          IFNULL(MAX(ab.amount), 0) AS current_bid
       FROM auctions a
       LEFT JOIN auction_image ai ON ai.Auctions_auction_id = a.auction_id
       LEFT JOIN auctionbids ab ON ab.Auctions_auction_id = a.auction_id
       WHERE a.Users_user_id = ?
       GROUP BY a.auction_id, a.auction_name, ai.image_name, a.auction_bid_max`,
      [user.user_id]
    );

    await connection.end();

    return NextResponse.json(auctions);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
