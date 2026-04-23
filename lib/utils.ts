/**
 * Menghilangkan syntax Markdown dari string untuk keperluan preview/snippet
 */
export function stripMarkdown(text: string): string {
  if (!text) return "";
  
  return text
    // 1. Hapus header (# Judul) - hanya di awal baris
    .replace(/^#{1,6}\s+/gm, "")
    // 2. Hapus bold & italic (**teks**, *teks*, __teks__, _teks_)
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // 3. Hapus link [teks](url) -> ambil teksnya saja
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    // 4. Hapus blockquotes (> teks)
    .replace(/^>\s+/gm, "")
    // 5. Hapus list items (* teks, - teks, 1. teks)
    .replace(/^[*-]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    // 6. Hapus inline code & code blocks (```teks```, `teks`)
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
    // 7. Hapus tag HTML jika ada
    .replace(/<[^>]*>/g, "")
    // 8. Bersihkan whitespace: ganti newline dengan spasi, buang spasi ganda
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
