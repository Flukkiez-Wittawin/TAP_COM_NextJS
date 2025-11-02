"use client";
import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfileDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    phone: "",
    address: "",
    citizen_id: "",
    avatar: null,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("/default-avatar.png");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [myAuctions, setMyAuctions] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // ----------------- Fetch user & auctions -----------------
  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      router.push("/auth");
      return;
    }

    const fetchData = async () => {
      setLoadingData(true);
      const fetchJsonSafe = async (url) => {
        try {
          const res = await fetch(url, { cache: "no-store" });
          const text = await res.text();
          try {
            return { ok: res.ok, data: JSON.parse(text) };
          } catch {
            console.error("Non-JSON response from", url, text);
            return { ok: false, data: null };
          }
        } catch (err) {
          console.error("Fetch error:", err);
          return { ok: false, data: null };
        }
      };

      const { ok: okUser, data: dataUser } = await fetchJsonSafe("/api/user/getUserPersonalData");
      if (okUser && dataUser) {
        setFormData({
          fname: dataUser.fname || "",
          lname: dataUser.lname || "",
          phone: dataUser.phone || "",
          address: dataUser.address || "",
          citizen_id: dataUser.citizen_id || "",
          avatar: dataUser.avatar || null,
        });
        setAvatarPreview(dataUser.avatar || "/default-avatar.png");
      }

      const { ok: okMy, data: dataMy } = await fetchJsonSafe("/api/auction_data/myAuctions");
      if (okMy && dataMy) setMyAuctions(Array.from(new Map(dataMy.map(a => [a.id, a])).values()));

      const { ok: okWon, data: dataWon } = await fetchJsonSafe("/api/auction_data/wonAuctions");
      if (okWon && dataWon) setWonAuctions(Array.from(new Map(dataWon.map(a => [a.id, a])).values()));

      setLoadingData(false);
    };

    fetchData();
  }, [status, session, router]);

  // ----------------- Handlers -----------------
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return alert("กรุณาเลือกไฟล์ก่อน");
    setUploadingAvatar(true);
    const formDataObj = new FormData();
    formDataObj.append("avatar", avatarFile);

    try {
      const res = await fetch("/api/user/uploadAvatar", { method: "POST", body: formDataObj });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { alert("Response is not JSON: " + text); return; }

      if (res.ok && data) {
        setFormData(prev => ({ ...prev, avatar: data.avatarUrl }));
        setAvatarFile(null);
        setAvatarPreview(data.avatarUrl);
        alert("อัปโหลดเรียบร้อย!");
      } else alert("เกิดข้อผิดพลาด: " + (data?.error || "Unknown error"));
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/user/updateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { alert("Response is not JSON: " + text); return; }

      if (res.ok && data) setEditMode(false);
      else alert("เกิดข้อผิดพลาด: " + (data?.error || "Unknown error"));
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  const getAuctionImage = (auction) => {
    if (auction.image) return `/uploads/auctions/auction_${auction.id}/${auction.image}`;
    if (auction.images && auction.images.length > 0) return `/uploads/auctions/auction_${auction.id}/${auction.images[0]}`;
    return "/default-avatar.png";
  };

  if (status === "loading" || loadingData) return <p className="text-center mt-10 text-lg text-gray-600">Loading profile...</p>;

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6">
        {/* Left: Profile */}
        <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-lg flex flex-col items-center p-6">
          <div className="w-full h-28 bg-gradient-to-r from-red-600 to-red-400 rounded-t-2xl" />
          <div className="relative -mt-16">
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer mx-auto"
            />
            {editMode && (
              <label className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-red-700 transition">
                <input type="file" className="hidden" onChange={handleAvatarChange} />
                ✎
              </label>
            )}
          </div>

          {editMode && (
            <div className="mt-3 flex flex-col items-center gap-2 w-full">
              <button
                onClick={handleAvatarUpload}
                disabled={uploadingAvatar}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 w-full"
              >
                {uploadingAvatar ? "Uploading..." : "Upload Avatar"}
              </button>
            </div>
          )}

          <div className="mt-4 w-full space-y-3">
            {editMode ? (
              <>
                {["fname", "lname", "phone", "address", "citizen_id"].map((key) => (
                  <input
                    key={key}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:border-red-500"
                    placeholder={key.replace("_", " ").toUpperCase()}
                  />
                ))}
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button onClick={handleSave} className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700">Save</button>
                  <button onClick={() => setEditMode(false)} className="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300">Cancel</button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-2 p-4 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300">
                <p className="font-semibold text-2xl">{formData.fname} {formData.lname}</p>
                <p className="text-gray-600">โทรศัพท์: {formData.phone}</p>
                <p className="text-gray-600">ที่อยู่: {formData.address}</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-2">
                  <button onClick={() => setEditMode(true)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full sm:w-auto">แก้ไข</button>
                  <button onClick={() => signOut()} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 w-full sm:w-auto">Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Auction Data */}
        <div className="flex-1 flex flex-col gap-6 max-h-screen overflow-y-auto">
          {[{ title: "ประมูลของฉัน", data: myAuctions }, { title: "ประมูลที่ชนะ", data: wonAuctions }].map(section => (
            <div key={section.title} className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
              {section.data.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ไม่พบข้อมูล</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {section.data.map(a => (
                    <div
                      key={a.id}
                      className="group border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => router.push(`/auctions/${a.id}`)}
                    >
                      <div className="relative w-full h-40 overflow-hidden">
                        <img
                          src={getAuctionImage(a)}
                          alt={a.name || a.auction_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <span className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          {a.price || a.highest_bid || a.current_bid || 0} บาท
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="font-semibold text-lg">{a.name || a.auction_name}</p>
                        <p className="text-gray-500 text-sm mt-1">Auction ID: {a.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
