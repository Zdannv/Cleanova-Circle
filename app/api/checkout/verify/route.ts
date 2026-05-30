import { NextRequest, NextResponse } from "next/server";
import { syncOrderPaymentStatus } from "../../../../lib/orders";

/**
 * Verifikasi status pembayaran dari frontend (fallback webhook).
 *
 * Dipanggil oleh halaman cart pada callback Snap onSuccess/onPending.
 * Berguna terutama di localhost di mana webhook Midtrans tidak bisa
 * menjangkau aplikasi. Aman & idempoten — status resmi tetap diambil
 * langsung dari Midtrans Core API, bukan dipercaya dari client.
 */
export async function POST(req: NextRequest) {
  let body: { orderId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderId = body?.orderId?.trim();
  if (!orderId) {
    return NextResponse.json({ error: "orderId wajib diisi." }, { status: 400 });
  }

  const result = await syncOrderPaymentStatus(orderId);
  return NextResponse.json(result, { status: result.ok ? 200 : 202 });
}
