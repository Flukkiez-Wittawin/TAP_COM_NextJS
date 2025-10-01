"use client";
import React, { useState } from "react";

export default function Categories() {
  const categories = {
    มือ1: {
      ของเล่น: [
        "ของเล่นบังคับ",
        "ตัวต่อ",
        "ลูกบอล",
        "ตุ๊กตา",
        "บอร์ดเกม",
        "อื่นๆ",
      ],
      "ฟิกเกอร์ & แอ็คชั่นฟิกเกอร์": [
        "ตัวละครจากหนัง",
        "ตัวละครจากเกม",
        "ตัวละครจากการ์ตูน",
        "ตัวละครจาก anime",
        "อื่นๆ",
      ],
      โมเดลพลาสติก: [
        "กันพลา",
        "โมเดลแปลงร่าง",
        "โมเดลรถ",
        "โมเดลเรือ",
        "โมเดลอากาศยาน",
        "อื่นๆ",
      ],
      อื่นๆ: [],
    },
    มือ2: {
      ของเล่น: [
        "ของเล่นบังคับ",
        "ตัวต่อ",
        "ลูกบอล",
        "ตุ๊กตา",
        "บอร์ดเกม",
        "อื่นๆ",
      ],
      "ฟิกเกอร์ & แอ็คชั่นฟิกเกอร์": [
        "ตัวละครจากหนัง",
        "ตัวละครจากเกม",
        "ตัวละครจากการ์ตูน",
        "ตัวละครจาก anime",
        "อื่นๆ",
      ],
      โมเดลพลาสติก: [
        "กันพลา",
        "โมเดลแปลงร่าง",
        "โมเดลรถ",
        "โมเดลเรือ",
        "โมเดลอากาศยาน",
        "อื่นๆ",
      ],
      อื่นๆ: [],
    },
  };

  const [selectedMain, setSelectedMain] = useState("มือ1");
  const [selectedSub, setSelectedSub] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-4 text-red-800">
        หมวดหมู่การประมูล
      </h2>

      <div className="flex gap-4 mb-6">
        {Object.keys(categories).map((main) => (
          <button
            key={main}
            className={`px-4 py-2 rounded-lg ${
              selectedMain === main
                ? "bg-red-700 text-white"
                : "bg-red-100 text-red-700"
            }`}
            onClick={() => {
              setSelectedMain(main);
              setSelectedSub(null);
            }}
          >
            {main}
          </button>
        ))}
      </div>

      {/* หมวดรอง */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {Object.keys(categories[selectedMain]).map((sub) => (
          <button
            key={sub}
            className={`px-3 py-1 rounded-lg border ${
              selectedSub === sub
                ? "bg-red-700 text-white border-red-700"
                : "bg-white text-red-700 border-red-300"
            }`}
            onClick={() => setSelectedSub(sub)}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* หมวดย่อย */}
      {selectedSub && categories[selectedMain][selectedSub].length > 0 && (
        <div className="flex gap-3 flex-wrap mb-6">
          {categories[selectedMain][selectedSub].map((item) => (
            <span
              key={item}
              className="px-2 py-1 bg-red-100 text-red-700 rounded"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
