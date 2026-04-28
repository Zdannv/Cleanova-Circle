"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { sendConfirmationEmail } from "../../lib/mailer";

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
  const categoryId = formData.get("categoryId") as string;
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
      categoryId,
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
  const categoryId = formData.get("categoryId") as string;
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
      categoryId,
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

export async function createCategoryAction(name: string) {
  await verifyAdmin();
  await prisma.category.create({ data: { name } });
  revalidatePath("/admin");
}

export async function deleteCategoryAction(id: string) {
  await verifyAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function createUserAction(formData: FormData) {
  await verifyAdmin();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "USER" | "ADMIN";

  await prisma.user.create({
    data: {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      email,
      phone,
      password,
      role
    }
  });

  // Try sending the confirmation email
  if (email) {
    await sendConfirmationEmail({ name, email, phone, password });
  }

  revalidatePath("/admin");
}

export async function deleteUserAction(id: string) {
  await verifyAdmin();

  const session = await getServerSession(authOptions);
  if (session?.user?.id === id) {
    throw new Error("Cannot delete own admin account");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function addArticleAction(formData: FormData) {
  await verifyAdmin();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const coverImage = formData.get("coverImage") as string;
  const tag = formData.get("tag") as string;

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  await prisma.article.create({
    data: {
      title,
      slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
      content,
      coverImage,
      tag: tag || "Artikel"
    }
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateArticleAction(id: string, formData: FormData) {
  await verifyAdmin();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const coverImage = formData.get("coverImage") as string;
  const tag = formData.get("tag") as string;

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  // content bisa null jika hidden input tidak terkirim — fallback ke string kosong
  const safeContent = content ?? "";

  await prisma.article.update({
    where: { id },
    data: {
      title,
      slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
      content: safeContent,
      coverImage,
      tag: tag || "Artikel"
    }
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function deleteArticleAction(id: string) {
  await verifyAdmin();
  await prisma.article.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateLandingPageAction(formData: FormData) {
  await verifyAdmin();

  const keys = [
    "logoUrl", "heroTitle", "heroSubtitle", "heroDescription", "heroImageUrl", "whatsappUrl",
    "valueTitle", "valueDescription",
    "valueCard1Title", "valueCard1Text", "valueCard2Title", "valueCard2Text", "valueCard3Title", "valueCard3Text",
    "featureTitle", "featureSubtitle",
    "feature1Title", "feature1Description", "feature1ImageUrl",
    "feature2Title", "feature2Description", "feature2ImageUrl",
    "feature3Title", "feature3Description", "feature3ImageUrl",
    "ctaTitle", "ctaSubtitle", "ctaDescription"
  ];

  const data: any = {};
  keys.forEach(key => {
    const val = formData.get(key);
    if (val !== null) {
      data[key] = val as string;
    }
  });

  await prisma.landingPage.upsert({
    where: { id: "default" },
    update: data,
    create: {
      ...data,
      id: "default",
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}
