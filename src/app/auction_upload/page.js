"use client";
import React, { useState, useEffect } from "react";
import NavGundamAuction from "../components/navbar/navbar";

function AlertModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
        <p className="text-gray-800 text-center mb-4">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreateAuctionPage() {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({
    name: "",
    desc: "",
    bid_min: "",
    bid_max: "",
    type_id: "",
    start_time: "",
    end_time: "",
    status_id: "S01",
    user_id: "U003",
  });

  const [images, setImages] = useState([]);
  const [previewURLs, setPreviewURLs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchTypes() {
      try {
        const res = await fetch("/api/auction/types");
        const data = await res.json();
        if (Array.isArray(data)) {
          setTypes(data);
          setForm(prev => ({ ...prev, type_id: data[0]?.auction_type_id }));
        }
      } catch (err) {
        console.error("Failed to fetch types:", err);
      }
    }
    fetchTypes();
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    if (images.length + newFiles.length > 10) {
      setModalMessage("Cannot upload more than 10 images");
      setShowModal(true);
      return;
    }

    const updatedImages = [...images, ...newFiles];
    setImages(updatedImages);

    const newPreview = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewURLs((prev) => [...prev, ...newPreview]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previewURLs];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setPreviewURLs(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!images.length) {
      setModalMessage("กรุณาเลือกรูปภาพก่อน!");
      setShowModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auction/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.auction_id)
        throw new Error(data.error || "สร้างประมูลล้มเหลว");

      const auctionId = data.auction_id;

      const formData = new FormData();
      formData.append("auction_id", auctionId);
      images.forEach((img) => formData.append("images", img));

      const uploadRes = await fetch("/api/auction/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("อัปโหลดรูปภาพล้มเหลว");

      setModalMessage("✅ Auction created successfully!");
      setShowModal(true);

      setImages([]);
      setPreviewURLs([]);
      setForm({
        name: "",
        desc: "",
        bid_min: "",
        bid_max: "",
        type_id: types[0]?.auction_type_id || "",
        start_time: "",
        end_time: "",
        status_id: "S01",
        user_id: "U003",
      });
    } catch (err) {
      setModalMessage(err.message);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavGundamAuction />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Create Auction</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input name="name" value={form.name} onChange={handleChange} placeholder="Auction Name" className="border p-2 rounded" required />
          <textarea name="desc" value={form.desc} onChange={handleChange} placeholder="Description" className="border p-2 rounded" />
          <input name="bid_min" type="number" value={form.bid_min} onChange={handleChange} placeholder="Min Bid" className="border p-2 rounded" required />
          <input name="bid_max" type="number" value={form.bid_max} onChange={handleChange} placeholder="Max Bid" className="border p-2 rounded" />
          <input name="start_time" type="datetime-local" value={form.start_time} onChange={handleChange} className="border p-2 rounded" required />
          <input name="end_time" type="datetime-local" value={form.end_time} onChange={handleChange} className="border p-2 rounded" required />

          <select name="type_id" value={form.type_id} onChange={handleChange} className="border p-2 rounded">
            {types.map((t) => (
              <option key={t.auction_type_id} value={t.auction_type_id}>
                {t.auction_type_name}
              </option>
            ))}
          </select>

          <label htmlFor="fileUpload"
            className="cursor-pointer block bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium text-center">
            📁 Choose Images
          </label>

          <input id="fileUpload" type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />

          {previewURLs.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {previewURLs.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} className="w-full h-32 object-cover rounded-md border shadow-sm" alt="Preview" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            {loading ? "Creating..." : "Create Auction"}
          </button>

        </form>

        {showModal && <AlertModal message={modalMessage} onClose={() => setShowModal(false)} />}
      </div>
    </>
  );
}
