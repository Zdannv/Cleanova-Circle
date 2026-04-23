"use client";

import { useRef } from "react";
import Link from "next/link";

type CarouselImage = { src: string; tag: string; title: string; slug?: string; };

export default function HeroCarouselClient({ images }: { images: CarouselImage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -600, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 600, behavior: "smooth" });
    }
  };

  return (
    <section className="-mx-4 px-4 xl:mx-0 xl:px-0 relative group">
      {/* Scroll Buttons */}
      <button 
        onClick={scrollLeft}
        className="hidden md:flex absolute -left-4 xl:-left-6 top-[calc(50%-12px)] -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-stone-800/90 shadow-xl border border-stone-200 dark:border-stone-700 rounded-full items-center justify-center text-stone-600 dark:text-stone-300 hover:text-amber-600 hover:scale-110 transition-all z-20 opacity-0 group-hover:opacity-100"
      >
        <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button 
        onClick={scrollRight}
        className="hidden md:flex absolute -right-4 xl:-right-6 top-[calc(50%-12px)] -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-stone-800/90 shadow-xl border border-stone-200 dark:border-stone-700 rounded-full items-center justify-center text-stone-600 dark:text-stone-300 hover:text-amber-600 hover:scale-110 transition-all z-20 opacity-0 group-hover:opacity-100"
      >
        <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Container */}
      <div 
        ref={scrollRef}
        className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((item, idx) => {
          const content = (
            <div className={`snap-center sm:snap-start shrink-0 relative w-[85vw] sm:w-[500px] md:w-[650px] h-64 md:h-[350px] rounded-3xl overflow-hidden shadow-sm border border-stone-200 dark:border-stone-800 group/item ${item.slug ? 'cursor-pointer' : ''}`}>
              <img src={item.src} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover/item:scale-105" alt={item.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
                <span className="inline-block px-3 py-1 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-wider rounded-md mb-3">{item.tag}</span>
                <h3 className="text-white font-serif text-xl md:text-3xl font-medium leading-tight max-w-lg mb-2">{item.title}</h3>
                <p className="text-stone-300 text-sm hidden md:block">Pelajari rahasia dan trik jitu persembahan instruktur profesional Cleanova Circle khusus untuk Anda di sini.</p>
              </div>
            </div>
          );

          if (item.slug) {
            return <Link key={idx} href={`/dashboard/articles/${item.slug}`}>{content}</Link>;
          }
          return <div key={idx}>{content}</div>;
        })}
      </div>
    </section>
  );
}
