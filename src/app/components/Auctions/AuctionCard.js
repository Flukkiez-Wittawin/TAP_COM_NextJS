"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function AuctionCard({ title, img, price, timeLeft, auction_id }) {
  const router = useRouter();

  const goToDetail = () => {
    router.push(`/auctions/${auction_id}`);
  };

  return (
    <div className="border rounded-lg shadow hover:shadow-lg hover:scale-[1.02] transition overflow-hidden bg-white">
      <img src={img} alt={title} className="w-full h-48 object-cover"/>
      <div className="p-4">
        <h3 className="font-semibold text-red-800 mb-2 text-lg">{title}</h3>
        <p className="text-gray-700 mb-2">
          ราคาปัจจุบัน: <span className="font-bold">{price}</span> บาท
        </p>
        <p className="text-gray-500 text-sm">⏱ เหลือเวลา: {timeLeft}</p>

        <button
          onClick={goToDetail}
          className="mt-3 w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
        >
          ดูรายละเอียด
        </button>
      </div>
    </div>
  );
}
