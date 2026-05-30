import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { redirect } from "next/navigation";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      OrderItem: true,
    },
  });

  // Serialisasi agar aman dikirim ke client component.
  const serial = orders.map((o) => ({
    id: o.id,
    status: o.status,
    totalAmount: o.totalAmount,
    shippingCost: o.shippingCost,
    shippingName: o.shippingName,
    shippingPhone: o.shippingPhone,
    shippingEmail: o.shippingEmail,
    shippingAddress: o.shippingAddress,
    courier: o.courier,
    courierService: o.courierService,
    trackingNumber: o.trackingNumber,
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
    items: o.OrderItem.map((it) => ({
      id: it.id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      imageUrl: it.imageUrl,
    })),
  }));

  return <OrdersClient orders={serial} adminName={session.user.name || "Admin"} />;
}
