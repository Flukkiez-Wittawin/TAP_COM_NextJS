"use client";
import React from "react";

export default function AuctionSteps({ userLoggedIn = false }) {
  const steps = [
    {
      id: 1,
      title: "เข้าสู่ระบบก่อนบิด",
      description:
        "คุณต้องเข้าสู่ระบบก่อนถึงจะสามารถกดบิดสินค้าได้ หากยังไม่มีบัญชี ให้สมัครสมาชิกก่อน",
      condition: !userLoggedIn,
    },
    {
      id: 2,
      title: "ล็อกอินสำเร็จ",
      description:
        "หลังจากเข้าสู่ระบบแล้ว คุณสามารถ bid สินค้าได้ทันที ปุ่ม bid จะพร้อมใช้งาน",
      condition: userLoggedIn,
    },
    {
      id: 3,
      title: "กด bid และอัปเดตแบบเรียลไทม์",
      description:
        "เมื่อกด bid ระบบจะแสดงราคาประมูลล่าสุดแบบ real-time ให้ทุกคนเห็น ใคร bid สูงสุดจะแสดงสถานะว่าคุณเป็นผู้เสนอราคาสูงสุด",
      condition: userLoggedIn,
    },
    {
      id: 4,
      title: "เมื่อชนะการประมูล",
      description:
        "หากคุณเป็นผู้ชนะ ระบบจะส่ง Gmail แจ้งรายละเอียดการชำระเงินและขั้นตอนการรับสินค้า",
      condition: userLoggedIn,
    },
  ];

  return (
    <div className="space-y-4 p-5 rounded-lg text-white max-w-7xl mx-auto -mt-8">
      <div className="space-y-4 list-decimal ">
        {steps.map((step) => (
          <details open
            key={step.id}
            className={`p-4 rounded-md text-black shadow bg-blue-50/30 backdrop-blur-md hover:bg-blue-50 transition ` }
          >
            <summary className="font-semibold text-xl cursor-pointer">{step.id}) {step.title}</summary>
            <div className="text-sm mt-1">{step.description}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
