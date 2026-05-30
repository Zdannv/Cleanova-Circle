"use client";

import { useEffect, useState } from "react";
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

export default function CartClient({ isAuthenticated, defaultName, defaultPhone, defaultEmail }: Props) {
  const { items, totalQty, totalAmount, setQty, remove, clear, isHydrated } = useCart();
  const router = useRouter();

  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snapReady, setSnapReady] = useState<boolean>(false);

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

  const validate = (): string | null => {
    if (items.length === 0) return "Keranjang kosong.";
    if (!name.trim()) return "Nama lengkap wajib diisi.";
    if (!email.trim()) return "Email wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Format email tidak valid.";
    if (!phone.trim()) return "Nomor HP wajib diisi.";
    if (!/^[0-9+\s-]{8,20}$/.test(phone.trim())) return "Nomor HP tidak valid.";
    if (!address.trim() || address.trim().length < 10) return "Alamat lengkap minimal 10 karakter.";
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
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
          shipping: {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            address: address.trim(),
            notes: notes.trim() || undefined,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Checkout gagal (${res.status}).`);
      }
      if (!data?.token) throw new Error("Token pembayaran tidak diterima.");

      const orderId = data.orderId as string;

      // Helper: verifikasi status pembayaran ke server (fallback webhook,
      // penting di localhost di mana webhook Midtrans tidak bisa menjangkau app).
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
          // User menutup popup tanpa membayar — biarkan keranjang.
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

      {/* Optional login banner — guest checkout tetap bisa, login hanya untuk auto-fill & riwayat */}
      {!isAuthenticated && (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Belanja sebagai tamu? Silakan lanjut ke checkout. <Link href="/login?callbackUrl=/shop/cart" className="text-amber-700 dark:text-amber-500 font-medium underline-offset-2 hover:underline">Login</Link> untuk auto-fill data dan riwayat pesanan.
            </p>
          </div>
        </div>
      )}

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
                <div className="space-y-1.5">
                  <label htmlFor="ship-address" className="block text-xs font-medium text-stone-700 dark:text-stone-300">Alamat Lengkap</label>
                  <textarea
                    id="ship-address"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y"
                    placeholder="Jl. Mawar No. 12, Kel. Cipete, Kec. Cilandak, Jakarta Selatan, 12420"
                  />
                </div>
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
                <div className="flex justify-between">
                  <span className="text-stone-500">Ongkir</span>
                  <span className="text-xs text-stone-400 italic">Dihitung saat pembayaran</span>
                </div>
                <div className="border-t border-stone-200 dark:border-stone-800 pt-3 flex justify-between items-baseline">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-amber-600 tabular-nums">{formatRupiah(totalAmount)}</span>
                </div>

                {errorMsg && (
                  <div className="mt-3 p-3 bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/40 rounded-xl text-xs font-medium">
                    ⚠ {errorMsg}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting || items.length === 0}
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
