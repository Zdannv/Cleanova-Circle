// Wrapper kecil di atas midtrans-client agar import-nya tipe-aman.
// midtrans-client tidak ship .d.ts, jadi kita require lewat eval-style import.
import midtransClient from "midtrans-client";

export const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
export const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
export const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";

if (!serverKey || !clientKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[midtrans] MIDTRANS_SERVER_KEY / MIDTRANS_CLIENT_KEY belum diset. Checkout akan gagal sampai variabel ini tersedia."
  );
}

// Snap API — generate transaction token untuk Snap.js di frontend.
export const snap = new (midtransClient as any).Snap({
  isProduction,
  serverKey,
  clientKey,
});

// Core API — bisa dipakai untuk verifikasi status transaksi (status check di webhook).
export const coreApi = new (midtransClient as any).CoreApi({
  isProduction,
  serverKey,
  clientKey,
});
