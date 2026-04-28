"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const MarkdownPreview = dynamic(() => import("../dashboard/articles/MarkdownContent"), { ssr: false });
import { 
  addVideoAction, 
  updateVideoAction, 
  deleteVideoAction,
  createCategoryAction,
  deleteCategoryAction,
  createUserAction,
  deleteUserAction,
  addArticleAction,
  updateArticleAction,
  deleteArticleAction,
  updateLandingPageAction
} from "./actions";

type Category = {
  id: string;
  name: string;
  createdAt: Date;
};

type User = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
};

type Video = {
  id: string;
  title: string;
  description: string;
  url: string;
  categoryId: string | null;
  Category?: Category | null;
  toolsNeeded: string[];
  createdAt: Date;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  content: string;
  tag: string;
  createdAt: Date;
};

type LandingPage = {
  logoUrl: string;
  whatsappUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImageUrl: string;
  valueTitle: string;
  valueDescription: string;
  valueCard1Title: string;
  valueCard1Text: string;
  valueCard2Title: string;
  valueCard2Text: string;
  valueCard3Title: string;
  valueCard3Text: string;
  featureTitle: string;
  featureSubtitle: string;
  feature1Title: string;
  feature1Description: string;
  feature1ImageUrl: string;
  feature2Title: string;
  feature2Description: string;
  feature2ImageUrl: string;
  feature3Title: string;
  feature3Description: string;
  feature3ImageUrl: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaDescription: string;
} | null;

export default function AdminClient({
  videos,
  categories,
  users,
  articles,
  landingPage,
  user,
}: {
  videos: Video[];
  categories: Category[];
  users: User[];
  articles: Article[];
  landingPage: LandingPage;
  user: any;
}) {
  const [activeTab, setActiveTab] = useState<"VIDEOS" | "CATEGORIES" | "USERS" | "ARTICLES" | "LANDING">("VIDEOS");
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleContent, setArticleContent] = useState("");
  const [isDocxLoading, setIsDocxLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const categoryFormRef = useRef<HTMLFormElement>(null);
  const userFormRef = useRef<HTMLFormElement>(null);
  const articleFormRef = useRef<HTMLFormElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);

  // VIDEO ACTIONS
  const handleVideoSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (editingVideo) {
        await updateVideoAction(editingVideo.id, formData);
        setEditingVideo(null);
      } else {
        await addVideoAction(formData);
      }
      formRef.current?.reset();
    });
  };

  const handleVideoDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus video ini secara permanen?")) {
      startTransition(async () => {
        if (editingVideo?.id === id) setEditingVideo(null);
        await deleteVideoAction(id);
      });
    }
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setActiveTab("VIDEOS");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // CATEGORY ACTIONS
  const handleCategorySubmit = (formData: FormData) => {
    startTransition(async () => {
      await createCategoryAction(formData.get("name") as string);
      categoryFormRef.current?.reset();
    });
  };

  const handleCategoryDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kategori ini? (Catatan: video yang memiliki kategori ini akan kehilangan relasinya)")) {
      startTransition(async () => {
        await deleteCategoryAction(id);
      });
    }
  };

  // USER ACTIONS
  const handleUserSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createUserAction(formData);
      userFormRef.current?.reset();
    });
  };

  const handleUserDelete = (id: string) => {
    if (confirm("Hapus user ini beserta semua data miliknya (progress, catatan, bookmark)?")) {
      startTransition(async () => {
        try {
          await deleteUserAction(id);
        } catch (error: any) {
          alert(error.message);
        }
      });
    }
  };

  // ARTICLE ACTIONS
  const handleArticleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (editingArticle) {
        await updateArticleAction(editingArticle.id, formData);
        setEditingArticle(null);
      } else {
        await addArticleAction(formData);
      }
      articleFormRef.current?.reset();
    });
  };

  const handleArticleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus artikel/publikasi ini?")) {
      startTransition(async () => {
        if (editingArticle?.id === id) setEditingArticle(null);
        await deleteArticleAction(id);
      });
    }
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setArticleContent(article.content);
    setActiveTab("ARTICLES");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // LANDING PAGE ACTIONS
  const handleLandingSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateLandingPageAction(formData);
      alert("Landing page berhasil diperbarui!");
    });
  };

  // DOCX IMPORT
  const htmlToMarkdown = (html: string): string => {
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n\n# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\n## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n\n### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n\n#### $1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, ' **$1** ')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, ' **$1** ')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, ' *$1* ')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, ' *$1* ')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '\n- $1')
      .replace(/<ul[^>]*>/gi, '\n\n')
      .replace(/<ol[^>]*>/gi, '\n\n')
      .replace(/<\/ul>/gi, '\n\n')
      .replace(/<\/ol>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n\n$1\n\n')
      .replace(/<div[^>]*>(.*?)<\/div>/gi, '\n\n$1\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const handleDocxImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsDocxLoading(true);
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const markdown = htmlToMarkdown(result.value);
      setArticleContent(markdown);
      setShowPreview(true);
    } catch (err) {
      alert("Gagal membaca file .docx. Pastikan file tidak corrupt.");
      console.error(err);
    } finally {
      setIsDocxLoading(false);
      if (docxInputRef.current) docxInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      {/* Sidebar Layout */}
      <aside className="w-64 bg-gray-900 text-white hidden md:flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold tracking-wider">CMS ADMIN</h1>
          <p className="text-xs text-gray-400 mt-1">Cleanova Circle</p>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 relative">
          <button 
            type="button"
            onClick={() => setActiveTab("VIDEOS")}
            className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-3 font-medium transition-colors ${activeTab === 'VIDEOS' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Manajemen Video
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("CATEGORIES")}
            className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-3 font-medium transition-colors ${activeTab === 'CATEGORIES' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Kategori Video
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("ARTICLES")}
            className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-3 font-medium transition-colors ${activeTab === 'ARTICLES' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Artikel
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("USERS")}
            className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-3 font-medium transition-colors ${activeTab === 'USERS' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Akun Pengguna
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("LANDING")}
            className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-3 font-medium transition-colors ${activeTab === 'LANDING' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 18c-5.982 0-10.833-4.851-10.833-10.833" />
            </svg>
            Landing Page
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 md:pb-0">
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-10 shrink-0 gap-3 md:gap-0">
          <div>
            <h1 className="md:hidden text-lg font-bold tracking-widest text-gray-900 mb-1">CMS ADMIN</h1>
            <h2 className="text-md md:text-lg font-semibold text-gray-500 md:text-gray-800">
              {activeTab === "VIDEOS" && "Manajemen Konten Video"}
              {activeTab === "CATEGORIES" && "Pengaturan Kategori"}
              {activeTab === "USERS" && "Pusat Akun Pengguna"}
              {activeTab === "LANDING" && "Kelola Konten Landing Page"}
            </h2>
          </div>
          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="text-xs md:text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full ring-1 ring-gray-200">Admin: {user.name}</span>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto w-full relative">
          
          {isPending && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
              <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin flex-shrink-0" />
            </div>
          )}

          {/* TAB 1: VIDEOS */}
          {activeTab === "VIDEOS" && (
            <>
              {/* Form Video */}
              <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
                <div className={`px-6 py-5 border-b border-gray-200 transition-colors ${editingVideo ? "bg-blue-50/50" : "bg-gray-50/50"}`}>
                  <h3 className="text-base font-semibold text-gray-800 flex items-center justify-between">
                    <span>{editingVideo ? "Edit Konten Video" : "Tambah Konten Baru"}</span>
                    {editingVideo && (
                       <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md">Mode Edit Aktif</span>
                    )}
                  </h3>
                </div>

                <form action={handleVideoSubmit} ref={formRef} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 md:col-span-2">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Video</label>
                      <input type="text" id="title" name="title" required defaultValue={editingVideo?.title || ""} className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Masukkan judul video materi" />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label htmlFor="url" className="block text-sm font-medium text-gray-700">Tautan Video (URL YouTube)</label>
                      <input type="url" id="url" name="url" required defaultValue={editingVideo?.url || ""} className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="https://www.youtube.com/watch?v=..." />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Kategori</label>
                      <select id="categoryId" name="categoryId" required defaultValue={editingVideo?.categoryId || ""} className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white">
                        <option value="" disabled>-- Pilih Kategori --</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      {categories.length === 0 && (
                        <p className="text-xs text-rose-500 mt-1">Belum ada kategori! Buat kategori di tab Kategori Video terlebih dahulu.</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="toolsNeeded" className="block text-sm font-medium text-gray-700">Peralatan (Beri koma antar item)</label>
                      <input type="text" id="toolsNeeded" name="toolsNeeded" defaultValue={editingVideo?.toolsNeeded.join(", ") || ""} className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Kain, Air Hangat, Sikat Halus" />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi Lengkap</label>
                      <textarea id="description" name="description" rows={3} required defaultValue={editingVideo?.description || ""} className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y" placeholder="Tulis deskripsi konten video..."></textarea>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    {editingVideo && (
                       <button type="button" onClick={() => { setEditingVideo(null); formRef.current?.reset(); }} className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md shadow-sm transition-colors text-sm disabled:opacity-50" disabled={isPending}>
                          Batal
                       </button>
                    )}
                    <button type="submit" disabled={isPending || categories.length === 0} className={`px-6 py-2.5 text-white font-medium rounded-md shadow-sm transition-colors text-sm disabled:opacity-50 flex items-center justify-center min-w-[140px] ${editingVideo ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-900 hover:bg-black"}`}>
                      {editingVideo ? "Simpan Perubahan" : "Tambah Video"}
                    </button>
                  </div>
                </form>
              </section>

              {/* Tabel Video */}
              <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-base font-semibold text-gray-800">Daftar Video</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">Total: {videos.length}</span>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                        <th className="px-6 py-4">Judul</th>
                        <th className="px-6 py-4 w-48">Kategori</th>
                        <th className="px-6 py-4 w-40 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {videos.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">Belum ada video yang ditambahkan.</td>
                        </tr>
                      ) : (
                        videos.map((video) => (
                          <tr key={video.id} className={`transition-colors ${editingVideo?.id === video.id ? "bg-blue-50/30" : "hover:bg-gray-50"}`}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 line-clamp-1">{video.title}</div>
                              <div className="text-xs text-gray-500 line-clamp-1 mt-0.5" title={video.url}>{video.url}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {video.Category?.name || "Tidak ada kategori"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleEditVideo(video)} className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-white text-gray-700 hover:bg-gray-50 rounded transition-colors border border-gray-300">Edit</button>
                                <button onClick={() => handleVideoDelete(video.id)} disabled={isPending} className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded transition-colors border border-red-200 disabled:opacity-50">Hapus</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* TAB 2: CATEGORIES */}
          {activeTab === "CATEGORIES" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden lg:col-span-1">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                  <h3 className="text-base font-semibold text-gray-800">Tambah Kategori Baru</h3>
                </div>
                <form action={handleCategorySubmit} ref={categoryFormRef} className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Kategori</label>
                      <input type="text" id="name" name="name" required className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="e.g. Tips Dapur" />
                    </div>
                    <button type="submit" disabled={isPending} className="w-full px-6 py-2.5 text-white font-medium rounded-md shadow-sm transition-colors text-sm disabled:opacity-50 bg-gray-900 hover:bg-black">
                      Simpan Kategori
                    </button>
                  </div>
                </form>
              </section>

              <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-base font-semibold text-gray-800">Kategori Tersedia</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">Total: {categories.length}</span>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                        <th className="px-6 py-4">Nama</th>
                        <th className="px-6 py-4 w-40 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.length === 0 ? (
                        <tr><td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500">Belum ada kategori.</td></tr>
                      ) : (
                        categories.map((cat) => (
                          <tr key={cat.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                               <button onClick={() => handleCategoryDelete(cat.id)} disabled={isPending} className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded transition-colors border border-red-200 disabled:opacity-50">Hapus</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: USERS */}
          {activeTab === "USERS" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden lg:col-span-1 border-t-4 border-t-amber-500">
                <div className="px-6 py-5 border-b border-gray-200 bg-amber-50/30">
                  <h3 className="text-base font-semibold text-gray-800">Pendaftaran Akun Baru</h3>
                </div>
                <form action={handleUserSubmit} ref={userFormRef} className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="userName" className="block text-sm font-medium text-gray-700">Nama Pengguna</label>
                      <input type="text" id="userName" name="name" required className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors" placeholder="Nama Lengkap" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">Email Utama</label>
                      <input type="email" id="userEmail" name="email" required className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors" placeholder="nama@email.com" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="userPhone" className="block text-sm font-medium text-gray-700">Nomor Telepon (ID Login)</label>
                      <input type="text" id="userPhone" name="phone" required className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors" placeholder="081xxx" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="userPassword" className="block text-sm font-medium text-gray-700">Password</label>
                      <input type="text" id="userPassword" name="password" required className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors" placeholder="Buat password login" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="userRole" className="block text-sm font-medium text-gray-700">Hak Akses (Role)</label>
                      <select id="userRole" name="role" required defaultValue="USER" className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors bg-white">
                        <option value="USER">User Reguler</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </div>
                    <button type="submit" disabled={isPending} className="w-full mt-2 px-6 py-2.5 text-white font-medium rounded-md shadow-sm transition-colors text-sm disabled:opacity-50 bg-amber-600 hover:bg-amber-700">
                      Buat Akun
                    </button>
                  </div>
                </form>
              </section>

              <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-base font-semibold text-gray-800">Daftar Akun Pengguna</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">Total: {users.length}</span>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                        <th className="px-6 py-4">Identitas</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.length === 0 ? (
                        <tr><td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">Belum ada akun.</td></tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{u.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{u.email || "Tanpa Email"}</div>
                              <div className="text-xs font-mono text-gray-500 mt-0.5">{u.phone}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                               <button 
                                 onClick={() => handleUserDelete(u.id)} 
                                 disabled={isPending || u.id === user.id} 
                                 className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                               >
                                 Hapus
                               </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* TAB 4: ARTICLES */}
          {activeTab === "ARTICLES" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden lg:col-span-1 h-fit">
                <div className={`px-6 py-5 border-b border-gray-200 transition-colors ${editingArticle ? "bg-amber-50/50" : "bg-gray-50/50"}`}>
                  <h3 className="text-base font-semibold text-gray-800 flex flex-col gap-1">
                    <span>{editingArticle ? "Edit Artikel" : "Tambah Artikel Baru"}</span>
                    {editingArticle && <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded w-fit">Mode Edit Aktif</span>}
                  </h3>
                </div>
                <form action={handleArticleSubmit} ref={articleFormRef} className="p-6 space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Artikel</label>
                    <input type="text" id="title" name="title" required defaultValue={editingArticle?.title || ""} className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Contoh: Tips Merawat Sepatu Putih" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="tag" className="block text-sm font-medium text-gray-700">Tag / Kategori</label>
                    <input type="text" id="tag" name="tag" defaultValue={editingArticle?.tag || "Artikel"} className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Contoh: TIPS & TRIK" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">Cover Image URL</label>
                    <input
                      type="text"
                      id="coverImage"
                      name="coverImage"
                      required
                      defaultValue={editingArticle?.coverImage || ""}
                      className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                      placeholder="https://i.postimg.cc/xxxxxx/nama-file.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Untuk gambar dari Postimages, pastikan URL diawali <code className="bg-gray-100 px-1 rounded text-indigo-600">https://i.postimg.cc/</code> (bukan <code className="bg-gray-100 px-1 rounded text-red-500">postimg.cc</code>). Cara: setelah upload → klik kanan gambar → <em>Copy image address</em>.
                      Untuk gambar lokal gunakan path seperti <code className="bg-gray-100 px-1 rounded text-indigo-600">/landing-page/nama.jpg</code>
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700">Isi Artikel <span className="text-xs font-normal text-gray-400">(Markdown)</span></label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {isDocxLoading && (
                          <span className="text-xs text-indigo-600 flex items-center gap-1">
                            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                            Mengkonversi dokumen...
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => docxInputRef.current?.click()}
                          disabled={isDocxLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors disabled:opacity-50"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          Import dari .docx
                        </button>
                        {articleContent && (
                          <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-md transition-colors ${showPreview ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {showPreview ? 'Edit Mode' : 'Preview'}
                          </button>
                        )}
                        <input
                          ref={docxInputRef}
                          type="file"
                          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          className="hidden"
                          onChange={handleDocxImport}
                        />
                      </div>
                    </div>
                    {/* Hidden input selalu ada — memastikan content terkirim saat preview mode aktif */}
                    <input type="hidden" name="content" value={articleContent} />
                    {showPreview && articleContent ? (
                      <div className="w-full min-h-[300px] px-4 py-3 rounded-md border border-emerald-200 bg-white overflow-auto text-sm">
                        <MarkdownPreview content={articleContent} />
                      </div>
                    ) : (
                      <textarea
                        id="content"
                        rows={12}
                        required={!articleContent}
                        value={articleContent}
                        onChange={(e) => setArticleContent(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                        placeholder={"Tulis konten artikel di sini...\n\nTips format Markdown:\n# Judul Besar\n## Subjudul\n**teks tebal**, *teks miring*\n- item list"}
                      />
                    )}
                    {articleContent && (
                      <p className="text-xs text-gray-500">{articleContent.length.toLocaleString()} karakter · {articleContent.split('\n').filter(Boolean).length} baris teks</p>
                    )}
                  </div>
                  <div className="pt-2 flex gap-3">
                     {editingArticle && (
                       <button type="button" onClick={() => { setEditingArticle(null); setArticleContent(""); articleFormRef.current?.reset(); }} className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm transition-colors text-sm" disabled={isPending}>Batal</button>
                     )}
                    <button type="submit" disabled={isPending || isDocxLoading} className="flex-1 py-2.5 text-white font-medium rounded-md shadow-sm transition-colors text-sm bg-gray-900 hover:bg-black disabled:opacity-50">
                      {editingArticle ? "Simpan Perbaikan" : "Publikasi Artikel"}
                    </button>
                  </div>
                </form>
              </section>

              <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-base font-semibold text-gray-800">Daftar Publikasi Topik</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">Total: {articles.length}</span>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                        <th className="px-6 py-4">Judul & Tag</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {articles.length === 0 ? (
                        <tr><td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500">Belum ada artikel.</td></tr>
                      ) : (
                        articles.map((a) => (
                          <tr key={a.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-gray-900 mb-1">{a.title}</div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                                {a.tag}
                              </span>
                              <div className="text-xs text-gray-500 mt-1 truncate max-w-sm">{a.slug}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                               <div className="flex items-center justify-end gap-2">
                                 <button onClick={() => handleEditArticle(a)} className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-white text-gray-700 hover:bg-gray-50 rounded transition-colors border border-gray-300">Edit</button>
                                 <button onClick={() => handleArticleDelete(a.id)} disabled={isPending} className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded transition-colors border border-red-200 disabled:opacity-50">Hapus</button>
                               </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* TAB 5: LANDING PAGE */}
          {activeTab === "LANDING" && (
            <div className="space-y-8 pb-10">
              <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden text-gray-900">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-base font-semibold text-gray-800">Pengaturan Landing Page</h3>
                  <button 
                    form="landing-page-form"
                    type="submit" 
                    disabled={isPending}
                    className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-black transition-colors disabled:opacity-50"
                  >
                    Simpan Semua Perubahan
                  </button>
                </div>
                <form id="landing-page-form" action={handleLandingSubmit} className="p-6 space-y-12">
                   {/* Header & Logo */}
                   <div className="space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-amber-600 border-b pb-2">Header & Logo</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Logo Image URL</label>
                        <input type="text" name="logoUrl" defaultValue={landingPage?.logoUrl || "/landing-page/logo.jpg"} className="w-full px-4 py-2 border rounded-md text-sm font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">WhatsApp URL</label>
                        <input type="text" name="whatsappUrl" defaultValue={landingPage?.whatsappUrl || "https://wa.me/..."} className="w-full px-4 py-2 border rounded-md text-sm font-mono" />
                      </div>
                    </div>
                  </div>

                  {/* Hero Section */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-amber-600 border-b pb-2">Hero Section</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Hero Title</label>
                        <input type="text" name="heroTitle" defaultValue={landingPage?.heroTitle || "Kembalikan Kilau"} className="w-full px-4 py-2 border rounded-md text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Hero Subtitle</label>
                        <input type="text" name="heroSubtitle" defaultValue={landingPage?.heroSubtitle || "Koleksi Berharga Anda."} className="w-full px-4 py-2 border rounded-md text-sm italic" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Hero Description</label>
                        <textarea name="heroDescription" rows={3} defaultValue={landingPage?.heroDescription || ""} className="w-full px-4 py-2 border rounded-md text-sm" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Hero Image URL</label>
                        <input type="text" name="heroImageUrl" defaultValue={landingPage?.heroImageUrl || ""} className="w-full px-4 py-2 border rounded-md text-sm font-mono" />
                      </div>
                    </div>
                  </div>

                  {/* Value Section */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-amber-600 border-b pb-2">Value Section</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Value Title</label>
                        <input type="text" name="valueTitle" defaultValue={landingPage?.valueTitle || ""} className="w-full px-4 py-2 border rounded-md text-sm" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Value Description</label>
                        <textarea name="valueDescription" rows={3} defaultValue={landingPage?.valueDescription || ""} className="w-full px-4 py-2 border rounded-md text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-amber-600 border-b pb-2">Features Section</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Feature 1 Title</label>
                        <input type="text" name="feature1Title" defaultValue={landingPage?.feature1Title || ""} className="w-full px-4 py-2 border rounded-md text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Feature 1 Image URL</label>
                        <input type="text" name="feature1ImageUrl" defaultValue={landingPage?.feature1ImageUrl || ""} className="w-full px-4 py-2 border rounded-md text-xs font-mono" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Feature 1 Desc</label>
                        <textarea name="feature1Description" rows={2} defaultValue={landingPage?.feature1Description || ""} className="w-full px-4 py-2 border rounded-md text-sm" />
                      </div>
                    </div>
                    {/* Add Feature 2 & 3 similarly if user needs, but let's keep it compact for now or do it all */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Feature 2 Title</label>
                        <input type="text" name="feature2Title" defaultValue={landingPage?.feature2Title || ""} className="w-full px-4 py-2 border rounded-md text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Feature 2 Image URL</label>
                        <input type="text" name="feature2ImageUrl" defaultValue={landingPage?.feature2ImageUrl || ""} className="w-full px-4 py-2 border rounded-md text-xs font-mono" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Feature 3 Title</label>
                        <input type="text" name="feature3Title" defaultValue={landingPage?.feature3Title || ""} className="w-full px-4 py-2 border rounded-md text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Feature 3 Image URL</label>
                        <input type="text" name="feature3ImageUrl" defaultValue={landingPage?.feature3ImageUrl || ""} className="w-full px-4 py-2 border rounded-md text-xs font-mono" />
                      </div>
                    </div>
                  </div>

                  {/* CTA Section */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-amber-600 border-b pb-2">CTA Section</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">CTA Title</label>
                        <input type="text" name="ctaTitle" defaultValue={landingPage?.ctaTitle || ""} className="w-full px-4 py-2 border rounded-md text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">CTA Subtitle</label>
                        <input type="text" name="ctaSubtitle" defaultValue={landingPage?.ctaSubtitle || ""} className="w-full px-4 py-2 border rounded-md text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t flex justify-end">
                    <button type="submit" disabled={isPending} className="px-10 py-4 bg-amber-600 text-white font-bold uppercase tracking-widest rounded-md hover:bg-amber-700 transition-all disabled:opacity-50">
                      Update Landing Page
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}

        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex justify-around p-1 z-50 border-t border-gray-800 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <button onClick={() => setActiveTab("VIDEOS")} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'VIDEOS' ? 'text-blue-400 bg-gray-800' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          <span className="text-[9px] font-medium tracking-wide">Video</span>
        </button>
        <button onClick={() => setActiveTab("CATEGORIES")} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'CATEGORIES' ? 'text-blue-400 bg-gray-800' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          <span className="text-[9px] font-medium tracking-wide">Kategori</span>
        </button>
        <button onClick={() => setActiveTab("ARTICLES")} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'ARTICLES' ? 'text-blue-400 bg-gray-800' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          <span className="text-[9px] font-medium tracking-wide">Publikasi</span>
        </button>
        <button onClick={() => setActiveTab("USERS")} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'USERS' ? 'text-blue-400 bg-gray-800' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <span className="text-[9px] font-medium tracking-wide">User</span>
        </button>
        <button onClick={() => setActiveTab("LANDING")} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'LANDING' ? 'text-blue-400 bg-gray-800' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 18c-5.982 0-10.833-4.851-10.833-10.833" /></svg>
          <span className="text-[9px] font-medium tracking-wide">Landing</span>
        </button>
        <Link href="/dashboard" className="flex flex-col items-center p-2 rounded-lg text-rose-400 hover:text-rose-300">
          <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="text-[9px] font-medium tracking-wide">Keluar</span>
        </Link>
      </nav>
    </div>
  );
}
