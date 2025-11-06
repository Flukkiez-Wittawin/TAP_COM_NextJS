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
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// ทดสอบ connection ก่อน start server
(async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ MySQL connected successfully");
    startSocketServer();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err);
    process.exit(1);
  }
})();

// ----------------- Socket.IO -----------------
function startSocketServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });


  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("placeBid", async (data) => {
      try {
        const { auctionId, amount, userEmail } = data;
        if (!auctionId || !amount || !userEmail) {
          return socket.emit("bidError", { error: "Invalid bid data" });
        }

        // หา user_id จาก email
        const [users] = await db.query(
          "SELECT user_id, fname, lname, email, Role_role_id FROM users WHERE email = ?",
          [userEmail]
        );
        if (users.length === 0) {
          return socket.emit("bidError", { error: "User not found" });
        }



        const user = users[0];

        if (user.Role_role_id === 'R001') {
          return socket.emit('bidError', { error: "This role cannot auction" })
        }

        // ดึง auction info เพื่อตรวจสอบ max bid
        const [auctionRows] = await db.query(
          "SELECT auction_bid_max, AuctionStatus_status_id FROM auctions WHERE auction_id = ?",
          [auctionId]
        );
        if (auctionRows.length === 0) {
          return socket.emit("bidError", { error: "Auction not found" });
        }
        const auction = auctionRows[0];
        const maxBid = auction.auction_bid_max;

        // เช็ค highest bid ปัจจุบัน
        const [currentBids] = await db.query(
          "SELECT amount, Users_user_id FROM auctionbids WHERE Auctions_auction_id = ? AND is_highest = 'Y' ORDER BY amount DESC LIMIT 1",
          [auctionId]
        );
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
        await db.query(
          "UPDATE auctionbids SET is_highest = 'N' WHERE Auctions_auction_id = ? AND is_highest = 'Y'",
          [auctionId]
        );

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
          await db.query(
            "UPDATE auctions SET AuctionStatus_status_id = 'S03' WHERE auction_id = ?",
            [auctionId]
          );
          io.emit("auctionClosed", { auctionId, finalBid: amount });
        }

      } catch (err) {
        console.error(err);
        socket.emit("bidError", { error: "Failed to place bid" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  const PORT = process.env.SOCKET_PORT || 4000;
  httpServer.listen(PORT, () => console.log(`Socket server running on port ${PORT}`));
}
