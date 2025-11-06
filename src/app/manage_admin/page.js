// src/app/manage/admin/page.jsx
'use client'

import { useEffect, useMemo, useState } from "react";
import NavGundamAuction from "../components/navbar/navbar";
import { useRouter } from "next/navigation";

/* ============ Minimal Modal System ============ */
function Backdrop({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
  );
}
function Modal({ title, children, footer, onClose }) {
  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button className="px-3 py-1 rounded bg-gray-100" onClick={onClose}>ปิด</button>
          </div>
          <div className="p-5">{children}</div>
          {footer && <div className="px-5 py-4 border-t bg-gray-50">{footer}</div>}
        </div>
      </div>
    </>
  );
}
function AlertModal({ open, title="แจ้งเตือน", message, onClose }) {
  if (!open) return null;
  return (
    <Modal title={title} onClose={onClose}
      footer={<div className="flex justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded bg-blue-600 text-white">ตกลง</button>
      </div>}
    >
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
    </Modal>
  );
}
function ConfirmModal({ open, title="ยืนยันการทำรายการ", message, onCancel, onConfirm, confirmText="ยืนยัน" }) {
  if (!open) return null;
  return (
    <Modal title={title} onClose={onCancel}
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-200">ยกเลิก</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-blue-600 text-white">{confirmText}</button>
        </div>
      }
    >
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
    </Modal>
  );
}

/* ============ Page ============ */
export default function ManageAdmin() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [statusId, setStatusId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [orderBy, setOrderBy] = useState("start_time"); // start_time | end_time | name
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const router = useRouter();

  // inline edit
  const [editingId, setEditingId] = useState(null); // auction_id
  const [draft, setDraft] = useState({});
  const [savingId, setSavingId] = useState(null);

  // modals
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState({ open: false, title: "", message: "" });

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const sp = new URLSearchParams({
        page: String(page), pageSize: String(pageSize), orderBy, order,
      });
      if (q) sp.set("q", q);
      if (statusId) sp.set("statusId", statusId);
      if (typeId) sp.set("typeId", typeId);

      const res = await fetch(`/api/auctions?${sp.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t?.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setItems(json.data || []);
      setPages(json.pages || 1);
      setTotal(json.total || 0);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, orderBy, order]);

  const onSearch = () => { setPage(1); load(); };
  const onClear = () => {
    setQ(""); setStatusId(""); setTypeId("");
    setOrderBy("start_time"); setOrder("desc");
    setPage(1); load();
  };

  // ===== inline edit helpers =====
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
  const changeDraft = (k, v) => setDraft((s) => ({ ...s, [k]: v }));

  // ===== validation (ฟอร์ม) =====
  const errors = useMemo(() => {
    if (editingId == null) return {};
    const e = {};
    const name = (draft.auction_name || "").trim();
    if (!name) e.auction_name = "กรอกชื่อรายการ";
    const min = draft.auction_bid_min === "" ? null : Number(draft.auction_bid_min);
    const max = draft.auction_bid_max === "" ? null : Number(draft.auction_bid_max);
    if (min != null && (Number.isNaN(min) || min < 0)) e.auction_bid_min = "กรอกตัวเลข ≥ 0";
    if (max != null && (Number.isNaN(max) || max < 0)) e.auction_bid_max = "กรอกตัวเลข ≥ 0";
    if (min != null && max != null && min > max) e.auction_bid_max = "Bid Max ต้อง ≥ Bid Min";
    // เวลา (ถ้ากรอกทั้งคู่)
    if (draft.start_time && draft.end_time) {
      const s = new Date(draft.start_time).getTime();
      const ed = new Date(draft.end_time).getTime();
      if (!Number.isFinite(s) || !Number.isFinite(ed)) {
        e.time = "รูปแบบเวลาไม่ถูกต้อง";
      } else if (s >= ed) {
        e.time = "เวลาจบต้องมากกว่าเวลาเริ่ม";
      }
    }
    return e;
  }, [draft, editingId]);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const requestSave = () => {
    // ถ้ามี error ให้เปิด alert modal รวมข้อความ
    if (hasErrors) {
      const msg = [
        errors.auction_name && `• ${errors.auction_name}`,
        errors.auction_bid_min && `• ${errors.auction_bid_min}`,
        errors.auction_bid_max && `• ${errors.auction_bid_max}`,
        errors.time && `• ${errors.time}`,
      ].filter(Boolean).join("\n");
      setShowAlert({ open: true, title: "กรอกข้อมูลไม่ครบถ้วน", message: msg || "กรุณาตรวจสอบข้อมูล" });
      return;
    }
    setShowConfirm(true);
  };

  const doSave = async () => {
    const id = editingId;
    setShowConfirm(false);
    if (!id) return;

    try {
      setSavingId(id);
      const minNum = draft.auction_bid_min === "" ? null : Number(draft.auction_bid_min);
      const maxNum = draft.auction_bid_max === "" ? null : Number(draft.auction_bid_max);

      const payload = {
        ...draft,
        id : id,
        auction_bid_min: minNum,
        auction_bid_max: maxNum,
        start_time: draft.start_time ? new Date(draft.start_time).toISOString() : null,
        end_time: draft.end_time ? new Date(draft.end_time).toISOString() : null,
      };

      const res = await fetch(`/api/auctions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t?.error || `HTTP ${res.status}`);
      }

      cancelEdit();
      await load();
      setShowAlert({ open: true, title: "บันทึกสำเร็จ", message: "บันทึกข้อมูลเรียบร้อยแล้ว" });
    } catch (e) {
      setShowAlert({ open: true, title: "บันทึกล้มเหลว", message: String(e.message || e) });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <NavGundamAuction />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Manage Admin — All Auctions</h1>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow mb-4 grid gap-3 md:grid-cols-5">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาชื่อ/คำอธิบาย…"
              className="border rounded-lg px-3 py-2 md:col-span-2"
            />
            <select
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">— ทุกสถานะ —</option>
              <option value="S01">Pending</option>
              <option value="S02">Active</option>
              <option value="S03">Closed</option>
            </select>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">— ทุกประเภท —</option>
              <option value="T01">FirstHand</option>
              <option value="T02">SecondHand</option>
            </select>
            <div className="flex gap-2">
              <button onClick={onSearch} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                ค้นหา
              </button>
              <button onClick={onClear} className="bg-gray-200 px-4 py-2 rounded-lg">
                ล้าง
              </button>
            </div>

            <div className="md:col-span-5 flex gap-2 items-center">
              <label className="text-sm text-gray-600">เรียงโดย</label>
              <select
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="start_time">เริ่ม (ล่าสุด/เก่าสุด)</option>
                <option value="end_time">จบ (ล่าสุด/เก่าสุด)</option>
                <option value="name">ชื่อ (A→Z / Z→A)</option>
              </select>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">รูป</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ชื่อ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">คำอธิบาย</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">สถานะ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ประเภท</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Bid Min</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Bid Max</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Highest Bid</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">เริ่ม</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">จบ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="px-4 py-4" colSpan={12}>กำลังโหลด…</td></tr>
                ) : err ? (
                  <tr><td className="px-4 py-4 text-red-600" colSpan={12}>{err}</td></tr>
                ) : items.length === 0 ? (
                  <tr><td className="px-4 py-4" colSpan={12}>ไม่มีข้อมูล</td></tr>
                ) : (
                  items.map((a) => {
                    const isEdit = editingId === a.auction_id;
                    return (
                      <tr key={a.auction_id} className="border-t align-top">
                        {/* ID (read-only) */}
                        <td className="px-4 py-3 text-sm">{a.auction_id}</td>

                        {/* Image (read-only) */}
                        <td className="px-4 py-3">
                          {a.thumbnail ? (
                            <img src={a.thumbnail} alt={a.auction_name} className="h-12 w-12 object-cover rounded" />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No img</div>
                          )}
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3 min-w-[180px]">
                          {isEdit ? (
                            <div>
                              <input
                                className={`w-full border rounded px-2 py-1 text-sm ${errors.auction_name ? 'border-red-500' : ''}`}
                                value={draft.auction_name}
                                onChange={(e) => changeDraft("auction_name", e.target.value)}
                              />
                              {errors.auction_name && <p className="mt-1 text-xs text-red-600">{errors.auction_name}</p>}
                            </div>
                          ) : (
                            <div className="font-medium hover:text-red-500 duration-500 hover:cursor-pointer" onClick={()=> router.push(`/auctions/${a.auction_id}`)}>{a.auction_name}</div>
                          )}
                        </td>

                        {/* Desc */}
                        <td className="px-4 py-3 min-w-[240px]">
                          {isEdit ? (
                            <textarea
                              className="w-full border rounded px-2 py-1 text-sm min-h-[64px]"
                              value={draft.auction_desc}
                              onChange={(e) => changeDraft("auction_desc", e.target.value)}
                            />
                          ) : (
                            <div className="text-xs text-gray-600 line-clamp-3">{a.auction_desc}</div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          {isEdit ? (
                            <select
                              className="w-full border rounded px-2 py-1 text-sm"
                              value={draft.AuctionStatus_status_id}
                              onChange={(e) => changeDraft("AuctionStatus_status_id", e.target.value)}
                            >
                              <option value="">(เลือกสถานะ)</option>
                              <option value="S01">Pending</option>
                              <option value="S02">Active</option>
                              <option value="S03">Closed</option>
                            </select>
                          ) : (
                            <div className="text-sm">{a.status_name || a.status_id}</div>
                          )}
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          {isEdit ? (
                            <select
                              className="w-full border rounded px-2 py-1 text-sm"
                              value={draft.AuctionType_auction_type_id}
                              onChange={(e) => changeDraft("AuctionType_auction_type_id", e.target.value)}
                            >
                              <option value="">(เลือกประเภท)</option>
                              <option value="T01">FirstHand</option>
                              <option value="T02">SecondHand</option>
                            </select>
                          ) : (
                            <div className="text-sm">{a.auction_type_name || a.type_id}</div>
                          )}
                        </td>

                        {/* Bid Min */}
                        <td className="px-4 py-3 w-[120px]">
                          {isEdit ? (
                            <div>
                              <input
                                type="number"
                                className={`w-full border rounded px-2 py-1 text-sm ${errors.auction_bid_min ? 'border-red-500' : ''}`}
                                value={draft.auction_bid_min}
                                onChange={(e) => changeDraft("auction_bid_min", e.target.value)}
                              />
                              {errors.auction_bid_min && <p className="mt-1 text-xs text-red-600">{errors.auction_bid_min}</p>}
                            </div>
                          ) : (
                            <div className="text-sm">{a.auction_bid_min ?? "-"}</div>
                          )}
                        </td>

                        {/* Bid Max */}
                        <td className="px-4 py-3 w-[120px]">
                          {isEdit ? (
                            <div>
                              <input
                                type="number"
                                className={`w-full border rounded px-2 py-1 text-sm ${errors.auction_bid_max ? 'border-red-500' : ''}`}
                                value={draft.auction_bid_max}
                                onChange={(e) => changeDraft("auction_bid_max", e.target.value)}
                              />
                              {errors.auction_bid_max && <p className="mt-1 text-xs text-red-600">{errors.auction_bid_max}</p>}
                            </div>
                          ) : (
                            <div className="text-sm">{a.auction_bid_max ?? "-"}</div>
                          )}
                        </td>

                        {/* Highest bid (read-only) */}
                        <td className="px-4 py-3 text-sm">{a.highest_bid ?? "-"}</td>

                        {/* Start */}
                        <td className="px-4 py-3 w-[210px]">
                          {isEdit ? (
                            <input
                              type="datetime-local"
                              className="w-full border rounded px-2 py-1 text-sm"
                              value={draft.start_time}
                              onChange={(e) => changeDraft("start_time", e.target.value)}
                            />
                          ) : (
                            <div className="text-xs">{a.start_time ? new Date(a.start_time).toLocaleString() : "-"}</div>
                          )}
                        </td>

                        {/* End */}
                        <td className="px-4 py-3 w-[210px]">
                          {isEdit ? (
                            <input
                              type="datetime-local"
                              className="w-full border rounded px-2 py-1 text-sm"
                              value={draft.end_time}
                              onChange={(e) => changeDraft("end_time", e.target.value)}
                            />
                          ) : (
                            <div className="text-xs">{a.end_time ? new Date(a.end_time).toLocaleString() : "-"}</div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isEdit ? (
                            <div className="flex gap-2">
                              <button
                                disabled={savingId === a.auction_id}
                                onClick={requestSave}
                                className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                              >
                                {savingId === a.auction_id ? "Saving…" : "Save"}
                              </button>
                              <button onClick={cancelEdit} className="px-3 py-1 rounded bg-gray-200">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => startEdit(a)} className="px-3 py-1 rounded bg-amber-500 text-white">Edit</button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">รวม {total} รายการ • หน้า {page}/{pages}</div>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50">ก่อนหน้า</button>
              <button disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))} className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50">ถัดไป</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        open={showConfirm}
        title="ยืนยันการบันทึก"
        message="ต้องการบันทึกการแก้ไขรายการนี้ใช่หรือไม่?"
        onCancel={() => setShowConfirm(false)}
        onConfirm={doSave}
        confirmText="บันทึก"
      />
      <AlertModal
        open={showAlert.open}
        title={showAlert.title}
        message={showAlert.message}
        onClose={() => setShowAlert({ open: false, title: "", message: "" })}
      />
    </>
  );
}
