import { db } from "@/lib/db";

export async function saveGoogleUserFromProfile({ email, fname, lname }) {
  const DEFAULT_GROUP = "G001";
  const DEFAULT_ROLE = "R001";

  // สร้าง Group และ Role หากยังไม่มี
  await db.execute(
    "INSERT IGNORE INTO usergroup (group_id, group_name) VALUES (?, ?)",
    [DEFAULT_GROUP, "Default Group"]
  );
  await db.execute(
    "INSERT IGNORE INTO role (role_id, role_name) VALUES (?, ?)",
    [DEFAULT_ROLE, "Default Role"]
  );

  // 🔹 ตรวจสอบ email ก่อน
  const [existingRows] = await db.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (existingRows.length > 0) {
    // Email มีอยู่แล้ว ดึงข้อมูลเดิม
    const existingUser = existingRows[0];
    return {
      user_id: existingUser.user_id,
      email: existingUser.email,
      fname: existingUser.fname,
      lname: existingUser.lname
    };
  }

  // 🔹 หาเลข user_id ล่าสุด
  const [rows] = await db.execute(
    "SELECT user_id FROM users WHERE user_id LIKE 'TAP-%' ORDER BY user_id DESC LIMIT 1"
  );

  let nextNumber = 1; // ค่าเริ่มต้น
  if (rows.length > 0) {
    const lastId = rows[0].user_id; // เช่น "TAP-007"
    const lastNum = parseInt(lastId.split("-")[1], 10);
    nextNumber = lastNum + 1;
  }

  // เติมเลข 0 ข้างหน้าให้ครบ 3 หลัก (001, 002...) หรือมากกว่า 999 ก็ไม่ต้องเติม
  const numberStr = nextNumber < 1000 ? String(nextNumber).padStart(3, "0") : String(nextNumber);
  const userId = `TAP-${numberStr}`;

  // 🔹 Insert user ใหม่
  const sql = `
    INSERT INTO users
      (user_id, email, fname, lname, phone, address, citizen_id, Group_group_id, Role_role_id)
    VALUES (?, ?, ?, ?, NULL, NULL, NULL, ?, ?)
  `;

  await db.execute(sql, [userId, email, fname, lname, DEFAULT_GROUP, DEFAULT_ROLE]);

  return { user_id: userId, email, fname, lname };
}
