import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const { category } = await searchParams;

  const videos = await prisma.video.findMany({
    where: category === "DIY_HACKS" || category === "CLEANOVA_PRODUCT"
      ? { category: category as any }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  const categories = [
    { label: "Semua", value: "", href: "/dashboard/videos" },
    { label: "DIY Hacks", value: "DIY_HACKS", href: "/dashboard/videos?category=DIY_HACKS" },
    { label: "Rekomendasi Produk", value: "CLEANOVA_PRODUCT", href: "/dashboard/videos?category=CLEANOVA_PRODUCT" },
  ];

  const activeCategory = category || "";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header */}
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-serif text-stone-900 dark:text-white">
          Pustaka <span className="text-amber-600 dark:text-amber-500 italic">Video</span>
        </h1>
        <p className="text-stone-500 dark:text-stone-400 font-light">
          Seluruh koleksi tutorial eksklusif Cleanova Circle — {videos.length} video tersedia.
        </p>
      </header>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-0">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={cat.href}
            className={`relative px-4 py-3 text-sm font-medium transition-colors rounded-t-lg -mb-px border-b-2 ${
              activeCategory === cat.value
                ? "text-amber-700 dark:text-amber-400 border-amber-500"
                : "text-stone-500 dark:text-stone-400 border-transparent hover:text-stone-800 dark:hover:text-stone-200 hover:border-stone-300 dark:hover:border-stone-600"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Video Grid */}
      {videos.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-5 text-stone-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h3 className="text-xl font-serif text-stone-700 dark:text-stone-300 mb-2">Belum ada video di kategori ini</h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm font-light">Tim kami sedang mempersiapkan materi terbaru untuk Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => {
            const youtubeId = getYouTubeId(video.url);
            const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;

            return (
            <Link
              href={`/dashboard/videos/${video.id}`}
              key={video.id}
              className="group flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-500"
            >
              {/* Thumbnail Placeholder */}
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

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col gap-2">
                <h3 className="font-serif font-medium text-base text-stone-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 font-light leading-relaxed mt-auto">
                  {video.description}
                </p>
                {video.toolsNeeded.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                    {video.toolsNeeded.slice(0, 2).map((tool, i) => (
                      <span key={i} className="text-[10px] bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                        {tool}
                      </span>
                    ))}
                    {video.toolsNeeded.length > 2 && (
                      <span className="text-[10px] text-stone-400">+{video.toolsNeeded.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
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

