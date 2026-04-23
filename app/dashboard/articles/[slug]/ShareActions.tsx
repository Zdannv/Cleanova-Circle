"use client";

export default function ShareActions({ title, url }: { title: string; url: string }) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert("Link artikel berhasil disalin ke clipboard!");
      });
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleShare}
        title="Bagikan artikel"
        className="p-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-stone-700 rounded-full transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      </button>
    </div>
  );
}
