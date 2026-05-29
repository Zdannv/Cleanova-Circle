import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { redirect } from "next/navigation";
import ProductsClient from "./ProductsClient";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <ProductsClient products={products} adminName={session.user.name || "Admin"} />;
}
