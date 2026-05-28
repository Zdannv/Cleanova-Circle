"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateProfileAction } from "./actions";

type UserData = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  avatar: string | null;
  password?: string | null;
};

export default function ProfileClient({
  user,
  avatars,
  isAdmin = false,
}: {
  user: UserData;
  avatars: string[];
  isAdmin?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user.avatar || "1.png");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    
    const formData = new FormData(e.currentTarget);
    formData.append("avatar", selectedAvatar); // Inject avatar state into formData

    startTransition(async () => {
      try {
        await updateProfileAction(formData);
        await updateSession({
          name: formData.get("name"),
          avatar: selectedAvatar,
        });
        router.refresh();
        router.push("/dashboard");
      } catch (err: any) {
        setErrorMsg(err.message || "Gagal memperbarui profil.");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header */}
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-serif text-stone-900 dark:text-white">
          Pengaturan <span className="text-amber-600 dark:text-amber-500 italic">Profil</span>
        </h1>
        <p className="text-stone-500 dark:text-stone-400 font-light">
          Kustomisasi akun Anda. Atur nama, password, dan identitas visual di Cleanova Circle.
        </p>
      </header>

      {isAdmin && (
        <Link
          href="/admin"
          className="group block bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-900/20 dark:to-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-3xl p-6 md:p-7 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif font-semibold text-lg md:text-xl text-stone-900 dark:text-white">CMS Admin Panel</h2>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white">Admin</span>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400 font-light mt-0.5">
                Kelola artikel, video, dan konten Cleanova Circle.
              </p>
            </div>
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-500 group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      )}

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm relative">
        {isPending && (
          <div className="absolute inset-0 bg-white/50 dark:bg-stone-950/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin flex-shrink-0" />
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-8 md:p-10">
          
          {successMsg && (
            <div className="mb-8 p-4 bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/40 rounded-xl text-sm font-medium">
              ✓ {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40 rounded-xl text-sm font-medium">
               ⚠ {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            
            {/* Avatar Section */}
            <div className="md:col-span-5 space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 text-lg border-b border-stone-100 dark:border-stone-800 pb-2">Foto Profil</h3>
                <p className="text-sm font-light text-stone-500 dark:text-stone-400">Pilih salah satu avatar premium di bawah ini.</p>
              </div>
              
              <div className="flex justify-center md:justify-start mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-amber-100 dark:border-amber-900/30 shadow-xl bg-stone-100 dark:bg-stone-800">
                  <Image 
                    src={`/avatar/${selectedAvatar}`} 
                    alt="Current Avatar" 
                    fill 
                    className="object-contain p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 gap-3 bg-stone-50 dark:bg-stone-950/50 p-4 rounded-2xl border border-stone-100 dark:border-stone-800/50 h-64 overflow-y-auto">
                {avatars.map((avatarFile) => (
                  <button
                    key={avatarFile}
                    type="button"
                    onClick={() => setSelectedAvatar(avatarFile)}
                    className={`relative w-full aspect-square rounded-full overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${selectedAvatar === avatarFile ? "border-amber-500 shadow-md shadow-amber-500/20 ring-2 ring-amber-200 dark:ring-amber-900/50 transform scale-105" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <Image 
                      src={`/avatar/${avatarFile}`} 
                      alt={`Avatar ${avatarFile}`} 
                      fill 
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Data Section */}
            <div className="md:col-span-7 space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 text-lg border-b border-stone-100 dark:border-stone-800 pb-2">Data Pribadi</h3>
                <p className="text-sm font-light text-stone-500 dark:text-stone-400">Pastikan informasi di bawah ini tetap akurat.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Nama Lengkap (Username)</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    defaultValue={user.name}
                    required 
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="phone" className="block text-sm font-medium text-stone-500 dark:text-stone-500">Nomor Telepon (ID Login)</label>
                  <input 
                    type="text" 
                    id="phone" 
                    defaultValue={user.phone}
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 cursor-not-allowed opacity-70" 
                  />
                  <p className="text-xs text-stone-400 mt-1">Hubungi admin jika Anda perlu mengubah nomor telepon.</p>
                </div>

                <div className="space-y-1.5 pt-4">
                  <label htmlFor="password" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Password Baru</label>
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" 
                  />
                </div>
              </div>

              <div className="pt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button 
                  type="button" 
                  onClick={() => router.push("/dashboard")}
                  className="w-full sm:w-auto px-6 py-3.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full sm:w-auto px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center min-w-[160px]"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
