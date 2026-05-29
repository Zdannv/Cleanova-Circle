"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { supabase, SUPABASE_BUCKET } from "../../lib/supabase";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Subfolder di bucket Supabase. Default: "landing". */
  folder?: string;
  /** Aspect ratio preview, default 16/9. */
  aspect?: string;
  /** Hint kecil di bawah field. */
  hint?: string;
};

export default function ImageUploadField({
  label,
  value,
  onChange,
  folder = "landing",
  aspect = "aspect-[16/9]",
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("File harus gambar (jpg, png, webp).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const fileName = `${folder}/${Date.now()}-${safeName}`;

      const { error: upErr } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/jpeg",
        });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(fileName);

      if (!pub?.publicUrl) throw new Error("Gagal mengambil public URL.");
      onChange(pub.publicUrl);
    } catch (err: any) {
      setError(err?.message || "Upload gagal.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [folder, onChange]);

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {value ? (
        <div className="space-y-2">
          <div className={`relative w-full ${aspect} rounded-md overflow-hidden border border-gray-200 bg-gray-50`}>
            <Image
              src={value}
              alt={label}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors disabled:opacity-50"
            >
              {isUploading ? "Mengunggah…" : "Ganti"}
            </button>
            <button
              type="button"
              onClick={() => { onChange(""); setError(null); }}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors disabled:opacity-50"
            >
              Hapus
            </button>
            <span className="text-[10px] text-gray-500 truncate max-w-[180px] font-mono" title={value}>{value}</span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full ${aspect} rounded-md border-2 border-dashed ${isUploading ? "border-indigo-300 bg-indigo-50/40" : "border-gray-300 bg-gray-50 hover:bg-gray-100"} cursor-pointer transition-colors flex flex-col items-center justify-center gap-1`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-indigo-600">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-xs font-medium">Mengunggah gambar…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 7.5m0 0L7.5 12M12 7.5v9" />
              </svg>
              <span className="text-xs font-medium text-gray-700">Klik untuk pilih gambar</span>
              <span className="text-[10px] text-gray-500">JPG, PNG, WEBP · maks. 5MB</span>
            </div>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        disabled={isUploading}
      />

      {error && <p className="text-xs text-rose-600">⚠ {error}</p>}
      {hint && !error && <p className="text-[11px] text-gray-500">{hint}</p>}
    </div>
  );
}
