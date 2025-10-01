import Image from "next/image";
import NavGundamAuction from "@/app/components/navbar/navbar";
// import CopyRight from "@/components/Assets/Copyright/Page";
import Logo from "@/assets/imgs/Logo.svg";

const sections = [
  { id: "join", title: "1) การเข้าร่วมประมูล" },
  { id: "law", title: "2) ข้อผูกพันตามกฎหมาย" },
  { id: "breach", title: "3) ผลของการไม่รับผิดชอบ" },
  { id: "general", title: "4) กฎทั่วไปอื่น ๆ" },
];

export default function AuctionRulePage() {
  return (
    <main>

      

      <div className="max-w-7xl mx-auto px-4 pb-12 gap-8">
        {/* MAIN CONTENT */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-blue-50/30 p-4 rounded shadow">
            <h1 className="font-bold text-3xl">กฎการประมูล</h1>
            <p className="font-semibold">โปรดอ่านก่อนเริ่มประมูล: เมื่อกดบิดถือว่ายอมรับกฎทั้งหมดด้านล่าง</p>
            <span className="inline-block bg-blue-500 text-white text-xs px-2 py-0.5 rounded ml-2">อัปเดตล่าสุด</span>
          </div>

          {/* Accordion */}
          <div className="space-y-3">
            {/* 1) การเข้าร่วมประมูล */}
            <details open className="bg-white/5 rounded shadow p-4  hover:bg-blue-50 transition">
              <summary className="cursor-pointer font-semibold text-xl">1) การเข้าร่วมประมูล</summary>
              <ul className="list-disc list-inside mt-2 space-y-1 text-black">
                <li>ต้องเข้าสู่ระบบ และผ่านการยืนยันตัวตนก่อนถึงจะร่วมประมูลได้</li>
                <li>ผู้เสนอราคาสูงสุดเมื่อถึงเวลาสิ้นสุด <span className="bg-green-500 text-white px-1 rounded text-xs">คือผู้ชนะ</span></li>
                <li>การบิดแต่ละครั้งต้องเป็นไปตาม <span className="bg-gray-500 text-white px-1 rounded text-xs">ค่า Step</span> ที่กำหนด</li>
              </ul>
              <p className="text-xs text-gray-400 mt-1">* ระบบจะแสดงเวลานับถอยหลังชัดเจนในหน้าสินค้า</p>
            </details>

            {/* 2) กฎหมาย */}
            <details open className="bg-white/5 rounded shadow p-4 hover:bg-blue-50 transition">
              <summary className="cursor-pointer font-semibold text-xl">2) ข้อผูกพันตามกฎหมาย</summary>
              <p className="mt-2 text-black">
                การเข้าร่วมประมูลถือเป็นการแสดงเจตนาทำสัญญาซื้อขายตาม
                <strong> ประมวลกฎหมายแพ่งและพาณิชย์ มาตรา 454</strong>
              </p>
              <blockquote className="border-l-2 border-gray-400 pl-3 text-gray-400 italic mt-2">
                “เมื่อมีผู้รับราคาที่เสนอในการประมูลแล้ว การขายย่อมสมบูรณ์”
              </blockquote>
              <p className="text-black mt-2">หากชนะแล้วไม่ปฏิบัติตาม ถือเป็น <strong>การผิดสัญญา</strong> และมีผลทางกฎหมาย</p>
            </details>

            {/* 3) ผลของการไม่รับผิดชอบ */}
            <details open className="bg-white/5 rounded shadow p-4 hover:bg-blue-50 transition">
              <summary className="cursor-pointer font-semibold text-xl">3) ผลของการไม่รับผิดชอบหลังชนะ</summary>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <div className="bg-white/10 rounded p-3">
                  <p className="font-semibold text-black">ระงับบัญชี</p>
                  <p className="text-gray-400 text-sm">หรือจำกัดสิทธิ์การใช้งาน</p>
                </div>
                <div className="bg-white/10 rounded p-3">
                  <p className="font-semibold text-black">เรียกค่าเสียหาย</p>
                  <p className="text-gray-400 text-sm">ตามความเสียหายที่เกิดขึ้นจริง</p>
                </div>
                <div className="bg-white/10 rounded p-3">
                  <p className="font-semibold text-black">ดำเนินคดี</p>
                  <p className="text-gray-400 text-sm">ตาม <strong>มาตรา 217 และ 222</strong> ของ ป.พ.พ.</p>
                </div>
              </div>
            </details>

            {/* 4) กฎทั่วไป */}
            <details open className="bg-white/5 rounded shadow p-4 hover:bg-blue-50 transition">
              <summary className="cursor-pointer font-semibold text-xl">4) กฎทั่วไปอื่น ๆ</summary>
              <ul className="list-disc list-inside mt-2 text-black space-y-1">
                <li>ห้ามบิดปั่น/เสนอราคาหลอกลวง</li>
                <li>ห้ามใช้บัญชีปลอมหรือหลายบัญชีเพื่อชิงความได้เปรียบ</li>
                <li>ราคาที่เสนอแล้วถือเป็นข้อผูกพัน ยกเลิกไม่ได้</li>
                <li>หากเกิดปัญหาการชำระเงินให้แจ้งภายใน 24 ชั่วโมง</li>
              </ul>
            </details>
          </div>
        </div>


      </div>

      {/* <CopyRight /> */}
    </main>
  );
}
