import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import prisma from "../../../../lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ShareActions from "./ShareActions";
import MarkdownContent from "../MarkdownContent";

export default async function ArticleReaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) {
    notFound();
  }

  // Related articles (latest 3 excluding current)
  const relatedArticles = await prisma.article.findMany({
    where: { id: { not: article.id } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out px-4 xl:px-0">
      {/* Back Button */}
      <div className="mb-8 pt-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-500 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Kembali ke Dashboard
        </Link>
      </div>

      {/* Article Header */}
      <header className="space-y-6 mb-10 border-b border-stone-200 dark:border-stone-800 pb-10">
        <div className="flex items-center gap-3">
           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
             {article.tag}
           </span>
           <span className="text-sm font-medium text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
             </svg>
             {new Date(article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
           </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-medium text-stone-900 dark:text-white leading-[1.15] tracking-tight">
          {article.title}
        </h1>
        <div className="flex items-center gap-3 pt-2">
          <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 border-2 border-white dark:border-stone-900 shadow-sm flex items-center justify-center overflow-hidden">
             <img src="/landing-page/logo.jpg" alt="Cleanova" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-white">Cleanova Team</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">Instruktur & Kurator</p>
          </div>
        </div>
      </header>

      {/* Article Cover */}
      <div className="mb-12 w-full max-w-4xl mx-auto relative aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden shadow-xl border border-stone-200 dark:border-stone-800">
        <img 
          src={article.coverImage} 
          alt={article.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Article Content */}
      <MarkdownContent content={article!.content} />

      {/* Share / Footer */}
      <div className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center">
         <p className="text-stone-500 text-sm font-medium">Terima kasih telah membaca!</p>
         <ShareActions title={article!.title} url={`/dashboard/articles/${article!.slug}`} />
      </div>

      {/* Suggested Next reading */}
      {relatedArticles.length > 0 && (
        <div className="mt-16 pt-12 border-t-4 border-stone-100 dark:border-stone-900">
           <h3 className="text-2xl font-serif font-medium text-stone-900 dark:text-white mb-8">Bacaan Lainnya</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {relatedArticles.map((rel) => (
                <Link 
                  key={rel.id} 
                  href={`/dashboard/articles/${rel.slug}`}
                  className="group block"
                >
                  <div className="aspect-video rounded-xl overflow-hidden bg-stone-100 mb-3 border border-stone-200 dark:border-stone-800 relative">
                    <img src={rel.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                     <div className="absolute inset-0 bg-stone-900/5 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                  <h4 className="font-semibold text-stone-900 dark:text-stone-200 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1">{new Date(rel.createdAt).toLocaleDateString()}</p>
                </Link>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}
