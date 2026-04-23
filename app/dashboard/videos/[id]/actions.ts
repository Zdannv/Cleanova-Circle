"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import prisma from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function addNoteAction(videoId: string, content: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  await prisma.note.create({
    data: {
      id: randomUUID(),
      userId: session.user.id as string,
      videoId,
      content,
      timestamp: 0
    }
  });
  
  revalidatePath(`/dashboard/videos/${videoId}`);
}

export async function deleteNoteAction(noteId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  // Verify ownership before deleting
  const note = await prisma.note.findUnique({ where: { id: noteId }});
  if (!note || note.userId !== session.user.id) {
    throw new Error("Unauthorized or not found");
  }
  
  await prisma.note.delete({
    where: { id: noteId }
  });
  
  revalidatePath(`/dashboard/videos/${note.videoId}`);
}

export async function updateWatchedSecondsAction(videoId: string, watchedSeconds: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id as string;
  const progressId = `${userId}_${videoId}`;

  const existing = await prisma.progress.findFirst({
    where: { userId, videoId }
  });

  if (existing) {
    // Hanya update jika durasi yang baru lebih besar (tidak rewind)
    if (watchedSeconds > existing.watchedSeconds) {
      await prisma.progress.update({
        where: { id: existing.id },
        data: { watchedSeconds }
      });
    }
  } else {
    // Buat record baru saat pertama kali user mulai menonton
    await prisma.progress.create({
      data: {
        id: progressId,
        userId,
        videoId,
        isCompleted: false,
        watchedSeconds
      }
    });
  }
  // Tidak revalidatePath di sini agar tidak re-render setiap detik
}

export async function markVideoCompletedAction(videoId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id as string;
  const progressId = `${userId}_${videoId}`;

  const existing = await prisma.progress.findFirst({
    where: { userId, videoId }
  });

  if (existing) {
    await prisma.progress.update({
      where: { id: existing.id },
      data: { isCompleted: true }
    });
  } else {
    await prisma.progress.create({
      data: {
        id: progressId,
        userId,
        videoId,
        isCompleted: true,
        watchedSeconds: 0
      }
    });
  }

  revalidatePath(`/dashboard/videos/${videoId}`);
}

export async function toggleBookmarkAction(videoId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id as string;

  const existing = await prisma.bookmark.findFirst({
    where: { userId, videoId }
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { id: existing.id }
    });
  } else {
    await prisma.bookmark.create({
      data: {
        id: randomUUID(),
        userId,
        videoId
      }
    });
  }

  revalidatePath(`/dashboard/videos/${videoId}`);
}

export async function addCommentAction(videoId: string, content: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.comment.create({
    data: {
      id: randomUUID(),
      userId: session.user.id as string,
      videoId,
      content
    }
  });

  revalidatePath(`/dashboard/videos/${videoId}`);
}

export async function deleteCommentAction(commentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== session.user.id) {
    throw new Error("Unauthorized or not found");
  }

  await prisma.comment.delete({
    where: { id: commentId }
  });

  revalidatePath(`/dashboard/videos/${comment.videoId}`);
}

export async function toggleLikeAction(videoId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id as string;

  const existing = await prisma.like.findUnique({
    where: { userId_videoId: { userId, videoId } }
  });

  if (existing) {
    await prisma.like.delete({
      where: { userId_videoId: { userId, videoId } }
    });
  } else {
    await prisma.like.create({
      data: { userId, videoId }
    });
  }

  revalidatePath(`/dashboard/videos/${videoId}`);
}
