"use client";
import React from "react";

export default function AuctionCard({ title, img, price, timeLeft }) {
  return (
    <div className="border rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      <img src={img} alt={title} className="w-full h-48 object-cover"/>
      <div className="p-4">
        <h3 className="font-semibold text-red-800 mb-2">{title}</h3>
        <p className="text-gray-700 mb-2">ราคาปัจจุบัน: {price} บาท</p>
        <p className="text-gray-500 text-sm">เหลือเวลา: {timeLeft}</p>
      </div>
    </div>
  );
}
