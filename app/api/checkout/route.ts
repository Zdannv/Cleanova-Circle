import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { snap } from "../../../lib/midtrans";

type CartItem = {
  productId: string;
  quantity: number;
};

type CheckoutBody = {
  items: CartItem[];
  shipping: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
  };
};

export async function POST(req: NextRequest) {
  // Guest checkout — tidak wajib login. Kalau kebetulan login, kita catat userId.
  const session = await getServerSession(authOptions).catch(() => null);
  const userId = session?.user?.id ? String(session.user.id) : null;

  // 1. Parse body
  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { items, shipping } = body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Keranjang kosong." }, { status: 400 });
  }
  if (!shipping?.name?.trim() || !shipping?.phone?.trim() || !shipping?.address?.trim()) {
    return NextResponse.json({ error: "Data pengiriman wajib diisi (nama, telepon, alamat)." }, { status: 400 });
  }

  // Normalisasi & dedup item.
  const normalized = new Map<string, number>();
  for (const it of items) {
    if (!it?.productId || typeof it.productId !== "string") continue;
    const qty = Math.max(1, Math.floor(Number(it.quantity) || 0));
    if (qty <= 0) continue;
    normalized.set(it.productId, (normalized.get(it.productId) || 0) + qty);
  }
  if (normalized.size === 0) {
    return NextResponse.json({ error: "Item keranjang tidak valid." }, { status: 400 });
  }

  // 2. Ambil produk dari DB & validasi stok/harga (jangan percaya client).
  const productIds = Array.from(normalized.keys());
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  if (products.length !== productIds.length) {
    return NextResponse.json(
      { error: "Beberapa produk tidak tersedia atau dinonaktifkan." },
      { status: 400 }
    );
  }

  for (const p of products) {
    const qty = normalized.get(p.id) || 0;
    if (qty > p.stock) {
      return NextResponse.json(
        { error: `Stok produk "${p.name}" hanya ${p.stock}.` },
        { status: 400 }
      );
    }
  }

  // 3. Buat Order + OrderItem dalam transaksi DB. Status default PENDING.
  //    userId boleh null (guest).
  const order = await prisma.$transaction(async (tx) => {
    let total = 0;
    const itemSnapshots = products.map((p) => {
      const qty = normalized.get(p.id) || 0;
      total += p.price * qty;
      return {
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: qty,
        imageUrl: p.imageUrl,
      };
    });

    const created = await tx.order.create({
      data: {
        userId, // null untuk guest
        status: "PENDING",
        totalAmount: total,
        shippingName: shipping.name.trim(),
        shippingPhone: shipping.phone.trim(),
        shippingAddress: shipping.address.trim(),
        notes: shipping.notes?.trim() || null,
        OrderItem: {
          create: itemSnapshots,
        },
      },
      include: { OrderItem: true },
    });

    return created;
  });

  // 4. Pisah nama jadi first/last (Midtrans menerima last_name opsional).
  const trimmedName = shipping.name.trim();
  const nameParts = trimmedName.split(/\s+/);
  const firstName = nameParts[0] || trimmedName;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;

  // 5. Request Snap token ke Midtrans.
  try {
    const parameter: any = {
      transaction_details: {
        order_id: order.id,
        gross_amount: order.totalAmount,
      },
      item_details: order.OrderItem.map((it) => ({
        id: it.productId,
        price: it.price,
        quantity: it.quantity,
        name: it.name.slice(0, 50), // Midtrans max 50 chars
      })),
      // Customer details diambil langsung dari shipping (guest-friendly).
      customer_details: {
        first_name: firstName,
        last_name: lastName,
        phone: shipping.phone.trim(),
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          phone: shipping.phone.trim(),
          address: shipping.address.trim(),
        },
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      orderId: order.id,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    });
  } catch (err: any) {
    // Kalau Snap gagal, batalkan order supaya tidak menggantung.
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    // eslint-disable-next-line no-console
    console.error("[checkout] Midtrans Snap error:", err);
    return NextResponse.json(
      { error: err?.ApiResponse?.error_messages?.[0] || err?.message || "Gagal membuat transaksi pembayaran." },
      { status: 502 }
    );
  }
}
