"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { sendOrderStatusEmail } from "../../../lib/mail";
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

// Transisi status yang diizinkan (fulfillment forward + cancel).
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
  await verifyAdmin();

  if (!ALL_STATUSES.includes(newStatus as OrderStatus)) {
    throw new Error("Status tidak valid.");
  }
  const target = newStatus as OrderStatus;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, shippingEmail: true, shippingName: true },
  });
  if (!order) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  if (order.status === target) {
    return; // tidak ada perubahan
  }

  const allowed = ALLOWED_TRANSITIONS[order.status] || [];
  if (!allowed.includes(target)) {
    throw new Error(`Tidak bisa mengubah status dari ${order.status} ke ${target}.`);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: target },
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
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[orders] gagal kirim email status:", err);
    }
  }

  revalidatePath("/admin/orders");
}
