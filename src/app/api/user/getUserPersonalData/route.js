// /api/user/getUserPersonalData.js
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    // ดึงข้อมูลผู้ใช้
    const [users] = await connection.execute(
      "SELECT user_id, fname, lname, phone, address, citizen_id, avatar, Group_group_id, Role_role_id FROM users WHERE email = ?",
      [session.user.email]
    );

    if (users.length === 0) {
      await connection.end();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];
    user.avatar = user.avatar || "/default-avatar.png";

    await connection.end();

    // Return user object ตรง ๆ
    return NextResponse.json(user);

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
