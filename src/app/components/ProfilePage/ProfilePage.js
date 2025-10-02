"use client";
import React, { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [hidden_body, setHidden_body] = useState(true)
  const router = useRouter()

  useEffect(()=> {
    if (status !== 'authenticated') {
      router.push('/auth')
      setHidden_body(true)
    } else {
        setHidden_body(false)
    }
  }, [status])

  const user = {
    avatar:
      "https://media.discordapp.net/attachments/1278376989698428968/1312627520151224432/image.png?ex=68dff164&is=68de9fe4&hm=1736ed0586831aee3f1637cdbefe131232d8460792d78286887886c293509cc5&=&format=webp&quality=lossless",
    banner:
      "https://media.discordapp.net/attachments/1278376989698428968/1278377019398426634/image.png?ex=68dfece0&is=68de9b60&hm=d5bb68529ae5ad2387144fe91edc0528c0ffb28be151c9fb976853af91f60e74&=&format=webp&quality=lossless&width=1525&height=856",
    fullName: session?.user?.name,
    role: "Bidder",
    stats: { bids: 12, auctions: 5 },
    reviews: [
      { rating: 5, comment: "บริการดีมาก!" },
      { rating: 4, comment: "สินค้าได้ตามรูป" },
    ],
    auctionItems: [
      { id: 1, title: "กันพลา RX-78", image: "/gundam1.jpg", status: "ชนะ" },
      {
        id: 2,
        title: "ฟิกเกอร์ Iron Man",
        image: "/ironman.jpg",
        status: "ลงประมูล",
      },
      { id: 3, title: "โมเดลรถแข่ง", image: "/car-model.jpg", status: "ชนะ" },
    ],
  };

  const CurrentId = session?.user?.name == user?.fullName;

  return (
    <div className="bg-gradient-to-br  min-h-screen pb-12" hidden={hidden_body}>
      {/* Banner */}
      <div
        className="h-90 w-full bg-cover bg-center relative rounded-b-2xl"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(139,0,0,0.7)), url('${user?.banner}')`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
          ข้อมูลผู้ใช้
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-black/80 p-6 rounded-2xl shadow-lg max-w-xl mx-auto -mt-38 relative z-10 text-white">
        {/* Avatar + ชื่อ */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full border-2 border-red-600"
          />
          <div>
            <div className="text-xl font-bold">{user.fullName}</div>

            <div className="text-sm text-gray-300">{user.role}</div>
            {CurrentId && (
              <div
                className="text-sm text-red-500 hover:text-red-700 cursor-pointer"
                onClick={() => signOut()}
              >
                Logout
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-4 text-sm">
          <div>
            <div className="font-semibold">{user.stats.bids}</div>
            <div className="text-gray-400">Bid</div>
          </div>
          <div>
            <div className="font-semibold">{user.stats.auctions}</div>
            <div className="text-gray-400">สินค้าที่ลง</div>
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h4 className="font-semibold mb-2">รีวิวจากลูกค้า</h4>
          <div className="flex flex-col gap-2">
            {user.reviews.map((r, i) => (
              <div
                key={i}
                className="text-sm bg-gray-800/50 p-2 rounded flex items-center gap-2"
              >
                <div className="flex text-yellow-400">
                  {Array.from({ length: r.rating }).map((_, idx) => (
                    <FaStar key={idx} />
                  ))}
                </div>
                <div>{r.comment}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auction History */}
      <div className="mt-8 max-w-5xl mx-auto px-4">
        <h3 className="text-xl font-bold text-red-400 mb-4">
          ของที่เคยลงประมูล
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {user.auctionItems.map((item) => (
            <div key={item.id} className="bg-black/80 p-3 rounded-lg shadow-md">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-40 object-cover rounded"
              />
              <div className="mt-2 font-semibold">{item.title}</div>
              <div className="text-gray-400 text-sm">{item.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
