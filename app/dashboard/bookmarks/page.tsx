import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: { Video: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header */}
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-serif text-stone-900 dark:text-white">
          Markah <span className="text-amber-600 dark:text-amber-500 italic">Saya</span>
        </h1>
        <p className="text-stone-500 dark:text-stone-400 font-light">
          Video yang sudah Anda simpan untuk ditonton kembali — {bookmarks.length} video tersimpan.
        </p>
      </header>

      {/* Bookmarks Grid */}
      {bookmarks.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-5 text-stone-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-xl font-serif text-stone-700 dark:text-stone-300 mb-2">Belum ada markah</h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm font-light mb-8">
            Tandai video yang ingin Anda simpan untuk ditonton kembali kapan saja.
          </p>
          <Link
            href="/dashboard/videos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl shadow shadow-amber-600/30 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Jelajahi Pustaka Video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map(({ Video: video, id: bookmarkId, createdAt }) => {
            const youtubeId = getYouTubeId(video.url);
            const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;

            return (
            <div key={bookmarkId} className="group flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-500 relative">
              {/* Saved Date Badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="text-[10px] font-medium bg-white/90 dark:bg-stone-900/90 text-stone-500 dark:text-stone-400 px-2 py-1 rounded-md border border-stone-200 dark:border-stone-700 backdrop-blur-sm">
                  {new Date(createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
              </div>

              {/* Thumbnail Placeholder */}
              <Link href={`/dashboard/videos/${video.id}`} className="block">
                <div className="relative aspect-video bg-stone-100 dark:bg-stone-800 overflow-hidden flex items-center justify-center">
                  {thumbnailUrl ? (
                    <img 
                      src={thumbnailUrl}
                      alt={video.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800" />
                  )}
                  <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-transparent transition-colors duration-500"></div>
                  <div className="relative z-10 w-14 h-14 bg-white/90 dark:bg-stone-900/90 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-xl backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm border ${
                      video.category === "DIY_HACKS"
                        ? "bg-amber-50/90 text-amber-700 border-amber-200"
                        : "bg-white/90 text-stone-700 border-stone-200"
                    }`}>
                      {video.category === "DIY_HACKS" ? "DIY Hack" : "Produk"}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col gap-2">
                <Link href={`/dashboard/videos/${video.id}`}>
                  <h3 className="font-serif font-medium text-base text-stone-900 dark:text-white leading-snug hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                </Link>
                <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 font-light leading-relaxed mt-auto">
                  {video.description}
                </p>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}

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

