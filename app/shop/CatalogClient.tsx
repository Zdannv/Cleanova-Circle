"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, formatRupiah } from "./CartContext";

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
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState<string | null>(null);

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
    window.setTimeout(() => setJustAdded((cur) => (cur === p.id ? null : cur)), 1400);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12">
      {/* Hero */}
      <header className="space-y-3">
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-500 font-semibold bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Cleanova Shop
        </span>
        <h1 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-stone-900 dark:text-white leading-tight">
          Produk perawatan <br />
          <span className="italic text-amber-600 dark:text-amber-500 font-medium">koleksi premium Anda.</span>
        </h1>
        <p className="text-stone-500 dark:text-stone-400 max-w-2xl font-light leading-relaxed">
          Pilihan produk pembersih dan perawatan yang dikurasi langsung oleh tim Cleanova Circle. Aman, teruji, dan terbukti mengembalikan kilau.
        </p>
      </header>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="border border-dashed border-stone-300 dark:border-stone-700 rounded-3xl py-20 text-center">
          <p className="text-stone-500">Belum ada produk yang tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {products.map((p) => {
            const isOut = !p.isActive || p.stock <= 0;
            const wasJustAdded = justAdded === p.id;
            return (
              <article
                key={p.id}
                className="group relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col transition-all hover:shadow-xl hover:shadow-stone-900/5 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative aspect-square bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className={`object-contain p-4 transition-transform duration-700 ${isOut ? "opacity-50 grayscale" : "group-hover:scale-105"}`}
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-stone-400 text-xs">No image</div>
                  )}

                  {/* Status badge */}
                  {isOut ? (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-stone-900/90 text-white text-[10px] uppercase tracking-widest font-bold rounded-full backdrop-blur-sm">
                      {p.stock <= 0 ? "Habis" : "Tidak Tersedia"}
                    </span>
                  ) : p.stock <= 5 ? (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-white text-[10px] uppercase tracking-widest font-bold rounded-full shadow">
                      Sisa {p.stock}
                    </span>
                  ) : null}
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-serif text-lg leading-tight text-stone-900 dark:text-white line-clamp-2">
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-light line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-stone-400">Harga</p>
                      <p className="font-semibold text-stone-900 dark:text-white">{formatRupiah(p.price)}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdd(p)}
                      disabled={isOut}
                      aria-label={`Tambah ${p.name} ke keranjang`}
                      className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                        isOut
                          ? "bg-stone-100 text-stone-400 cursor-not-allowed dark:bg-stone-800 dark:text-stone-600"
                          : wasJustAdded
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                            : "bg-stone-900 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-600/20 dark:bg-white dark:text-stone-900 dark:hover:bg-amber-500"
                      }`}
                    >
                      {wasJustAdded ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Masuk
                        </>
                      ) : isOut ? (
                        "Habis"
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          Tambah
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

      {/* Footer CTA */}
      <div className="bg-stone-900 dark:bg-stone-900 text-white rounded-3xl px-6 md:px-12 py-10 md:py-14 text-center">
        <p className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold mb-2">Selesai berbelanja?</p>
        <h2 className="text-2xl md:text-3xl font-serif mb-4">Lanjutkan ke <span className="italic text-amber-400">Keranjang</span></h2>
        <Link
          href="/shop/cart"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 text-stone-900 font-bold uppercase tracking-widest text-xs rounded-full hover:bg-amber-400 transition-colors"
        >
          Buka Keranjang
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
