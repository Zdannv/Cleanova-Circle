"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { sendOrderStatusEmail } from "../../../lib/mail";
import { createBiteshipOrder } from "../../../lib/biteship";
import type { OrderStatus } from "../../../generated/prisma/client";

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PACKED",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
];

// Transisi status yang diizinkan (fulfillment manual oleh admin).
// Pembayaran lunas otomatis -> PACKED (lewat webhook / verify), jadi admin
// mulai dari PACKED. Tidak ada lagi PENDING/PAID manual.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  PAID: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string,
  trackingNumber?: string
) {
  await verifyAdmin();

  if (!ALL_STATUSES.includes(newStatus as OrderStatus)) {
    throw new Error("Status tidak valid.");
  }
  const target = newStatus as OrderStatus;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, shippingEmail: true, shippingName: true, trackingNumber: true },
  });
  if (!order) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  const trimmedTracking = trackingNumber?.trim() || "";

  // Mengirim wajib pakai resi — tidak mungkin kirim tanpa nomor resi.
  if (target === "SHIPPED" && !trimmedTracking && !order.trackingNumber) {
    throw new Error("Nomor resi wajib diisi sebelum pesanan dikirim.");
  }

  // Kalau status sama tapi ada resi baru, tetap simpan resinya.
  if (order.status === target && !trimmedTracking) {
    return;
  }
  if (order.status !== target) {
    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(target)) {
      throw new Error(`Tidak bisa mengubah status dari ${order.status} ke ${target}.`);
    }
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: target,
      ...(trimmedTracking ? { trackingNumber: trimmedTracking } : {}),
    },
  });

  // Kirim email notifikasi untuk tahap fulfillment (best-effort).
  if (
    order.shippingEmail &&
    (target === "PACKED" || target === "SHIPPED" || target === "COMPLETED")
  ) {
    try {
      await sendOrderStatusEmail(order.shippingEmail, target, {
        orderId: order.id,
        customerName: order.shippingName,
        trackingNumber: trimmedTracking || order.trackingNumber,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[orders] gagal kirim email status:", err);
    }
  }

  revalidatePath("/admin/orders");
}

/**
 * Panggil kurir / pick-up via Biteship, lalu set status SHIPPED + simpan resi.
 * Mengembalikan { success, waybill?, error? } supaya UI bisa menampilkan hasil.
 */
export async function pickupBiteshipAction(orderId: string): Promise<{
  success: boolean;
  waybill?: string | null;
  error?: string;
}> {
  await verifyAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { OrderItem: true },
  });
  if (!order) {
    return { success: false, error: "Pesanan tidak ditemukan." };
  }
  if (order.status !== "PACKED") {
    return { success: false, error: "Hanya pesanan berstatus Dikemas yang bisa di-pickup." };
  }
  if (!order.courier || !order.courierService) {
    return { success: false, error: "Data kurir pesanan tidak lengkap." };
  }

  const result = await createBiteshipOrder(
    {
      id: order.id,
      shippingName: order.shippingName,
      shippingPhone: order.shippingPhone,
      shippingEmail: order.shippingEmail,
      shippingAddress: order.shippingAddress,
      destinationAreaId: order.destinationAreaId,
      destinationPostalCode: null,
      courier: order.courier,
      courierService: order.courierService,
      notes: order.notes,
    },
    order.OrderItem.map((it) => ({
      name: it.name,
      value: it.price,
      quantity: it.quantity,
      weight: 500, // berat snapshot tidak tersimpan per-item; fallback aman 500g/unit
    }))
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const waybill = result.waybill || result.trackingId || "";
  if (!waybill) {
    return { success: false, error: "Biteship tidak mengembalikan nomor resi." };
  }

  // Set status SHIPPED + simpan resi + kirim email resi ke pembeli.
  await updateOrderStatusAction(orderId, "SHIPPED", waybill);

  return { success: true, waybill };
}
