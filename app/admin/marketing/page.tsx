import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { redirect } from "next/navigation";
import MarketingClient from "./MarketingClient";

export const dynamic = "force-dynamic";

export default async function AdminMarketingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const subscriberCount = await prisma.user.count({
    where: {
      acceptsMarketing: true,
      email: {
        not: null,
      },
    },
  });

  return (
    <MarketingClient
      subscriberCount={subscriberCount}
      adminName={session.user.name || "Admin"}
    />
  );
}
