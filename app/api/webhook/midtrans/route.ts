import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import prisma from "../../../../lib/prisma";
import { coreApi, serverKey } from "../../../../lib/midtrans";
import type { OrderStatus } from "../../../../generated/prisma/client";

/**
 * Midtrans HTTP Notification (webhook) handler.
 *
 * Logika:
 * - Verifikasi signature_key (SHA512 dari order_id + status_code + gross_amount + serverKey).
 * - Ambil status resmi via Midtrans CoreApi.transaction.notification untuk mencegah
 *   payload palsu walaupun signature lulus (defense in depth).
 * - Mapping ke Prisma OrderStatus:
 *     settlement / capture (accept) -> PAID  (a.k.a. SUCCESS)
 *     pending                       -> PENDING
 *     deny / cancel / expire        -> CANCELLED (a.k.a. FAILED)
 *     refund / partial_refund / chargeback -> CANCELLED
 * - Idempoten: kalau order sudah SHIPPED / COMPLETED, jangan turunkan statusnya.
 */

function verifySignature(payload: any): boolean {
  if (!serverKey) return false;
  const { order_id, status_code, gross_amount, signature_key } = payload || {};
  if (!order_id || !status_code || !gross_amount || !signature_key) return false;

  const raw = `${order_id}${status_code}${gross_amount}${serverKey}`;
  const expected = createHash("sha512").update(raw).digest("hex");
  return expected === signature_key;
}

function mapStatus(payload: {
  transaction_status?: string;
  fraud_status?: string;
}): OrderStatus | null {
  const status = payload.transaction_status;
  const fraud = payload.fraud_status;

  if (status === "settlement") return "PAID";
  if (status === "capture") {
    return fraud === "accept" ? "PAID" : "PENDING";
  }
  if (status === "pending") return "PENDING";
  if (status === "deny" || status === "cancel" || status === "expire") return "CANCELLED";
  if (status === "refund" || status === "partial_refund" || status === "chargeback") return "CANCELLED";
  if (status === "failure") return "CANCELLED";
  return null;
}

export async function POST(req: NextRequest) {
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 1. Verifikasi signature.
  if (!verifySignature(payload)) {
    // eslint-disable-next-line no-console
    console.warn("[midtrans-webhook] invalid signature for order", payload?.order_id);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 2. Re-verify ke Midtrans (defense in depth).
  let verified: any = payload;
  try {
    verified = await coreApi.transaction.notification(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[midtrans-webhook] gagal verifikasi ke Midtrans:", err);
    // Tetap lanjut pakai payload signed kalau verifikasi network gagal — Midtrans akan retry juga.
  }

  const orderId: string | undefined = verified?.order_id || payload.order_id;
  if (!orderId) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  const newStatus = mapStatus(verified);
  if (!newStatus) {
    // Status tidak kita tangani — Midtrans tetap perlu 200 OK supaya tidak retry forever.
    return NextResponse.json({ ok: true, ignored: verified?.transaction_status });
  }

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, totalAmount: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Sanity check jumlah (mencegah replay dengan amount berbeda).
  const grossAmount = Number(verified?.gross_amount || payload.gross_amount);
  if (Number.isFinite(grossAmount) && grossAmount !== existing.totalAmount) {
    // eslint-disable-next-line no-console
    console.warn(
      `[midtrans-webhook] gross_amount mismatch for ${orderId}: got ${grossAmount}, expected ${existing.totalAmount}`
    );
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  // 3. Idempotency — jangan timpa status terminal.
  if (existing.status === "SHIPPED" || existing.status === "COMPLETED") {
    return NextResponse.json({ ok: true, status: existing.status, kept: true });
  }
  if (existing.status === newStatus) {
    return NextResponse.json({ ok: true, status: existing.status, unchanged: true });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  // 4. Decrement stok kalau pertama kali masuk PAID.
  if (newStatus === "PAID" && existing.status !== "PAID") {
    const items = await prisma.orderItem.findMany({
      where: { orderId },
      select: { productId: true, quantity: true },
    });
    if (items.length > 0) {
      await prisma.$transaction(
        items.map((it) =>
          prisma.product.update({
            where: { id: it.productId },
            data: { stock: { decrement: it.quantity } },
          })
        )
      );
    }
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
