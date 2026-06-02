"use server";

import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { RegisterSchema } from "../../lib/validations";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  acceptsMarketing: boolean;
};

type RegisterResult = { success: true } | { success: false; error: string };

const rateLimitMap = new Map<string, number>();

function checkRateLimit(key: string, limitMs: number = 60000): boolean {
  const now = Date.now();
  const lastAttempt = rateLimitMap.get(key);
  if (lastAttempt && now - lastAttempt < limitMs) {
    return true;
  }
  rateLimitMap.set(key, now);

  // Prune map jika terlalu besar untuk mencegah kebocoran memori
  if (rateLimitMap.size > 2000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now - v > limitMs) {
        rateLimitMap.delete(k);
      }
    }
  }
  return false;
}

/**
 * Pendaftaran mandiri publik (Lead Magnet).
 * - Validasi input dasar + cek email duplikat.
 * - Password di-hash (bcrypt) sebelum disimpan.
 */
export async function registerUserAction(input: RegisterInput): Promise<RegisterResult> {
  // 1. Anti-Spam Rate Limiting (IP & Email)
  const clientHeaders = await headers();
  const clientIp = clientHeaders.get("x-forwarded-for")?.split(",")[0].trim() || clientHeaders.get("x-real-ip") || "unknown-ip";
  const emailKey = input?.email?.trim().toLowerCase() || "unknown-email";

  if (checkRateLimit(`ip:${clientIp}`) || checkRateLimit(`email:${emailKey}`)) {
    return { success: false, error: "Terlalu banyak percobaan. Harap tunggu 1 menit." };
  }

  // 2. Validasi dengan Zod
  const validationResult = RegisterSchema.safeParse(input);
  if (!validationResult.success) {
    return { success: false, error: validationResult.error.issues[0].message };
  }

  const { name, email, password, acceptsMarketing } = validationResult.data;

  if (!acceptsMarketing) {
    return { success: false, error: "Persetujuan penerimaan informasi promo wajib dicentang." };
  }

  // Cek email sudah terdaftar.
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Email ini sudah terdaftar. Silakan login." };
  }

  // Hash password.
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name,
        email,
        password: hashedPassword,
        role: "USER",
        acceptsMarketing,
      },
    });
    return { success: true };
  } catch (err: any) {
    // Tangani race condition unique constraint (P2002).
    if (err?.code === "P2002") {
      return { success: false, error: "Email ini sudah terdaftar. Silakan login." };
    }
    // eslint-disable-next-line no-console
    console.error("[register] gagal membuat user:", err);
    return { success: false, error: "Gagal mendaftar. Coba lagi nanti." };
  }
}
