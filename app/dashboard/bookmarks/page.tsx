import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1).split("?")[0];
    if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/embed/")[1].split("?")[0];
    if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/shorts/")[1].split("?")[0];
  } catch {
    return null;
  }
  return null;
}

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch bookmarks including Video
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id as string },
    include: { Video: { include: { Category: true } } },
    orderBy: { createdAt: "desc" }
  });

  const progressRecords = await prisma.progress.findMany({
    where: { userId: session.user.id as string },
  });
  const progressMap = new Map(progressRecords.map(p => [p.videoId, p]));

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out px-4 xl:px-0">
      <header className="space-y-3 pb-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-stone-900 dark:text-white">Video Tersimpan</h1>
          <p className="text-stone-500 dark:text-stone-400 text-lg font-light mt-2">
            Kumpulan video yang telah Anda simpan untuk referensi.
          </p>
        </div>
      </header>

      {bookmarks.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 md:p-20 text-center shadow-xl shadow-stone-200/40 dark:shadow-black/20">
          <div className="w-20 h-20 bg-amber-50 text-amber-600 dark:bg-stone-800 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
             <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
             </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-white mb-4">Belum Ada Video</h2>
          <p className="text-stone-500 dark:text-stone-400 max-w-md mx-auto font-light leading-relaxed mb-8">
            Anda belum menyimpan video apapun. Silakan jelajahi ulasan produk dan panduan DIY, lalu simpan video favorit Anda.
          </p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium shadow shadow-amber-600/30 transition-all group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookmarks.map(bookmark => {
             const video = bookmark.Video;
             const youtubeId = getYouTubeId(video.url);
             const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null;
             const progress = progressMap.get(video.id);
             const isCompleted = progress?.isCompleted;
             const inProgress = !isCompleted && (progress?.watchedSeconds ?? 0) > 0;

             return (
               <Link href={`/dashboard/videos/${video.id}`} key={video.id} className="group flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-500 relative">
                 <div className="relative aspect-video bg-stone-100 dark:bg-stone-800 overflow-hidden">
                   {thumbnailUrl ? (
                     <img 
                       src={thumbnailUrl}
                       alt={video.title} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                     />
                   ) : (
                     <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800" />
                   )}
                   <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
                   
                   {/* Play overlay icon */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                     <div className="w-14 h-14 bg-white/95 dark:bg-stone-900/95 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-xl shadow-black/20 backdrop-blur-md transform scale-50 group-hover:scale-100 transition-transform duration-500 ease-out">
                       <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M8 5v14l11-7z" />
                       </svg>
                     </div>
                   </div>

                   {/* Completed Badge overlay */}
                   {isCompleted ? (
                     <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm bg-opacity-90">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                       </svg>
                       Selesai
                     </div>
                   ) : inProgress ? (
                     <div className="absolute top-3 left-3 bg-sky-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm bg-opacity-90">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                       </svg>
                       Sedang Ditonton
                     </div>
                   ) : null}

                   {/* Bookmark Indicator Overlay */}
                   <div className="absolute top-3 right-3 bg-amber-600 text-white p-1.5 rounded-full shadow-lg backdrop-blur-sm bg-opacity-90">
                     <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                     </svg>
                   </div>
                 </div>

                 <div className="p-6 flex-1 flex flex-col">
                   <div className="flex items-center gap-2 mb-3">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-sm border border-amber-100 dark:border-amber-800/50">
                       {video.Category?.name || "Uncategorized"}
                     </span>
                   </div>
                   <h3 className="font-serif font-medium text-lg text-stone-900 dark:text-white leading-snug mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                     {video.title}
                   </h3>
                   <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 mt-auto font-light leading-relaxed">
                     {video.description}
                   </p>
                 </div>
               </Link>
             );
          })}
        </div>
      )}
    </div>
  );
}
