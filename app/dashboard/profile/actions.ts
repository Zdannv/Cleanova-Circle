"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const avatar = formData.get("avatar") as string; // Will receive "1.png", etc.

  if (!name || name.trim() === "") {
    throw new Error("Nama tidak boleh kosong");
  }

  const updateData: any = {
    name,
  };

  if (password && password.trim() !== "") {
    updateData.password = password;
  }

  if (avatar) {
    updateData.avatar = avatar;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
}
