import { NextRequest, NextResponse } from "next/server";
import { getRates } from "../../../../lib/biteship";

/**
 * POST /api/shipping/rates
 * Body: { destinationAreaId: string, weight: number, couriers?: string }
 * Mengembalikan daftar opsi kurir + ongkir dari ORIGIN (env) ke tujuan.
 */
export async function POST(req: NextRequest) {
  try {
    let body: { destinationAreaId?: string; weight?: number; couriers?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, pricing: [], error: "Invalid JSON" }, { status: 400 });
    }

    const destinationAreaId = (body?.destinationAreaId || "").trim();
    const weight = Number(body?.weight) || 0;

    if (!destinationAreaId) {
      return NextResponse.json(
        { success: false, pricing: [], error: "Area tujuan wajib dipilih." },
        { status: 400 }
      );
    }
    if (weight <= 0) {
      return NextResponse.json(
        { success: false, pricing: [], error: "Berat barang tidak valid." },
        { status: 400 }
      );
    }

    const result = await getRates(destinationAreaId, weight, body?.couriers);

    if (!result.success) {
      // Balas 200 dengan pricing kosong + pesan, supaya UI bisa menampilkan
      // "ongkir tidak tersedia" tanpa error.
      return NextResponse.json({ success: false, pricing: [], error: result.error });
    }

    return NextResponse.json({ success: true, pricing: result.pricing });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[api/shipping/rates] error:", err?.message || err);
    return NextResponse.json({ success: false, pricing: [], error: "Internal error" });
  }
}
