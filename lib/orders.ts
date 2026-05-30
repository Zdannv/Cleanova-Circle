import prisma from "./prisma";
import { coreApi } from "./midtrans";
import { sendInvoiceEmail } from "./mail";

/**
 * Sinkronisasi status pembayaran sebuah Order langsung dari Midtrans Core API.
 *
 * Dipakai oleh:
 *  - Webhook Midtrans (saat server Midtrans mengirim notifikasi)
 *  - Endpoint verifikasi frontend (fallback saat webhook tidak bisa menjangkau
 *    localhost / belum dikonfigurasi)
 *
 * Alur status:
 *  - Pembayaran lunas (settlement / capture+accept) -> order langsung jadi PACKED
 *    (otomatis "dikemas"), stok dikurangi sekali, dan email invoice dikirim.
 *  - Gagal (deny/cancel/expire/failure/refund/chargeback) -> CANCELLED.
 *  - Masih pending -> biarkan PENDING.
 *
 * Idempoten: aman dipanggil berkali-kali (webhook + frontend bisa dobel).
 */

type SyncResult = {
  ok: boolean;
  status?: string;
  changed?: boolean;
  reason?: string;
};

function isPaidStatus(transactionStatus?: string, fraudStatus?: string): boolean {
  if (transactionStatus === "settlement") return true;
  if (transactionStatus === "capture" && fraudStatus === "accept") return true;
  return false;
}

function isFailedStatus(transactionStatus?: string): boolean {
  return (
    transactionStatus === "deny" ||
    transactionStatus === "cancel" ||
    transactionStatus === "expire" ||
    transactionStatus === "failure"
  );
}

export async function syncOrderPaymentStatus(orderId: string): Promise<SyncResult> {
  if (!orderId) return { ok: false, reason: "no orderId" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { OrderItem: true },
  });
  if (!order) return { ok: false, reason: "order not found" };

  // Sudah melewati tahap pembayaran — tidak perlu disinkron lagi.
  if (
    order.status === "PACKED" ||
    order.status === "SHIPPED" ||
    order.status === "COMPLETED" ||
    order.status === "CANCELLED"
  ) {
    return { ok: true, status: order.status, changed: false, reason: "already settled" };
  }

  // Tanya status resmi ke Midtrans.
  let midtrans: any;
  try {
    midtrans = await coreApi.transaction.status(orderId);
  } catch (err: any) {
    // 404 = transaksi belum ada di Midtrans (belum bayar). Bukan error fatal.
    // eslint-disable-next-line no-console
    console.warn(`[orders] gagal cek status Midtrans untuk ${orderId}:`, err?.message || err);
    return { ok: false, status: order.status, changed: false, reason: "midtrans status unavailable" };
  }

  const txStatus: string | undefined = midtrans?.transaction_status;
  const fraud: string | undefined = midtrans?.fraud_status;

  // Validasi nominal (cegah manipulasi).
  const gross = Number(midtrans?.gross_amount);
  if (Number.isFinite(gross) && gross !== order.totalAmount) {
    // eslint-disable-next-line no-console
    console.warn(`[orders] gross_amount mismatch untuk ${orderId}: ${gross} != ${order.totalAmount}`);
    return { ok: false, status: order.status, changed: false, reason: "amount mismatch" };
  }

  // PEMBAYARAN LUNAS -> PACKED
  if (isPaidStatus(txStatus, fraud)) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PACKED" },
    });

    // Kurangi stok sekali (transisi dari PENDING).
    if (order.OrderItem.length > 0) {
      await prisma.$transaction(
        order.OrderItem.map((it) =>
          prisma.product.update({
            where: { id: it.productId },
            data: { stock: { decrement: it.quantity } },
          })
        )
      );
    }

    // Kirim email invoice + notifikasi sedang dikemas (best-effort).
    if (order.shippingEmail) {
      try {
        await sendInvoiceEmail(order.shippingEmail, {
          orderId: order.id,
          customerName: order.shippingName,
          totalAmount: order.totalAmount,
          shippingAddress: order.shippingAddress,
          items: order.OrderItem.map((it) => ({
            name: it.name,
            price: it.price,
            quantity: it.quantity,
          })),
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[orders] gagal kirim invoice email ${orderId}:`, err);
      }
    }

    return { ok: true, status: "PACKED", changed: true };
  }

  // GAGAL -> CANCELLED
  if (isFailedStatus(txStatus)) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
    return { ok: true, status: "CANCELLED", changed: true };
  }

  // Masih pending — tidak ada perubahan.
  return { ok: true, status: order.status, changed: false, reason: "still pending" };
}
