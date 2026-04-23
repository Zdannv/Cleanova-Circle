"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
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
}: {
  user: UserData;
  avatars: string[];
}) {
  const [isPending, startTransition] = useTransition();
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
        setSuccessMsg("Profil berhasil diperbarui!");
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
                    className="object-cover"
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
                      className="object-cover"
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

              <div className="pt-8 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center min-w-[200px]"
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
