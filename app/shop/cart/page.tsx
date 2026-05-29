import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import CartClient from "./CartClient";

export const metadata = {
  title: "Keranjang — Cleanova Shop",
};

export default async function CartPage() {
  const session = await getServerSession(authOptions);

  let defaultName = "";
  let defaultPhone = "";
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, phone: true },
    });
    defaultName = user?.name || "";
    defaultPhone = user?.phone || "";
  }

  return (
    <CartClient
      isAuthenticated={!!session?.user?.id}
      defaultName={defaultName}
      defaultPhone={defaultPhone}
    />
  );
}
