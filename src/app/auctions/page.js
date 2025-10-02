import NavGundamAuction from "@/app/components/navbar/navbar";
import Categories from "@/app/components/Auctions/Categories";
import AuctionCard from "@/app/components/Auctions/AuctionCard";

export default function AuctionsPage() {
  const auctionItems = [
    { title: "กันดั้ม RX-78-2", img: "/gundam1.jpg", price: 2500, timeLeft: "2h 30m" },
    { title: "โมเดล Zaku II", img: "/gundam2.jpg", price: 1800, timeLeft: "1h 15m" },
    { title: "ฟิกเกอร์ Char Aznable", img: "/figure1.jpg", price: 1500, timeLeft: "3h 45m" },
     { title: "ฟิกเกอร์ Char Aznable", img: "/figure1.jpg", price: 1500, timeLeft: "3h 45m" },
     { title: "กันดั้ม RX-78-2", img: "/gundam1.jpg", price: 2500, timeLeft: "2h 30m" },
    { title: "โมเดล Zaku II", img: "/gundam2.jpg", price: 1800, timeLeft: "1h 15m" },
    { title: "ฟิกเกอร์ Char Aznable", img: "/figure1.jpg", price: 1500, timeLeft: "3h 45m" },
     { title: "ฟิกเกอร์ Char Aznable", img: "/figure1.jpg", price: 1500, timeLeft: "3h 45m" },
     { title: "กันดั้ม RX-78-2", img: "/gundam1.jpg", price: 2500, timeLeft: "2h 30m" },
    { title: "โมเดล Zaku II", img: "/gundam2.jpg", price: 1800, timeLeft: "1h 15m" },
    { title: "ฟิกเกอร์ Char Aznable", img: "/figure1.jpg", price: 1500, timeLeft: "3h 45m" },
     { title: "ฟิกเกอร์ Char Aznable", img: "/figure1.jpg", price: 1500, timeLeft: "3h 45m" },
  ];

  return (
    <>
      <NavGundamAuction />
      <Categories />
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {auctionItems.map((item, idx) => (
          <AuctionCard key={idx} {...item} />
        ))}
      </div>
    </>
  );
}
