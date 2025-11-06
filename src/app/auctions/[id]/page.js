"use client";

import React, { useEffect, useState, useRef } from "react";
import NavGundamAuction from "@/app/components/navbar/navbar";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { io } from "socket.io-client";

<<<<<<< HEAD
=======
// ===== socket config (frontend) =====
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || undefined; // ถ้าตั้งค่า → ชี้ตรง, ถ้าไม่ตั้ง → same-origin (ใช้ rewrite)
const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";

>>>>>>> 4692864 (push from mac)
// =================== Message Modal ===================
function MessageModal({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-80 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
        <p className="text-gray-800">{message}</p>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// =================== Confirm Bid Modal ===================
function ConfirmBidModal({ amount, onConfirm, onCancel }) {
  if (!amount) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-80 relative">
<<<<<<< HEAD
        <h3 className="text-2xl font-bold text-red-600 mb-4">Confirm Your Bid</h3>
=======
        <h3 className="text-2xl font-bold text-red-600 mb-4">
          Confirm Your Bid
        </h3>
>>>>>>> 4692864 (push from mac)
        <p className="text-gray-800 mb-6">
          Are you sure you want to place a bid of <strong>{amount}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// =================== AuctionDetailPage ===================
export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [customBid, setCustomBid] = useState("");
  const [confirmBidAmount, setConfirmBidAmount] = useState(null);
  const [placingBid, setPlacingBid] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [auctionClosed, setAuctionClosed] = useState(false);
  const [message, setMessage] = useState("");

<<<<<<< HEAD
=======
  const [socketReady, setSocketReady] = useState(false);

>>>>>>> 4692864 (push from mac)
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  const calculateTimeLeft = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    if (diff <= 0) return "Auction ended";
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  useEffect(() => {
    if (!id) return;

    const fetchAuction = async () => {
      try {
        const res = await fetch(`/api/auction/${id}`, { cache: "no-store" });
        const data = await res.json();
<<<<<<< HEAD
        if (!res.ok || !data.auction_id) throw new Error(data.error || "Auction not found");

        const images = Array.isArray(data.images) && data.images.length ? data.images : ["/default-auction.jpg"];
=======
        if (!res.ok || !data.auction_id)
          throw new Error(data.error || "Auction not found");

        const images =
          Array.isArray(data.images) && data.images.length
            ? data.images
            : ["/default-auction.jpg"];
>>>>>>> 4692864 (push from mac)
        setAuction({ ...data, images });

        if (data.AuctionStatus_status_id === "S03") {
          setAuctionClosed(true);
          setTimeLeft("Auction ended");
          return;
        }

        setTimeLeft(calculateTimeLeft(data.end_time));
        timerRef.current = setInterval(() => {
          const time = calculateTimeLeft(data.end_time);
          setTimeLeft(time);
          if (time === "Auction ended") {
            clearInterval(timerRef.current);
            setAuctionClosed(true);
          }
        }, 1000);
      } catch (err) {
        console.error(err);
        setAuction(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
    return () => clearInterval(timerRef.current);
  }, [id]);

  useEffect(() => {
    if (!id) return;

<<<<<<< HEAD
    const socket = io(process.env.socket);
    socketRef.current = socket;

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("bidUpdate", (data) => {
=======
    // ========= แก้ 404: ใช้ URL/Path ที่ถูกต้อง + transports websocket =========
    const socket = io(SOCKET_URL, {
      path: SOCKET_PATH,
      transports: ["websocket"],
      withCredentials: false,
    });
    socketRef.current = socket;

    const onConnect = () => {
      console.log("Socket connected:", socket.id);
      setSocketReady(true);
    };
    const onConnectError = (err) => {
      console.error("Socket connect error:", err?.message || err);
      setSocketReady(false);
      setMessage("เชื่อมต่อห้องประมูลไม่สำเร็จ");
    };
    const onBidUpdate = (data) => {
>>>>>>> 4692864 (push from mac)
      if (data.auctionId === id) {
        setAuction((prev) => ({
          ...prev,
          current_bid: data.amount,
          highest_bidder: data.user,
        }));
      }
<<<<<<< HEAD
    });
    socket.on("auctionClosed", (data) => {
=======
    };
    const onAuctionClosed = (data) => {
>>>>>>> 4692864 (push from mac)
      if (data.auctionId === id) {
        setAuctionClosed(true);
        clearInterval(timerRef.current);
        setAuction((prev) => ({ ...prev, current_bid: data.finalBid }));
        setMessage(`Auction ปิดแล้ว! ราคาสุดท้าย: ${data.finalBid}`);
      }
<<<<<<< HEAD
    });
    socket.on("bidError", (data) => setMessage(data.error));

    return () => socket.disconnect();
=======
    };
    const onBidError = (data) => setMessage(data.error);

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("bidUpdate", onBidUpdate);
    socket.on("auctionClosed", onAuctionClosed);
    socket.on("bidError", onBidError);

    // cleanup กัน listener ซ้อนตอนเปลี่ยนหน้า/Fast Refresh
    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("bidUpdate", onBidUpdate);
      socket.off("auctionClosed", onAuctionClosed);
      socket.off("bidError", onBidError);
      socket.disconnect();
    };
>>>>>>> 4692864 (push from mac)
  }, [id]);

  const handleBid = async (amount) => {
    if (!auction) return;
<<<<<<< HEAD
  
    if (auction?.status_name === 'Pending' || auction?.status_id === 'S01') {
=======

    if (auction?.status_name === "Pending" || auction?.status_id === "S01") {
>>>>>>> 4692864 (push from mac)
      setMessage("การประมูลยังไม่เริ่ม");
      setPlacingBid(false);
      return;
    }
<<<<<<< HEAD

    if (auctionClosed || auction?.status_name === 'Closed' || auction?.status_id === 'S03') {
=======
    if (
      auctionClosed ||
      auction?.status_name === "Closed" ||
      auction?.status_id === "S03"
    ) {
>>>>>>> 4692864 (push from mac)
      setMessage("การประมูลได้จบลงไปแล้ว");
      setPlacingBid(false);
      return;
    }

<<<<<<< HEAD
    

    const bidAmount = Number(amount);
    if (!bidAmount || bidAmount <= 0) return setMessage("กรุณาใส่จำนวนเงินที่ถูกต้อง");
    if (!socketRef.current || !socketRef.current.connected) return setMessage("Socket ยังไม่พร้อม");
=======
    const bidAmount = Number(amount);
    if (!bidAmount || bidAmount <= 0)
      return setMessage("กรุณาใส่จำนวนเงินที่ถูกต้อง");
    if (!socketRef.current || !socketRef.current.connected)
      return setMessage("Socket ยังไม่พร้อม");
>>>>>>> 4692864 (push from mac)

    setPlacingBid(true);
    try {
      const session = await getSession();
      if (!session || !session.user) {
        setMessage("คุณยังไม่ได้ล็อกอิน");
        setPlacingBid(false);
        return;
      }

<<<<<<< HEAD


=======
>>>>>>> 4692864 (push from mac)
      // --- ตรวจสอบว่าเป็นเจ้าของ auction ---
      if (session.user.email === auction.seller?.email) {
        setMessage("คุณไม่สามารถประมูลสินค้าของตัวเองได้");
        setPlacingBid(false);
        return;
      }

<<<<<<< HEAD
=======
      // NOTE: ตอนนี้ยังคงพฤติกรรม "เพิ่มจาก current" ตามโค้ดเดิมของคุณ
>>>>>>> 4692864 (push from mac)
      socketRef.current.emit("placeBid", {
        auctionId: id,
        amount: Number(auction.current_bid) + Number(amount),
        userEmail: session.user.email,
      });

      setCustomBid("");
      setShowBidModal(false);
      setConfirmBidAmount(null);
    } catch (err) {
      console.error(err);
      setMessage("เกิดข้อผิดพลาดในการวาง bid");
    } finally {
      setPlacingBid(false);
    }
  };

  const openImageModal = (index) => setSelectedImageIndex(index);
  const closeImageModal = () => setSelectedImageIndex(null);

  const handlePlaceCustomBid = () => {
    const amount = Number(customBid);
<<<<<<< HEAD
    if (!amount || amount <= 0) return setMessage("กรุณาใส่จำนวนเงินที่ถูกต้อง");
=======
    if (!amount || amount <= 0)
      return setMessage("กรุณาใส่จำนวนเงินที่ถูกต้อง");
>>>>>>> 4692864 (push from mac)
    if (auctionClosed) return setMessage("Auction ปิดแล้ว");
    setConfirmBidAmount(amount);
  };

  const handleBidMin = () => {
    if (!auction || auctionClosed) return setMessage("Auction ปิดแล้ว");
    setConfirmBidAmount(auction.min_bid);
  };

  const confirmBid = () => handleBid(confirmBidAmount);
  const cancelBid = () => setConfirmBidAmount(null);

<<<<<<< HEAD
  if (loading) return <p className="text-white text-center mt-10 text-lg">Loading...</p>;
  if (!auction) return <p className="text-white text-center mt-10 text-lg">Auction not found</p>;
=======
  if (loading)
    return <p className="text-white text-center mt-10 text-lg">Loading...</p>;
  if (!auction)
    return (
      <p className="text-white text-center mt-10 text-lg">Auction not found</p>
    );
>>>>>>> 4692864 (push from mac)

  return (
    <>
      <NavGundamAuction />
      <div className="max-w-7xl mx-auto p-6">
        {/* Auction Info */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-3xl p-8 shadow-xl mb-8">
          <h1 className="text-4xl font-extrabold">{auction.name}</h1>
          <p className="mt-3 text-gray-100">{auction.description}</p>
<<<<<<< HEAD
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-sm">
            <span className="bg-white text-red-600 font-semibold px-3 py-1 rounded-full text-center shadow">{auction.status_name}</span>
            <span className="bg-white text-red-600 font-semibold px-3 py-1 rounded-full text-center shadow">{auction.type_name}</span>
            <span className="bg-white text-red-600 font-semibold px-3 py-1 rounded-full text-center shadow">Min: {auction.min_bid || "-"}</span>
            <span className="bg-white text-red-600 font-semibold px-3 py-1 rounded-full text-center shadow">Current: {auction.current_bid || 0}</span>
            <span className="bg-white text-red-600 font-semibold px-3 py-1 rounded-full text-center shadow col-span-full sm:col-span-1">Time Left: {timeLeft}</span>
=======
         
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-sm">
            {/* <span className="bg-white text-red-600 font-semibold px-3 py-1 rounded-full text-center shadow">
              {auction.status_name}
            </span> */}
            <span className="bg-white text-red-600 font-semibold px-3 py-1 rounded-full text-center shadow">
              Type : {auction.type_name}
            </span>
            <span className="bg-white text-red-600 font-semibold px-3 py-1 rounded-full text-center shadow">
              Min: {auction.min_bid || "-"}
            </span>
            <span className="bg-white text-red-600 font-semibold px-3 py-1 rounded-full text-center shadow">
              Current: {auction.current_bid || 0}
            </span>
            <span className="bg-white text-red-600 font-semibold px-3 py-1 rounded-full text-center shadow col-span-full sm:col-span-1">
              Time Left: {timeLeft}
            </span>

             <span
            className={"bg-white text-red-600 font-semibold px-3 py-1 rounded-full text-center shadow col-span-full sm:col-span-1"}
            title={socketReady ? "Socket connected" : "Socket not connected"}
          >
           Status : {socketReady ? "Live" : "Offline"}
          </span>
>>>>>>> 4692864 (push from mac)
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8 auto-rows-fr">
          {auction.images.map((img, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl shadow-xl cursor-pointer transform hover:scale-105 transition-all duration-300 group"
              onClick={() => openImageModal(idx)}
            >
              <img
                src={`/uploads/auctions/auction_${auction.auction_id}/${img}`}
                alt={`Auction ${idx}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
<<<<<<< HEAD
                style={{ aspectRatio: '4/5' }}
=======
                style={{ aspectRatio: "4/5" }}
>>>>>>> 4692864 (push from mac)
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <span className="text-white font-semibold text-lg">View</span>
              </div>
            </div>
          ))}
        </div>

<<<<<<< HEAD


=======
>>>>>>> 4692864 (push from mac)
        {/* Bid Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button
            onClick={handleBidMin}
            disabled={placingBid || auctionClosed}
<<<<<<< HEAD
            className={`px-6 py-3 rounded-full font-semibold text-white transition ${auctionClosed ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
=======
            className={`px-6 py-3 rounded-full font-semibold text-white transition ${
              auctionClosed
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
>>>>>>> 4692864 (push from mac)
          >
            Bid Min ({auction.min_bid})
          </button>
          <button
            onClick={() => setShowBidModal(true)}
            disabled={auctionClosed}
<<<<<<< HEAD
            className={`px-6 py-3 rounded-full font-semibold transition border-2 ${auctionClosed ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed" : "bg-white text-red-600 border-red-600 hover:bg-red-600 hover:text-white"}`}
=======
            className={`px-6 py-3 rounded-full font-semibold transition border-2 ${
              auctionClosed
                ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                : "bg-white text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            }`}
>>>>>>> 4692864 (push from mac)
          >
            Custom Bid
          </button>
        </div>

        {/* Modals */}
        {showBidModal && (
<<<<<<< HEAD
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50" onClick={() => setShowBidModal(false)}>
            <div className="bg-white rounded-2xl p-6 w-80 shadow-xl relative" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-bold text-red-600 mb-4">Custom Bid</h3>
=======
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50"
            onClick={() => setShowBidModal(false)}
          >
            <div
              className="bg-white rounded-2xl p-6 w-80 shadow-xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-red-600 mb-4">
                Custom Bid
              </h3>
>>>>>>> 4692864 (push from mac)
              <input
                type="number"
                placeholder={`Enter bid >= ${auction.min_bid}`}
                value={customBid}
                onChange={(e) => setCustomBid(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full mb-4 focus:ring-2 focus:ring-red-500 outline-none"
              />
              <div className="flex justify-end gap-3">
<<<<<<< HEAD
                <button onClick={() => setShowBidModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition">Cancel</button>
                <button onClick={handlePlaceCustomBid} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Place Bid</button>
=======
                <button
                  onClick={() => setShowBidModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePlaceCustomBid}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Place Bid
                </button>
>>>>>>> 4692864 (push from mac)
              </div>
            </div>
          </div>
        )}

<<<<<<< HEAD
        {confirmBidAmount !== null && <ConfirmBidModal amount={confirmBidAmount} onConfirm={confirmBid} onCancel={cancelBid} />}
        {selectedImageIndex !== null && (
          <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50" onClick={closeImageModal}>
            <button onClick={(e) => { e.stopPropagation(); closeImageModal(); }} className="absolute top-4 right-4 text-white text-3xl font-bold bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition">×</button>
            <img src={`/uploads/auctions/auction_${auction.auction_id}/${auction.images[selectedImageIndex]}`} alt="Selected" className="max-h-[90%] max-w-[90%] object-contain rounded-xl shadow-2xl transition-transform" onClick={(e) => e.stopPropagation()} />
=======
        {confirmBidAmount !== null && (
          <ConfirmBidModal
            amount={confirmBidAmount}
            onConfirm={confirmBid}
            onCancel={cancelBid}
          />
        )}
        {selectedImageIndex !== null && (
          <div
            className="fixed inset-0 bg-black/80 flex justify-center items-center z-50"
            onClick={closeImageModal}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeImageModal();
              }}
              className="absolute top-4 right-4 text-white text-3xl font-bold bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition"
            >
              ×
            </button>
            <img
              src={`/uploads/auctions/auction_${auction.auction_id}/${auction.images[selectedImageIndex]}`}
              alt="Selected"
              className="max-h-[90%] max-w-[90%] object-contain rounded-xl shadow-2xl transition-transform"
              onClick={(e) => e.stopPropagation()}
            />
>>>>>>> 4692864 (push from mac)
          </div>
        )}
        <MessageModal message={message} onClose={() => setMessage("")} />
      </div>
    </>
  );
}
