"use client";

import { useMemo, useState, useTransition, Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { updateOrderStatusAction, pickupBiteshipAction } from "./actions";

type OrderStatus = "PENDING" | "PAID" | "PACKED" | "SHIPPED" | "COMPLETED" | "CANCELLED";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

type Order = {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  shippingCost: number;
  shippingName: string;
  shippingPhone: string;
  shippingEmail: string | null;
  shippingAddress: string;
  courier: string | null;
  courierService: string | null;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
};

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const STATUS_META: Record<OrderStatus, { label: string; badge: string }> = {
  PENDING: { label: "Belum Dibayar", badge: "bg-stone-100 text-stone-600" },
  PAID: { label: "Dibayar", badge: "bg-blue-100 text-blue-800" },
  PACKED: { label: "Dikemas", badge: "bg-indigo-100 text-indigo-800" },
  SHIPPED: { label: "Dikirim", badge: "bg-purple-100 text-purple-800" },
  COMPLETED: { label: "Selesai", badge: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "Dibatalkan", badge: "bg-rose-100 text-rose-700" },
};

// Transisi yang diizinkan — mirror dari server action.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  PAID: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

const FILTERS: { key: "ALL" | OrderStatus; label: string }[] = [
  { key: "ALL", label: "Semua" },
  { key: "PACKED", label: "Dikemas" },
  { key: "SHIPPED", label: "Dikirim" },
  { key: "COMPLETED", label: "Selesai" },
  { key: "PENDING", label: "Belum Dibayar" },
  { key: "CANCELLED", label: "Batal" },
];

export default function OrdersClient({
  orders,
  adminName,
}: {
  orders: Order[];
  adminName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "ALL" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] || 0) + 1;
    return c;
  }, [orders]);

  const handleChange = (orderId: string, newStatus: OrderStatus) => {
    setErrorMsg(null);
    setPendingId(orderId);
    startTransition(async () => {
      try {
        await updateOrderStatusAction(orderId, newStatus);
      } catch (err: any) {
        setErrorMsg(err?.message || "Gagal mengubah status.");
      } finally {
        setPendingId(null);
      }
    });
  };

  const handlePickup = (orderId: string) => {
    if (!confirm("Panggil kurir untuk pesanan ini? Resi akan dibuat otomatis via Biteship dan status menjadi Dikirim.")) {
      return;
    }
    setErrorMsg(null);
    setPendingId(orderId);
    startTransition(async () => {
      try {
        const result = await pickupBiteshipAction(orderId);
        if (!result.success) {
          setErrorMsg(result.error || "Gagal memanggil kurir.");
        } else {
          alert(`Kurir berhasil dipanggil. Nomor resi: ${result.waybill}`);
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Gagal memanggil kurir.");
      } finally {
        setPendingId(null);
      }
    });
  };

  const handleManualShip = (orderId: string) => {
    const input = window.prompt(
      "Masukkan nomor resi pengiriman.\nStatus pesanan akan menjadi 'Dikirim' dan email berisi nomor resi akan otomatis dikirim ke pelanggan."
    );
    if (input === null) return; // batal
    const tracking = input.trim();
    if (!tracking) {
      setErrorMsg("Nomor resi tidak boleh kosong.");
      return;
    }
    setErrorMsg(null);
    setPendingId(orderId);
    startTransition(async () => {
      try {
        await updateOrderStatusAction(orderId, "SHIPPED", tracking);
        alert(`Pesanan ditandai Dikirim dengan resi: ${tracking}. Email pelacakan telah dikirim ke pelanggan.`);
      } catch (err: any) {
        setErrorMsg(err?.message || "Gagal menyimpan resi.");
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke CMS
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-base md:text-lg font-bold tracking-wide">Manajemen Pesanan</h1>
          </div>
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full ring-1 ring-gray-200">
            Admin: {adminName}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 relative">
        {isPending && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-start justify-center pt-32">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm">
            ⚠ {errorMsg}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filter === f.key ? "bg-white/20" : "bg-gray-100"}`}>
                {counts[f.key] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-base font-semibold">Daftar Pesanan</h2>
            <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">
              {filtered.length} pesanan
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">Tidak ada pesanan pada filter ini.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-5 py-4">Order</th>
                    <th className="px-5 py-4">Tanggal</th>
                    <th className="px-5 py-4">Pembeli</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4 text-right">Total</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 w-56">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((o) => {
                    const meta = STATUS_META[o.status];
                    const nextOptions = ALLOWED_TRANSITIONS[o.status];
                    const isRowPending = pendingId === o.id;
                    const isExpanded = expanded === o.id;
                    return (
                      <Fragment key={o.id}>
                        <tr className="hover:bg-gray-50 align-top">
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => setExpanded(isExpanded ? null : o.id)}
                              className="text-left group"
                            >
                              <div className="text-sm font-mono font-semibold text-gray-900 flex items-center gap-1.5">
                                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                                #{o.id.slice(0, 8)}
                              </div>
                              <div className="text-[11px] text-gray-400 mt-0.5 ml-5">{o.items.length} item</div>
                            </button>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                          <td className="px-5 py-4">
                            <div className="text-sm font-medium text-gray-900">{o.shippingName}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{o.shippingPhone}</div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {o.shippingEmail || <span className="text-gray-400 italic">—</span>}
                          </td>
                          <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {formatRupiah(o.totalAmount)}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${meta.badge}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {nextOptions.length === 0 ? (
                              <span className="text-xs text-gray-400 italic">Status final</span>
                            ) : (
                              <div className="space-y-2">
                                <select
                                  value={o.status}
                                  disabled={isRowPending}
                                  onChange={(e) => {
                                    const v = e.target.value as OrderStatus;
                                    if (v !== o.status) handleChange(o.id, v);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-medium rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 disabled:opacity-50 cursor-pointer"
                                >
                                  <option value={o.status} disabled>
                                    {STATUS_META[o.status].label} (saat ini)
                                  </option>
                                  {nextOptions.map((s) => (
                                    <option key={s} value={s}>
                                      Ubah ke: {STATUS_META[s].label}
                                    </option>
                                  ))}
                                </select>

                                {o.status === "PACKED" && o.courier && o.courier !== "flat" && (
                                  <button
                                    type="button"
                                    onClick={() => handlePickup(o.id)}
                                    disabled={isRowPending}
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                    </svg>
                                    Panggil Kurir
                                  </button>
                                )}

                                {o.status === "PACKED" && (
                                  <button
                                    type="button"
                                    onClick={() => handleManualShip(o.id)}
                                    disabled={isRowPending}
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-50"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                    Kirim Manual (input resi)
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${o.id}-detail`} className="bg-gray-50/60">
                            <td colSpan={7} className="px-5 py-5">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Items */}
                                <div className="lg:col-span-2 space-y-3">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Item Pesanan</h4>
                                  <ul className="space-y-2">
                                    {o.items.map((it) => (
                                      <li key={it.id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-2.5">
                                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                          {it.imageUrl ? (
                                            <Image src={it.imageUrl} alt={it.name} fill sizes="48px" className="object-cover" unoptimized />
                                          ) : null}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-gray-900 line-clamp-1">{it.name}</div>
                                          <div className="text-xs text-gray-500">{formatRupiah(it.price)} × {it.quantity}</div>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                          {formatRupiah(it.price * it.quantity)}
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Shipping info */}
                                <div className="space-y-3">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Detail Pengiriman</h4>
                                  <dl className="bg-white rounded-lg border border-gray-200 p-3 text-sm space-y-2">
                                    <div>
                                      <dt className="text-[11px] text-gray-400 uppercase tracking-wider">Order ID</dt>
                                      <dd className="font-mono text-xs text-gray-900 break-all">{o.id}</dd>
                                    </div>
                                    <div>
                                      <dt className="text-[11px] text-gray-400 uppercase tracking-wider">Penerima</dt>
                                      <dd className="text-gray-900">{o.shippingName} · {o.shippingPhone}</dd>
                                    </div>
                                    <div>
                                      <dt className="text-[11px] text-gray-400 uppercase tracking-wider">Alamat</dt>
                                      <dd className="text-gray-700 leading-relaxed">{o.shippingAddress}</dd>
                                    </div>
                                    <div>
                                      <dt className="text-[11px] text-gray-400 uppercase tracking-wider">Kurir</dt>
                                      <dd className="text-gray-700">
                                        {o.courier
                                          ? `${o.courier.toUpperCase()} ${(o.courierService || "").toUpperCase()} · ${formatRupiah(o.shippingCost)}`
                                          : "—"}
                                      </dd>
                                    </div>
                                    {o.trackingNumber && (
                                      <div>
                                        <dt className="text-[11px] text-gray-400 uppercase tracking-wider">No. Resi</dt>
                                        <dd className="font-mono text-sm font-semibold text-indigo-700 break-all">{o.trackingNumber}</dd>
                                      </div>
                                    )}
                                    {o.notes && (
                                      <div>
                                        <dt className="text-[11px] text-gray-400 uppercase tracking-wider">Catatan</dt>
                                        <dd className="text-gray-700">{o.notes}</dd>
                                      </div>
                                    )}
                                  </dl>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
