import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "auctiondb",
    });

    const [rows] = await connection.execute(
      "SELECT auction_type_id, auction_type_name FROM auctiontype"
    );

    await connection.end();

    return NextResponse.json(rows); // ส่งเป็น array ของ type
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch auction types" }, { status: 500 });
  }
}
