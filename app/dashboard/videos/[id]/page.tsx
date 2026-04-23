import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import prisma from "../../../../lib/prisma";
import { redirect } from "next/navigation";
import VideoPlayerClient from "./VideoPlayerClient";
import Link from "next/link";

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Server-Side Protection
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Next.js 15+ (and Turbopack 16) requires awaiting the dynamic params
  const { id } = await params;

  // 2. Fetch the specific video, notes, progress, bookmark, and comments
  const [video, notes, progress, bookmark, comments, likeCount, userLike] = await Promise.all([
    prisma.video.findUnique({
      where: { id },
      include: { Category: true }
    }),
    prisma.note.findMany({
      where: { videoId: id, userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.progress.findFirst({
      where: { videoId: id, userId: session.user.id }
    }),
    prisma.bookmark.findFirst({
      where: { videoId: id, userId: session.user.id }
    }),
    prisma.comment.findMany({
      where: { videoId: id },
      include: {
        User: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.like.count({ where: { videoId: id } }),
    prisma.like.findUnique({
      where: { userId_videoId: { userId: session.user.id as string, videoId: id } }
    })
  ]);

  // 3. Handle Not Found Gracefully
  if (!video) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
         <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-6 text-stone-400 dark:text-stone-500">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
         </div>
         <h2 className="text-2xl md:text-3xl font-serif text-stone-800 dark:text-stone-200 mb-3">Video Tidak Ditemukan</h2>
         <p className="max-w-sm text-stone-500 dark:text-stone-400 mb-8 font-light">
            Maaf, video yang Anda cari mungkin telah dipindahkan, dhapus, atau memiliki tautan yang tidak valid.
         </p>
         <Link 
            href="/dashboard" 
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl shadow shadow-amber-600/30 transition-all flex items-center gap-2 group"
         >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Dashboard Utama
         </Link>
      </div>
    );
  }

  return (
    <VideoPlayerClient 
      video={video} 
      initialNotes={notes} 
      initialProgress={progress?.isCompleted || false}
      initialWatchedSeconds={progress?.watchedSeconds || 0}
      userId={session.user.id} 
      isBookmarked={!!bookmark}
      initialComments={comments}
      initialLikeCount={likeCount}
      isLiked={!!userLike}
    />
  );
}
