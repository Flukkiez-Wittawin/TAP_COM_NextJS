"use client";

import React, { useEffect, useMemo, useState } from "react";
import NavGundamAuction from "../components/navbar/navbar";
import { useRouter } from "next/navigation";

/**
 * ManageAdmin — Admin Panel (Theme: ขาว-แดง, ภาษาไทย)
 *
 * ข้อสังเกต:
 * - API endpoints ที่ใช้:
 *   GET  /api/auctions?page=&pageSize=&q=&statusId=&typeId=&orderBy=&order=
 *   PUT  /api/auctions/:id
 *   DELETE /api/auctions/:id
 *
 *   GET  /api/users/AllUsers?page=&pageSize=
 *   POST /api/users/:user_id/ban
 *   PUT  /api/users/:user_id
 *
 *   GET  /api/requests?page=&pageSize=
 *   POST /api/requests/:id/approve
 *   POST /api/requests/:id/reject
 *
 *   GET  /api/blacklist?page=&pageSize=
 *   DELETE /api/blacklist/:user_id
 *
 * - โค้ดนี้ออกแบบให้รองรับทั้งกรณีที่ API คืน array ตรง ๆ
 *   หรือคืนเป็น object { data, pages, total } (จะเลือกอัตโนมัติ)
 */

function Backdrop({ onClose }) {
  return <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />;
}
function Modal({ title, children, footer, onClose }) {
  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden border">
          <div className="px-5 py-3 border-b flex items-center justify-between bg-red-50">
            <h3 className="text-lg font-semibold text-red-700">{title}</h3>
            <button className="px-3 py-1 rounded bg-white border" onClick={onClose}>ปิด</button>
          </div>
          <div className="p-5">{children}</div>
          {footer && <div className="px-5 py-4 border-t bg-gray-50">{footer}</div>}
        </div>
      </div>
    </>
  );
}
function ConfirmModal({ open, title = "ยืนยัน", message, onCancel, onConfirm, confirmText = "ยืนยัน" }) {
  if (!open) return null;
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-100">ยกเลิก</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white">{confirmText}</button>
        </div>
      }
    >
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
    </Modal>
  );
}
function AlertModal({ open, title = "แจ้งเตือน", message, onClose }) {
  if (!open) return null;
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={<div className="flex justify-end"><button onClick={onClose} className="px-4 py-2 rounded bg-red-600 text-white">ตกลง</button></div>}
    >
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
    </Modal>
  );
}

export default function ManageAdmin() {
  const router = useRouter();

  // tabs
  const [tab, setTab] = useState("auctions"); // auctions | users | requests | blacklist

  // global UI
  const [alert, setAlert] = useState({ open: false, title: "", message: "" });

  // ===== Auctions =====
  const [auctions, setAuctions] = useState([]);
  const [auctionsLoading, setAuctionsLoading] = useState(false);
  const [auctionsErr, setAuctionsErr] = useState("");
  const [auctionsPage, setAuctionsPage] = useState(1);
  const [auctionsPages, setAuctionsPages] = useState(1);
  const [auctionsTotal, setAuctionsTotal] = useState(0);
  const [pageSize] = useState(10);

  // filters / inline edit
  const [q, setQ] = useState("");
  const [statusId, setStatusId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [orderBy, setOrderBy] = useState("start_time");
  const [order, setOrder] = useState("desc");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const [savingId, setSavingId] = useState(null);

  // delete confirm
  const [toDeleteAuction, setToDeleteAuction] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ===== Users =====
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPages, setUsersPages] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);

  // edit user modal
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editUserData, setEditUserData] = useState(null);
  const [editUserSaving, setEditUserSaving] = useState(false);

  // ===== Requests =====
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsPages, setRequestsPages] = useState(1);
  const [requestsTotal, setRequestsTotal] = useState(0);

  // ===== Blacklist =====
  const [blacklist, setBlacklist] = useState([]);
  const [blacklistLoading, setBlacklistLoading] = useState(false);
  const [blacklistPage, setBlacklistPage] = useState(1);
  const [blacklistPages, setBlacklistPages] = useState(1);
  const [blacklistTotal, setBlacklistTotal] = useState(0);

  // helpers
  const changeDraft = (k, v) => setDraft((s) => ({ ...s, [k]: v }));
  const changeEditUser = (k, v) => setEditUserData((s) => ({ ...(s || {}), [k]: v }));

  // small helper: parse response that might be array or object { data, pages, total }
  const parseListResponse = async (res) => {
    const j = await res.json().catch(() => null);
    if (!j) return { data: [], pages: 1, total: 0 };
    if (Array.isArray(j)) return { data: j, pages: 1, total: j.length };
    if (j.data && Array.isArray(j.data)) return { data: j.data, pages: j.pages || 1, total: j.total || j.data.length || 0 };
    // fallback: if object with rows
    if (j.rows && Array.isArray(j.rows)) return { data: j.rows, pages: j.pages || 1, total: j.total || j.rows.length || 0 };
    // if object map of users etc: try to find array inside
    const arr = Object.values(j).find(v => Array.isArray(v));
    if (arr) return { data: arr, pages: j.pages || 1, total: j.total || arr.length || 0 };
    return { data: [], pages: 1, total: 0 };
  };

  // ===== API calls =====
  async function loadAuctions(opts = {}) {
    try {
      setAuctionsErr("");
      setAuctionsLoading(true);
      const page = opts.page ?? auctionsPage;
      const sp = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        orderBy: opts.orderBy || orderBy,
        order: opts.order || order,
      });
      if ((opts.q !== undefined ? opts.q : q)) sp.set("q", opts.q !== undefined ? opts.q : q);
      if ((opts.statusId !== undefined ? opts.statusId : statusId)) sp.set("statusId", opts.statusId !== undefined ? opts.statusId : statusId);
      if ((opts.typeId !== undefined ? opts.typeId : typeId)) sp.set("typeId", opts.typeId !== undefined ? opts.typeId : typeId);

      const res = await fetch(`/api/auctions?${sp.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const parsed = await parseListResponse(res);
      setAuctions(parsed.data);
      setAuctionsPages(parsed.pages || 1);
      setAuctionsTotal(parsed.total || 0);
      setAuctionsPage(page);
    } catch (e) {
      setAuctionsErr(String(e.message || e));
    } finally {
      setAuctionsLoading(false);
    }
  }

  async function saveAuction(id, payload) {
    try {
      setSavingId(id);
      const res = await fetch(`/api/auctions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log(JSON.stringify(payload))
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t?.error || `HTTP ${res.status}`);
      }
      setAlert({ open: true, title: "บันทึกสำเร็จ", message: "บันทึกข้อมูลประมูลเรียบร้อย" });
      await loadAuctions({ page: auctionsPage });
    } catch (e) {
      setAlert({ open: true, title: "บันทึกล้มเหลว", message: String(e.message || e) });
    } finally {
      setSavingId(null);
      setEditingId(null);
      setDraft({});
    }
  }

  async function deleteAuction(id) {
    try {
      const res = await fetch(`/api/auctions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t?.error || `HTTP ${res.status}`);
      }
      setAlert({ open: true, title: "ลบสำเร็จ", message: `ลบรายการ ${id} เรียบร้อย` });
      await loadAuctions({ page: auctionsPage });
    } catch (e) {
      setAlert({ open: true, title: "ลบล้มเหลว", message: String(e.message || e) });
    }
  }

  // ===== Users API =====
  async function loadUsers(opts = {}) {
    try {
      setUsersLoading(true);
      const page = opts.page ?? usersPage;
      const sp = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      const res = await fetch(`/api/users/AllUsers?${sp.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        // try to read body for message
        const t = await res.json().catch(() => ({}));
        throw new Error(t?.error || `HTTP ${res.status}`);
      }
      const parsed = await parseListResponse(res);
      setUsers(parsed.data);
      setUsersPages(parsed.pages || 1);
      setUsersTotal(parsed.total || parsed.data.length || 0);
      setUsersPage(page);
    } catch (e) {
      setAlert({ open: true, title: "โหลดผู้ใช้ล้มเหลว", message: String(e.message || e) });
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }

  async function toggleBanUser(user) {
    try {
      const res = await fetch(`/api/users/${user.user_id}/ban`, { method: "POST" });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t?.error || `HTTP ${res.status}`);
      }
      await loadUsers({ page: usersPage });
      setAlert({ open: true, title: "สำเร็จ", message: user.is_banned ? "ยกเลิกการแบนแล้ว" : "แบนผู้ใช้เรียบร้อย" });
    } catch (e) {
      setAlert({ open: true, title: "ผิดพลาด", message: String(e.message || e) });
    }
  }

  async function openEditUserModal(user) {
    // user object -> open modal and preload fields
    setEditUserData({
      user_id: user.user_id,
      fname: user.fname || "",
      lname: user.lname || "",
      email: user.email || "",
      Group_id: user.Group_id || user.group || "",
      role_name: user.role_name || "",
      is_banned: !!user.is_banned,
    });
    setEditUserOpen(true);
  }

  async function saveUserEdits() {
    if (!editUserData || !editUserData.user_id) return;
    try {
      setEditUserSaving(true);
      const payload = {
        fname: editUserData.fname,
        lname: editUserData.lname,
        email: editUserData.email,
        Group_id: editUserData.Group_id,
      };
      const res = await fetch(`/api/users/${editUserData.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t?.error || `HTTP ${res.status}`);
      }
      setAlert({ open: true, title: "บันทึกผู้ใช้", message: "แก้ไขข้อมูลผู้ใช้เรียบร้อย" });
      setEditUserOpen(false);
      await loadUsers({ page: usersPage });
    } catch (e) {
      setAlert({ open: true, title: "ผิดพลาด", message: String(e.message || e) });
    } finally {
      setEditUserSaving(false);
    }
  }

  // ===== Requests API =====
  async function loadRequests(opts = {}) {
    try {
      setRequestsLoading(true);
      const page = opts.page ?? requestsPage;
      const sp = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      const res = await fetch(`/api/requests?${sp.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const parsed = await parseListResponse(res);
      setRequests(parsed.data);
      setRequestsPages(parsed.pages || 1);
      setRequestsTotal(parsed.total || parsed.data.length || 0);
      setRequestsPage(page);
    } catch (e) {
      setAlert({ open: true, title: "โหลดคำขอผิดพลาด", message: String(e.message || e) });
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }

  async function approveRequest(r) {
    try {
      const res = await fetch(`/api/requests/${r.request_id}/approve`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAlert({ open: true, title: "อนุมัติ", message: "อนุมัติคำขอเรียบร้อย" });
      await loadRequests({ page: requestsPage });
    } catch (e) {
      setAlert({ open: true, title: "ผิดพลาด", message: String(e.message || e) });
    }
  }
  async function rejectRequest(r) {
    try {
      const res = await fetch(`/api/requests/${r.request_id}/reject`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAlert({ open: true, title: "ปฏิเสธ", message: "ปฏิเสธคำขอเรียบร้อย" });
      await loadRequests({ page: requestsPage });
    } catch (e) {
      setAlert({ open: true, title: "ผิดพลาด", message: String(e.message || e) });
    }
  }

  // ===== Blacklist API =====
  async function loadBlacklist(opts = {}) {
    try {
      setBlacklistLoading(true);
      const page = opts.page ?? blacklistPage;
      const sp = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      const res = await fetch(`/api/blacklist?${sp.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const parsed = await parseListResponse(res);
      setBlacklist(parsed.data);
      setBlacklistPages(parsed.pages || 1);
      setBlacklistTotal(parsed.total || parsed.data.length || 0);
      setBlacklistPage(page);
    } catch (e) {
      setAlert({ open: true, title: "โหลด blacklist ผิดพลาด", message: String(e.message || e) });
      setBlacklist([]);
    } finally {
      setBlacklistLoading(false);
    }
  }

  async function removeFromBlacklist(b) {
    try {
      const res = await fetch(`/api/blacklist/${b.user_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAlert({ open: true, title: "สำเร็จ", message: "นำออกจาก blacklist เรียบร้อย" });
      await loadBlacklist({ page: blacklistPage });
    } catch (e) {
      setAlert({ open: true, title: "ผิดพลาด", message: String(e.message || e) });
    }
  }

  // ===== Inline edit helpers for auctions =====
  const startEdit = (row) => {
    setEditingId(row.auction_id);
    setDraft({
      auction_name: row.auction_name || "",
      auction_desc: row.auction_desc || "",
      auction_bid_min: row.auction_bid_min ?? "",
      auction_bid_max: row.auction_bid_max ?? "",
      AuctionStatus_status_id: row.status_id || "",
      AuctionType_auction_type_id: row.type_id || "",
      Users_user_id: row.Users_user_id || "",
      start_time: row.start_time ? new Date(row.start_time).toISOString().slice(0, 16) : "",
      end_time: row.end_time ? new Date(row.end_time).toISOString().slice(0, 16) : "",
    });
  };
  const cancelEdit = () => { setEditingId(null); setDraft({}); };

  const requestSave = async () => {
    if (!editingId) return;
    // lightweight validation
    if (!draft.auction_name || !draft.auction_name.trim()) {
      setAlert({ open: true, title: "ผิดพลาด", message: "กรุณากรอกชื่อรายการ" });
      return;
    }
    const payload = {
      id : editingId,
      auction_name: draft.auction_name,
      auction_desc: draft.auction_desc,
      auction_bid_min: draft.auction_bid_min === "" ? null : Number(draft.auction_bid_min),
      auction_bid_max: draft.auction_bid_max === "" ? null : Number(draft.auction_bid_max),
      start_time: draft.start_time ? new Date(draft.start_time).toISOString() : null,
      end_time: draft.end_time ? new Date(draft.end_time).toISOString() : null,
      AuctionStatus_status_id: draft.AuctionStatus_status_id,
      AuctionType_auction_type_id: draft.AuctionType_auction_type_id,
    };
    await saveAuction(editingId, payload);
  };

  // delete flow
  const confirmDelete = (row) => {
    setToDeleteAuction(row);
    setShowDeleteConfirm(true);
  };
  const doDelete = async () => {
    setShowDeleteConfirm(false);
    if (!toDeleteAuction) return;
    await deleteAuction(toDeleteAuction.auction_id);
    setToDeleteAuction(null);
  };

  // status badge
  const statusBadge = (s) => {
    if (!s) return <span className="px-2 py-1 rounded-full text-xs bg-gray-200">-</span>;
    if (s === "S01") return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">รออนุมัติ</span>;
    if (s === "S02") return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">กำลังประมูล</span>;
    if (s === "S03") return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">ปิดแล้ว</span>;
    return <span className="px-2 py-1 rounded-full text-xs bg-gray-100">{s}</span>;
  };

  // initial load per tab
  useEffect(() => { loadAuctions({ page: 1 }); }, []); // initial auctions
  useEffect(() => { if (tab === "users") loadUsers({ page: usersPage }); }, [tab, usersPage]);
  useEffect(() => { if (tab === "requests") loadRequests({ page: requestsPage }); }, [tab, requestsPage]);
  useEffect(() => { if (tab === "blacklist") loadBlacklist({ page: blacklistPage }); }, [tab, blacklistPage]);

  // render
  return (
    <>
      <NavGundamAuction />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-8xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-red-700">แผงควบคุมผู้ดูแลระบบ</h1>
            <div className="flex gap-2">
              <button onClick={() => setTab("auctions")} className={`px-3 py-2 rounded ${tab === 'auctions' ? 'bg-red-600 text-white' : 'bg-white border'}`}>จัดการสินค้า</button>
              <button onClick={() => setTab("users")} className={`px-3 py-2 rounded ${tab === 'users' ? 'bg-red-600 text-white' : 'bg-white border'}`}>จัดการผู้ใช้งาน</button>
              <button onClick={() => setTab("requests")} className={`px-3 py-2 rounded ${tab === 'requests' ? 'bg-red-600 text-white' : 'bg-white border'}`}>จัดการคำขอ</button>
              <button onClick={() => setTab("blacklist")} className={`px-3 py-2 rounded ${tab === 'blacklist' ? 'bg-red-600 text-white' : 'bg-white border'}`}>Blacklist</button>
            </div>
          </div>

          {/* content */}
          <div className="bg-white rounded-xl shadow p-5">
            {/* ----- AUCTIONS ----- */}
            {tab === "auctions" && (
              <>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div className="flex gap-2 items-center">
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อ/คำอธิบาย…" className="border rounded px-3 py-2 md:w-80" />
                    <select value={statusId} onChange={(e) => setStatusId(e.target.value)} className="border rounded px-3 py-2">
                      <option value="">— ทุกสถานะ —</option>
                      <option value="S01">Pending</option>
                      <option value="S02">Active</option>
                      <option value="S03">Closed</option>
                    </select>
                    <select value={typeId} onChange={(e) => setTypeId(e.target.value)} className="border rounded px-3 py-2">
                      <option value="">— ทุกประเภท —</option>
                      <option value="T01">FirstHand</option>
                      <option value="T02">SecondHand</option>
                    </select>
                    <button onClick={() => { setAuctionsPage(1); loadAuctions({ page: 1 }); }} className="bg-red-600 text-white px-4 py-2 rounded">ค้นหา</button>
                    <button onClick={() => { setQ(''); setStatusId(''); setTypeId(''); setOrderBy('start_time'); setOrder('desc'); setAuctionsPage(1); loadAuctions({ page: 1 }); }} className="bg-gray-100 px-4 py-2 rounded">ล้าง</button>
                  </div>

                  <div className="flex gap-2 items-center">
                    <label className="text-sm text-gray-600">เรียง:</label>
                    <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)} className="border rounded px-3 py-2">
                      <option value="start_time">เริ่ม</option>
                      <option value="end_time">จบ</option>
                      <option value="name">ชื่อ</option>
                    </select>
                    <select value={order} onChange={(e) => setOrder(e.target.value)} className="border rounded px-3 py-2">
                      <option value="desc">ลงท้าย (ใหม่→เก่า)</option>
                      <option value="asc">ขึ้นต้น (เก่า→ใหม่)</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">ชื่อ</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Bid Min</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Bid Max</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">สถานะ</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">เริ่ม</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">จบ</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auctionsLoading ? (
                        <tr><td colSpan={8} className="px-4 py-6 text-center">กำลังโหลด…</td></tr>
                      ) : auctionsErr ? (
                        <tr><td colSpan={8} className="px-4 py-6 text-center text-red-600">{auctionsErr}</td></tr>
                      ) : auctions.length === 0 ? (
                        <tr><td colSpan={8} className="px-4 py-6 text-center">ไม่มีรายการ</td></tr>
                      ) : auctions.map(a => {
                        const isEdit = editingId === a.auction_id;
                        return (
                          <tr key={a.auction_id} className="border-t align-top">
                            <td className="px-4 py-3 text-sm">{a.auction_id}</td>
                            <td className="px-4 py-3 text-sm">
                              {isEdit ? (
                                <input value={draft.auction_name} onChange={(e) => changeDraft("auction_name", e.target.value)} className="w-full border rounded px-2 py-1 text-sm" />
                              ) : (
                                <div className="font-medium">{a.auction_name}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">{isEdit ? <input type="number" value={draft.auction_bid_min} onChange={(e) => changeDraft("auction_bid_min", e.target.value)} className="w-24 border rounded px-2 py-1 text-sm" /> : (a.auction_bid_min ?? "-")}</td>
                            <td className="px-4 py-3 text-sm">{isEdit ? <input type="number" value={draft.auction_bid_max} onChange={(e) => changeDraft("auction_bid_max", e.target.value)} className="w-24 border rounded px-2 py-1 text-sm" /> : (a.auction_bid_max ?? "-")}</td>
                            <td className="px-4 py-3">{isEdit ? (<select className="border rounded px-2 py-1 text-sm" value={draft.AuctionStatus_status_id} onChange={(e) => changeDraft("AuctionStatus_status_id", e.target.value)}><option value="">(เลือก)</option><option value="S01">Pending</option><option value="S02">Active</option><option value="S03">Closed</option></select>) : statusBadge(a.status_id || a.AuctionStatus_status_id)}</td>
                            <td className="px-4 py-3 text-sm">{isEdit ? <input type="datetime-local" value={draft.start_time} onChange={(e) => changeDraft("start_time", e.target.value)} className="border rounded px-2 py-1 text-sm" /> : (a.start_time ? new Date(a.start_time).toLocaleString() : "-")}</td>
                            <td className="px-4 py-3 text-sm">{isEdit ? <input type="datetime-local" value={draft.end_time} onChange={(e) => changeDraft("end_time", e.target.value)} className="border rounded px-2 py-1 text-sm" /> : (a.end_time ? new Date(a.end_time).toLocaleString() : "-")}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isEdit ? (
                                <div className="flex gap-2">
                                  <button disabled={savingId === a.auction_id} onClick={requestSave} className="px-3 py-1 rounded bg-red-600 text-white disabled:opacity-50">{savingId === a.auction_id ? "Saving…" : "Save"}</button>
                                  <button onClick={cancelEdit} className="px-3 py-1 rounded bg-gray-100">Cancel</button>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <button onClick={() => startEdit(a)} className="px-3 py-1 rounded bg-yellow-400 text-white">Edit</button>
                                  <button onClick={() => confirmDelete(a)} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* pagination */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">รวม {auctionsTotal} รายการ • หน้า {auctionsPage}/{auctionsPages}</div>
                  <div className="flex gap-2">
                    <button disabled={auctionsPage <= 1} onClick={() => { const p = Math.max(1, auctionsPage - 1); setAuctionsPage(p); loadAuctions({ page: p }); }} className="px-3 py-2 rounded bg-gray-100 disabled:opacity-50">ก่อนหน้า</button>
                    <button disabled={auctionsPage >= auctionsPages} onClick={() => { const p = Math.min(auctionsPages, auctionsPage + 1); setAuctionsPage(p); loadAuctions({ page: p }); }} className="px-3 py-2 rounded bg-gray-100 disabled:opacity-50">ถัดไป</button>
                  </div>
                </div>
              </>
            )}

            {/* ----- USERS ----- */}
            {tab === "users" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2 items-center">
                    <input placeholder="ค้นหาอีเมลหรือชื่อ…" className="border rounded px-3 py-2" onChange={(e) => { setUsersPage(1); /* client filter could be added */ }} />
                    <button onClick={() => loadUsers({ page: 1 })} className="bg-red-600 text-white px-4 py-2 rounded">รีเฟรช</button>
                  </div>
                  <div className="text-sm text-gray-600">รวม {usersTotal} รายการ • หน้า {usersPage}/{usersPages}</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">User ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">ชื่อ</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">กลุ่ม</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">สถานะ</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? (<tr><td colSpan={6} className="px-4 py-6 text-center">กำลังโหลด…</td></tr>) : users.length === 0 ? (<tr><td colSpan={6} className="px-4 py-6 text-center">ไม่มีผู้ใช้งาน</td></tr>) : users.map(u => (
                        <tr key={u.user_id} className="border-t">
                          <td className="px-4 py-3 text-sm">{u.user_id}</td>
                          <td className="px-4 py-3 text-sm">{u.fname} {u.lname}</td>
                          <td className="px-4 py-3 text-sm">{u.email}</td>
                          <td className="px-4 py-3 text-sm">{u.Group_id || u.group || u.role_name || "-"}</td>
                          <td className="px-4 py-3 text-sm">{u.is_banned ? <span className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded-full">Banned</span> : <span className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded-full">Active</span>}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <button onClick={() => toggleBanUser(u)} className={`px-3 py-1 rounded ${u.is_banned ? 'bg-yellow-500' : 'bg-red-600 text-white'}`}>{u.is_banned ? 'Unban' : 'Ban'}</button>
                              <button onClick={() => openEditUserModal(u)} className="px-3 py-1 rounded bg-white border">Edit</button>
                              <button onClick={() => router.push(`/manage/users/${u.user_id}`)} className="px-3 py-1 rounded bg-gray-100">View</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div />
                  <div className="flex gap-2">
                    <button disabled={usersPage <= 1} onClick={() => { const p = Math.max(1, usersPage - 1); setUsersPage(p); loadUsers({ page: p }); }} className="px-3 py-2 rounded bg-gray-100 disabled:opacity-50">ก่อนหน้า</button>
                    <button disabled={usersPage >= usersPages} onClick={() => { const p = Math.min(usersPages, usersPage + 1); setUsersPage(p); loadUsers({ page: p }); }} className="px-3 py-2 rounded bg-gray-100 disabled:opacity-50">ถัดไป</button>
                  </div>
                </div>
              </>
            )}

            {/* ----- REQUESTS ----- */}
            {tab === "requests" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">คำขอที่รอการตรวจสอบ</div>
                  <div className="text-sm text-gray-600">รวม {requestsTotal} รายการ • หน้า {requestsPage}/{requestsPages}</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">ผู้ขอ</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">ประเภท</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">รายละเอียด</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestsLoading ? (<tr><td colSpan={5} className="px-4 py-6 text-center">กำลังโหลด…</td></tr>) : requests.length === 0 ? (<tr><td colSpan={5} className="px-4 py-6 text-center">ไม่มีคำขอ</td></tr>) : requests.map(r => (
                        <tr key={r.request_id} className="border-t">
                          <td className="px-4 py-3">{r.request_id}</td>
                          <td className="px-4 py-3">{r.user_name || r.user_email || r.user_id}</td>
                          <td className="px-4 py-3">{r.type}</td>
                          <td className="px-4 py-3 text-xs">{r.detail}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => approveRequest(r)} className="px-3 py-1 rounded bg-green-600 text-white">Approve</button>
                              <button onClick={() => rejectRequest(r)} className="px-3 py-1 rounded bg-red-600 text-white">Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div />
                  <div className="flex gap-2">
                    <button disabled={requestsPage <= 1} onClick={() => { const p = Math.max(1, requestsPage - 1); setRequestsPage(p); loadRequests({ page: p }); }} className="px-3 py-2 rounded bg-gray-100 disabled:opacity-50">ก่อนหน้า</button>
                    <button disabled={requestsPage >= requestsPages} onClick={() => { const p = Math.min(requestsPages, requestsPage + 1); setRequestsPage(p); loadRequests({ page: p }); }} className="px-3 py-2 rounded bg-gray-100 disabled:opacity-50">ถัดไป</button>
                  </div>
                </div>
              </>
            )}

            {/* ----- BLACKLIST ----- */}
            {tab === "blacklist" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">Blacklist (ผู้ขาย)</div>
                  <div className="text-sm text-gray-600">รวม {blacklistTotal} รายการ • หน้า {blacklistPage}/{blacklistPages}</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">User ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">ชื่อ</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">เหตุผล</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blacklistLoading ? (<tr><td colSpan={5} className="px-4 py-6 text-center">กำลังโหลด…</td></tr>) : blacklist.length === 0 ? (<tr><td colSpan={5} className="px-4 py-6 text-center">ไม่มีข้อมูล</td></tr>) : blacklist.map(b => (
                        <tr key={b.user_id} className="border-t">
                          <td className="px-4 py-3">{b.user_id}</td>
                          <td className="px-4 py-3">{b.fname} {b.lname}</td>
                          <td className="px-4 py-3">{b.email}</td>
                          <td className="px-4 py-3 text-xs">{b.reason}</td>
                          <td className="px-4 py-3"><button onClick={() => removeFromBlacklist(b)} className="px-3 py-1 rounded bg-red-600 text-white">นำออก</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div />
                  <div className="flex gap-2">
                    <button disabled={blacklistPage <= 1} onClick={() => { const p = Math.max(1, blacklistPage - 1); setBlacklistPage(p); loadBlacklist({ page: p }); }} className="px-3 py-2 rounded bg-gray-100 disabled:opacity-50">ก่อนหน้า</button>
                    <button disabled={blacklistPage >= blacklistPages} onClick={() => { const p = Math.min(blacklistPages, blacklistPage + 1); setBlacklistPage(p); loadBlacklist({ page: p }); }} className="px-3 py-2 rounded bg-gray-100 disabled:opacity-50">ถัดไป</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Auction */}
      <ConfirmModal open={showDeleteConfirm} title="ยืนยันการลบ" message={`ต้องการลบรายการ ${toDeleteAuction?.auction_id || ""} หรือไม่?`} onCancel={() => setShowDeleteConfirm(false)} onConfirm={doDelete} confirmText="ลบ" />

      {/* Edit user modal */}
      {editUserOpen && (
        <Modal
          title="แก้ไขข้อมูลผู้ใช้"
          onClose={() => setEditUserOpen(false)}
          footer={
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditUserOpen(false)} className="px-4 py-2 rounded bg-gray-100">ยกเลิก</button>
              <button onClick={saveUserEdits} className="px-4 py-2 rounded bg-red-600 text-white" disabled={editUserSaving}>{editUserSaving ? "Saving…" : "บันทึก"}</button>
            </div>
          }
        >
          <div className="grid gap-3">
            <label className="text-sm">ชื่อ</label>
            <input value={editUserData?.fname || ""} onChange={(e) => changeEditUser("fname", e.target.value)} className="border rounded px-3 py-2" />
            <label className="text-sm">นามสกุล</label>
            <input value={editUserData?.lname || ""} onChange={(e) => changeEditUser("lname", e.target.value)} className="border rounded px-3 py-2" />
            <label className="text-sm">Email</label>
            <input value={editUserData?.email || ""} onChange={(e) => changeEditUser("email", e.target.value)} className="border rounded px-3 py-2" />
            <label className="text-sm">Group</label>
            <select value={editUserData?.Group_id || ""} onChange={(e) => changeEditUser("Group_id", e.target.value)} className="border rounded px-3 py-2">
              <option value="">— เลือก Group —</option>
              <option value="G001">G001 (User)</option>
              <option value="G002">G002 (Admin)</option>
              <option value="G003">G003 (Moderator)</option>
            </select>
          </div>
        </Modal>
      )}

      <AlertModal open={alert.open} title={alert.title} message={alert.message} onClose={() => setAlert({ open: false, title: "", message: "" })} />
    </>
  );
}
