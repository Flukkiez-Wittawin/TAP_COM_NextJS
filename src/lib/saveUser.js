import { promises as fs } from "fs";
import path from "path";

const ROOT_DIR = process.cwd();

// เก็บไฟล์ที่ src/data (override ได้ด้วย USE_TMP=1 เพื่อเทสบน serverless)
const DATA_DIR =
  process.env.USE_TMP === "1"
    ? "/tmp"
    : path.join(ROOT_DIR, "src", "data");   // <<— เปลี่ยนตรงนี้

const DATA_PATH = path.join(DATA_DIR, "users.json");

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, "[]", "utf8");
  }
}

async function atomicWriteJson(filePath, json) {
  const tmpPath = filePath + ".tmp";
  try {
    await fs.writeFile(tmpPath, json, "utf8");
    await fs.rename(tmpPath, filePath);
  } catch (e) {
    try {
      await fs.writeFile(filePath, json, "utf8");
      try { await fs.unlink(tmpPath); } catch {}
    } catch (e2) {
      throw new Error(`atomicWriteJson failed: ${e2?.message || e2}`);
    }
  }
}

export async function upsertUser(user) {
  if (!user || (!user.email && !user.id)) {
    throw new Error("User must have email or id");
  }

  console.log("[saveUser] DATA_PATH:", DATA_PATH);
  await ensureFile();

  let users = [];
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    users = raw?.trim() ? JSON.parse(raw) : [];
  } catch {
    users = [];
  }

  const key = user.email || user.id;
  const now = new Date().toISOString();
  const withTimestamp = { ...user, lastLoginAt: now };

  const idx = users.findIndex((u) => (u.email || u.id) === key);
  if (idx >= 0) users[idx] = { ...users[idx], ...withTimestamp };
  else users.push(withTimestamp);

  await atomicWriteJson(DATA_PATH, JSON.stringify(users, null, 2));

  const verifyRaw = await fs.readFile(DATA_PATH, "utf8");
  const verify = verifyRaw?.trim() ? JSON.parse(verifyRaw) : [];
  const stat = await fs.stat(DATA_PATH);

  return { saved: withTimestamp, path: DATA_PATH, count: verify.length, size: stat.size, mtime: stat.mtime };
}

export async function readUsers() {
  await ensureFile();
  const raw = await fs.readFile(DATA_PATH, "utf8");
  const users = raw?.trim() ? JSON.parse(raw) : [];
  const stat = await fs.stat(DATA_PATH);
  return { users, path: DATA_PATH, size: stat.size, mtime: stat.mtime };
}

export function getDataInfo() {
  return { ROOT_DIR, DATA_DIR, DATA_PATH, USE_TMP: process.env.USE_TMP || "0" };
}
