import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 1. Validasi environment variable untuk mencegah footgun 'Bearer undefined'
    if (!process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // 2. Amankan endpoint dengan Bearer Token
    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Cari order yang berstatus PENDING dan dibuat > 24 jam yang lalu
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const unpaidOrders = await prisma.order.findMany({
      where: {
        status: "PENDING",
        createdAt: {
          lt: cutoff,
        },
      },
      include: {
        OrderItem: true,
      },
    });

    if (unpaidOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tidak ada pesanan PENDING yang belum dibayar lebih dari 24 jam.",
        cancelledCount: 0,
      });
    }

    // 3. Jalankan transaksi database terenkapsulasi
    await prisma.$transaction(async (tx) => {
      for (const order of unpaidOrders) {
        // Ubah status pesanan menjadi CANCELLED
        await tx.order.update({
          where: { id: order.id },
          data: { status: "CANCELLED" },
        });

        // Loop untuk mengembalikan stok masing-masing item di pesanan
        for (const item of order.OrderItem) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil membatalkan ${unpaidOrders.length} pesanan yang melewati tenggat waktu 24 jam dan mengembalikan stok produk terkait.`,
      cancelledCount: unpaidOrders.length,
      cancelledOrderIds: unpaidOrders.map((o) => o.id),
    });
  } catch (error: any) {
    console.error("[CRON CANCEL UNPAID ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server saat memproses pembatalan otomatis.",
        details: error.message || error,
      },
      { status: 500 }
    );
  }
}
