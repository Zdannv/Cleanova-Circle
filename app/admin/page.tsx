import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "../../lib/prisma";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [videos, categories, users, articles] = await Promise.all([
    prisma.video.findMany({
      orderBy: { createdAt: "desc" },
      include: { Category: true }
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" }
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    }),
    prisma.article.findMany({
      orderBy: { createdAt: "desc" }
    })
  ]);

  return <AdminClient videos={videos} categories={categories} users={users} articles={articles} user={session.user} />;
}
