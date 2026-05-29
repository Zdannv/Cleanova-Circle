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
};

const DEFAULTS: LandingPageData = {
  logoUrl: "/landing-page/logo.jpg",
  whatsappUrl: "https://wa.me/6287855310680",
  heroTitle: "Kembalikan Kilau",
  heroSubtitle: "Koleksi Berharga Anda.",
  heroDescription: "",
  heroImageUrl: "",
  valueTitle: "Perawatan Tepat, Investasi Selamat",
  valueDescription: "",
  valueCard1Title: "Hemat Ratusan Ribu",
  valueCard1Text: "",
  valueCard2Title: "Aman & Teruji",
  valueCard2Text: "",
  valueCard3Title: "Hasil Instan",
  valueCard3Text: "",
  featureTitle: "Akses Aksesibilitas Tak Terbatas",
  featureSubtitle: "Eksklusif Untuk Member",
  feature1Title: "DIY Hacks & Tricks",
  feature1Description: "",
  feature1ImageUrl: "",
  feature2Title: "Step-by-Step Video",
  feature2Description: "",
  feature2ImageUrl: "",
  feature3Title: "Product Rating & Guide",
  feature3Description: "",
  feature3ImageUrl: "",
  ctaTitle: "Mulai Merawat",
  ctaSubtitle: "Koleksi Kesayangan Anda.",
  ctaDescription: "",
};

type Section = "HEADER" | "HERO" | "VALUE" | "FEATURES" | "CTA";

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: "HEADER", label: "Header", icon: "M4 6h16M4 12h16M4 18h16" },
  { id: "HERO", label: "Hero", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "VALUE", label: "Value Cards", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { id: "FEATURES", label: "Features", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25" },
  { id: "CTA", label: "CTA", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" },
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
                <SectionTitle title="Header & WhatsApp" desc="Logo dan tautan kontak yang muncul di navigasi atas." />
                <ImageUploadField
                  label="Logo"
                  value={data.logoUrl}
                  onChange={(url) => set("logoUrl", url)}
                  folder="landing/logo"
                  aspect="aspect-square w-32"
                  hint="Disarankan kotak (1:1), format PNG transparan."
                />
                <Field label="WhatsApp URL" value={data.whatsappUrl} onChange={(v) => set("whatsappUrl", v)} mono placeholder="https://wa.me/62..." />
              </div>
            )}

            {activeSection === "HERO" && (
              <div className="space-y-5">
                <SectionTitle title="Hero Section" desc="Bagian pertama yang dilihat pengunjung." />
                <Field label="Hero Title" value={data.heroTitle} onChange={(v) => set("heroTitle", v)} />
                <Field label="Hero Subtitle (italic)" value={data.heroSubtitle} onChange={(v) => set("heroSubtitle", v)} />
                <TextArea label="Hero Description" value={data.heroDescription} onChange={(v) => set("heroDescription", v)} rows={4} />
                <ImageUploadField
                  label="Hero Image"
                  value={data.heroImageUrl}
                  onChange={(url) => set("heroImageUrl", url)}
                  folder="landing/hero"
                  aspect="aspect-[4/5]"
                />
              </div>
            )}

            {activeSection === "VALUE" && (
              <div className="space-y-5">
                <SectionTitle title="Value Section" desc="Headline + 3 kartu manfaat di tengah halaman." />
                <Field label="Value Title" value={data.valueTitle} onChange={(v) => set("valueTitle", v)} />
                <TextArea label="Value Description" value={data.valueDescription} onChange={(v) => set("valueDescription", v)} rows={3} />

                <div className="space-y-4">
                  {([1, 2, 3] as const).map(i => {
                    const tKey = `valueCard${i}Title` as keyof LandingPageData;
                    const xKey = `valueCard${i}Text` as keyof LandingPageData;
                    return (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50/40 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Kartu {i}</p>
                        <Field label="Title" value={data[tKey]} onChange={(v) => set(tKey, v)} compact />
                        <TextArea label="Text" value={data[xKey]} onChange={(v) => set(xKey, v)} rows={2} compact />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSection === "FEATURES" && (
              <div className="space-y-5">
                <SectionTitle title="Features Section" desc="3 fitur unggulan dengan gambar." />
                <Field label="Feature Subtitle (kapitalisasi atas)" value={data.featureSubtitle} onChange={(v) => set("featureSubtitle", v)} />
                <Field label="Feature Title" value={data.featureTitle} onChange={(v) => set("featureTitle", v)} />

                <div className="space-y-5">
                  {([1, 2, 3] as const).map(i => {
                    const tKey = `feature${i}Title` as keyof LandingPageData;
                    const dKey = `feature${i}Description` as keyof LandingPageData;
                    const iKey = `feature${i}ImageUrl` as keyof LandingPageData;
                    return (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50/40 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Fitur {i}</p>
                        <Field label="Title" value={data[tKey]} onChange={(v) => set(tKey, v)} compact />
                        <TextArea label="Description" value={data[dKey]} onChange={(v) => set(dKey, v)} rows={2} compact />
                        <ImageUploadField
                          label="Image"
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

            {activeSection === "CTA" && (
              <div className="space-y-5">
                <SectionTitle title="CTA Section" desc="Ajakan terakhir di bagian bawah halaman." />
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
      ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-stone-100"
      : "ring-1 ring-stone-200 hover:ring-stone-300";

  return (
    <div className="p-4 space-y-4 text-stone-900">
      {/* Header */}
      <button
        type="button"
        onClick={() => onJump("HEADER")}
        className={`block w-full text-left bg-white rounded-md p-3 transition ${ring("HEADER")}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {data.logoUrl ? (
              <div className="relative w-7 h-7 rounded-full overflow-hidden bg-stone-100">
                <Image src={data.logoUrl} alt="logo" fill className="object-contain" unoptimized />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-stone-200 grid place-items-center text-[9px] text-stone-500">logo</div>
            )}
            <span className="font-serif text-sm">Cleanova Circle</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest bg-stone-900 text-white px-2 py-1 rounded-sm">Member Login</span>
        </div>
      </button>

      {/* Hero */}
      <button
        type="button"
        onClick={() => onJump("HERO")}
        className={`block w-full text-left bg-white rounded-md p-4 transition ${ring("HERO")}`}
      >
        <div className="grid grid-cols-2 gap-3 items-center">
          <div className="space-y-2">
            <span className="inline-block text-[8px] uppercase tracking-widest text-stone-500 border border-stone-200 px-2 py-0.5">Komunitas Premium</span>
            <h1 className="text-base font-serif leading-tight">
              {data.heroTitle || <span className="text-stone-400 italic">Hero title…</span>}<br />
              <span className="italic text-amber-600">{data.heroSubtitle || "—"}</span>
            </h1>
            <p className="text-[10px] text-stone-600 line-clamp-3">
              {data.heroDescription || <span className="italic text-stone-400">Deskripsi hero…</span>}
            </p>
            <div className="flex gap-1.5 pt-1">
              <span className="text-[8px] bg-green-600 text-white px-2 py-1 rounded-sm">Gabung WhatsApp</span>
              <span className="text-[8px] border border-stone-300 px-2 py-1 rounded-sm">Pelajari</span>
            </div>
          </div>
          <div className="aspect-[4/5] relative bg-stone-200 rounded overflow-hidden">
            {data.heroImageUrl ? (
              <Image src={data.heroImageUrl} alt="hero" fill className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-[9px] text-stone-500">Hero image</div>
            )}
          </div>
        </div>
      </button>

      {/* Value */}
      <button
        type="button"
        onClick={() => onJump("VALUE")}
        className={`block w-full text-left rounded-md p-4 transition bg-stone-900 text-stone-100 ${ring("VALUE")}`}
      >
        <h2 className="text-sm font-serif text-center">{data.valueTitle || <span className="italic text-stone-500">Value title…</span>}</h2>
        <div className="w-8 h-px bg-amber-500 mx-auto my-2" />
        <p className="text-[10px] text-stone-300 text-center line-clamp-2">{data.valueDescription || <span className="italic text-stone-500">Deskripsi value…</span>}</p>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[1, 2, 3].map(i => {
            const t = (data as any)[`valueCard${i}Title`] as string;
            const x = (data as any)[`valueCard${i}Text`] as string;
            return (
              <div key={i} className="border border-stone-700 bg-stone-950/40 p-2 rounded">
                <p className="text-amber-400 italic text-[10px] font-semibold mb-1">{t || `Kartu ${i}`}</p>
                <p className="text-[9px] text-stone-400 line-clamp-3">{x || <span className="italic text-stone-600">Teks…</span>}</p>
              </div>
            );
          })}
        </div>
      </button>

      {/* Features */}
      <button
        type="button"
        onClick={() => onJump("FEATURES")}
        className={`block w-full text-left bg-white rounded-md p-4 transition ${ring("FEATURES")}`}
      >
        <p className="text-[9px] uppercase tracking-widest text-amber-600 font-semibold">{data.featureSubtitle || "Subtitle"}</p>
        <h2 className="text-sm font-serif mt-1">{data.featureTitle || <span className="italic text-stone-400">Feature title…</span>}</h2>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[1, 2, 3].map(i => {
            const t = (data as any)[`feature${i}Title`] as string;
            const d = (data as any)[`feature${i}Description`] as string;
            const img = (data as any)[`feature${i}ImageUrl`] as string;
            return (
              <div key={i}>
                <div className="aspect-[4/3] bg-stone-100 rounded relative overflow-hidden mb-1.5">
                  {img ? (
                    <Image src={img} alt={t} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-[9px] text-stone-500">No image</div>
                  )}
                </div>
                <p className="font-serif text-[11px] mb-0.5 line-clamp-1">{t || `Fitur ${i}`}</p>
                <p className="text-[9px] text-stone-500 line-clamp-3">{d || <span className="italic">Deskripsi…</span>}</p>
              </div>
            );
          })}
        </div>
      </button>

      {/* CTA */}
      <button
        type="button"
        onClick={() => onJump("CTA")}
        className={`block w-full text-left rounded-md p-4 transition bg-stone-900 text-white text-center ${ring("CTA")}`}
      >
        <h2 className="text-sm font-serif">
          {data.ctaTitle || <span className="italic text-stone-500">CTA title…</span>}<br />
          <span className="italic text-amber-500">{data.ctaSubtitle || "—"}</span>
        </h2>
        <p className="text-[10px] text-stone-300 mt-1.5 line-clamp-2">{data.ctaDescription || <span className="italic text-stone-500">Deskripsi CTA…</span>}</p>
        <span className="inline-block mt-2 text-[9px] uppercase tracking-widest bg-amber-500 text-stone-900 font-bold px-3 py-1.5 rounded-sm">
          Berlangganan Sekarang
        </span>
      </button>
    </div>
  );
}
