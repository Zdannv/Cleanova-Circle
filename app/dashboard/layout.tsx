"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Video", href: "/dashboard/videos", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
    { label: "Artikel", href: "/dashboard/articles", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
    { label: "Saved", href: "/dashboard/bookmarks", icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
  ];

  return (
    <div className="flex h-screen bg-[#fafaf9] text-stone-900 font-sans dark:bg-stone-950 dark:text-stone-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 relative z-20 shadow-sm transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-64" : "w-20"}`}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3.5 top-8 w-7 h-7 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full flex items-center justify-center shadow-sm text-stone-500 hover:text-amber-600 z-30 transition-colors"
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? "rotate-0" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className={`p-6 border-b border-stone-200 dark:border-stone-800 flex ${isSidebarOpen ? "items-center" : "justify-center"}`}>
          <Link href="/" className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full shadow-sm relative overflow-hidden bg-white flex-shrink-0">
               <Image src="/landing-page/logo.jpg" alt="Logo" fill className="object-contain" />
             </div>
             <span className={`font-serif font-medium text-lg tracking-wide text-stone-800 dark:text-stone-200 whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 hidden"}`}>
                Cleanova
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
                title={!isSidebarOpen ? link.label : undefined}
                className={`flex items-center ${isSidebarOpen ? "gap-3 px-3" : "justify-center px-0"} py-3 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-amber-50 text-amber-800 dark:bg-stone-800 dark:text-amber-400 shadow-sm border border-amber-100 dark:border-stone-700" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 border border-transparent"}`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
                <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? "opacity-100 block" : "opacity-0 hidden"}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            title={!isSidebarOpen ? "Keluar Akun" : undefined}
            className={`flex items-center ${isSidebarOpen ? "gap-3 px-3" : "justify-center px-0"} py-3 w-full rounded-xl text-sm font-medium text-stone-600 hover:text-red-600 hover:bg-red-50 dark:text-stone-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors border border-transparent`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? "opacity-100 block" : "opacity-0 hidden"}`}>
              Keluar
            </span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-30">
          <Link href="/" className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-full shadow-sm relative overflow-hidden bg-white flex-shrink-0">
               <Image src="/landing-page/logo.jpg" alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-serif font-medium text-lg text-stone-800 dark:text-stone-200">
                Cleanova
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link 
              href="/dashboard/profile"
              className="text-stone-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-500 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Desktop Absolute Top Right Profile */}
        <div className="hidden md:block absolute top-6 right-8 md:right-10 z-30">
          <Link 
            href="/dashboard/profile" 
            className="group flex flex-col items-center gap-1.5"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white dark:bg-stone-800 shadow-md border-2 border-stone-200 dark:border-stone-700 group-hover:border-amber-500 transition-all duration-300 ease-out group-hover:shadow-lg group-hover:shadow-amber-500/20 group-hover:-translate-y-1 relative">
              {(session?.user as any)?.avatar ? (
                <Image src={`/avatar/${(session?.user as any).avatar}`} alt="Profile" fill className="object-contain p-1" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-stone-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-10 pb-24 scroll-smooth">
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
