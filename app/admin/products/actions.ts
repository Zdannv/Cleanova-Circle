"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "produk";
}

function toIntSafe(v: FormDataEntryValue | null, fallback = 0): number {
  if (v === null) return fallback;
  const n = parseInt(String(v).replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function addProductAction(formData: FormData) {
  await verifyAdmin();

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const imageUrl = (formData.get("imageUrl") as string)?.trim();
  const price = toIntSafe(formData.get("price"));
  const stock = toIntSafe(formData.get("stock"));
  const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

  if (!name) throw new Error("Nama produk wajib diisi.");
  if (!imageUrl) throw new Error("Gambar produk wajib diunggah.");
  if (price < 0) throw new Error("Harga tidak boleh negatif.");
  if (stock < 0) throw new Error("Stok tidak boleh negatif.");

  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

  await prisma.product.create({
    data: {
      name,
      slug,
      description: description || "",
      price,
      stock,
      imageUrl,
      isActive,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function updateProductAction(id: string, formData: FormData) {
  await verifyAdmin();

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const imageUrl = (formData.get("imageUrl") as string)?.trim();
  const price = toIntSafe(formData.get("price"));
  const stock = toIntSafe(formData.get("stock"));
  const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

  if (!name) throw new Error("Nama produk wajib diisi.");
  if (!imageUrl) throw new Error("Gambar produk wajib diunggah.");

  await prisma.product.update({
    where: { id },
    data: {
      name,
      description: description || "",
      price,
      stock,
      imageUrl,
      isActive,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function deleteProductAction(id: string) {
  await verifyAdmin();

  // Cek apakah produk pernah dipakai di OrderItem. Kalau iya, soft-disable saja.
  const used = await prisma.orderItem.findFirst({ where: { productId: id }, select: { id: true } });
  if (used) {
    await prisma.product.update({
      where: { id },
      data: { isActive: false, stock: 0 },
    });
  } else {
    await prisma.product.delete({ where: { id } });
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
