"use client";

import React from "react";
import Link from "next/link";

import Banner1 from '@/assets/imgs/BannerPage_1.jpg'

export default function BannerLanding() {
  return (
    <section className="relative w-full h-[80vh] flex items-center justify-center bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white overflow-hidden">
      {/* background image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center lg:bg-top opacity-50 bg-cover lg:bg-cotain"
        style={{
          backgroundImage:
            `url(${Banner1.src})`,
        }}
      ></div>

      {/* content */}
      <div className="relative z-10 text-center px-4 max-w-3xl lg:max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
          ประมูลกันดั้ม รุ่นหายาก & รุ่นพิเศษ
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          ร่วมประมูลโมเดลกันดั้มสุดเอ็กซ์คลูซีฟ เพิ่มเข้าคอลเลคชั่นของคุณ
          แบบ Real-time
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auctions"
            className="px-6 py-3 rounded-lg bg-white text-red-800 font-semibold hover:bg-red-100 transition"
          >
            เริ่มประมูลเลย
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 rounded-lg border border-white hover:bg-red-600/40 transition"
          >
            เรียนรู้เพิ่มเติม
          </Link>
        </div>
      </div>

      {/* bottom decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-red-900 to-transparent"></div>
    </section>
  );
}