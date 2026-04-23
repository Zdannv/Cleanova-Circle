import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "../../lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch Latest Videos securely
  const latestVideos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const productVideos = latestVideos.filter(v => v.category === "CLEANOVA_PRODUCT");
  const diyVideos = latestVideos.filter(v => v.category === "DIY_HACKS");

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-serif text-stone-900 dark:text-white">
          Selamat Datang, <span className="text-amber-600 dark:text-amber-500 italic">{session.user.name || "Member"}</span>!
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-lg font-light max-w-2xl">
          Siap untuk mengembalikan kilau koleksi perhiasan berharga Anda hari ini? Mari jelajahi teknik restorasi eksklusif.
        </p>
      </header>

      {latestVideos.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 md:p-20 text-center shadow-xl shadow-stone-200/40 dark:shadow-black/20">
          <div className="w-20 h-20 bg-amber-50 text-amber-600 dark:bg-stone-800 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg className="w-10 h-10 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-white mb-4">Video Belum Tersedia</h2>
          <p className="text-stone-500 dark:text-stone-400 max-w-md mx-auto font-light leading-relaxed mb-8">
            Tim pakar kami sedang mempersiapkan video materi eksklusif untuk Anda. Silakan periksa kembali dalam waktu dekat untuk menemukan panduan terbaru.
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {/* DIY Hacks Section */}
          {diyVideos.length > 0 && (
            <section className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                  <h2 className="text-2xl font-serif text-stone-900 dark:text-white flex items-center gap-3">
                    <span className="w-1.5 h-6 rounded-full bg-amber-500"></span>
                    DIY Hacks & Tricks
                  </h2>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 font-light">Trik rahasia menggunakan bahan rumahan.</p>
                </div>
                <Link href="/dashboard/videos?category=DIY_HACKS" className="text-sm font-medium uppercase tracking-widest text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 group flex items-center gap-1">
                  Lihat Semua <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {diyVideos.map(renderVideoCard)}
              </div>
            </section>
          )}

          {/* Product Category Section */}
          {productVideos.length > 0 && (
            <section className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
                 <div>
                  <h2 className="text-2xl font-serif text-stone-900 dark:text-white flex items-center gap-3">
                    <span className="w-1.5 h-6 rounded-full bg-stone-700 dark:bg-stone-500"></span>
                    Rekomendasi Produk
                  </h2>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 font-light">Panduan dosis dan ulasan peralatan premium.</p>
                </div>
                <Link href="/dashboard/videos?category=CLEANOVA_PRODUCT" className="text-sm font-medium uppercase tracking-widest text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 group flex items-center gap-1">
                  Lihat Semua <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {productVideos.map(renderVideoCard)}
              </div>
            </section>
          )}
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

function renderVideoCard(video: any) {
  const youtubeId = getYouTubeId(video.url);
  const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;

  return (
    <Link href={`/dashboard/videos/${video.id}`} key={video.id} className="group flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-500">
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
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-14 h-14 bg-white/95 dark:bg-stone-900/95 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-xl shadow-black/20 backdrop-blur-md transform scale-50 group-hover:scale-100 transition-transform duration-500 ease-out">
            <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-sm border border-amber-100 dark:border-amber-800/50">
            {video.category === "DIY_HACKS" ? "DIY Hack" : "Produk Review"}
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
}
