/**
 * Integrasi Biteship — pencarian area & cek ongkir.
 *
 * Semua fungsi fail-safe: tidak melempar error mentah, selalu mengembalikan
 * objek hasil yang konsisten supaya API route tidak crash di production.
 *
 * Env yang dipakai (sudah diset di Vercel):
 *  - BITESHIP_API_KEY       : API key Biteship
 *  - ORIGIN_POSTAL_CODE     : kode pos titik asal pengiriman
 *  - ORIGIN_AREA_ID         : (opsional) area id titik asal, kalau ada lebih akurat
 */

const BITESHIP_BASE_URL = "https://api.biteship.com";

function getApiKey(): string {
  return process.env.BITESHIP_API_KEY || "";
}

type BiteshipArea = {
  id: string;
  name: string;
  postal_code: number | string;
  country_name?: string;
  administrative_division_level_1_name?: string;
  administrative_division_level_2_name?: string;
  administrative_division_level_3_name?: string;
};

type SearchAreaResult =
  | { success: true; areas: BiteshipArea[] }
  | { success: false; error: string; areas: [] };

export type CourierRate = {
  courier_code: string;
  courier_name: string;
  courier_service_code: string;
  courier_service_name: string;
  description?: string;
  duration?: string;
  price: number;
  shipping_fee?: number;
};

type GetRatesResult =
  | { success: true; pricing: CourierRate[]; fallback?: boolean }
  | { success: false; error: string; pricing: [] };

/** Ongkir flat sebagai jaring pengaman saat Biteship tidak bisa dipanggil. */
export function getFallbackRate(): CourierRate {
  const price = Number(process.env.SHIPPING_FALLBACK_COST) || 20000;
  return {
    courier_code: "flat",
    courier_name: "Pengiriman Reguler (Flat Rate)",
    courier_service_code: "reg",
    courier_service_name: "Reguler",
    description: "Estimasi ongkir standar",
    duration: "2-3 hari",
    price,
  };
}

/**
 * Cari area (kecamatan / kode pos) berdasarkan input teks.
 * GET /v1/maps/areas?countries=ID&input=<input>&type=single
 */
export async function searchArea(input: string): Promise<SearchAreaResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { success: false, error: "BITESHIP_API_KEY belum diset.", areas: [] };
  }
  const trimmed = (input || "").trim();
  if (trimmed.length < 3) {
    return { success: true, areas: [] };
  }

  try {
    const url =
      `${BITESHIP_BASE_URL}/v1/maps/areas` +
      `?countries=ID&type=single&input=${encodeURIComponent(trimmed)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        authorization: apiKey,
        "content-type": "application/json",
      },
      // Hindari cache supaya hasil pencarian selalu segar.
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return {
        success: false,
        error: data?.error || data?.message || `Biteship areas error (${res.status}).`,
        areas: [],
      };
    }

    return { success: true, areas: Array.isArray(data.areas) ? data.areas : [] };
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[biteship] searchArea error:", err?.message || err);
    return { success: false, error: "Gagal menghubungi Biteship.", areas: [] };
  }
}

/**
 * Ambil daftar ongkir kurir dari ORIGIN (kode pos di env) menuju destination area.
 * POST /v1/rates/couriers
 *
 * @param destinationAreaId  Area id tujuan (dari searchArea)
 * @param weight             Total berat barang dalam gram
 * @param couriers           Daftar kurir (default: jne,sicepat,anteraja,jnt,ide)
 */
export async function getRates(
  destinationAreaId: string,
  weight: number,
  couriers?: string
): Promise<GetRatesResult> {
  const apiKey = getApiKey();
  const originPostalCode = process.env.ORIGIN_POSTAL_CODE || "";
  const originAreaId = process.env.ORIGIN_AREA_ID || "";

  if (!destinationAreaId) {
    return { success: false, error: "Area tujuan wajib dipilih.", pricing: [] };
  }

  // Kalau konfigurasi dasar belum ada, langsung pakai fallback (jangan blokir checkout).
  if (!apiKey || (!originPostalCode && !originAreaId)) {
    // eslint-disable-next-line no-console
    console.warn("[biteship] konfigurasi belum lengkap — pakai ongkir fallback.");
    return { success: true, pricing: [getFallbackRate()], fallback: true };
  }

  // Berat minimal 1 gram, dibulatkan ke integer.
  const safeWeight = Math.max(1, Math.round(Number(weight) || 0));
  const courierList = couriers || "jne,sicepat,anteraja,jnt,ide,pos";

  try {
    const body: Record<string, unknown> = {
      destination_area_id: destinationAreaId,
      couriers: courierList,
      items: [
        {
          name: "Pesanan Cleanova Shop",
          description: "Produk perawatan",
          value: 1, // nilai barang untuk asuransi; tidak memengaruhi ongkir dasar
          weight: safeWeight,
          quantity: 1,
        },
      ],
    };

    // Pakai area id kalau tersedia (lebih akurat), kalau tidak pakai kode pos.
    if (originAreaId) {
      body.origin_area_id = originAreaId;
    } else {
      body.origin_postal_code = Number(originPostalCode) || originPostalCode;
    }

    const res = await fetch(`${BITESHIP_BASE_URL}/v1/rates/couriers`, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    // Gagal (saldo habis, error server, dll) -> jatuh ke fallback, JANGAN macetkan checkout.
    if (!res.ok || !data?.success || !Array.isArray(data.pricing) || data.pricing.length === 0) {
      // eslint-disable-next-line no-console
      console.warn(
        "[biteship] rates gagal/kosong — pakai ongkir fallback:",
        data?.error || data?.message || `status ${res.status}`
      );
      return { success: true, pricing: [getFallbackRate()], fallback: true };
    }

    const pricing: CourierRate[] = data.pricing.map((p: any) => ({
      courier_code: p.courier_code,
      courier_name: p.courier_name,
      courier_service_code: p.courier_service_code,
      courier_service_name: p.courier_service_name,
      description: p.description,
      duration: p.duration,
      price: p.price,
      shipping_fee: p.shipping_fee,
    }));

    return { success: true, pricing };
  } catch (err: any) {
    // Error jaringan / lainnya -> fallback.
    // eslint-disable-next-line no-console
    console.error("[biteship] getRates error — pakai ongkir fallback:", err?.message || err);
    return { success: true, pricing: [getFallbackRate()], fallback: true };
  }
}
