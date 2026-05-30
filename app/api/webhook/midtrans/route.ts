import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { serverKey } from "../../../../lib/midtrans";
import { syncOrderPaymentStatus } from "../../../../lib/orders";

/**
 * Midtrans HTTP Notification (webhook) handler.
 *
 * - Verifikasi signature_key (SHA512 dari order_id + status_code + gross_amount + serverKey).
 * - Delegasikan update status ke syncOrderPaymentStatus() yang mengambil status resmi
 *   langsung dari Midtrans Core API (defense in depth) dan menangani:
 *     lunas    -> PACKED (otomatis dikemas) + kurangi stok + email invoice
 *     gagal    -> CANCELLED
 *     pending  -> tetap PENDING
 * - Idempoten & fault-tolerant: SELALU membalas HTTP 200 supaya Midtrans tidak
 *   menandai endpoint sebagai gagal / retry tanpa henti. Error internal hanya di-log.
 */

// Health-check: bisa dibuka di browser untuk memastikan endpoint reachable.
export async function GET() {
  return NextResponse.json({ ok: true, service: "midtrans-webhook", alive: true });
}

function verifySignature(payload: any): boolean {
  if (!serverKey) return false;
  const { order_id, status_code, gross_amount, signature_key } = payload || {};
  if (!order_id || !status_code || !gross_amount || !signature_key) return false;

  const raw = `${order_id}${status_code}${gross_amount}${serverKey}`;
  const expected = createHash("sha512").update(raw).digest("hex");
  return expected === signature_key;
}

export async function POST(req: NextRequest) {
  try {
    let payload: any;
    try {
      payload = await req.json();
    } catch {
      // Body bukan JSON valid — tetap balas 200 supaya tidak dianggap gagal.
      return NextResponse.json({ ok: true, ignored: "invalid json" });
    }

    const orderId: string | undefined = payload?.order_id;

    // Notifikasi "Test" dari dashboard Midtrans memakai order_id dummy
    // (mis. "payment_notif_test_xxx") yang tidak ada di database. Balas 200 OK
    // supaya tombol "Test notification URL" sukses.
    if (!orderId || orderId.startsWith("payment_notif_test")) {
      return NextResponse.json({ ok: true, test: true });
    }

    // Verifikasi signature. Kalau gagal, jangan proses — tapi tetap balas 200.
    if (!verifySignature(payload)) {
      // eslint-disable-next-line no-console
      console.warn("[midtrans-webhook] invalid signature for order", orderId);
      return NextResponse.json({ ok: true, ignored: "invalid signature" });
    }

    // Sinkronisasi status (status resmi diambil ulang dari Midtrans di dalam helper).
    const result = await syncOrderPaymentStatus(orderId);
    return NextResponse.json({ ...result, ok: true });
  } catch (err) {
    // Jangan pernah lempar 500 ke Midtrans — cukup log, balas 200.
    // eslint-disable-next-line no-console
    console.error("[midtrans-webhook] unhandled error:", err);
    return NextResponse.json({ ok: true, error: "logged" });
  }
}
