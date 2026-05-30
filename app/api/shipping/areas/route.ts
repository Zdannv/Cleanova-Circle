import { NextRequest, NextResponse } from "next/server";
import { searchArea } from "../../../../lib/biteship";

/**
 * GET /api/shipping/areas?input=<teks>
 * Autocomplete area tujuan (kecamatan / kode pos) via Biteship Maps API.
 */
export async function GET(req: NextRequest) {
  try {
    const input = req.nextUrl.searchParams.get("input") || "";

    if (input.trim().length < 3) {
      return NextResponse.json({ success: true, areas: [] });
    }

    const result = await searchArea(input);

    if (!result.success) {
      // Tetap balas 200 dengan areas kosong supaya frontend tidak crash;
      // sertakan pesan untuk debugging.
      return NextResponse.json({ success: false, areas: [], error: result.error });
    }

    return NextResponse.json({ success: true, areas: result.areas });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[api/shipping/areas] error:", err?.message || err);
    return NextResponse.json({ success: false, areas: [], error: "Internal error" });
  }
}
