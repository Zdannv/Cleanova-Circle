"use server";

import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  acceptsMarketing: boolean;
};

type RegisterResult = { success: true } | { success: false; error: string };

/**
 * Pendaftaran mandiri publik (Lead Magnet).
 * - Validasi input dasar + cek email duplikat.
 * - Password di-hash (bcrypt) sebelum disimpan.
 */
export async function registerUserAction(input: RegisterInput): Promise<RegisterResult> {
  const name = input?.name?.trim() || "";
  const email = input?.email?.trim().toLowerCase() || "";
  const password = input?.password || "";
  const acceptsMarketing = input?.acceptsMarketing !== false;

  // Validasi
  if (!name) return { success: false, error: "Nama wajib diisi." };
  if (!email) return { success: false, error: "Email wajib diisi." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Format email tidak valid." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password minimal 6 karakter." };
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
