"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, formatRupiah } from "./CartContext";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  weight: number;
  imageUrl: string;
  isActive: boolean;
};

export default function CatalogClient({ products }: { products: Product[] }) {
  const { add, totalQty } = useCart();
  const [justAdded, setJustAdded] = useState<string | null>(null);
  
  // Interactive search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "INSTOCK">("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "PRICE_ASC" | "PRICE_DESC">("NEWEST");

  const handleAdd = (p: Product) => {
    add({
      productId: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
      stock: p.stock,
      weight: p.weight,
      quantity: 1,
    });
    setJustAdded(p.id);
    toast.success(`${p.name} berhasil ditambahkan ke keranjang!`, {
      action: {
        label: "Buka Keranjang",
        onClick: () => window.location.href = "/shop/cart"
      }
    });
    window.setTimeout(() => setJustAdded((cur) => (cur === p.id ? null : cur)), 1400);
  };

  // Filtered & Sorted products computation
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Availability filter
    if (selectedFilter === "INSTOCK") {
      result = result.filter((p) => p.stock > 0 && p.isActive);
    }

    // Sorting logic
    if (sortBy === "PRICE_ASC") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "PRICE_DESC") {
      result.sort((a, b) => b.price - a.price);
    } else {
      // NEWEST — sorted by default from the server
    }

    return result;
  }, [products, searchQuery, selectedFilter, sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12">
      
      {/* Header / Hero */}
      <header className="space-y-4 text-center sm:text-left relative">
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 px-3.5 py-1.5 rounded-full">
          Catalog Premium
        </span>
        <h1 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-stone-900 dark:text-white leading-tight">
          Produk Perawatan <br />
          <span className="italic text-amber-600 dark:text-amber-500 font-semibold">Koleksi Berharga Anda.</span>
        </h1>
        <p className="text-stone-500 dark:text-stone-400 max-w-2xl font-light text-sm sm:text-base leading-relaxed mx-auto sm:mx-0">
          Pilihan formula orisinal, ultrasonic cleaner, dan lap pembersih mikrofiber yang dikurasi khusus untuk memulihkan keindahan perhiasan serta logam mulia secara instan.
        </p>
      </header>

      {/* Interactive Search & Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-stone-900/60 p-4 md:p-5 rounded-2xl border border-stone-200/80 dark:border-stone-850 shadow-sm backdrop-blur">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama produk atau bahan perawatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-16 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-amber-600 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Filters Tabs & Sorting Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Availability Tabs */}
          <div className="flex bg-stone-100 dark:bg-stone-950 p-1 rounded-xl border border-stone-200/60 dark:border-stone-850 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSelectedFilter("ALL")}
              className={`flex-1 sm:flex-none px-5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                selectedFilter === "ALL"
                  ? "bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-white"
                  : "text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter("INSTOCK")}
              className={`flex-1 sm:flex-none px-5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                selectedFilter === "INSTOCK"
                  ? "bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-white"
                  : "text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              }`}
            >
              Tersedia
            </button>
          </div>

          {/* Sorting */}
          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-850 bg-stone-50 dark:bg-stone-950 text-[10px] font-bold uppercase tracking-wider text-stone-650 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer appearance-none pr-10"
            >
              <option value="NEWEST">Terbaru</option>
              <option value="PRICE_ASC">Harga Terendah</option>
              <option value="PRICE_DESC">Harga Tertinggi</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="border border-dashed border-stone-300 dark:border-stone-800 rounded-3xl py-24 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center mx-auto text-stone-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="font-serif text-lg text-stone-900 dark:text-white font-medium">Produk Tidak Ditemukan</h3>
          <p className="text-stone-550 dark:text-stone-400 text-xs font-light max-w-xs mx-auto leading-relaxed">
            Tidak ada produk perawatan yang sesuai dengan kata kunci pencarian Anda. Silakan coba kata kunci lain.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedFilter("ALL");
              setSortBy("NEWEST");
            }}
            className="px-5 py-2.5 bg-stone-900 text-white dark:bg-white dark:text-stone-950 font-semibold text-[10px] uppercase tracking-wider rounded-lg transition-colors hover:bg-amber-500 hover:text-stone-950"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.map((p) => {
            const isOut = !p.isActive || p.stock <= 0;
            const wasJustAdded = justAdded === p.id;
            return (
              <article
                key={p.id}
                className="group relative bg-white dark:bg-stone-950 rounded-2xl border border-stone-250/50 dark:border-stone-850 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-stone-900/5 hover:-translate-y-1"
              >
                {/* Image Container with Hover Scaling */}
                <div className="relative aspect-square bg-stone-50/60 dark:bg-stone-900/40 overflow-hidden border-b border-stone-100 dark:border-stone-900">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className={`object-contain p-6 transition-transform duration-700 ${isOut ? "opacity-40 grayscale" : "group-hover:scale-105"}`}
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-stone-400 text-xs">Tidak ada gambar</div>
                  )}

                  {/* Stock Badges / Label Tags */}
                  {isOut ? (
                    <span className="absolute top-3.5 left-3.5 px-3 py-1 bg-stone-950 text-white text-[9px] uppercase tracking-widest font-extrabold rounded-full shadow backdrop-blur-sm">
                      Habis
                    </span>
                  ) : p.stock <= 5 ? (
                    <span className="absolute top-3.5 left-3.5 px-3 py-1 bg-rose-600 text-white text-[9px] uppercase tracking-widest font-extrabold rounded-full shadow">
                      Sisa {p.stock} pcs!
                    </span>
                  ) : (
                    <span className="absolute top-3.5 left-3.5 px-2.5 py-1 bg-amber-400/90 text-stone-950 text-[8px] uppercase tracking-widest font-extrabold rounded-full shadow">
                      Tersedia
                    </span>
                  )}
                  
                  {p.weight && (
                    <span className="absolute bottom-3 right-3 text-[9px] text-stone-400 dark:text-stone-500 font-medium">
                      {p.weight} g
                    </span>
                  )}
                </div>

                {/* Content Block */}
                <div className="p-5 flex flex-col flex-1 gap-4">
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-serif text-base leading-snug text-stone-900 dark:text-white line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-light line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    )}
                  </div>

                  {/* Pricing and Action Button */}
                  <div className="pt-3.5 border-t border-stone-100 dark:border-stone-900 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[8px] uppercase tracking-widest text-stone-400 dark:text-stone-500">Harga</p>
                      <p className="font-semibold text-stone-900 dark:text-white text-sm sm:text-base">{formatRupiah(p.price)}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdd(p)}
                      disabled={isOut}
                      aria-label={`Tambah ${p.name} ke keranjang`}
                      className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 duration-150 ${
                        isOut
                          ? "bg-stone-100 text-stone-400 cursor-not-allowed dark:bg-stone-850 dark:text-stone-600"
                          : wasJustAdded
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                            : "bg-stone-900 text-white hover:bg-amber-500 hover:text-stone-950 dark:bg-white dark:text-stone-950 dark:hover:bg-amber-400 shadow-md hover:shadow-lg"
                      }`}
                    >
                      {wasJustAdded ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          ✓ Masuk
                        </>
                      ) : isOut ? (
                        "Habis"
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          Beli
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Cart Navigation Helper */}
      <div className="bg-stone-900 dark:bg-stone-950 text-white rounded-3xl p-8 md:p-14 text-center relative overflow-hidden border border-stone-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">
              {totalQty > 0 ? `Terdapat ${totalQty} Produk Di Keranjang Anda` : "Keranjang Belanja"}
            </p>
            <h2 className="text-2xl md:text-3xl font-serif">
              Siap untuk melakukan <span className="italic text-amber-500">Checkout?</span>
            </h2>
          </div>
          
          <Link
            href="/shop/cart"
            className="inline-flex items-center gap-2.5 px-10 py-4.5 bg-amber-400 hover:bg-amber-500 active:scale-95 duration-150 text-stone-950 font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all"
          >
            Buka Keranjang Belanja
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272" />
            </svg>
          </Link>
        </div>
      </div>
      
    </div>
  );
}
