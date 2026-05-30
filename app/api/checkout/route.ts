import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { snap } from "../../../lib/midtrans";
import { getRates } from "../../../lib/biteship";

type CartItem = {
  productId: string;
  quantity: number;
};

type CheckoutBody = {
  items: CartItem[];
  shipping: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    notes?: string;
    destinationAreaId?: string;
    shippingCost?: number;
    courier?: string;
    courierService?: string;
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
  const shippingEmail = shipping.email?.trim() || "";
  if (!shippingEmail) {
    return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingEmail)) {
    return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
  }

  const destinationAreaId = shipping.destinationAreaId?.trim() || "";
  const courier = shipping.courier?.trim() || "";
  const courierService = shipping.courierService?.trim() || "";
  if (!destinationAreaId || !courier || !courierService) {
    return NextResponse.json({ error: "Kurir dan tujuan pengiriman wajib dipilih." }, { status: 400 });
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

  // 2b. Hitung ulang ongkir di server via Biteship (jangan percaya nilai dari client).
  let totalWeight = 0;
  for (const p of products) {
    const qty = normalized.get(p.id) || 0;
    totalWeight += (p.weight || 500) * qty;
  }
  totalWeight = Math.max(1, totalWeight);

  let shippingCost = 0;
  try {
    const rateResult = await getRates(destinationAreaId, totalWeight, courier);
    if (!rateResult.success) {
      return NextResponse.json(
        { error: rateResult.error || "Gagal memvalidasi ongkir." },
        { status: 400 }
      );
    }
    const matched = rateResult.pricing.find(
      (r) => r.courier_code === courier && r.courier_service_code === courierService
    );
    if (!matched) {
      return NextResponse.json(
        { error: "Layanan kurir yang dipilih tidak tersedia. Silakan pilih ulang." },
        { status: 400 }
      );
    }
    shippingCost = matched.price;
  } catch {
    return NextResponse.json({ error: "Gagal menghitung ongkir." }, { status: 502 });
  }

  // 3. Buat Order + OrderItem dalam transaksi DB. Status default PENDING.
  //    userId boleh null (guest). totalAmount = produk + ongkir.
  const order = await prisma.$transaction(async (tx) => {
    let itemsTotal = 0;
    const itemSnapshots = products.map((p) => {
      const qty = normalized.get(p.id) || 0;
      itemsTotal += p.price * qty;
      return {
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: qty,
        imageUrl: p.imageUrl,
      };
    });

    const grandTotal = itemsTotal + shippingCost;

    const created = await tx.order.create({
      data: {
        userId, // null untuk guest
        status: "PENDING",
        totalAmount: grandTotal,
        shippingName: shipping.name.trim(),
        shippingPhone: shipping.phone.trim(),
        shippingEmail: shippingEmail,
        shippingAddress: shipping.address.trim(),
        shippingCost,
        courier,
        courierService,
        destinationAreaId,
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
    // item_details harus berjumlah sama dengan gross_amount. Ongkir
    // dimasukkan sebagai line item terpisah.
    const itemDetails = order.OrderItem.map((it) => ({
      id: it.productId,
      price: it.price,
      quantity: it.quantity,
      name: it.name.slice(0, 50), // Midtrans max 50 chars
    }));
    if (order.shippingCost > 0) {
      itemDetails.push({
        id: "SHIPPING",
        price: order.shippingCost,
        quantity: 1,
        name: `Ongkir ${courier.toUpperCase()} ${courierService.toUpperCase()}`.slice(0, 50),
      });
    }

    const parameter: any = {
      transaction_details: {
        order_id: order.id,
        gross_amount: order.totalAmount,
      },
      item_details: itemDetails,
      // Customer details diambil langsung dari shipping (guest-friendly).
      customer_details: {
        first_name: firstName,
        last_name: lastName,
        email: shippingEmail,
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
