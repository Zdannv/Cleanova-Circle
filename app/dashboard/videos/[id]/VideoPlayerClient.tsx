"use client";

import Link from "next/link";

type Video = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: "CLEANOVA_PRODUCT" | "DIY_HACKS";
  toolsNeeded: string[];
};

// Extract YouTube video ID from any YouTube URL format
function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Format: youtube.com/watch?v=VIDEO_ID
    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }
    // Format: youtu.be/VIDEO_ID
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1).split("?")[0];
    }
    // Format: youtube.com/embed/VIDEO_ID
    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.split("/embed/")[1].split("?")[0];
    }
    // Format: youtube.com/shorts/VIDEO_ID
    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.split("/shorts/")[1].split("?")[0];
    }
  } catch {
    return null;
  }
  return null;
}

export default function VideoPlayerClient({ video }: { video: Video }) {
  const youtubeId = getYouTubeId(video.url);


  return (
    <div className="max-w-5xl mx-auto py-6 animate-in fade-in zoom-in-95 duration-500 ease-out">
      
      {/* Back Navigation */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-500 mb-8 mt-2 transition-colors group"
      >
        <div className="p-1.5 rounded-full bg-stone-100 dark:bg-stone-800/50 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
           <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
        </div>
        Kembali ke Dashboard
      </Link>

      {/* Video Player Container - Responsive 16:9 */}
      <div className="bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-stone-200/50 dark:shadow-black/50 border border-stone-200 dark:border-stone-800">
         <div className="relative pt-[56.25%] w-full">
           {youtubeId ? (
             <iframe
               className="absolute top-0 left-0 w-full h-full"
               src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&enablejsapi=1`}
               title={video.title}
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
               allowFullScreen
               referrerPolicy="strict-origin-when-cross-origin"
             />
           ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900 text-stone-400 gap-3">
               <svg className="w-12 h-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
               </svg>
               <p className="text-sm">Format URL video tidak didukung</p>
             </div>
           )}
         </div>
      </div>

      {/* Fallback YouTube Link */}
      <div className="mt-4 mb-6 flex justify-end">
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 transition-colors group"
        >
          <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Jika video tidak bisa diputar, tonton langsung di YouTube
          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Video Details */}
      <article className="space-y-6">
         {/* Title & Category Flex */}
         <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
            <div className="space-y-3 flex-1">
               <div className="flex items-center gap-2">
                 <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm border ${video.category === 'DIY_HACKS' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40' : 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700'}`}>
                    {video.category === 'DIY_HACKS' ? 'DIY Hack Khusus' : 'Rekomendasi Produk'}
                 </span>
               </div>
               <h1 className="text-3xl md:text-4xl font-serif font-medium text-stone-900 dark:text-white leading-tight">
                  {video.title}
               </h1>
            </div>
         </div>

         {/* Content Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 pt-4">
            
            {/* Description */}
            <div className="md:col-span-2 space-y-4">
               <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 hidden md:block">
                  Ringkasan Materi
               </h3>
               <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-lg font-light whitespace-pre-wrap">
                  {video.description}
               </p>
            </div>

            {/* Tools Needed Sidebar */}
            <div className="md:col-span-1">
               <div className="bg-stone-50 dark:bg-stone-900/50 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 space-y-5">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-amber-700 dark:text-amber-500 flex items-center gap-2">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                     Peralatan Dibutuhkan
                  </h3>
                  
                  {video.toolsNeeded.length === 0 ? (
                     <p className="text-stone-500 text-sm">Tidak memerlukan peralatan khusus.</p>
                  ) : (
                     <ul className="space-y-3">
                        {video.toolsNeeded.map((tool, idx) => (
                           <li key={idx} className="flex items-start gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                              <span className="text-stone-700 dark:text-stone-300 font-medium">{tool}</span>
                           </li>
                        ))}
                     </ul>
                  )}
               </div>
            </div>
         </div>
      </article>

    </div>
  );
}
