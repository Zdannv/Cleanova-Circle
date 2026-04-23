import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "../../lib/prisma";
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

type VideoCardProps = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  isCompleted?: boolean;
  inProgress?: boolean;
  likeCount?: number;
  badge?: "completed" | "inprogress" | "new" | null;
};

function VideoCard({ id, title, description, url, category, isCompleted, inProgress, likeCount }: VideoCardProps) {
  const youtubeId = getYouTubeId(url);
  const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null;

  return (
    <Link
      href={`/dashboard/videos/${id}`}
      className="group flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-500 flex-shrink-0 w-72 md:w-80"
    >
      <div className="relative aspect-video bg-stone-100 dark:bg-stone-800 overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800" />
        )}
        <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-500" />

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-14 h-14 bg-white/95 dark:bg-stone-900/95 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-xl backdrop-blur-md transform scale-50 group-hover:scale-100 transition-transform duration-500 ease-out">
            <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Status Badge */}
        {isCompleted ? (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm bg-opacity-90">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Selesai
          </div>
        ) : inProgress ? (
          <div className="absolute top-3 right-3 bg-sky-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm bg-opacity-90">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
            Ditonton
          </div>
        ) : null}

        {/* Like count badge (for popular section) */}
        {likeCount !== undefined && likeCount > 0 && (
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
            <svg className="w-3.5 h-3.5 fill-rose-400" viewBox="0 0 24 24" stroke="none">
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {likeCount}
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-sm border border-amber-100 dark:border-amber-800/50">
            {category || "Uncategorized"}
          </span>
        </div>
        <h3 className="font-serif font-medium text-base text-stone-900 dark:text-white leading-snug mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 mt-auto font-light leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}

function SectionRow({ title, icon, children, emptyMessage }: { title: string; icon: React.ReactNode; children: React.ReactNode; emptyMessage: string }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-amber-600 dark:text-amber-500">{icon}</div>
        <h2 className="text-xl font-serif font-medium text-stone-900 dark:text-white">{title}</h2>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-3 -mx-4 px-4 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id as string;

  const [videos, progressRecords] = await Promise.all([
    prisma.video.findMany({ 
      orderBy: { createdAt: "desc" },
      include: { Category: true }
    }),
    prisma.progress.findMany({ where: { userId } }),
  ]);

  // Fallback aman — akan kosong jika model Like belum dikenali client
  let popularData: { videoId: string; _count: { videoId: number } }[] = [];
  try {
    popularData = await (prisma as any).like.groupBy({
      by: ["videoId"],
      _count: { videoId: true },
      orderBy: { _count: { videoId: "desc" } },
      take: 10
    });
  } catch {
    // Like model belum tersedia, lewati seksi Terpopuler
  }

  const progressMap = new Map(progressRecords.map(p => [p.videoId, p]));

  // Recently viewed: videos the user has started (progress exists), sorted by most watchedSeconds desc
  const recentlyViewedProgress = progressRecords
    .filter(p => p.watchedSeconds > 0 || p.isCompleted)
    .sort((a, b) => b.watchedSeconds - a.watchedSeconds)
    .slice(0, 8);
  const recentlyViewedVideoIds = new Set(recentlyViewedProgress.map(p => p.videoId));
  const recentlyViewedVideos = videos.filter(v => recentlyViewedVideoIds.has(v.id));

  // Recently added: latest 8 videos
  const recentlyAdded = videos.slice(0, 8);

  // Popular: top liked videos
  const popularVideoIds = popularData.map(p => p.videoId);
  const popularLikeMap = new Map(popularData.map(p => [p.videoId, p._count.videoId]));
  const popularVideos = videos
    .filter(v => popularVideoIds.includes(v.id))
    .sort((a, b) => (popularLikeMap.get(b.id) ?? 0) - (popularLikeMap.get(a.id) ?? 0));

  const icons = {
    recent: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    new: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    popular: (
      <svg className="w-6 h-6 fill-rose-400" viewBox="0 0 24 24" stroke="none">
        <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out px-4 xl:px-0">
      <header className="space-y-3 pb-6 border-b border-stone-200 dark:border-stone-800">
        <h1 className="text-3xl md:text-4xl font-serif text-stone-900 dark:text-white">
          Selamat Datang, <span className="text-amber-600 dark:text-amber-500 italic">{session.user.name || "Member"}</span>!
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-lg font-light max-w-2xl">
          Siap untuk mengembalikan kilau koleksi perhiasan berharga Anda hari ini? Mari jelajahi teknik restorasi eksklusif.
        </p>
      </header>

      {/* Recently Viewed */}
      {recentlyViewedVideos.length > 0 && (
        <SectionRow title="Terakhir Ditonton" icon={icons.recent} emptyMessage="">
          {recentlyViewedVideos.map(video => {
            const p = progressMap.get(video.id);
            return (
              <div key={video.id} className="snap-start">
                <VideoCard
                  id={video.id} title={video.title} description={video.description}
                  url={video.url} category={video.Category?.name || ""}
                  isCompleted={p?.isCompleted} inProgress={!p?.isCompleted && (p?.watchedSeconds ?? 0) > 0}
                />
              </div>
            );
          })}
        </SectionRow>
      )}

      {/* Recently Added */}
      <SectionRow title="Baru Ditambahkan" icon={icons.new} emptyMessage="Belum ada video.">
        {recentlyAdded.length === 0 ? (
          <p className="text-stone-400 dark:text-stone-500 text-sm py-6">Belum ada video tersedia.</p>
        ) : recentlyAdded.map(video => {
          const p = progressMap.get(video.id);
          return (
            <div key={video.id} className="snap-start">
              <VideoCard
                id={video.id} title={video.title} description={video.description}
                url={video.url} category={video.Category?.name || ""}
                isCompleted={p?.isCompleted} inProgress={!p?.isCompleted && (p?.watchedSeconds ?? 0) > 0}
              />
            </div>
          );
        })}
      </SectionRow>

      {/* Popular */}
      <SectionRow title="Video Terpopuler" icon={icons.popular} emptyMessage="Belum ada video populer.">
        {popularVideos.length === 0 ? (
          <p className="text-stone-400 dark:text-stone-500 text-sm py-6">Belum ada video yang disukai. Jadilah yang pertama menyukai!</p>
        ) : popularVideos.map(video => {
          const p = progressMap.get(video.id);
          return (
            <div key={video.id} className="snap-start">
              <VideoCard
                id={video.id} title={video.title} description={video.description}
                url={video.url} category={video.Category?.name || ""}
                isCompleted={p?.isCompleted} inProgress={!p?.isCompleted && (p?.watchedSeconds ?? 0) > 0}
                likeCount={popularLikeMap.get(video.id)}
              />
            </div>
          );
        })}
      </SectionRow>
    </div>
  );
}
