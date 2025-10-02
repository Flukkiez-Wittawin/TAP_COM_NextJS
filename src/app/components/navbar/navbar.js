"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import Logo from "@/assets/imgs/Logo.svg";

import { useSession } from "next-auth/react";

export default function NavGundamAuction() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isLive, setIsLive] = useState(true);

  const { data: session, status } = useSession();

  const [isLogin, setIsLogin] = useState(false);

  useEffect(()=> {
    let session_status = false
    if (status === 'unauthenticated') {
      session_status = false
    } else if (status === 'authenticated') {
      session_status = true
    }
    setIsLogin(session_status)
    // alert(status)
  }, [status])

  useEffect(() => {
    const t = setInterval(() => setIsLive((s) => !s), 4000);
    return () => clearInterval(t);
  }, []);

  const categories = [
    "MG",
    "RG",
    "PG",
    "HG",
    "SD",
    "Accessories",
    "Custom Builds",
  ];

  return (
    <header className="w-full shadow-sm bg-gradient-to-r from-red-800 via-red-900 to-red-800 text-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 ">
          {/* LEFT: logo + brand */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <img src={Logo.src} alt="GundamBid Logo" className="h-16 w-14" />
              <div className="leading-tight">
                <div className="font-bold text-lg">TAP.COM</div>
                <div className="text-xs opacity-80">Live Gundam Auctions</div>
              </div>
            </Link>
          </div>

          {/* RIGHT: actions */}
          <div className="flex items-center gap-3 ">
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/auctions"
                className="px-3 py-2 rounded-md hover:bg-red-600/30"
              >
                Auctions
              </Link>

              {isLogin ? (
                <Link
                  href="/profile"
                  className="px-3 py-1 rounded-md bg-white text-red-700 font-semibold hover:opacity-95"
                >
                  {session?.user?.name}
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="px-3 py-2 rounded-md bg-white text-red-700 font-semibold hover:opacity-95"
                >
                  Login
                </Link>
              )}
            </div>

            {/* mobile menu button */}
            <div className="sm:hidden">
              <button
                onClick={() => setMobileOpen((s) => !s)}
                aria-label="Open menu"
                className="p-2 rounded-md hover:bg-red-600/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden mt-2 pb-4">
            <div className="space-y-2 px-2">
              <Link href="/auctions" className="block px-3 py-2 rounded-md hover:bg-white/10">
                Auctions
              </Link>
              {isLogin ? (
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md bg-white text-red-700 font-semibold"
                >
                  {session?.user?.name}
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="block px-3 py-2 rounded-md bg-white text-red-700 font-semibold"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
