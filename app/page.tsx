import Link from "next/link";
import Image from "next/image";
import prisma from "../lib/prisma";

export default async function Home() {
  const landingPage = await prisma.landingPage.findUnique({
    where: { id: "default" }
  });

  const content = {
    logoUrl: landingPage?.logoUrl || "/landing-page/logo.jpg",
    whatsappUrl: landingPage?.whatsappUrl || "https://wa.me/6287855310680?text=Halo%20Admin%20Cleanova,%20saya%20tertarik%20untuk%20mendaftar%20langganan%20web%20edukasi%20Cleanova%20Circle.",
    heroTitle: landingPage?.heroTitle || "Kembalikan Kilau",
    heroSubtitle: landingPage?.heroSubtitle || "Koleksi Berharga Anda.",
    heroDescription: landingPage?.heroDescription || "Bergabunglah dengan Cleanova Circle—komunitas eksklusif yang membagikan rahasia, tips DIY, dan panduan restorasi profesional agar perhiasan dan koleksi Anda selalu tampil memukau seperti baru.",
    heroImageUrl: landingPage?.heroImageUrl || "/landing-page/671129876_17900392704423715_6523539329292204971_n..jpg",
    valueTitle: landingPage?.valueTitle || "Perawatan Tepat, Investasi Selamat",
    valueDescription: landingPage?.valueDescription || "Perhiasan yang kusam bukan berarti rusak permanen. Dengan teknik yang salah, Anda berisiko merusak material berharga. Di Cleanova Circle, kami mengajarkan Anda metode restorasi yang aman, hemat biaya, dan efektif, menjaga koleksi Anda tetap murni generasi demi generasi.",
    valueCard1Title: landingPage?.valueCard1Title || "Hemat Ratusan Ribu",
    valueCard1Text: landingPage?.valueCard1Text || "Kurangi ketergantungan pada jasa pembersih profesional yang mahal dengan teknik mandiri yang terbukti.",
    valueCard2Title: landingPage?.valueCard2Title || "Aman & Teruji",
    valueCard2Text: landingPage?.valueCard2Text || "Lupakan risiko kerusakan akibat bahan kimia keras. Kami merekomendasikan produk dengan komposisi teraman.",
    valueCard3Title: landingPage?.valueCard3Title || "Hasil Instan",
    valueCard3Text: landingPage?.valueCard3Text || "Panduan langsung ke inti yang memungkinkan Anda melihat perbedaannya (Before & After) dalam hitungan menit.",
    featureTitle: landingPage?.featureTitle || "Akses Aksesibilitas Tak Terbatas",
    featureSubtitle: landingPage?.featureSubtitle || "Eksklusif Untuk Member",
    feature1Title: landingPage?.feature1Title || "DIY Hacks & Tricks",
    feature1Description: landingPage?.feature1Description || "Pelajari rahasia merawat perak, emas, hingga berlian menggunakan bahan-bahan aman yang bisa Anda temukan di rumah.",
    feature1ImageUrl: landingPage?.feature1ImageUrl || "/landing-page/656353206_17897386137423715_5989968134986280728_n..jpg",
    feature2Title: landingPage?.feature2Title || "Step-by-Step Video",
    feature2Description: landingPage?.feature2Description || "Tonton panduan visual visual untuk proses restorasi perhiasan kusam mulai dari persiapan hingga tahap pemolesan akhir.",
    feature2ImageUrl: landingPage?.feature2ImageUrl || "/landing-page/656701773_17898483894423715_5763756912223990821_n..jpg",
    feature3Title: landingPage?.feature3Title || "Product Rating & Guide",
    feature3Description: landingPage?.feature3Description || "Rekomendasi independen dan panduan dosis pemakaian produk pembersih pabrikan dari para kurator pengalaman.",
    feature3ImageUrl: landingPage?.feature3ImageUrl || "/landing-page/656817205_17899009773423715_4292222626302527645_n..jpg",
    ctaTitle: landingPage?.ctaTitle || "Mulai Merawat",
    ctaSubtitle: landingPage?.ctaSubtitle || "Koleksi Kesayangan Anda.",
    ctaDescription: landingPage?.ctaDescription || "Tingkatkan standar kebersihan dan estetika koleksi Anda hari ini juga tanpa menghabiskan budget berlebih di jasa terpadu.",
    shopCardLabel: landingPage?.shopCardLabel || "Toko Cleanova",
    shopCardTitle: landingPage?.shopCardTitle || "Beli Produk",
    eduCardLabel: landingPage?.eduCardLabel || "Tips & Trik",
    eduCardTitle: landingPage?.eduCardTitle || "Komunitas Edukasi",
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 font-sans selection:bg-amber-500 selection:text-white dark:bg-stone-950 dark:text-stone-50">
      
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 dark:bg-stone-950/80 dark:border-stone-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Image 
                src={content.logoUrl} 
                alt="Cleanova Circle Logo" 
                width={40} height={40}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-contain shadow-lg shadow-amber-500/20 flex-shrink-0"
              />
              <span className="font-serif font-medium text-base sm:text-xl lg:text-2xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-stone-800 to-stone-500 dark:from-stone-200 dark:to-stone-400 whitespace-nowrap truncate">
                Cleanova Circle
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold tracking-wide sm:tracking-widest uppercase text-stone-900 bg-amber-400 hover:bg-amber-500 rounded-lg sm:rounded-none transition-all shadow hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 dark:text-stone-900 whitespace-nowrap"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272" />
                </svg>
                Toko
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold tracking-wide sm:tracking-widest uppercase text-white bg-stone-900 hover:bg-amber-600 rounded-lg sm:rounded-none transition-all shadow hover:shadow-lg hover:-translate-y-0.5 dark:bg-white dark:text-stone-900 dark:hover:bg-amber-500 whitespace-nowrap"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Tips &amp; Trik
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-gradient-to-bl from-amber-200/40 to-transparent rounded-full blur-3xl pointer-events-none dark:from-amber-900/20"></div>

        <div className="relative flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="flex-1 text-center lg:text-left space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 text-xs font-semibold tracking-widest uppercase">
              Perawatan Perhiasan Premium
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-tight leading-tight text-stone-900 dark:text-white">
              {content.heroTitle} <br />
              <span className="font-medium text-amber-600 dark:text-amber-500 italic">
                {content.heroSubtitle}
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto lg:mx-0 text-lg text-stone-600 dark:text-stone-400 leading-relaxed font-light">
              {content.heroDescription}
            </p>
            
            <div className="space-y-4 pt-6">
              {/* Primary navigation CTAs — toko & tips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto lg:mx-0">
                <Link
                  href="/shop"
                  className="group relative overflow-hidden flex flex-col gap-3 p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:-translate-y-1"
                >
                  <span className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors" />
                  <span className="relative w-12 h-12 rounded-xl bg-white/20 grid place-items-center backdrop-blur-sm">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                  </span>
                  <span className="relative">
                    <span className="block text-[10px] uppercase tracking-widest font-semibold text-white/80">{content.shopCardLabel}</span>
                    <span className="mt-1 flex items-center gap-1.5 font-serif text-xl leading-tight font-medium">
                      {content.shopCardTitle}
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </span>
                </Link>

                <Link
                  href="/dashboard"
                  className="group relative overflow-hidden flex flex-col gap-3 p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-500 text-stone-900 dark:text-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <span className="relative w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 grid place-items-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                    </svg>
                  </span>
                  <span className="relative">
                    <span className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500 dark:text-stone-400">{content.eduCardLabel}</span>
                    <span className="mt-1 flex items-center gap-1.5 font-serif text-xl leading-tight font-medium">
                      {content.eduCardTitle}
                      <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </span>
                </Link>
              </div>

              {/* Secondary CTAs — Tanya admin & scroll to value */}
              <div className="flex flex-col sm:flex-row items-stretch justify-center lg:justify-start gap-3">
                <a 
                  href={content.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 text-xs font-semibold tracking-wide uppercase text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/40 w-full sm:w-auto rounded-xl"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Tanya Admin / Produk
                </a>
                <a 
                  href="#value" 
                  className="inline-flex flex-row items-center justify-center gap-2 px-6 py-3 text-xs font-semibold tracking-wide uppercase text-stone-700 bg-transparent border border-stone-300 hover:border-stone-400 hover:bg-stone-100 transition-colors dark:text-stone-300 dark:border-stone-700 dark:hover:bg-stone-900 w-full sm:w-auto rounded-xl"
                >
                  Pelajari Manfaatnya
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full relative z-10 lg:pl-10">
            <div className="relative aspect-[4/5] sm:aspect-video lg:aspect-[4/5] bg-stone-200 dark:bg-stone-800 shadow-2xl overflow-hidden before:absolute before:inset-0 before:ring-1 before:ring-inset before:ring-black/10">
              <Image 
                src={content.heroImageUrl} 
                alt="Perbaikan perhiasan oleh Cleanova" 
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain transition-transform duration-1000 hover:scale-105"
                priority
              />
              {/* Elegant Accent Box */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-stone-50 dark:bg-stone-950 p-2 hidden sm:block">
                <div className="w-full h-full border border-amber-600/30 flex items-center justify-center p-4 text-center">
                  <span className="font-serif italic text-sm text-amber-700 dark:text-amber-500">Premium Care</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before & After / Value Proposition Section */}
      <section id="value" className="py-24 bg-stone-900 text-stone-50 dark:bg-stone-950 border-y border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif font-light">{content.valueTitle}</h2>
            <div className="w-16 h-px bg-amber-500 mx-auto"></div>
          </div>
          
          <p className="text-lg md:text-xl text-stone-300 font-light leading-relaxed">
            {content.valueDescription}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
            <div className="p-6 border border-stone-800 bg-stone-950/50">
              <h3 className="text-amber-500 font-serif italic text-xl mb-3">{content.valueCard1Title}</h3>
              <p className="text-stone-400 text-sm font-light">{content.valueCard1Text}</p>
            </div>
            <div className="p-6 border border-stone-800 bg-stone-950/50">
              <h3 className="text-amber-500 font-serif italic text-xl mb-3">{content.valueCard2Title}</h3>
              <p className="text-stone-400 text-sm font-light">{content.valueCard2Text}</p>
            </div>
            <div className="p-6 border border-stone-800 bg-stone-950/50">
              <h3 className="text-amber-500 font-serif italic text-xl mb-3">{content.valueCard3Title}</h3>
              <p className="text-stone-400 text-sm font-light">{content.valueCard3Text}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sneak Peek / Features Section */}
      <section className="py-32 bg-white dark:bg-stone-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 md:flex md:justify-between md:items-end border-b border-stone-200 dark:border-stone-800 pb-6">
            <div className="max-w-2xl">
              <span className="text-amber-600 dark:text-amber-500 text-sm font-semibold tracking-wider uppercase mb-2 block">{content.featureSubtitle}</span>
              <h2 className="text-3xl md:text-4xl font-serif text-stone-900 dark:text-white">{content.featureTitle}</h2>
            </div>
            <p className="text-stone-500 dark:text-stone-400 mt-4 md:mt-0 font-light max-w-sm">
              Semua hal yang Anda butuhkan untuk merawat koleksi berada di dalam genggaman Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800 mb-6">
                <Image 
                  src={content.feature1ImageUrl} 
                  alt={content.feature1Title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="text-2xl font-serif text-stone-900 dark:text-white mb-3">{content.feature1Title}</h3>
              <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed">
                {content.feature1Description}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800 mb-6">
                <Image 
                  src={content.feature2ImageUrl} 
                  alt={content.feature2Title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="text-2xl font-serif text-stone-900 dark:text-white mb-3">{content.feature2Title}</h3>
              <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed">
                {content.feature2Description}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800 mb-6">
                <Image 
                  src={content.feature3ImageUrl} 
                  alt={content.feature3Title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="text-2xl font-serif text-stone-900 dark:text-white mb-3">{content.feature3Title}</h3>
              <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed">
                {content.feature3Description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-stone-900 dark:bg-stone-950 p-12 md:p-20 text-center relative overflow-hidden border border-amber-900/30">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
              {content.ctaTitle} <br/>
              <span className="italic text-amber-500 font-light">{content.ctaSubtitle}</span>
            </h2>
            <p className="text-stone-300 max-w-xl mx-auto font-light">
              {content.ctaDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-sm uppercase tracking-widest font-bold text-stone-900 bg-amber-500 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 w-full sm:w-auto"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                Daftar Gratis Sekarang
              </Link>
              <a 
                href={content.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-5 text-sm uppercase tracking-widest font-bold text-white border border-stone-600 hover:border-amber-500 hover:text-amber-400 transition-colors w-full sm:w-auto"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Tanya Admin
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="font-serif italic text-xl text-stone-500">Cleanova Circle</span>
          </div>
          <p className="text-sm text-stone-400 font-light tracking-wide">
            &copy; {new Date().getFullYear()} Cleanova Circle. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
