import prisma from "../../lib/prisma";
import CatalogClient from "./CatalogClient";

export const metadata = {
  title: "Cleanova Shop — Katalog Produk Premium",
  description: "Belanja produk perawatan koleksi premium di Cleanova Circle.",
};

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  // Serialisasi Date supaya aman dilempar ke client component.
  const serial = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    stock: p.stock,
    imageUrl: p.imageUrl,
    isActive: p.isActive,
  }));

  return <CatalogClient products={serial} />;
}
