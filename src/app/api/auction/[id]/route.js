import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(req, context) {
  try {
    const params = await context.params; 
    const id = params?.id;

    if (!id) return NextResponse.json({ error: "Auction ID missing" }, { status: 400 });

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    const [rows] = await connection.execute(
      `
      SELECT 
        a.auction_id,
        a.auction_name,
        a.auction_desc,
        a.auction_bid_min,
        a.auction_bid_max,
        a.AuctionStatus_status_id,
        s.status_name,
        t.auction_type_name,
        ad.start_time,
        ad.end_time,
        u.user_id AS seller_id,
        u.fname AS seller_fname,
        u.lname AS seller_lname,
        u.email AS seller_email,
        IFNULL(ai.images, '') AS images,
        hb.amount AS highest_bid,
        ub.user_id AS bidder_id,
        ub.fname AS bidder_fname,
        ub.lname AS bidder_lname,
        (
          SELECT COUNT(*) 
          FROM auctionbids 
          WHERE Auctions_auction_id = a.auction_id
        ) AS bid_count
      FROM auctions a
      JOIN users u ON u.user_id = a.Users_user_id
      JOIN auctionstatus s ON s.status_id = a.AuctionStatus_status_id
      JOIN auctiontype t ON t.auction_type_id = a.AuctionType_auction_type_id
      JOIN auction_date ad ON ad.auction_id = a.auction_id
      LEFT JOIN (
        SELECT Auctions_auction_id, GROUP_CONCAT(image_name) AS images
        FROM auction_image
        GROUP BY Auctions_auction_id
      ) ai ON ai.Auctions_auction_id = a.auction_id
      LEFT JOIN auctionbids hb 
        ON hb.Auctions_auction_id = a.auction_id 
        AND hb.amount = (SELECT MAX(amount) FROM auctionbids WHERE Auctions_auction_id = a.auction_id)
      LEFT JOIN users ub ON ub.user_id = hb.Users_user_id
      WHERE a.auction_id = ?
      LIMIT 1
      `,
      [id]
    );

    await connection.end();

    if (!rows || rows.length === 0)
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });

    const data = rows[0];

    // current_bid = highest_bid หรือ min_bid ถ้าไม่มี bid
    const current_bid = data.highest_bid || data.auction_bid_min;

    const result = {
      auction_id: data.auction_id,
      name: data.auction_name,
      description: data.auction_desc,
      min_bid: data.auction_bid_min,
      max_bid: data.auction_bid_max,
      status_id: data.AuctionStatus_status_id,
      status_name: data.status_name,
      type_name: data.auction_type_name,
      start_time: data.start_time,
      end_time: data.end_time,
      bid_count: data.bid_count,
      highest_bid: data.highest_bid || 0,
      current_bid, // <-- เพิ่มตรงนี้
      highest_bidder: data.bidder_id
        ? {
            id: data.bidder_id,
            fname: data.bidder_fname,
            lname: data.bidder_lname,
          }
        : null,
      seller: {
        id: data.seller_id,
        fname: data.seller_fname,
        lname: data.seller_lname,
        email: data.seller_email
      },
      images: data.images ? data.images.split(",") : [],
    };

    return NextResponse.json(result, { status: 200 });

  } catch (err) {
    console.error("API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
