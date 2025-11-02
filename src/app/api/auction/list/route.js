import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    // ดึง auctions พร้อม join image ทั้งหมดใน query เดียว
    const [rows] = await connection.execute(`
      SELECT 
        a.auction_id,
        a.auction_name AS title,
        a.auction_bid_min AS price,
        a.AuctionStatus_status_id,
        ad.start_time,
        ad.end_time,
        ai.image_name
      FROM auctions a
      JOIN auction_date ad ON a.auction_id = ad.auction_id
      LEFT JOIN auction_image ai ON ai.Auctions_auction_id = a.auction_id
      WHERE a.AuctionStatus_status_id = 'S02'
      ORDER BY ad.start_time DESC
    `);

    // จัดกลุ่ม auction และรวม images เป็น array
    const auctionsMap = {};
    rows.forEach(row => {
      if (!auctionsMap[row.auction_id]) {
        auctionsMap[row.auction_id] = {
          auction_id: row.auction_id,
          title: row.title,
          price: row.price,
          AuctionStatus_status_id: row.AuctionStatus_status_id,
          start_time: row.start_time,
          end_time: row.end_time,
          images: [],
        };
      }
      if (row.image_name) {
        auctionsMap[row.auction_id].images.push(`/uploads/auctions/auction_${row.auction_id}/${row.image_name}`);
      }
    });

    const auctions = Object.values(auctionsMap);

    await connection.end();

    return NextResponse.json(auctions, { status: 200 });
  } catch (err) {
    console.error("API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
