"use client";

import { useState, useEffect } from "react";
import NavGundamAuction from "@/app/components/navbar/navbar";
import Categories from "@/app/components/Auctions/Categories";
import AuctionCard from "@/app/components/Auctions/AuctionCard";

export default function AuctionsPage() {
  const [auctionItems, setAuctionItems] = useState([]);

  const fetchAuctions = async () => {
    try {
      const res = await fetch("/api/auction/list", { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch");
      }

      const data = await res.json();

      const now = new Date();
      const itemsWithTime = data.map(item => {
        const end = new Date(item.end_time);
        const diffMs = end - new Date();
        const hours = Math.floor(diffMs / 1000 / 60 / 60);
        const minutes = Math.floor((diffMs / 1000 / 60) % 60);

        return {
          ...item,
          timeLeft: diffMs > 0 ? `${hours}h ${minutes}m` : "หมดเวลา",
        };
      });




      setAuctionItems(itemsWithTime);
    } catch (err) {
      console.error("Fetch auctions failed:", err.message);
    }
  };

  const calculateTimeLeft = (endTime) => {
    const diffMs = new Date(endTime) - new Date();
    const hours = Math.floor(diffMs / 1000 / 60 / 60);
    const minutes = Math.floor((diffMs / 1000 / 60) % 60);
    return diffMs > 0 ? `${hours}h ${minutes}m` : "หมดเวลา";
  };


  useEffect(() => {
    fetchAuctions();
    const interval = setInterval(fetchAuctions, 5000); // refresh ทุก 5 วินาที
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <NavGundamAuction />
      <Categories />
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {auctionItems.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            ไม่พบการประมูล
          </p>
        )}
        {auctionItems.map((item) => (
          <AuctionCard
            key={item.auction_id}
            title={item.title}
            img={item.images[0] || "/default-auction.jpg"}
            price={item.price}
            timeLeft={calculateTimeLeft(item.end_time)}
            auction_id={item.auction_id}
          />


        ))}

      </div>
    </>
  );
}
