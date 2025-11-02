import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { fname, lname, phone, address, citizen_id } = body;

    const updates = [];
    const values = [];

    if (fname) { updates.push("fname = ?"); values.push(fname); }
    if (lname) { updates.push("lname = ?"); values.push(lname); }
    if (phone) { updates.push("phone = ?"); values.push(phone); }
    if (address) { updates.push("address = ?"); values.push(address); }
    if (citizen_id) { updates.push("citizen_id = ?"); values.push(citizen_id); }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    // หา user_id จริงจาก email
    const [rows] = await connection.execute(
      "SELECT user_id FROM users WHERE email = ?",
      [session.user.email]
    );

    if (rows.length === 0) {
      await connection.end();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user_id = rows[0].user_id;
    values.push(user_id);

    const [result] = await connection.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`,
      values
    );

    await connection.end();

    return NextResponse.json({
      message: "Updated successfully",
      affectedRows: result.affectedRows
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
