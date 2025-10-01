"use client";

import React from "react";

export default function ReviewsSection() {
  const reviews = [
    {
      name: "คุณสมชาย",
      avatar: "https://i.pravatar.cc/50?img=1",
      comment: "เว็บไซต์นี้ทำให้ผมได้กันดั้ม Rare รุ่นพิเศษที่ตามหามานาน สะดวกและน่าเชื่อถือมาก!",
      rating: 5,
    },
    {
      name: "คุณพรทิพย์",
      avatar: "https://i.pravatar.cc/50?img=2",
      comment: "ประมูลง่าย ระบบแสดงเวลานับถอยหลังชัดเจน รู้ทันทุกการเคลื่อนไหว!",
      rating: 4,
    },
    {
      name: "คุณวิทยา",
      avatar: "https://i.pravatar.cc/50?img=3",
      comment: "บริการดีมาก ส่งของเร็ว และมีหลายรุ่นให้เลือก เยี่ยมจริง ๆ ครับ",
      rating: 5,
    },
  ];

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < count ? "text-yellow-400" : "text-gray-300"}>★</span>
    ));
  };

  return (
    <section className="py-16 bg-red-50">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-red-800 mb-8">
          รีวิวจากผู้ใช้งานจริง
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={r.avatar}
                  alt={r.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-red-700">{r.name}</h3>
                  <div className="flex mt-1">{renderStars(r.rating)}</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}