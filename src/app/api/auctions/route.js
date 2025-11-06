// src/app/api/auctions/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    // ===== (ถ้าหน้านี้เฉพาะแอดมิน/เซลเลอร์ให้เปิดเช็ค session/role) =====
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ปรับตามสิทธิ์ที่ต้องการ (ตัวอย่าง: ให้ R003 = Seller ใช้ได้)
    const [urows] = await db.query(
      "SELECT Role_role_id FROM users WHERE email = ? LIMIT 1",
      [session.user.email]
    );
    if (!urows?.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const roleId = urows[0].Role_role_id;
    // ถ้าจะให้ทุก role เห็นลิสต์ ก็คอมเมนต์บรรทัดด้านล่างออก
    // if (roleId !== "R003") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // ===== รับ query params =====
    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "10", 10), 1), 100);
    const q = (searchParams.get("q") || "").trim();
    const orderBy = (searchParams.get("orderBy") || "start_time").trim(); // start_time | end_time | name
    const order = (searchParams.get("order") || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
    const statusId = (searchParams.get("statusId") || "").trim(); // S01,S02,S03 ฯลฯ
    const typeId = (searchParams.get("typeId") || "").trim();     // T01,T02 ฯลฯ

    const where = [];
    const params = [];

    if (q) {
      where.push("(a.auction_name LIKE ? OR a.auction_desc LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }
    if (statusId) {
      where.push("a.AuctionStatus_status_id = ?");
      params.push(statusId);
    }
    if (typeId) {
      where.push("a.AuctionType_auction_type_id = ?");
      params.push(typeId);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // นับจำนวนทั้งหมด
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM auctions a
       LEFT JOIN auction_date d ON d.auction_id = a.auction_id
       ${whereSql}`,
      params
    );
    const total = countRows?.[0]?.total || 0;

    // map ชื่อคอลัมน์ที่จะใช้เรียง
    const orderMap = {
      start_time: "d.start_time",
      end_time: "d.end_time",
      name: "a.auction_name"
    };
    const orderCol = orderMap[orderBy] || "d.start_time";

    const offset = (page - 1) * pageSize;

    // ดึงรายการ + รูปแรก + highest bid + ชื่อสถานะ/ประเภท
    const [rows] = await db.query(
      `
      SELECT
        a.auction_id,
        a.auction_name,
        a.auction_desc,
        a.auction_bid_min,
        a.auction_bid_max,
        a.Users_user_id,
        a.AuctionStatus_status_id AS status_id,
        s.status_name,
        a.AuctionType_auction_type_id AS type_id,
        t.auction_type_name,
        d.start_time,
        d.end_time,
        (
          SELECT ai.image_name
          FROM auction_image ai
          WHERE ai.Auctions_auction_id = a.auction_id
          ORDER BY ai.image_id ASC
          LIMIT 1
        ) AS first_image,
        (
          SELECT MAX(b.amount)
          FROM auctionbids b
          WHERE b.Auctions_auction_id = a.auction_id
        ) AS highest_bid
      FROM auctions a
      LEFT JOIN auction_date d ON d.auction_id = a.auction_id
      LEFT JOIN auctionstatus s ON s.status_id = a.AuctionStatus_status_id
      LEFT JOIN auctiontype t ON t.auction_type_id = a.AuctionType_auction_type_id
      ${whereSql}
      ORDER BY ${orderCol} ${order}
      LIMIT ? OFFSET ?
      `,
      [...params, pageSize, offset]
    );

    const data = rows.map((r) => ({
      ...r,
      thumbnail: r.first_image
        ? `/uploads/auctions/auction_${r.auction_id}/${r.first_image}`
        : null,
    }));

    return NextResponse.json({
      page,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize),
      data,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
