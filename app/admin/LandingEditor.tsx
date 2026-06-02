"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import ImageUploadField from "./ImageUploadField";
import { updateLandingPageAction } from "./actions";

export type LandingPageData = {
  logoUrl: string;
  whatsappUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImageUrl: string;
  valueTitle: string;
  valueDescription: string;
  valueCard1Title: string;
  valueCard1Text: string;
  valueCard2Title: string;
  valueCard2Text: string;
  valueCard3Title: string;
  valueCard3Text: string;
  featureTitle: string;
  featureSubtitle: string;
  feature1Title: string;
  feature1Description: string;
  feature1ImageUrl: string;
  feature2Title: string;
  feature2Description: string;
  feature2ImageUrl: string;
  feature3Title: string;
  feature3Description: string;
  feature3ImageUrl: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaDescription: string;
  shopCardLabel: string;
  shopCardTitle: string;
  eduCardLabel: string;
  eduCardTitle: string;
};

const DEFAULTS: LandingPageData = {
  logoUrl: "/landing-page/logo.jpg",
  whatsappUrl: "https://wa.me/6287855310680",
  heroTitle: "Solusi Kebersihan Modern",
  heroSubtitle: "untuk Barang Berharga Anda",
  heroDescription: "Memadukan formula premium ramah lingkungan dengan getaran ultrasonik untuk merawat, membersihkan, dan menjaga nilai perhiasan serta barang berharga Anda tetap seperti baru.",
  heroImageUrl: "/landing-page/671129876_17900392704423715_6523539329292204971_n..jpg",
  valueTitle: "Mengapa Memilih Cleanova?",
  valueDescription: "",
  valueCard1Title: "Teknologi Canggih",
  valueCard1Text: "Formula aman ramah lingkungan dengan pembersihan getaran ultrasonik mikro.",
  valueCard2Title: "Ekosistem Lengkap",
  valueCard2Text: "Edukasi perawatan mendalam dan produk pendukung dalam satu genggaman.",
  valueCard3Title: "Transaksi & Pengiriman Aman",
  valueCard3Text: "Terintegrasi langsung dengan kurir terpercaya dan gateway pembayaran yang aman.",
  featureTitle: "Cleanova Circle",
  featureSubtitle: "Eksklusif Untuk Member",
  feature1Title: "DIY Hacks & Tricks",
  feature1Description: "Pelajari rahasia merawat perak, emas, hingga berlian menggunakan bahan-bahan aman yang bisa Anda temukan di rumah.",
  feature1ImageUrl: "/landing-page/656353206_17897386137423715_5989968134986280728_n..jpg",
  feature2Title: "Step-by-Step Video",
  feature2Description: "Tonton panduan visual visual untuk proses restorasi perhiasan kusam mulai dari persiapan hingga tahap pemolesan akhir.",
  feature2ImageUrl: "/landing-page/656701773_17898483894423715_5763756912223990821_n..jpg",
  feature3Title: "Product Rating & Guide",
  feature3Description: "Rekomendasi independen dan panduan dosis pemakaian produk pembersih pabrikan dari para kurator pengalaman.",
  feature3ImageUrl: "/landing-page/656817205_17899009773423715_4292222626302527645_n..jpg",
  ctaTitle: "Mulai Merawat",
  ctaSubtitle: "Koleksi Kesayangan Anda.",
  ctaDescription: "Tingkatkan standar kebersihan dan estetika koleksi Anda hari ini juga tanpa menghabiskan budget berlebih di jasa terpadu.",
  shopCardLabel: "Toko Cleanova",
  shopCardTitle: "Jelajahi Produk",
  eduCardLabel: "Tips & Trik",
  eduCardTitle: "Pelajari Tips Bersih",
};

type Section = "HEADER" | "HERO" | "VALUE" | "FEATURES" | "CTA";

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: "HEADER", label: "Header", icon: "M4 6h16M4 12h16M4 18h16" },
  { id: "HERO", label: "Hero", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "FEATURES", label: "Edukasi", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { id: "VALUE", label: "Keunggulan", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { id: "CTA", label: "CTA Bawah", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" },
];

export default function LandingEditor({ initial }: { initial: LandingPageData | null }) {
  const merged = useMemo<LandingPageData>(() => ({ ...DEFAULTS, ...(initial || {}) }), [initial]);
  const [data, setData] = useState<LandingPageData>(merged);
  const [activeSection, setActiveSection] = useState<Section>("HERO");
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const set = <K extends keyof LandingPageData>(key: K, value: LandingPageData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const fd = new FormData();
    (Object.keys(data) as (keyof LandingPageData)[]).forEach((k) => {
      fd.append(k, data[k] ?? "");
    });

    startTransition(async () => {
      try {
        await updateLandingPageAction(fd);
        setSavedAt(new Date());
      } catch (err: any) {
        setErrorMsg(err?.message || "Gagal menyimpan landing page.");
      }
    });
  };

  const handleReset = () => {
    if (confirm("Reset perubahan yang belum disimpan?")) {
      setData(merged);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Editor Landing Page</h3>
          <p className="text-xs text-gray-500 mt-0.5">Edit konten di kiri, lihat hasilnya secara real-time di panel preview kanan.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {savedAt && (
            <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
              ✓ Tersimpan {savedAt.toLocaleTimeString("id-ID")}
            </span>
          )}
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="px-4 py-2 text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors disabled:opacity-50 min-w-[140px]"
          >
            {isPending ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mx-6 mt-4 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded text-sm">
          ⚠ {errorMsg}
        </div>
      )}

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Editor panel */}
        <div className="border-b lg:border-b-0 lg:border-r border-gray-200">
          {/* Section tabs */}
          <div className="flex overflow-x-auto border-b border-gray-200 bg-white sticky top-0 z-10">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeSection === s.id
                    ? "border-amber-500 text-amber-700 bg-amber-50/40"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
                {s.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {activeSection === "HEADER" && (
              <div className="space-y-5">
                <SectionTitle title="Header & Kontak" desc="Logo dan tautan WhatsApp admin (untuk tanya produk/CP)." />
                <ImageUploadField
                  label="Logo"
                  value={data.logoUrl}
                  onChange={(url) => set("logoUrl", url)}
                  folder="landing/logo"
                  aspect="aspect-square w-32"
                  hint="Disarankan kotak (1:1), format PNG transparan."
                />
                <Field label="WhatsApp Admin URL (CP / tanya produk)" value={data.whatsappUrl} onChange={(v) => set("whatsappUrl", v)} mono placeholder="https://wa.me/62..." />
              </div>
            )}

            {activeSection === "HERO" && (
              <div className="space-y-5">
                <SectionTitle title="Hero Section" desc="Headline dan deskripsi utama Landing Page Brand." />
                <Field label="Headline Baris 1 (Hero Title)" value={data.heroTitle} onChange={(v) => set("heroTitle", v)} />
                <Field label="Headline Baris 2 (Hero Subtitle - Italic &amp; Kuning)" value={data.heroSubtitle} onChange={(v) => set("heroSubtitle", v)} />
                <TextArea label="Deskripsi Brand" value={data.heroDescription} onChange={(v) => set("heroDescription", v)} rows={4} />
                <ImageUploadField
                  label="Hero Image (Visual Brand Utama)"
                  value={data.heroImageUrl}
                  onChange={(url) => set("heroImageUrl", url)}
                  folder="landing/hero"
                  aspect="aspect-[4/5]"
                />

                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Tombol Aksi Utama (CTA)</p>
                  <div className="border border-gray-200 rounded-lg p-4 bg-amber-50/30 space-y-3">
                    <p className="text-[11px] font-semibold text-gray-600">Tombol Utama (Mengarahkan ke /shop)</p>
                    <Field label="Teks Tombol" value={data.shopCardTitle} onChange={(v) => set("shopCardTitle", v)} compact />
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/40 space-y-3">
                    <p className="text-[11px] font-semibold text-gray-600">Tombol Sekunder (Mengarahkan ke /dashboard)</p>
                    <Field label="Teks Tombol" value={data.eduCardTitle} onChange={(v) => set("eduCardTitle", v)} compact />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "FEATURES" && (
              <div className="space-y-6">
                <SectionTitle title="Edukasi &amp; Komunitas" desc="Bagian presentasi pilar edukasi dan fitur platform yang didapatkan member." />
                
                <div className="bg-amber-50/40 p-4 border border-amber-200/50 rounded-2xl space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Header Section Edukasi</p>
                  <Field label="Subtitle / Nama Komunitas (e.g. Eksklusif Untuk Member)" value={data.featureSubtitle} onChange={(v) => set("featureSubtitle", v)} compact />
                  <Field label="Headline Section (e.g. Akses Aksesibilitas Tak Terbatas)" value={data.featureTitle} onChange={(v) => set("featureTitle", v)} compact />
                </div>

                <div className="space-y-6 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Tiga Fitur Penjelasan Platform</p>
                  {([1, 2, 3] as const).map(i => {
                    const tKey = `feature${i}Title` as keyof LandingPageData;
                    const dKey = `feature${i}Description` as keyof LandingPageData;
                    const iKey = `feature${i}ImageUrl` as keyof LandingPageData;
                    return (
                      <div key={i} className="border border-stone-200 rounded-2xl p-4 bg-stone-50/50 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Fitur/Penjelasan {i}</p>
                        <Field label="Judul Fitur" value={data[tKey]} onChange={(v) => set(tKey, v)} compact />
                        <TextArea label="Deskripsi Fitur" value={data[dKey]} onChange={(v) => set(dKey, v)} rows={2} compact />
                        <ImageUploadField
                          label="Gambar Ilustrasi Fitur"
                          value={data[iKey]}
                          onChange={(url) => set(iKey, url)}
                          folder={`landing/feature-${i}`}
                          aspect="aspect-[4/3]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSection === "VALUE" && (
              <div className="space-y-5">
                <SectionTitle title="Mengapa Memilih Cleanova?" desc="Headline + 3 keunggulan utama brand." />
                <Field label="Judul Utama Section" value={data.valueTitle} onChange={(v) => set("valueTitle", v)} />
                <TextArea label="Deskripsi Tambahan Section (Opsional)" value={data.valueDescription} onChange={(v) => set("valueDescription", v)} rows={2} />

                <div className="space-y-4">
                  {([1, 2, 3] as const).map(i => {
                    const tKey = `valueCard${i}Title` as keyof LandingPageData;
                    const xKey = `valueCard${i}Text` as keyof LandingPageData;
                    return (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50/40 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Keunggulan {i}</p>
                        <Field label="Judul Keunggulan" value={data[tKey]} onChange={(v) => set(tKey, v)} compact />
                        <TextArea label="Teks Deskripsi Keunggulan" value={data[xKey]} onChange={(v) => set(xKey, v)} rows={2} compact />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSection === "CTA" && (
              <div className="space-y-5">
                <SectionTitle title="CTA Bawah (Retained)" desc="Bagian ajakan pendaftaran di bagian paling bawah halaman." />
                <Field label="CTA Title" value={data.ctaTitle} onChange={(v) => set("ctaTitle", v)} />
                <Field label="CTA Subtitle (italic, kuning)" value={data.ctaSubtitle} onChange={(v) => set("ctaSubtitle", v)} />
                <TextArea label="CTA Description" value={data.ctaDescription} onChange={(v) => set("ctaDescription", v)} rows={3} />
              </div>
            )}
          </div>
        </div>

        {/* Live preview panel */}
        <div className="bg-stone-100 max-h-[75vh] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Live Preview</span>
            <span className="text-[10px] text-gray-500">Layout demonstratif (skala mini)</span>
          </div>
          <LandingPreview data={data} highlight={activeSection} onJump={setActiveSection} />
        </div>
      </div>
    </form>
  );
}

/* ---------------- Sub Components ---------------- */

function SectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border-b border-gray-200 pb-3">
      <h4 className="text-sm font-bold uppercase tracking-widest text-amber-600">{title}</h4>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  mono = false,
  placeholder,
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  placeholder?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      <label className="block text-xs font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm ${mono ? "font-mono text-xs" : ""}`}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      <label className="block text-xs font-medium text-gray-700">{label}</label>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm resize-y"
      />
    </div>
  );
}

/* ---------------- Live Preview ---------------- */

function LandingPreview({
  data,
  highlight,
  onJump,
}: {
  data: LandingPageData;
  highlight: Section;
  onJump: (s: Section) => void;
}) {
  const ring = (s: Section) =>
    highlight === s
      ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-stone-200"
      : "ring-1 ring-transparent hover:ring-stone-300";

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <button
        type="button"
        onClick={() => onJump("HEADER")}
        className={`block w-full text-left bg-[#fafaf9] rounded-lg p-3 transition ${ring("HEADER")}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {data.logoUrl ? (
              <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white shadow-sm">
                <Image src={data.logoUrl} alt="logo" fill className="object-contain" unoptimized />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-stone-200 grid place-items-center text-[9px] text-stone-500">logo</div>
            )}
            <span className="font-serif text-xs text-stone-850">Cleanova Circle</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[8px] uppercase tracking-widest bg-amber-400 text-stone-900 px-2 py-1 rounded font-bold">Toko</span>
            <span className="text-[8px] uppercase tracking-widest bg-stone-900 text-white px-2 py-1 rounded font-bold">Tips</span>
          </div>
        </div>
      </button>

      {/* Hero */}
      <button
        type="button"
        onClick={() => onJump("HERO")}
        className={`block w-full text-left bg-[#fafaf9] rounded-lg p-4 transition ${ring("HERO")}`}
      >
        <div className="grid grid-cols-2 gap-3 items-center">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-[7px] uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-sm font-semibold">
              Cleanova
            </span>
            <h1 className="text-xs font-serif leading-tight text-stone-900">
              {data.heroTitle || <span className="text-stone-400 italic">Hero title…</span>}<br />
              <span className="italic text-amber-600 font-medium">{data.heroSubtitle || "—"}</span>
            </h1>
            <p className="text-[8px] text-stone-600 line-clamp-2 leading-relaxed">
              {data.heroDescription || <span className="italic text-stone-400">Deskripsi hero…</span>}
            </p>

            <div className="flex gap-1 pt-1 flex-wrap">
              <span className="text-[7px] bg-amber-400 text-stone-900 px-2 py-1 rounded font-semibold whitespace-nowrap">{data.shopCardTitle || "Jelajahi Produk"}</span>
              <span className="text-[7px] bg-stone-900 text-white px-2 py-1 rounded font-semibold whitespace-nowrap">{data.eduCardTitle || "Pelajari Tips"}</span>
            </div>
          </div>
          <div className="aspect-[4/5] relative bg-stone-200 rounded overflow-hidden shadow-md">
            {data.heroImageUrl ? (
              <Image src={data.heroImageUrl} alt="hero" fill className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-[9px] text-stone-500">Hero image</div>
            )}
          </div>
        </div>
      </button>

      {/* Product Showcase Simulation */}
      <div className="bg-[#fafaf9] rounded-lg p-4 border border-stone-200 text-center space-y-3">
        <span className="text-[7px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold uppercase">Showcase</span>
        <h3 className="text-xs font-serif text-stone-900">Koleksi Produk Perawatan Utama (Simulasi Data DB)</h3>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-stone-200 rounded p-2 text-left space-y-1">
              <div className="aspect-square bg-stone-100 rounded flex items-center justify-center text-[8px] text-stone-400">Produk {i}</div>
              <p className="text-[8px] font-serif font-bold text-stone-855 truncate">Cleanova Premium {i}</p>
              <p className="text-[7px] text-stone-600">Rp 149.000</p>
              <div className="text-center bg-stone-900 text-white rounded text-[6px] py-0.5">Detail</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edukasi */}
      <button
        type="button"
        onClick={() => onJump("FEATURES")}
        className={`block w-full text-left bg-[#fafaf9] rounded-lg p-4 transition ${ring("FEATURES")}`}
      >
        <div className="text-center space-y-1.5 mb-3">
          <span className="inline-block text-[7px] uppercase tracking-widest text-amber-600 bg-amber-100/60 px-2 py-0.5 rounded font-semibold">{data.featureSubtitle || "Cleanova Circle"}</span>
          <h2 className="font-serif text-xs leading-normal text-stone-900 font-bold">{data.featureTitle || "Akses Aksesibilitas Tak Terbatas"}</h2>
          <div className="w-6 h-px bg-amber-500 mx-auto"></div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {([1, 2, 3] as const).map(i => {
            const t = data[`feature${i}Title` as keyof LandingPageData];
            const d = data[`feature${i}Description` as keyof LandingPageData];
            const img = data[`feature${i}ImageUrl` as keyof LandingPageData];
            return (
              <div key={i} className="bg-white border border-stone-200 rounded p-2 text-left space-y-1">
                <div className="aspect-[4/3] bg-stone-100 rounded relative overflow-hidden mb-1">
                  {img ? (
                    <Image src={img} alt={t} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-[6px] text-stone-400">No Image</div>
                  )}
                </div>
                <p className="font-serif text-[8px] font-bold text-stone-900 truncate">{t || `Fitur ${i}`}</p>
                <p className="text-[7px] text-stone-500 line-clamp-2 leading-tight font-light">{d || `Deskripsi ${i}...`}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center bg-amber-50 p-2 border border-amber-200/50 rounded">
          <span className="inline-block text-[7px] bg-amber-400 text-stone-950 font-bold px-3 py-1 rounded">Daftar Akun Gratis Sekarang</span>
        </div>
      </button>

      {/* Value Propositions */}
      <button
        type="button"
        onClick={() => onJump("VALUE")}
        className={`block w-full text-left rounded-lg p-4 transition bg-stone-900 text-stone-100 ${ring("VALUE")}`}
      >
        <h2 className="text-xs font-serif text-center font-light">{data.valueTitle || <span className="italic text-stone-500">Value title…</span>}</h2>
        <div className="w-8 h-px bg-amber-500 mx-auto my-1.5" />
        {data.valueDescription && (
          <p className="text-[8px] text-stone-400 text-center line-clamp-1 leading-relaxed">{data.valueDescription}</p>
        )}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {([1, 2, 3] as const).map(i => {
            const t = data[`valueCard${i}Title` as keyof LandingPageData];
            const x = data[`valueCard${i}Text` as keyof LandingPageData];
            return (
              <div key={i} className="border border-stone-850 bg-stone-950/50 p-2 rounded">
                <p className="text-amber-500 italic text-[8px] font-serif mb-0.5 truncate">{t || `Keunggulan ${i}`}</p>
                <p className="text-[7px] text-stone-400 line-clamp-2 font-light">{x || <span className="italic text-stone-600">Teks…</span>}</p>
              </div>
            );
          })}
        </div>
      </button>

      {/* CTA */}
      <button
        type="button"
        onClick={() => onJump("CTA")}
        className={`block w-full text-left rounded-lg p-4 transition bg-stone-900 text-white text-center border border-amber-900/40 ${ring("CTA")}`}
      >
        <h2 className="text-xs font-serif">
          {data.ctaTitle || <span className="italic text-stone-500">CTA title…</span>}<br />
          <span className="italic text-amber-500 font-light">{data.ctaSubtitle || "—"}</span>
        </h2>
        <p className="text-[8px] text-stone-300 mt-1 line-clamp-2 font-light">{data.ctaDescription || <span className="italic text-stone-500">Deskripsi CTA…</span>}</p>
        <span className="inline-block mt-1.5 text-[7px] uppercase tracking-widest bg-amber-500 text-stone-900 font-bold px-3 py-1 rounded">
          Daftar Gratis
        </span>
      </button>
    </div>
  );
}
