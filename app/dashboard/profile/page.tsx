import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  // Define avatars
  const avatars = Array.from({ length: 12 }, (_, i) => `${i + 1}.png`);

  return <ProfileClient user={user} avatars={avatars} />;
}
