import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

import { stripMarkdown } from "../../../lib/utils";

export default async function ArticlesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out px-4 xl:px-0">
      <header className="space-y-3 pb-6 border-b border-stone-200 dark:border-stone-800">
        <h1 className="text-3xl md:text-4xl font-serif text-stone-900 dark:text-white">
          Artikel & <span className="text-amber-600 dark:text-amber-500 italic">Publikasi</span>
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-lg font-light max-w-2xl">
          Eksplorasi kumpulan bacaan, tips jitu, ulasan studi kasus restorasi, hingga fun fact menarik lainnya untuk menjaga kilau koleksi Anda.
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="text-center py-20 px-4 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-200 dark:border-stone-800 border-dashed">
          <svg className="w-16 h-16 mx-auto text-stone-300 dark:text-stone-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">Belum ada publikasi terbit</h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm">Kembali beberapa saat lagi ya! Admin sedang menyiapkan bacaan menarik.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link 
              key={article.id} 
              href={`/dashboard/articles/${article.slug}`}
              className="group flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-500"
            >
              <div className="relative aspect-video bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <img 
                  src={article.coverImage} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-500" />
                <div className="absolute top-3 left-3">
                  <span className="inline-block px-2.5 py-1 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm text-stone-900 dark:text-stone-100 text-[10px] font-bold tracking-wider rounded border border-stone-200/50 dark:border-stone-700/50 shadow-sm uppercase">
                    {article.tag}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-serif font-medium text-lg text-stone-900 dark:text-white leading-snug mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-3 mt-auto font-light leading-relaxed">
                  {stripMarkdown(article.content).substring(0, 150)}...
                </p>
                <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-medium text-stone-400 dark:text-stone-500">
                  <span className="flex items-center gap-1 hover:text-amber-600 transition-colors group-hover:text-amber-600">
                    Baca Selengkapnya
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span>{new Date(article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
