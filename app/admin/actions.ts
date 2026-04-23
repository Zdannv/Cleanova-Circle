"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function addVideoAction(formData: FormData) {
  await verifyAdmin();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const url = formData.get("url") as string;
  const category = formData.get("category") as "CLEANOVA_PRODUCT" | "DIY_HACKS";
  const toolsString = formData.get("toolsNeeded") as string;

  const toolsNeeded = toolsString
    ? toolsString.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  await prisma.video.create({
    data: {
      id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      description,
      url,
      category,
      toolsNeeded,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateVideoAction(id: string, formData: FormData) {
  await verifyAdmin();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const url = formData.get("url") as string;
  const category = formData.get("category") as "CLEANOVA_PRODUCT" | "DIY_HACKS";
  const toolsString = formData.get("toolsNeeded") as string;

  const toolsNeeded = toolsString
    ? toolsString.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  await prisma.video.update({
    where: { id },
    data: {
      title,
      description,
      url,
      category,
      toolsNeeded,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function deleteVideoAction(id: string) {
  await verifyAdmin();

  await prisma.video.delete({ where: { id } });
  
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
