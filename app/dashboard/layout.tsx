"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    { label: "Ikhtisar", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Pustaka Video", href: "/dashboard/videos", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
    { label: "Markah Saya", href: "/dashboard/bookmarks", icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
    { label: "Profil Saya", href: "/dashboard/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  ];

  return (
    <div className="flex h-screen bg-[#fafaf9] text-stone-900 font-sans dark:bg-stone-950 dark:text-stone-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 relative z-20 shadow-sm">
        <div className="p-6 border-b border-stone-200 dark:border-stone-800">
          <Link href="/" className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full shadow-sm relative overflow-hidden bg-white">
               <Image src="/landing-page/logo.jpg" alt="Logo" fill className="object-contain" />
             </div>
             <span className="font-serif font-medium text-lg tracking-wide text-stone-800 dark:text-stone-200">
                Cleanova Circle
             </span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-amber-50 text-amber-800 dark:bg-stone-800 dark:text-amber-400 shadow-sm border border-amber-100 dark:border-stone-700" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 border border-transparent"}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-xl text-sm font-medium text-stone-600 hover:text-red-600 hover:bg-red-50 dark:text-stone-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors border border-transparent"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar Akun
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-30">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full shadow-sm relative overflow-hidden bg-white flex-shrink-0">
               <Image src="/landing-page/logo.jpg" alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-serif font-medium text-lg text-stone-800 dark:text-stone-200">
                Cleanova
            </span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-10 pb-24 md:pb-10 scroll-smooth">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg flex justify-around pb-safe z-40 px-2 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center py-3 px-4 flex-1 transition-all ${isActive ? "text-amber-600 dark:text-amber-500 -translate-y-1" : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"}`}
              >
                <div className={`p-1.5 rounded-full mb-1 ${isActive ? "bg-amber-50 dark:bg-amber-900/20" : ""}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                  </svg>
                </div>
                <span className={`text-[10px] sm:text-xs ${isActive ? "font-semibold" : "font-medium"}`}>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
