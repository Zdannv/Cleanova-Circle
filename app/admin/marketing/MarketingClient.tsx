"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { sendBroadcastAction } from "../actions";
import { toast } from "sonner";

export default function MarketingClient({
  subscriberCount,
  adminName,
}: {
  subscriberCount: number;
  adminName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !htmlBody.trim()) {
      toast.error("Subjek dan isi pesan wajib diisi.");
      return;
    }

    if (!confirm(`Kirim broadcast email ini ke ${subscriberCount} pelanggan?`)) {
      return;
    }

    const toastId = toast.loading("Mengirim broadcast email...");

    startTransition(async () => {
      try {
        const res = await sendBroadcastAction(subject, htmlBody);
        if (res.success) {
          toast.success(`Broadcast berhasil dikirim! Total: ${res.count} penerima (${res.succeeded} sukses, ${res.failed} gagal).`, { id: toastId });
          setSubject("");
          setHtmlBody("");
        } else {
          toast.error(res.message || "Gagal mengirim broadcast.", { id: toastId });
        }
      } catch (err: any) {
        toast.error(err.message || "Terjadi kesalahan sistem saat mengirim broadcast.", { id: toastId });
      }
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke CMS
            </Link>
            <span className="text-stone-300 dark:text-stone-700">/</span>
            <h1 className="text-base md:text-lg font-bold tracking-wide">Broadcast Marketing</h1>
          </div>
          <span className="text-xs font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-full ring-1 ring-stone-200 dark:ring-stone-700">
            Admin: {adminName}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* Subscriber counter info */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-400">Siap Menjangkau Audiens Anda?</h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
              Kirim kampanye email ke seluruh pelanggan yang menyetujui menerima materi promosi.
            </p>
          </div>
          <div className="bg-white dark:bg-stone-900 border border-amber-500/30 rounded-xl px-5 py-3 text-center sm:text-right shrink-0 shadow-sm shadow-amber-500/5">
            <span className="block text-2xl font-bold text-amber-600 dark:text-amber-500">{subscriberCount}</span>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Penerima Aktif</span>
          </div>
        </div>



        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Form Pembuatan Broadcast</h3>
            <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 border border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${!previewMode ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"}`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${previewMode ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"}`}
              >
                Preview HTML
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {!previewMode ? (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                    Subjek Email
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500/50 focus:border-transparent transition-all"
                    placeholder="Contoh: Tips Rahasia Mengembalikan Kilau Berlian!"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="htmlBody" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                      Isi Pesan (Mendukung HTML & Teks Biasa)
                    </label>
                    <span className="text-xs text-stone-400 dark:text-stone-500">Mendukung tag HTML inline</span>
                  </div>
                  <textarea
                    id="htmlBody"
                    rows={12}
                    value={htmlBody}
                    onChange={(e) => setHtmlBody(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500/50 focus:border-transparent transition-all font-mono text-sm resize-y animate-none"
                    placeholder={`<p>Halo Sahabat Cleanova,</p>\n<p>Dapatkan diskon eksklusif <strong>20%</strong> untuk produk cairan pembersih perhiasan kami hari ini saja!</p>\n<p>Gunakan kode promo: <strong>CLEAN20</strong> saat checkout.</p>`}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Subjek:</span>
                  <div className="px-4 py-2 border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 rounded-xl text-stone-800 dark:text-stone-200 font-medium">
                    {subject || <span className="text-stone-400 italic">Belum ada subjek</span>}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">Tampilan Konten:</span>
                  <div className="border border-stone-200 dark:border-stone-800 rounded-xl bg-white p-6 min-h-[300px] overflow-auto text-stone-800">
                    {htmlBody ? (
                      <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
                    ) : (
                      <div className="text-stone-400 italic text-center mt-20">Belum ada konten pesan untuk di-preview</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-3">
              <button
                type="submit"
                disabled={isPending || subscriberCount === 0}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl shadow-lg shadow-amber-600/20 dark:shadow-none hover:shadow-none transition-all active:scale-[0.98] transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm min-w-[180px]"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Mengirim Broadcast...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Kirim Broadcast
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
