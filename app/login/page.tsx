"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      phone,
      password,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] dark:bg-stone-950 px-4 sm:px-6 relative overflow-hidden font-sans">
      
      {/* Background Accent */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-gradient-to-bl from-amber-200/40 to-transparent rounded-full blur-3xl pointer-events-none dark:from-amber-900/20"></div>

      <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-800 p-8 sm:p-10 relative z-10 transition-colors">
        
        <div className="text-center mb-10 flex flex-col items-center">
          <Image 
            src="/landing-page/logo.jpg" 
            alt="Cleanova Circle Logo" 
            width={60} height={60}
            className="w-16 h-16 rounded-full object-contain shadow-lg shadow-amber-500/20 mb-5"
          />
          <h1 className="text-3xl font-serif font-light text-stone-900 dark:text-white tracking-tight mb-2">
            Masuk <span className="text-amber-600 dark:text-amber-500 italic font-medium">Akun</span>
          </h1>
          <p className="text-stone-500 dark:text-stone-400 font-light text-sm">
            Silakan masuk untuk mengakses Pustaka Video Cleanova Circle Anda.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium tracking-wide text-stone-700 dark:text-stone-300">Nomor Telepon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="Contoh: 08123456789"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium tracking-wide text-stone-700 dark:text-stone-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="Masukkan password Anda"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:ring-amber-500/50 text-white font-medium transition-all shadow-lg shadow-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-4"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Masuk...
              </span>
            ) : (
              "Masuk Sekarang"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-stone-500 dark:text-stone-400 font-light">
          Belum berlangganan? <a href="https://wa.me/6287855310680?text=Halo%20Admin%20Cleanova,%20saya%20tertarik%20untuk%20mendaftar%20langganan%20web%20edukasi%20Cleanova%20Circle." target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-500 font-medium hover:underline">Hubungi Admin</a>
        </p>
      </div>
    </div>
  );
}
