"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";

export default function ShopShell({ children }: { children: React.ReactNode }) {
  const { totalQty } = useCart();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 dark:bg-stone-950 dark:text-stone-50 font-sans flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/shop" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white shadow-sm relative">
              <Image src="/landing-page/logo.jpg" alt="Cleanova" fill className="object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="font-serif text-base leading-none">Cleanova Shop</p>
              <p className="text-[10px] uppercase tracking-widest text-stone-500 mt-0.5">Premium Care Store</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/shop"
              className={`text-sm font-medium px-3 py-2 rounded-full transition-colors ${
                pathname === "/shop"
                  ? "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20"
                  : "text-stone-600 hover:text-stone-900 dark:text-stone-400"
              }`}
            >
              Katalog
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium px-3 py-2 rounded-full text-stone-600 hover:text-stone-900 dark:text-stone-400 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/shop/cart"
              className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                pathname === "/shop/cart"
                  ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                  : "bg-stone-100 hover:bg-stone-200 text-stone-900 dark:bg-stone-800 dark:text-white dark:hover:bg-stone-700"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <span className="hidden sm:inline">Keranjang</span>
              {totalQty > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                  {totalQty}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-stone-500 flex flex-col sm:flex-row justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Cleanova Circle. Semua hak dilindungi.</span>
          <span className="font-serif italic">Premium Care, Lasting Shine.</span>
        </div>
      </footer>
    </div>
  );
}
