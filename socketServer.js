// socketServer.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mysql from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";

// ----------------- DB Setup -----------------
const db = mysql.createPool({
<<<<<<< HEAD
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// ทดสอบ connection ก่อน start server
=======
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "auctiondb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ----------------- Boot -----------------
>>>>>>> 4692864 (push from mac)
(async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ MySQL connected successfully");
    startSocketServer();
  } catch (err) {
<<<<<<< HEAD
    console.error("❌ MySQL connection failed:", err);
=======
    console.error("❌ MySQL connection failed:", err?.message || err);
>>>>>>> 4692864 (push from mac)
    process.exit(1);
  }
})();

// ----------------- Socket.IO -----------------
function startSocketServer() {
  const app = express();
  const httpServer = createServer(app);
<<<<<<< HEAD
  const io = new Server(httpServer, { cors: { origin: "*" } });
=======

  const SOCKET_PATH = process.env.SOCKET_PATH || "/socket.io";
  const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

  const io = new Server(httpServer, {
    path: SOCKET_PATH,
    cors: {
      origin: [CLIENT_ORIGIN],
      methods: ["GET", "POST"],
      credentials: false,
    },
  });
>>>>>>> 4692864 (push from mac)

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("placeBid", async (data) => {
      try {
<<<<<<< HEAD
        const { auctionId, amount, userEmail } = data;
=======
        const { auctionId, amount, userEmail } = data || {};
>>>>>>> 4692864 (push from mac)
        if (!auctionId || !amount || !userEmail) {
          return socket.emit("bidError", { error: "Invalid bid data" });
        }

<<<<<<< HEAD
        // หา user_id จาก email
=======
        // หา user
>>>>>>> 4692864 (push from mac)
        const [users] = await db.query(
          "SELECT user_id, fname, lname, email, Role_role_id FROM users WHERE email = ?",
          [userEmail]
        );
<<<<<<< HEAD
        if (users.length === 0) {
          return socket.emit("bidError", { error: "User not found" });
        }

       

        const user = users[0];

         if (user.Role_role_id === 'R001') {
          return socket.emit('bidError', {error: "This role cannot auction"})
        }

        // ดึง auction info เพื่อตรวจสอบ max bid
=======
        if (!users.length) {
          return socket.emit("bidError", { error: "User not found" });
        }
        const user = users[0];

        // role ที่ห้ามประมูล
        if (user.Role_role_id === "R001") {
          return socket.emit("bidError", { error: "This role cannot auction" });
        }

        // ดึง auction info
>>>>>>> 4692864 (push from mac)
        const [auctionRows] = await db.query(
          "SELECT auction_bid_max, AuctionStatus_status_id FROM auctions WHERE auction_id = ?",
          [auctionId]
        );
<<<<<<< HEAD
        if (auctionRows.length === 0) {
          return socket.emit("bidError", { error: "Auction not found" });
        }
        const auction = auctionRows[0];
        const maxBid = auction.auction_bid_max;

        // เช็ค highest bid ปัจจุบัน
=======
        if (!auctionRows.length) {
          return socket.emit("bidError", { error: "Auction not found" });
        }
        const auction = auctionRows[0];
        const maxBid = Number(auction.auction_bid_max || 0);

        // เช็ค highest ปัจจุบัน
>>>>>>> 4692864 (push from mac)
        const [currentBids] = await db.query(
          "SELECT amount, Users_user_id FROM auctionbids WHERE Auctions_auction_id = ? AND is_highest = 'Y' ORDER BY amount DESC LIMIT 1",
          [auctionId]
        );
<<<<<<< HEAD
        const highestBid = currentBids[0]?.amount || 0;

        if (amount <= highestBid) {
          return socket.emit("bidError", { error: `Bid must be higher than current bid (${highestBid})` });
        }

        // ตรวจสอบว่าผู้ใช้เคย bid ใน auction นี้แล้วหรือยัง
        const [existingBidRows] = await db.query(
          "SELECT auctionbid_id FROM auctionbids WHERE Auctions_auction_id = ? AND Users_user_id = ?",
          [auctionId, user.user_id]
        );

        // ทำ bid เก่ากลายเป็นไม่สูงสุด
=======
        const highestBid = currentBids[0]?.amount ? Number(currentBids[0].amount) : 0;
        const finalAmount = Number(amount);

        if (!(finalAmount > highestBid)) {
          return socket.emit("bidError", {
            error: `Bid must be higher than current bid (${highestBid})`,
          });
        }

        // ปรับสถานะ bid เก่าของ auction นี้ให้ไม่สูงสุด
>>>>>>> 4692864 (push from mac)
        await db.query(
          "UPDATE auctionbids SET is_highest = 'N' WHERE Auctions_auction_id = ? AND is_highest = 'Y'",
          [auctionId]
        );

<<<<<<< HEAD
        if (existingBidRows.length > 0) {
          // ถ้ามี bid อยู่แล้ว -> update amount
          const bidId = existingBidRows[0].auctionbid_id;
          await db.query(
            "UPDATE auctionbids SET amount = ?, is_highest = 'Y' WHERE auctionbid_id = ?",
            [amount, bidId]
          );
        } else {
          // ถ้าไม่มี bid ของ user -> insert ใหม่
          await db.query(
            "INSERT INTO auctionbids (auctionbid_id, amount, is_highest, Users_user_id, Auctions_auction_id) VALUES (?, ?, 'Y', ?, ?)",
            [uuidv4(), amount, user.user_id, auctionId]
          );
        }

        // Broadcast updated bid
        io.emit("bidUpdate", {
          auctionId,
          amount,
          user: { id: user.user_id, name: user.fname + " " + user.lname, email: user.email },
        });

        // ตรวจสอบว่าถึง max bid หรือไม่
        if (maxBid && amount >= maxBid) {
=======
        // มี bid ของ user นี้อยู่แล้วหรือยัง
        const [existingBidRows] = await db.query(
          "SELECT auctionbid_id FROM auctionbids WHERE Auctions_auction_id = ? AND Users_user_id = ? LIMIT 1",
          [auctionId, user.user_id]
        );

        if (existingBidRows.length) {
          await db.query(
            "UPDATE auctionbids SET amount = ?, is_highest = 'Y' WHERE auctionbid_id = ?",
            [finalAmount, existingBidRows[0].auctionbid_id]
          );
        } else {
          await db.query(
            "INSERT INTO auctionbids (auctionbid_id, amount, is_highest, Users_user_id, Auctions_auction_id) VALUES (?, ?, 'Y', ?, ?)",
            [uuidv4(), finalAmount, user.user_id, auctionId]
          );
        }

        // Broadcast
        io.emit("bidUpdate", {
          auctionId,
          amount: finalAmount,
          user: {
            id: user.user_id,
            name: `${user.fname} ${user.lname}`,
            email: user.email,
          },
        });

        // ปิดประมูลถ้าถึง max
        if (maxBid && finalAmount >= maxBid) {
>>>>>>> 4692864 (push from mac)
          await db.query(
            "UPDATE auctions SET AuctionStatus_status_id = 'S03' WHERE auction_id = ?",
            [auctionId]
          );
<<<<<<< HEAD
          io.emit("auctionClosed", { auctionId, finalBid: amount });
        }

      } catch (err) {
        console.error(err);
=======
          io.emit("auctionClosed", { auctionId, finalBid: finalAmount });
        }
      } catch (err) {
        console.error("placeBid error:", err?.message || err);
>>>>>>> 4692864 (push from mac)
        socket.emit("bidError", { error: "Failed to place bid" });
      }
    });

<<<<<<< HEAD

=======
>>>>>>> 4692864 (push from mac)
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  const PORT = process.env.SOCKET_PORT || 4000;
<<<<<<< HEAD
  httpServer.listen(PORT, () => console.log(`Socket server running on port ${PORT}`));
=======
  httpServer.listen(PORT, () => {
    console.log(`Socket server running on port ${PORT}`);
    console.log(`  Path: ${SOCKET_PATH}`);
    console.log(`  CORS Origin: ${CLIENT_ORIGIN}`);
  });
>>>>>>> 4692864 (push from mac)
}
