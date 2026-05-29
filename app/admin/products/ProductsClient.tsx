"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ImageUploadField from "../ImageUploadField";
import {
  addProductAction,
  updateProductAction,
  deleteProductAction,
} from "./actions";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
};

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default function ProductsClient({
  products,
  adminName,
}: {
  products: Product[];
  adminName: string;
}) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setImageUrl("");
    setIsActive(true);
    setErrorMsg(null);
    formRef.current?.reset();
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(String(p.price));
    setStock(String(p.stock));
    setImageUrl(p.imageUrl);
    setIsActive(p.isActive);
    setErrorMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Nama produk wajib diisi.");
      return;
    }
    if (!imageUrl) {
      setErrorMsg("Gambar produk wajib diunggah.");
      return;
    }

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("description", description.trim());
    fd.append("price", price || "0");
    fd.append("stock", stock || "0");
    fd.append("imageUrl", imageUrl);
    fd.append("isActive", isActive ? "true" : "false");

    startTransition(async () => {
      try {
        if (editing) {
          await updateProductAction(editing.id, fd);
        } else {
          await addProductAction(fd);
        }
        resetForm();
      } catch (err: any) {
        setErrorMsg(err?.message || "Gagal menyimpan produk.");
      }
    });
  };

  const handleDelete = (p: Product) => {
    if (!confirm(`Hapus produk "${p.name}"? Jika produk pernah dipesan, ia akan dinonaktifkan otomatis.`)) return;
    startTransition(async () => {
      try {
        if (editing?.id === p.id) resetForm();
        await deleteProductAction(p.id);
      } catch (err: any) {
        alert(err?.message || "Gagal menghapus produk.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke CMS
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-base md:text-lg font-bold tracking-wide">Manajemen Produk</h1>
          </div>
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full ring-1 ring-gray-200">
            Admin: {adminName}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 relative">
        {isPending && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-start justify-center pt-32">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
          </div>
        )}

        {/* Form */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className={`px-6 py-5 border-b border-gray-200 ${editing ? "bg-blue-50/50" : "bg-gray-50/50"}`}>
            <h2 className="text-base font-semibold flex items-center justify-between">
              <span>{editing ? "Edit Produk" : "Tambah Produk Baru"}</span>
              {editing && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md">Mode Edit</span>
              )}
            </h2>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Image */}
            <div className="md:col-span-5">
              <ImageUploadField
                label="Gambar Produk"
                value={imageUrl}
                onChange={setImageUrl}
                folder="products"
                aspect="aspect-square"
                hint="Disarankan kotak (1:1), maks. 5MB."
              />
            </div>

            {/* Fields */}
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="p-name" className="block text-sm font-medium text-gray-700">Nama Produk</label>
                <input
                  id="p-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Cleanova Polish Cream 50ml"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="p-price" className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
                  <input
                    id="p-price"
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="125000"
                  />
                  {price && (
                    <p className="text-[11px] text-gray-500">{formatRupiah(parseInt(price, 10) || 0)}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="p-stock" className="block text-sm font-medium text-gray-700">Stok</label>
                  <input
                    id="p-stock"
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="p-desc" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                  id="p-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
                  placeholder="Deskripsi singkat produk, manfaat, cara pakai…"
                />
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">Aktif (tampilkan di toko)</span>
              </label>

              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded text-sm">
                  ⚠ {errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                {editing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isPending}
                    className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md text-sm disabled:opacity-50"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isPending || !imageUrl}
                  className={`px-6 py-2.5 text-white font-medium rounded-md text-sm disabled:opacity-50 min-w-[160px] ${editing ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-900 hover:bg-black"}`}
                >
                  {isPending ? "Menyimpan…" : editing ? "Simpan Perubahan" : "Tambah Produk"}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* List */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-base font-semibold">Daftar Produk</h2>
            <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">Total: {products.length}</span>
          </div>

          {products.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              Belum ada produk. Tambahkan produk pertama menggunakan form di atas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Produk</th>
                    <th className="px-6 py-4 w-32">Harga</th>
                    <th className="px-6 py-4 w-20 text-center">Stok</th>
                    <th className="px-6 py-4 w-24 text-center">Status</th>
                    <th className="px-6 py-4 w-40 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((p) => (
                    <tr key={p.id} className={`transition-colors ${editing?.id === p.id ? "bg-blue-50/30" : "hover:bg-gray-50"}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                            {p.imageUrl ? (
                              <Image src={p.imageUrl} alt={p.name} fill sizes="48px" className="object-cover" unoptimized />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 line-clamp-1">{p.name}</div>
                            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5 font-mono">{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`text-sm font-semibold ${p.stock === 0 ? "text-rose-600" : "text-gray-900"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {p.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">Aktif</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">Nonaktif</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-white text-gray-700 hover:bg-gray-50 rounded transition-colors border border-gray-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            disabled={isPending}
                            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded transition-colors border border-red-200 disabled:opacity-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
