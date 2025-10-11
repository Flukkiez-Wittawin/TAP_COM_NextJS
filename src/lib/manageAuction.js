import { pormise as fs } from "fs";
import path from "path";

const Current_Auction_Path = path.join(
  process.cwd(),
  "data",
  "current_auction.json"
);

const Expired_Auction_Path = path.join(
  process.cwd(),
  "data",
  "expired_auctions.json"
);

async function ensureFile(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "[]", "utf8");
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
