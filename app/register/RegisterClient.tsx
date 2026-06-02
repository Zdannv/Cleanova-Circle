"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { registerUserAction } from "./actions";
import PasswordInput from "../components/PasswordInput";
import { toast } from "sonner";

export default function RegisterClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptsMarketing, setAcceptsMarketing] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Nama wajib diisi.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return toast.error("Format email tidak valid.");
    if (password.length < 6) return toast.error("Password minimal 6 karakter.");
    if (password !== confirmPassword) return toast.error("Konfirmasi password tidak cocok.");
    if (!acceptsMarketing) return toast.error("Anda harus menyetujui penerimaan informasi promo untuk mendaftar.");

    setLoading(true);
    try {
      const result = await registerUserAction({
        name: name.trim(),
        email: email.trim(),
        password,
        acceptsMarketing,
      });

      if (!result.success) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      // Sukses → arahkan ke login.
      toast.success("Pendaftaran berhasil! Silakan masuk.");
      router.push("/login?registered=1");
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi nanti.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] dark:bg-stone-950 px-4 sm:px-6 py-10 relative overflow-hidden font-sans">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-gradient-to-bl from-amber-200/40 to-transparent rounded-full blur-3xl pointer-events-none dark:from-amber-900/20"></div>

      <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-800 p-8 sm:p-10 relative z-10 transition-colors">
        <div className="text-center mb-8 flex flex-col items-center">
          <Image
            src="/landing-page/logo.jpg"
            alt="Cleanova Circle Logo"
            width={60}
            height={60}
            className="w-16 h-16 rounded-full object-contain shadow-lg shadow-amber-500/20 mb-5"
          />
          <h1 className="text-3xl font-serif font-light text-stone-900 dark:text-white tracking-tight mb-2">
            Buat <span className="text-amber-600 dark:text-amber-500 italic font-medium">Akun</span>
          </h1>
          <p className="text-stone-500 dark:text-stone-400 font-light text-sm">
            Gabung Cleanova Circle dan dapatkan akses tips, promo, dan penawaran menarik.
          </p>
        </div>



        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium tracking-wide text-stone-700 dark:text-stone-300">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="Nama Anda"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium tracking-wide text-stone-700 dark:text-stone-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="email@anda.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium tracking-wide text-stone-700 dark:text-stone-300">Password</label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Minimal 6 karakter"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium tracking-wide text-stone-700 dark:text-stone-300">Konfirmasi Password</label>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Ulangi password Anda"
              required
              autoComplete="new-password"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none rounded-xl bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 px-4 py-3">
            <input
              type="checkbox"
              checked={acceptsMarketing}
              onChange={(e) => setAcceptsMarketing(e.target.checked)}
              required
              className="mt-0.5 w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 flex-shrink-0"
            />
            <span className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Saya setuju menerima informasi promo, tips kebersihan, dan penawaran menarik dari Cleanova.
            </span>
          </label>

          <button
            type="submit"
            disabled={!acceptsMarketing || loading}
            className="w-full py-4 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:ring-amber-500/50 text-white font-medium transition-all active:scale-[0.98] transition-transform duration-150 shadow-lg shadow-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mendaftar...
              </span>
            ) : (
              "Daftar Sekarang"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-stone-500 dark:text-stone-400 font-light">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-amber-600 dark:text-amber-500 font-medium hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
