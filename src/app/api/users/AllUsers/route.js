// /api/user/getAllUsers.js
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

        // ✅ ตรวจสอบว่าเป็น Admin หรือไม่
        if (session.user.role === "G001" || session.user?.role === 'G002') {
            return NextResponse.json({ error: "Access forbidden" }, { status: 403 });
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        // ✅ ดึงข้อมูล users ทั้งหมด
        const [users] = await connection.execute(
            "SELECT * FROM users ORDER BY user_id DESC"
        );


        await connection.end();

        return NextResponse.json(users);

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
