"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { addVideoAction, updateVideoAction, deleteVideoAction } from "./actions";

type Video = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: "CLEANOVA_PRODUCT" | "DIY_HACKS";
  toolsNeeded: string[];
  createdAt: Date;
};

export default function AdminClient({
  videos,
  user,
}: {
  videos: Video[];
  user: any;
}) {
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
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

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus video ini secara permanen?")) {
      startTransition(async () => {
        if (editingVideo?.id === id) setEditingVideo(null);
        await deleteVideoAction(id);
      });
    }
  };

  const handleEditClick = (video: Video) => {
    setEditingVideo(video);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingVideo(null);
    formRef.current?.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      {/* Sidebar Layout */}
      <aside className="w-64 bg-gray-900 text-white hidden md:flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold tracking-wider">CMS ADMIN</h1>
          <p className="text-xs text-gray-400 mt-1">Cleanova Circle</p>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 relative">
          <div className="bg-gray-800 text-white px-4 py-3 rounded-md flex items-center gap-3 font-medium">
            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Manajemen Video
          </div>
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
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">Manajemen Konten Video</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">Admin: {user.name}</span>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* CREATE & EDIT: Form Section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
            {isPending && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                 <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin"></div>
              </div>
            )}
            
            <div className={`px-6 py-5 border-b border-gray-200 transition-colors ${editingVideo ? "bg-blue-50/50" : "bg-gray-50/50"}`}>
              <h3 className="text-base font-semibold text-gray-800 flex items-center justify-between">
                <span>{editingVideo ? "Edit Konten Video" : "Tambah Konten Baru"}</span>
                {editingVideo && (
                   <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md">Mode Edit Aktif</span>
                )}
              </h3>
            </div>

            <form action={handleSubmit} ref={formRef} className="p-6">
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
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori</label>
                  <select id="category" name="category" required defaultValue={editingVideo?.category || ""} className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white">
                    <option value="" disabled>-- Pilih Kategori --</option>
                    <option value="DIY_HACKS">DIY Hacks & Tricks</option>
                    <option value="CLEANOVA_PRODUCT">Rekomendasi Produk</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="toolsNeeded" className="block text-sm font-medium text-gray-700">Peralatan (Gunakan koma untuk memisahkan item)</label>
                  <input type="text" id="toolsNeeded" name="toolsNeeded" defaultValue={editingVideo?.toolsNeeded.join(", ") || ""} className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Kain, Air Hangat, Sikat Halus" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi Lengkap</label>
                  <textarea id="description" name="description" rows={3} required defaultValue={editingVideo?.description || ""} className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y" placeholder="Tulis deskripsi konten video..."></textarea>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                {editingVideo && (
                   <button type="button" onClick={cancelEdit} className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md shadow-sm transition-colors text-sm disabled:opacity-50" disabled={isPending}>
                      Batal
                   </button>
                )}
                <button type="submit" disabled={isPending} className={`px-6 py-2.5 text-white font-medium rounded-md shadow-sm transition-colors text-sm disabled:opacity-50 flex items-center justify-center min-w-[140px] ${editingVideo ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-900 hover:bg-black"}`}>
                  {isPending ? "Menyimpan..." : (editingVideo ? "Simpan Perubahan" : "Tambah Video")}
                </button>
              </div>
            </form>
          </section>

          {/* READ, UPDATE & DELETE: Management Table Section */}
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
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                        Belum ada video yang ditambahkan.
                      </td>
                    </tr>
                  ) : (
                    videos.map((video) => (
                      <tr key={video.id} className={`transition-colors ${editingVideo?.id === video.id ? "bg-blue-50/30" : "hover:bg-gray-50"}`}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">{video.title}</div>
                          <div className="text-xs text-gray-500 line-clamp-1 mt-0.5" title={video.url}>{video.url}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${video.category === 'DIY_HACKS' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                            {video.category === 'DIY_HACKS' ? 'DIY Hacks' : 'Produk'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                           <div className="flex items-center justify-center gap-2">
                             <button onClick={() => handleEditClick(video)} className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-white text-gray-700 hover:bg-gray-50 rounded transition-colors border border-gray-300">
                                Edit
                             </button>
                             <button onClick={() => handleDelete(video.id)} disabled={isPending} className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded transition-colors border border-red-200 disabled:opacity-50">
                                Hapus
                             </button>
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
      </main>
    </div>
  );
}
