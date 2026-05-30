"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, formatRupiah } from "../CartContext";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

type Props = {
  isAuthenticated: boolean;
  defaultName: string;
  defaultPhone: string;
  defaultEmail: string;
};

type Area = {
  id: string;
  name: string;
  postal_code: number | string;
};

type Rate = {
  courier_code: string;
  courier_name: string;
  courier_service_code: string;
  courier_service_name: string;
  description?: string;
  duration?: string;
  price: number;
};

export default function CartClient({ defaultName, defaultPhone, defaultEmail }: Props) {
  const { items, totalQty, totalAmount, totalWeight, setQty, remove, clear, isHydrated } = useCart();
  const router = useRouter();

  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // --- Shipping (Biteship) ---
  const [areaQuery, setAreaQuery] = useState("");
  const [areaResults, setAreaResults] = useState<Area[]>([]);
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaLoading, setAreaLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  const [rates, setRates] = useState<Rate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [selectedRateKey, setSelectedRateKey] = useState<string>("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snapReady, setSnapReady] = useState<boolean>(false);

  const rateKey = (r: Rate) => `${r.courier_code}|${r.courier_service_code}`;
  const selectedRate = rates.find((r) => rateKey(r) === selectedRateKey) || null;
  const shippingCost = selectedRate?.price ?? 0;
  // Berat total minimal 1 gram; fallback 500g/item kalau data berat kosong (cart lama).
  const effectiveWeight = Math.max(totalWeight, items.length * 500, 1);
  const grandTotal = totalAmount + shippingCost;

  // Pre-fill ulang kalau session datang setelah render awal.
  useEffect(() => {
    if (defaultName && !name) setName(defaultName);
    if (defaultPhone && !phone) setPhone(defaultPhone);
    if (defaultEmail && !email) setEmail(defaultEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultName, defaultPhone, defaultEmail]);

  // Polling cek snap.js sudah load.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.snap) {
      setSnapReady(true);
      return;
    }
    const t = window.setInterval(() => {
      if (window.snap) {
        setSnapReady(true);
        window.clearInterval(t);
      }
    }, 250);
    return () => window.clearInterval(t);
  }, []);

  // Debounced autocomplete area.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Kalau sudah memilih area dan query masih sama, jangan cari lagi.
    if (selectedArea && areaQuery === selectedArea.name) return;
    if (areaQuery.trim().length < 3) {
      setAreaResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setAreaLoading(true);
      try {
        const res = await fetch(`/api/shipping/areas?input=${encodeURIComponent(areaQuery.trim())}`);
        const data = await res.json().catch(() => ({}));
        setAreaResults(Array.isArray(data?.areas) ? data.areas : []);
        setAreaOpen(true);
      } catch {
        setAreaResults([]);
      } finally {
        setAreaLoading(false);
      }
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaQuery]);

  // Ambil ongkir setiap kali area terpilih / isi keranjang berubah.
  useEffect(() => {
    if (!selectedArea) {
      setRates([]);
      setSelectedRateKey("");
      return;
    }
    let cancelled = false;
    const fetchRates = async () => {
      setRatesLoading(true);
      setRatesError(null);
      setRates([]);
      setSelectedRateKey("");
      try {
        const res = await fetch("/api/shipping/rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destinationAreaId: selectedArea.id,
            weight: effectiveWeight,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!data?.success || !Array.isArray(data.pricing) || data.pricing.length === 0) {
          setRatesError(data?.error || "Ongkir tidak tersedia untuk tujuan ini.");
          setRates([]);
        } else {
          const sorted = [...data.pricing].sort((a: Rate, b: Rate) => a.price - b.price);
          setRates(sorted);
        }
      } catch {
        if (!cancelled) setRatesError("Gagal mengambil ongkir. Coba lagi.");
      } finally {
        if (!cancelled) setRatesLoading(false);
      }
    };
    fetchRates();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArea, totalWeight, totalQty]);

  const handleSelectArea = (area: Area) => {
    setSelectedArea(area);
    setAreaQuery(area.name);
    setAreaOpen(false);
    setAreaResults([]);
  };

  const validate = (): string | null => {
    if (items.length === 0) return "Keranjang kosong.";
    if (!name.trim()) return "Nama lengkap wajib diisi.";
    if (!email.trim()) return "Email wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Format email tidak valid.";
    if (!phone.trim()) return "Nomor HP wajib diisi.";
    if (!/^[0-9+\s-]{8,20}$/.test(phone.trim())) return "Nomor HP tidak valid.";
    if (!selectedArea) return "Pilih kecamatan / kode pos tujuan terlebih dahulu.";
    if (!address.trim() || address.trim().length < 10) return "Alamat lengkap (jalan/detail) minimal 10 karakter.";
    if (!selectedRate) return "Pilih kurir pengiriman terlebih dahulu.";
    return null;
  };

  const handleCheckout = async () => {
    setErrorMsg(null);
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }
    if (!snapReady || !window.snap) {
      setErrorMsg("Modul pembayaran belum siap. Coba lagi sebentar.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Gabungkan area + alamat detail untuk shippingAddress.
      const fullAddress = `${address.trim()} — ${selectedArea!.name}`;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
          shipping: {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            address: fullAddress,
            notes: notes.trim() || undefined,
            destinationAreaId: selectedArea!.id,
            shippingCost,
            courier: selectedRate!.courier_code,
            courierService: selectedRate!.courier_service_code,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Checkout gagal (${res.status}).`);
      }
      if (!data?.token) throw new Error("Token pembayaran tidak diterima.");

      const orderId = data.orderId as string;

      const verifyPayment = async () => {
        try {
          await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          });
        } catch {
          // abaikan — webhook tetap akan menyinkronkan saat di produksi
        }
      };

      window.snap.pay(data.token, {
        onSuccess: async () => {
          await verifyPayment();
          clear();
          alert("Pembayaran berhasil! Pesanan Anda otomatis masuk tahap dikemas. Bukti pembayaran dikirim ke email Anda.");
          router.push(`/shop?paid=${encodeURIComponent(orderId)}`);
        },
        onPending: async () => {
          await verifyPayment();
          clear();
          alert("Pembayaran sedang diproses. Status order akan otomatis ter-update setelah pembayaran selesai.");
          router.push(`/shop?pending=${encodeURIComponent(orderId)}`);
        },
        onError: (result) => {
          // eslint-disable-next-line no-console
          console.error("[snap] error:", result);
          setErrorMsg("Pembayaran gagal. Silakan coba metode pembayaran lain.");
          setIsSubmitting(false);
        },
        onClose: () => {
          setIsSubmitting(false);
        },
      });
    } catch (e: any) {
      setErrorMsg(e?.message || "Terjadi kesalahan saat checkout.");
      setIsSubmitting(false);
    }
  };

  // Loading skeleton saat hydrate.
  if (!isHydrated) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 w-40 bg-stone-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-stone-100 rounded-2xl animate-pulse" />)}
          </div>
          <div className="h-64 bg-stone-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-500 font-semibold">Cleanova Shop</p>
        <h1 className="text-3xl md:text-4xl font-serif font-light tracking-tight">
          Keranjang <span className="italic text-amber-600 dark:text-amber-500 font-medium">Belanja</span>
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 font-light">
          Pastikan barang dan data pengiriman Anda sudah benar sebelum checkout.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="border border-dashed border-stone-300 dark:border-stone-700 rounded-3xl py-20 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 mx-auto grid place-items-center text-stone-400">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272" />
            </svg>
          </div>
          <p className="text-stone-500">Keranjang Anda masih kosong.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 mt-2 px-5 py-2.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-amber-600 transition-colors dark:bg-white dark:text-stone-900"
          >
            Mulai Belanja
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT — Items + Shipping */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
                <h2 className="font-semibold text-sm">Item Pesanan ({totalQty})</h2>
                <button
                  type="button"
                  onClick={() => { if (confirm("Kosongkan keranjang?")) clear(); }}
                  className="text-xs text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Kosongkan
                </button>
              </div>
              <ul className="divide-y divide-stone-200 dark:divide-stone-800">
                {items.map((it) => (
                  <li key={it.productId} className="p-5 flex gap-4 items-start">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0">
                      {it.imageUrl ? (
                        <Image src={it.imageUrl} alt={it.name} fill sizes="80px" className="object-contain p-1.5" unoptimized />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm text-stone-900 dark:text-white line-clamp-2">{it.name}</h3>
                          <p className="text-xs text-stone-500 mt-0.5">{formatRupiah(it.price)} / unit</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(it.productId)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1 -mr-1"
                          aria-label="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="inline-flex items-center border border-stone-300 dark:border-stone-700 rounded-full overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setQty(it.productId, it.quantity - 1)}
                            disabled={it.quantity <= 1}
                            className="w-8 h-8 grid place-items-center text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30"
                            aria-label="Kurangi"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-semibold tabular-nums">{it.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQty(it.productId, it.quantity + 1)}
                            disabled={it.quantity >= it.stock}
                            className="w-8 h-8 grid place-items-center text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30"
                            aria-label="Tambah"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm font-semibold tabular-nums text-stone-900 dark:text-white">
                          {formatRupiah(it.price * it.quantity)}
                        </p>
                      </div>

                      {it.quantity >= it.stock && (
                        <p className="text-[11px] text-amber-600 font-medium">Maksimal stok ({it.stock}) tercapai</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Shipping form */}
            <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800">
                <h2 className="font-semibold text-sm">Data Pengiriman</h2>
                <p className="text-[11px] text-stone-500 mt-0.5">Wajib diisi sebelum checkout.</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="ship-name" className="block text-xs font-medium text-stone-700 dark:text-stone-300">Nama Lengkap</label>
                    <input
                      id="ship-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="ship-phone" className="block text-xs font-medium text-stone-700 dark:text-stone-300">No. HP</label>
                    <input
                      id="ship-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="08123456789"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="ship-email" className="block text-xs font-medium text-stone-700 dark:text-stone-300">Email</label>
                  <input
                    id="ship-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="email@anda.com"
                  />
                  <p className="text-[11px] text-stone-500">Untuk pengiriman bukti pembayaran dan update resi.</p>
                </div>

                {/* Area autocomplete */}
                <div className="space-y-1.5 relative">
                  <label htmlFor="ship-area" className="block text-xs font-medium text-stone-700 dark:text-stone-300">Kecamatan / Kode Pos Tujuan</label>
                  <div className="relative">
                    <input
                      id="ship-area"
                      type="text"
                      value={areaQuery}
                      onChange={(e) => {
                        setAreaQuery(e.target.value);
                        setSelectedArea(null);
                      }}
                      onFocus={() => { if (areaResults.length > 0) setAreaOpen(true); }}
                      autoComplete="off"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Ketik kecamatan atau kode pos, mis. Cilandak / 12430"
                    />
                    {areaLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-4 h-4 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      </div>
                    )}
                    {selectedArea && !areaLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {areaOpen && areaResults.length > 0 && !selectedArea && (
                    <ul className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg">
                      {areaResults.map((area) => (
                        <li key={area.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectArea(area)}
                            className="w-full text-left px-4 py-2.5 text-xs text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors border-b border-stone-100 dark:border-stone-800 last:border-0"
                          >
                            {area.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!selectedArea && (
                    <p className="text-[11px] text-stone-500">Pilih dari daftar yang muncul agar ongkir bisa dihitung.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ship-address" className="block text-xs font-medium text-stone-700 dark:text-stone-300">Alamat Lengkap (Jalan, No. Rumah, RT/RW, Patokan)</label>
                  <textarea
                    id="ship-address"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y"
                    placeholder="Jl. Mawar No. 12, RT 8/RW 4, dekat masjid An-Nur"
                  />
                </div>

                {/* Courier rates */}
                {selectedArea && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">Pilih Kurir</label>

                    {ratesLoading && (
                      <div className="flex items-center gap-2 text-xs text-stone-500 py-3">
                        <svg className="w-4 h-4 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Menghitung ongkir…
                      </div>
                    )}

                    {!ratesLoading && ratesError && (
                      <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/40 rounded-xl text-xs">
                        ⚠ {ratesError}
                      </div>
                    )}

                    {!ratesLoading && !ratesError && rates.length > 0 && (
                      <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {rates.map((r) => {
                          const key = rateKey(r);
                          const active = key === selectedRateKey;
                          return (
                            <li key={key}>
                              <button
                                type="button"
                                onClick={() => setSelectedRateKey(key)}
                                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                  active
                                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-500"
                                    : "border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600"
                                }`}
                              >
                                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 grid place-items-center ${active ? "border-amber-500" : "border-stone-300"}`}>
                                  {active && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                                </span>
                                <span className="flex-1 min-w-0">
                                  <span className="block text-xs font-semibold text-stone-900 dark:text-white">
                                    {r.courier_name} · {r.courier_service_name}
                                  </span>
                                  <span className="block text-[11px] text-stone-500">
                                    {r.duration ? `Estimasi ${r.duration}` : r.description || "—"}
                                  </span>
                                </span>
                                <span className="text-sm font-bold text-stone-900 dark:text-white whitespace-nowrap">
                                  {formatRupiah(r.price)}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="ship-notes" className="block text-xs font-medium text-stone-700 dark:text-stone-300">Catatan (opsional)</label>
                  <input
                    id="ship-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Titip ke security, dll."
                  />
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT — Summary */}
          <aside className="lg:sticky lg:top-24">
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800">
                <h2 className="font-semibold text-sm">Ringkasan Pesanan</h2>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal ({totalQty} item)</span>
                  <span className="font-medium tabular-nums">{formatRupiah(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Ongkir</span>
                  {selectedRate ? (
                    <span className="font-medium tabular-nums">{formatRupiah(shippingCost)}</span>
                  ) : (
                    <span className="text-xs text-stone-400 italic">Pilih kurir dulu</span>
                  )}
                </div>
                {selectedRate && (
                  <p className="text-[11px] text-stone-400 -mt-1">
                    {selectedRate.courier_name} · {selectedRate.courier_service_name}
                  </p>
                )}
                <div className="border-t border-stone-200 dark:border-stone-800 pt-3 flex justify-between items-baseline">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-amber-600 tabular-nums">{formatRupiah(grandTotal)}</span>
                </div>

                {errorMsg && (
                  <div className="mt-3 p-3 bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/40 rounded-xl text-xs font-medium">
                    ⚠ {errorMsg}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting || items.length === 0 || !selectedRate}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold uppercase tracking-widest rounded-full transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Memproses…
                    </>
                  ) : (
                    <>
                      Checkout
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>

                {!snapReady && (
                  <p className="text-[10px] text-stone-400 text-center">Memuat modul pembayaran…</p>
                )}

                <p className="text-[10px] text-stone-400 text-center pt-2 leading-relaxed">
                  Pembayaran diproses oleh Midtrans. Status pesanan akan otomatis ter-update setelah pembayaran selesai.
                </p>
              </div>
            </div>

            <Link
              href="/shop"
              className="block text-center mt-4 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              ← Lanjutkan belanja
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
