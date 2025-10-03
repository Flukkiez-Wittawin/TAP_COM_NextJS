"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Logo from "@/assets/imgs/Logo.svg";

import GoogleIcon from "@/assets/imgs/Google.svg";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { useRouter } from "next/navigation";

export default function AuthForm() {
  const { data: session, status } = useSession();
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    // รอจนกว่าจะรู้สถานะ session
    if (status === "authenticated") {
      router.push("/"); // redirect ไปหน้า Home
    }
  }, [status, router]);

  const toggleForm = () => setIsLogin(!isLogin);

  // const handleGoogleLogin = async () => {
  //   await signIn("google"); // หลัง login จะ redirect หน้าแรก
  // };

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

        {/* Login with Google */}
        <button
          onClick={() => signIn("google")}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-white text-red-700 py-2 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer"
        >
          <img src={GoogleIcon.src} alt="Google" className="w-5 h-5" />
          เข้าสู่ระบบด้วย Google
        </button>

        {/* Switch form */}
       
      </div>

      <div className="absolute inset-0 animate-pulse bg-black/10 z-0"></div>
    </div>
  );
}
