// src/app/api/auctions/[id]/route.js
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, ...headers } });

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/* ===================== GET ===================== */
export async function GET(_req, context) {
  try {
    const { id } = await context.params; // ⬅️ สำคัญ: await
    if (!id) return json({ error: "Missing id" }, 400);

    const [rows] = await db.query(
      `SELECT
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
         (SELECT ai.image_name FROM auction_image ai
          WHERE ai.Auctions_auction_id = a.auction_id
          ORDER BY ai.image_id ASC LIMIT 1) AS first_image,
         (SELECT MAX(b.amount) FROM auctionbids b
          WHERE b.Auctions_auction_id = a.auction_id) AS highest_bid
       FROM auctions a
       LEFT JOIN auction_date d ON d.auction_id = a.auction_id
       LEFT JOIN auctionstatus s ON s.status_id = a.AuctionStatus_status_id
       LEFT JOIN auctiontype t ON t.auction_type_id = a.AuctionType_auction_type_id
       WHERE a.auction_id = ?
       LIMIT 1`,
      [id]
    );

    const row = rows?.[0];
    if (!row) return json({ error: "Not found" }, 404);

    return json({
      ...row,
      thumbnail: row?.first_image
        ? `/uploads/auctions/auction_${row.auction_id}/${row.first_image}`
        : null,
    });
  } catch (err) {
    console.error("[GET /api/auctions/:id] error:", err?.stack || err);
    return json({ error: "Internal error", detail: String(err?.message || err) }, 500);
  }
}

/* ===================== PUT ===================== */
export async function PUT(req, context) {
  try {
    // 1) Auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return json({ error: "Not authenticated" }, 401);

    // 2) User
    const [meRows] = await db.query(
      "SELECT user_id, Role_role_id, Group_group_id FROM users WHERE email = ? LIMIT 1",
      [session.user.email]
    );
    const me = meRows?.[0];
    if (!me) return json({ error: "User not found" }, 404);

    // 3) Params (await สำคัญ)
    const { id } = await context.params; // ⬅️ สำคัญ: await
    console.log("Updating auction id:", id);
    if (!id) return json({ error: "Missing auction id" }, 400);

    // 4) Auction
    const [aucRows] = await db.query(
      "SELECT auction_id, Users_user_id FROM auctions WHERE auction_id = ? LIMIT 1",
      [id]
    );
    const auc = aucRows?.[0];
    if (!auc) return json({ error: "Auction not found" }, 404);

    // 5) Policy (คุณตั้งไว้ให้เฉพาะ G002/G003)
    const isAdminLike = ["G002", "G003"].includes(me.Group_group_id);
    if (!isAdminLike) return json({ error: "Forbidden" }, 403);

    // 6) Body
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    // 7) Allowlist fields
    let {
      auction_name,
      auction_desc,
      auction_bid_min,
      auction_bid_max,
      AuctionStatus_status_id,
      AuctionType_auction_type_id,
      Users_user_id, // ถ้าไม่อยากให้แก้ owner ให้ set เป็น undefined
      start_time,
      end_time,
    } = body || {};

    // 8) Validate numbers
    const toNum = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
    const minNum = toNum(auction_bid_min);
    const maxNum = toNum(auction_bid_max);
    if ((minNum !== null && Number.isNaN(minNum)) || (maxNum !== null && Number.isNaN(maxNum)))
      return json({ error: "Bid values must be numeric" }, 400);
    if (minNum !== null && minNum < 0) return json({ error: "auction_bid_min must be ≥ 0" }, 400);
    if (maxNum !== null && maxNum < 0) return json({ error: "auction_bid_max must be ≥ 0" }, 400);
    if (minNum !== null && maxNum !== null && minNum > maxNum)
      return json({ error: "auction_bid_min cannot exceed auction_bid_max" }, 400);

    // 9) Date -> SQL DATETIME
    const toSqlDateTime = (v) => {
      if (!v) return null;
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return null;
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    const startSQL = toSqlDateTime(start_time);
    const endSQL = toSqlDateTime(end_time);
    if (start_time && !startSQL) return json({ error: "Invalid start_time" }, 400);
    if (end_time && !endSQL) return json({ error: "Invalid end_time" }, 400);
    if (startSQL && endSQL && new Date(startSQL) >= new Date(endSQL))
      return json({ error: "end_time must be after start_time" }, 400);

    // 10) Dynamic UPDATE
    const setParts = [];
    const paramsA = [];
    if (auction_name != null)                { setParts.push("auction_name = ?");                paramsA.push(String(auction_name)); }
    if (auction_desc != null)                { setParts.push("auction_desc = ?");                paramsA.push(String(auction_desc)); }
    if (minNum !== null)                     { setParts.push("auction_bid_min = ?");             paramsA.push(minNum); }
    if (maxNum !== null)                     { setParts.push("auction_bid_max = ?");             paramsA.push(maxNum); }
    if (AuctionStatus_status_id != null)     { setParts.push("AuctionStatus_status_id = ?");     paramsA.push(String(AuctionStatus_status_id)); }
    if (AuctionType_auction_type_id != null) { setParts.push("AuctionType_auction_type_id = ?"); paramsA.push(String(AuctionType_auction_type_id)); }
    if (Users_user_id != null)               { setParts.push("Users_user_id = ?");               paramsA.push(String(Users_user_id)); }

    if (!setParts.length && startSQL == null && endSQL == null)
      return json({ error: "No updatable fields provided" }, 400);

    // 11) Transaction
    await db.query("START TRANSACTION");

    if (setParts.length) {
      await db.query(
        `UPDATE auctions SET ${setParts.join(", ")} WHERE auction_id = ?`,
        [...paramsA, id]
      );
    }

    if (startSQL != null || endSQL != null) {
      const [drows] = await db.query(
        "SELECT auction_date_id FROM auction_date WHERE auction_id = ? LIMIT 1",
        [id]
      );
      if (drows.length) {
        const setD = [];
        const parD = [];
        if (startSQL != null) { setD.push("start_time = ?"); parD.push(startSQL); }
        if (endSQL != null)   { setD.push("end_time = ?");   parD.push(endSQL); }
        if (setD.length) {
          await db.query(
            `UPDATE auction_date SET ${setD.join(", ")} WHERE auction_id = ?`,
            [...parD, id]
          );
        }
      } else {
        await db.query(
          `INSERT INTO auction_date (auction_date_id, auction_id, start_time, end_time)
           VALUES (REPLACE(UUID(),'-',''), ?, ?, ?)`,
          [id, startSQL, endSQL]
        );
      }
    }

    await db.query("COMMIT");
    return json({ success: true }, 200);
  } catch (err) {
    try { await db.query("ROLLBACK"); } catch {}
    console.error("[PUT /api/auctions/:id] error:", err?.stack || err);
    return json({ error: "Internal error", detail: String(err?.message || err) }, 500);
  }
}
