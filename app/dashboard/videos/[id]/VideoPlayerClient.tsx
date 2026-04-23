"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  addNoteAction, 
  deleteNoteAction, 
  updateWatchedSecondsAction,
  markVideoCompletedAction,
  toggleBookmarkAction,
  toggleLikeAction,
  addCommentAction,
  deleteCommentAction
} from "./actions";

type Video = {
  id: string;
  title: string;
  description: string;
  url: string;
  categoryId: string | null;
  Category?: { name: string } | null;
  toolsNeeded: string[];
};

type Note = {
  id: string;
  content: string;
  timestamp: number;
  createdAt: Date;
};

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  parentId: string | null;
  User: {
    name: string;
    avatar: string | null;
  };
};

function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1).split("?")[0];
    if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/embed/")[1].split("?")[0];
    if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/shorts/")[1].split("?")[0];
  } catch {
    return null;
  }
  return null;
}

export default function VideoPlayerClient({ 
  video,
  initialNotes = [],
  initialProgress = false,
  initialWatchedSeconds = 0,
  userId,
  isBookmarked = false,
  initialComments = [],
  initialLikeCount = 0,
  isLiked = false
}: { 
  video: Video;
  initialNotes?: Note[];
  initialProgress?: boolean;
  initialWatchedSeconds?: number;
  userId?: string;
  isBookmarked?: boolean;
  initialComments?: Comment[];
  initialLikeCount?: number;
  isLiked?: boolean;
}) {
  const youtubeId = getYouTubeId(video.url);
  const [isPending, startTransition] = useTransition();
  const [newNote, setNewNote] = useState("");
  const [optimisticProgress, setOptimisticProgress] = useState(initialProgress);
  const [optimisticBookmark, setOptimisticBookmark] = useState(isBookmarked);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [optimisticLike, setOptimisticLike] = useState(isLiked);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(initialLikeCount);
  const playerRef = useRef<any>(null);
  const watchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const optimisticProgressRef = useRef(initialProgress);

  // Sync state with server props when they change (e.g., after revalidatePath)
  useEffect(() => {
    setOptimisticBookmark(isBookmarked);
  }, [isBookmarked]);

  // Keep ref in sync with state so interval callbacks always see latest value
  useEffect(() => {
    optimisticProgressRef.current = optimisticProgress;
  }, [optimisticProgress]);

  useEffect(() => {
    if (!youtubeId) return;

    // Inject YouTube IFrame API script only once
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const initPlayer = () => {
      playerRef.current = new (window as any).YT.Player('youtube-player', {
        events: {
          onStateChange: (event: any) => {
            const YT = (window as any).YT.PlayerState;

            if (event.data === YT.PLAYING) {
              // Rekam watchedSeconds setiap 10 detik saat video diputar
              watchIntervalRef.current = setInterval(async () => {
                const elapsed = Math.floor(playerRef.current?.getCurrentTime?.() ?? 0);
                if (elapsed > 0) {
                  try {
                    await updateWatchedSecondsAction(video.id, elapsed);
                  } catch (err) {
                    console.error("Failed to update watchedSeconds", err);
                  }
                }
              }, 10_000);
            }

            if (event.data === YT.PAUSED || event.data === YT.ENDED) {
              // Hentikan interval saat video dijeda / selesai
              if (watchIntervalRef.current) {
                clearInterval(watchIntervalRef.current);
                watchIntervalRef.current = null;
              }
              // Simpan posisi terakhir saat dijeda
              const elapsed = Math.floor(playerRef.current?.getCurrentTime?.() ?? 0);
              if (elapsed > 0) {
                updateWatchedSecondsAction(video.id, elapsed).catch(console.error);
              }
            }

            if (event.data === YT.ENDED && !optimisticProgressRef.current) {
              // Tandai otomatis selesai saat video habis
              startTransition(async () => {
                try {
                  await markVideoCompletedAction(video.id);
                  setOptimisticProgress(true);
                } catch (err) {
                  console.error("Failed to auto-mark completed", err);
                }
              });
            }
          }
        }
      });
    };

    if ((window as any).YT?.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
    };
  }, [video.id, youtubeId]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const text = newNote;
    setNewNote("");
    startTransition(async () => {
      try {
        await addNoteAction(video.id, text);
      } catch (err) {
        console.error("Failed to add note", err);
      }
    });
  };

  const handleDeleteNote = (noteId: string) => {
    startTransition(async () => {
      try {
        await deleteNoteAction(noteId);
      } catch (err) {
        console.error("Failed to delete note", err);
      }
    });
  };



  const handleToggleBookmark = () => {
    const nextState = !optimisticBookmark;
    setOptimisticBookmark(nextState);
    startTransition(async () => {
      try {
        await toggleBookmarkAction(video.id);
      } catch (err) {
        setOptimisticBookmark(!nextState); // revert on error
        console.error("Failed to toggle bookmark", err);
      }
    });
  };

  const submitComment = (content: string, parentId?: string) => {
    if (!content.trim()) return;
    startTransition(async () => {
      try {
        await addCommentAction(video.id, content, parentId);
        if (!parentId) setNewComment("");
        else {
          setReplyContent("");
          setReplyingTo(null);
        }
      } catch (err) {
        console.error("Failed to add comment", err);
      }
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    submitComment(newComment);
  };

  const handleAddReply = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    submitComment(replyContent, parentId);
  };

  const handleDeleteComment = (commentId: string) => {
    const confirmed = confirm("Apakah Anda yakin ingin menghapus komentar ini?");
    if (!confirmed) return;
    startTransition(async () => {
      try {
        await deleteCommentAction(commentId);
      } catch (err) {
        console.error("Failed to delete comment", err);
      }
    });
  };

  const topLevelComments = initialComments.filter(c => !c.parentId);
  const repliesMap = initialComments.reduce((acc, c) => {
    if (c.parentId) {
      if (!acc[c.parentId]) acc[c.parentId] = [];
      acc[c.parentId].unshift(c);
    }
    return acc;
  }, {} as Record<string, typeof initialComments>);

  const renderCommentContent = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`flex gap-4 p-5 ${isReply ? 'mt-3 ml-6 md:ml-12 bg-stone-50/80 dark:bg-stone-800/30' : 'bg-white dark:bg-stone-900 shadow-sm'} rounded-2xl border border-stone-100 dark:border-stone-800 relative group`}>
       <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 font-bold uppercase shrink-0 overflow-hidden relative shadow-sm">
          {comment.User.avatar ? (
             <Image src={`/avatar/${comment.User.avatar}`} alt={comment.User.name} fill className="object-contain p-0.5 bg-white dark:bg-stone-800" sizes="40px" />
          ) : (
             comment.User.name.charAt(0)
          )}
       </div>
       <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
             <h4 className="font-medium text-stone-900 dark:text-stone-100 truncate">{comment.User.name}</h4>
             <span className="text-xs text-stone-400 dark:text-stone-500 whitespace-nowrap">
                {new Date(comment.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
             </span>
          </div>
          <p className="text-stone-600 dark:text-stone-300 whitespace-pre-wrap break-words leading-relaxed text-sm">
             {comment.content}
          </p>
          
          <div className="flex gap-4 pt-2">
            {!isReply && (
              <button
                onClick={() => {
                  setReplyingTo(replyingTo === comment.id ? null : comment.id);
                  setReplyContent("");
                }}
                className="text-xs font-medium text-stone-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-500 transition-colors"
                title="Beri komentar balasan"
              >
                {replyingTo === comment.id ? "Batal Balas" : "Balas"}
              </button>
            )}
          </div>

          {replyingTo === comment.id && !isReply && (
            <form onSubmit={e => handleAddReply(e, comment.id)} className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col gap-2">
                <textarea
                  className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none min-h-[80px] shadow-sm text-sm"
                  placeholder={`Membalas ${comment.User.name}...`}
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  disabled={isPending}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setReplyingTo(null)}
                    className="py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-600 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300 text-xs font-medium rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={!replyContent.trim() || isPending}
                    className="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg shadow shadow-amber-600/20 transition-all disabled:opacity-50"
                  >
                    {isPending ? 'Mengirim...' : 'Kirim Balasan'}
                  </button>
                </div>
              </div>
            </form>
          )}
       </div>
       
       {userId === comment.userId && (
          <div className="absolute top-4 right-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
             <button
               onClick={() => handleDeleteComment(comment.id)}
               disabled={isPending}
               className="text-stone-400 hover:text-red-500 text-sm flex items-center gap-1 bg-white/90 dark:bg-stone-900/90 py-1 px-2 rounded-md border border-stone-100 dark:border-stone-800 backdrop-blur-sm"
               title="Hapus Komentar"
             >
                Hapus
             </button>
          </div>
       )}
    </div>
 );

  return (
    <div className="max-w-6xl mx-auto py-6 animate-in fade-in zoom-in-95 duration-500 ease-out px-4 xl:px-0">
      
      {/* Back Navigation */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-500 mb-8 mt-2 transition-colors group"
      >
        <div className="p-1.5 rounded-full bg-stone-100 dark:bg-stone-800/50 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
           <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
        </div>
        Kembali ke Dashboard
      </Link>

      {/* Video Player Container */}
      <div className="bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-stone-200/50 dark:shadow-black/50 border border-stone-200 dark:border-stone-800">
         <div className="relative pt-[56.25%] w-full">
           {youtubeId ? (
             <iframe
               id="youtube-player"
               className="absolute top-0 left-0 w-full h-full"
               src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&enablejsapi=1`}
               title={video.title}
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
               allowFullScreen
               referrerPolicy="strict-origin-when-cross-origin"
             />
           ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900 text-stone-400 gap-3">
               <svg className="w-12 h-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
               </svg>
               <p className="text-sm">Format URL video tidak didukung</p>
             </div>
           )}
         </div>
      </div>

      <div className="mt-4 mb-6 flex justify-end">
        <a href={video.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 transition-colors group">
          <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Jika video tidak bisa diputar, tonton langsung di YouTube
          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <article className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14 pt-4 pb-12">
         {/* Left Column */}
         <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4 border-b border-stone-200 dark:border-stone-800 pb-6 flex flex-col md:flex-row justify-between items-start gap-4">
               <div className="space-y-4 flex-1">
                  <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40">
                     {video.Category?.name || "Uncategorized"}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-serif font-medium text-stone-900 dark:text-white leading-tight">
                     {video.title}
                  </h1>
                  {optimisticProgress ? (
                     <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-full border border-emerald-200 dark:border-emerald-500/20 w-max mt-2">
                       <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                       </svg>
                       Selesai Ditonton
                     </div>
                  ) : initialWatchedSeconds > 0 ? (
                     <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 text-xs font-bold uppercase tracking-widest rounded-full border border-sky-200 dark:border-sky-500/20 w-max mt-2">
                       <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                       </svg>
                       Sedang Ditonton
                     </div>
                  ) : null}
               </div>
               {/* Action Buttons: Like + Bookmark */}
               <div className="flex items-center gap-3 flex-shrink-0">
                 {/* Like Button */}
                 <button
                   type="button"
                   onClick={() => {
                     const next = !optimisticLike;
                     setOptimisticLike(next);
                     setOptimisticLikeCount(c => next ? c + 1 : c - 1);
                     startTransition(async () => {
                       try {
                         await toggleLikeAction(video.id);
                       } catch (err) {
                         setOptimisticLike(!next);
                         setOptimisticLikeCount(c => next ? c - 1 : c + 1);
                         console.error("Failed to toggle like", err);
                       }
                     });
                   }}
                   disabled={isPending}
                   className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all border ${
                     optimisticLike
                       ? 'bg-rose-500 border-rose-500 text-white hover:bg-rose-600'
                       : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                   }`}
                 >
                   <svg className={`w-5 h-5 transition-transform ${optimisticLike ? 'fill-current scale-110' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                   </svg>
                   <span>{optimisticLikeCount > 0 ? optimisticLikeCount : ''} Suka</span>
                 </button>

                 {/* Bookmark Toggle */}
                 <button 
                   type="button"
                   onClick={handleToggleBookmark}
                   disabled={isPending}
                   className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm border ${
                     optimisticBookmark 
                       ? 'bg-amber-600 border-amber-600 text-white hover:bg-amber-700 hover:border-amber-700' 
                       : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                   }`}
                 >
                   <svg className={`w-5 h-5 ${optimisticBookmark ? 'text-white fill-current' : 'text-stone-400 dark:text-stone-500 fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                   </svg>
                   {optimisticBookmark ? 'Tersimpan' : 'Simpan Video'}
                 </button>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">Ringkasan Materi</h3>
               <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-lg font-light whitespace-pre-wrap">
                  {video.description}
               </p>
            </div>

            <div className="bg-stone-50 dark:bg-stone-900/50 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 space-y-5">
               <h3 className="text-sm font-bold uppercase tracking-widest text-amber-700 dark:text-amber-500 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Peralatan Dibutuhkan
               </h3>
               {video.toolsNeeded.length === 0 ? (
                  <p className="text-stone-500 text-sm">Tidak memerlukan peralatan khusus.</p>
               ) : (
                  <ul className="space-y-3">
                     {video.toolsNeeded.map((tool, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                           <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                           <span className="text-stone-700 dark:text-stone-300 font-medium">{tool}</span>
                        </li>
                     ))}
                  </ul>
               )}
            </div>


         </div>

         {/* Right Column (Notes) */}
         <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xl shadow-stone-200/40 dark:shadow-none">
               <div className="flex items-center gap-2 mb-6 text-stone-900 dark:text-white">
                 <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                 </svg>
                 <h2 className="text-xl font-serif font-medium">Catatan Pribadi</h2>
               </div>

               <form onSubmit={handleAddNote} className="mb-6">
                 <textarea
                   className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl p-4 text-sm text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none min-h-[100px]"
                   placeholder="Ketik catatan di sini..."
                   value={newNote}
                   onChange={e => setNewNote(e.target.value)}
                   disabled={isPending}
                 />
                 <button 
                   type="submit" 
                   disabled={!newNote.trim() || isPending}
                   className="mt-3 w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-50 dark:text-stone-900 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                 >
                   {isPending ? 'Menyimpan...' : 'Simpan Catatan'}
                 </button>
               </form>

               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-stone-800">
                 {initialNotes.length === 0 ? (
                   <div className="text-center py-6 text-stone-400 dark:text-stone-500 text-sm italic">
                     Belum ada catatan.
                   </div>
                 ) : (
                   initialNotes.map(note => (
                     <div key={note.id} className="group relative bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 border border-stone-100 dark:border-stone-800">
                       <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed break-words whitespace-pre-wrap pr-6">
                         {note.content}
                       </p>
                       <button
                         onClick={() => handleDeleteNote(note.id)}
                         className="absolute top-3 right-3 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                         title="Hapus Catatan"
                         disabled={isPending}
                       >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                       </button>
                     </div>
                   ))
                 )}
               </div>
            </div>
         </div>
      </article>

      {/* Full Width Comments Section */}
      <section className="mt-10 pt-10 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
            <h2 className="text-2xl font-serif font-medium text-stone-900 dark:text-white">Diskusi Komunitas</h2>
            <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-sm font-bold px-2.5 py-0.5 rounded-full">{initialComments.length}</span>
          </div>

          <form onSubmit={handleAddComment} className="mb-10">
             <div className="flex flex-col gap-3">
               <textarea
                 className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none min-h-[120px] shadow-sm"
                 placeholder="Tulis pendapat atau pertanyaan Anda di sini..."
                 value={newComment}
                 onChange={e => setNewComment(e.target.value)}
                 disabled={isPending}
               />
               <div className="flex justify-end">
                 <button 
                   type="submit" 
                   disabled={!newComment.trim() || isPending}
                   className="py-2.5 px-6 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl shadow shadow-amber-600/20 transition-all disabled:opacity-50 disabled:shadow-none flex flex-row items-center gap-2"
                 >
                   {isPending && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                   Kirim Komentar
                 </button>
               </div>
             </div>
          </form>

          <div className="space-y-6">
             {topLevelComments.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                   <p className="text-stone-500 dark:text-stone-400">Jadilah yang pertama untuk berdiskusi!</p>
                </div>
             ) : (
                topLevelComments.map((comment) => (
                   <div key={`thread-${comment.id}`}>
                      {renderCommentContent(comment, false)}
                      
                      {repliesMap[comment.id] && repliesMap[comment.id].length > 0 && (
                        <div className="space-y-1">
                          {repliesMap[comment.id].map(reply => renderCommentContent(reply, true))}
                        </div>
                      )}
                   </div>
                ))
             )}
          </div>
        </div>
      </section>

    </div>
  );
}
