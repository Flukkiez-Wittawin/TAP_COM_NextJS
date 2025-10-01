"use client";
import React, { useState } from "react";
import Logo from "@/assets/imgs/Logo.svg";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom right, rgba(0,0,0,0.9), rgba(139,0,0,0.9)), url(${Logo.src})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "100%",
      }}
    >
      {/* Overlay form container */}
      <div className="bg-black/80 backdrop-blur-md shadow-2xl rounded-2xl max-w-md w-full p-8 relative text-white z-10">
        {/* Title */}
        <h2 className="text-3xl font-display text-red-400 text-center mb-6">
          {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </h2>

        {/* Form */}
        <form
          className="flex flex-col gap-4 transition-opacity duration-500"
          onSubmit={(e) => {
            e.preventDefault();
            alert(isLogin ? "Logging in..." : "Registering...");
          }}
        >
          {!isLogin && (
            <input
              type="text"
              placeholder="ชื่อผู้ใช้"
              className="border border-gray-600 rounded px-3 py-2 bg-black/50 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder-gray-300 text-white"
            />
          )}
          <input
            type="email"
            placeholder="อีเมล"
            className="border border-gray-600 rounded px-3 py-2 bg-black/50 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder-gray-300 text-white"
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            className="border border-gray-600 rounded px-3 py-2 bg-black/50 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder-gray-300 text-white"
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="ยืนยันรหัสผ่าน"
              className="border border-gray-600 rounded px-3 py-2 bg-black/50 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder-gray-300 text-white"
            />
          )}

          <button
            type="submit"
            className="bg-red-700 hover:bg-red-800 transition-colors py-2 rounded-lg font-semibold text-white cursor-pointer"
          >
            {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </form>

        {/* Switch form */}
        <p className="text-center text-sm text-gray-300 mt-4">
          {isLogin ? "ยังไม่มีบัญชี?" : "มีบัญชีอยู่แล้ว?"}{" "}
          <button
            onClick={toggleForm}
            className="text-red-400 font-semibold hover:underline cursor-pointer"
          >
            {isLogin ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
          </button>
        </p>
      </div>

      {/* Optional: subtle background animation */}
      <div className="absolute inset-0 animate-pulse bg-black/10 z-0"></div>
    </div>
  );
}
