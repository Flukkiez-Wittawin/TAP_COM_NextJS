"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Logo from "@/assets/imgs/Logo.svg";

import GoogleIcon from '@/assets/imgs/Google.svg'

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/" }); // หลัง login จะ redirect หน้าแรก
  };

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
      <div className="bg-black/80 backdrop-blur-md shadow-2xl rounded-2xl max-w-md w-full p-8 relative text-white z-10">
        <h2 className="text-3xl font-display text-red-400 text-center mb-6">
          {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </h2>

        {/* Form ปกติ */}
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

        <p className="text-center mt-3 font-semibold text-white/50 cursor-default">OR</p>
        {/* Login with Google */}
        <button
          onClick={handleGoogleLogin}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-white text-red-700 py-2 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer"
        >
          <img
            src={GoogleIcon.src}
            alt="Google"
            className="w-5 h-5"
          />
          เข้าสู่ระบบด้วย Google
        </button>

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

      <div className="absolute inset-0 animate-pulse bg-black/10 z-0"></div>
    </div>
  );
}
