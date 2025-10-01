"use client";

import NavGundamAuction from "@/app/components/navbar/navbar";
import AuctionRulePage from "@/app/components/About/Rule";

import AuctionSteps from "../components/Auctions/AuctionSteps";

import Image from "next/image";
import Logo from "@/assets/imgs/Logo.svg";

export default function AboutPage() {
  return (
    <>
      <NavGundamAuction />
      <div className="w-full py-12 mb-8 bg-gradient-to-r from-red-900/70 via-red-700/50 to-black/70 text-white text-center">
        <Image
          src={Logo}
          alt="TAP Logo"
          width={96}
          height={96}
          className="mx-auto mb-3"
        />
        <h1 className="text-3xl font-bold mb-2">รายละเอียดการประมูล TAP.COM</h1>
        <p className="text-black">
          กติกากระชับ อ่านง่าย — อ้างอิงตามกฎหมายไทยเพื่อความยุติธรรมของทุกฝ่าย
        </p>
      </div>

      <AuctionRulePage />

      <div className="max-w-7xl mx-auto px-4 pb-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-blue-50/30 p-4 rounded shadow">
            <h1 className="font-bold text-3xl">ขั้นตอนการใช้งาน</h1>
            <p className="font-semibold">
              โปรดอ่านก่อนเริ่มประมูล: เมื่อกดบิดถือว่ายอมรับกฎทั้งหมดด้านล่าง
            </p>
            <span className="inline-block bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
              อัปเดตล่าสุด
            </span>
          </div>
        </div>
      </div>

      <AuctionSteps></AuctionSteps>
    </>
  );
}
