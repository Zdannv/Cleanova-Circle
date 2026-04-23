"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { 
  addVideoAction, 
  updateVideoAction, 
  deleteVideoAction,
  createCategoryAction,
  deleteCategoryAction,
  createUserAction,
  deleteUserAction
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

export default function AdminClient({
  videos,
  categories,
  users,
  user,
}: {
  videos: Video[];
  categories: Category[];
  users: User[];
  user: any;
}) {
  const [activeTab, setActiveTab] = useState<"VIDEOS" | "CATEGORIES" | "USERS">("VIDEOS");
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const categoryFormRef = useRef<HTMLFormElement>(null);
  const userFormRef = useRef<HTMLFormElement>(null);

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
            onClick={() => setActiveTab("USERS")}
            className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-3 font-medium transition-colors ${activeTab === 'USERS' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Akun Pengguna
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

        </div>
	      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex justify-around p-2 z-50 border-t border-gray-800 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <button onClick={() => setActiveTab("VIDEOS")} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'VIDEOS' ? 'text-blue-400 bg-gray-800' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          <span className="text-[10px] font-medium tracking-wide">Video</span>
        </button>
        <button onClick={() => setActiveTab("CATEGORIES")} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'CATEGORIES' ? 'text-blue-400 bg-gray-800' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          <span className="text-[10px] font-medium tracking-wide">Kategori</span>
        </button>
        <button onClick={() => setActiveTab("USERS")} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'USERS' ? 'text-blue-400 bg-gray-800' : 'text-gray-400 hover:text-gray-200'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <span className="text-[10px] font-medium tracking-wide">Pengguna</span>
        </button>
        <Link href="/dashboard" className="flex flex-col items-center p-2 rounded-lg text-rose-400 hover:text-rose-300">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="text-[10px] font-medium tracking-wide">Dashboard</span>
        </Link>
      </nav>
    </div>
  );
}
