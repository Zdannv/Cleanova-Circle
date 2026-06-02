import Link from "next/link";
import Image from "next/image";
import prisma from "../lib/prisma";

export default async function Home() {
  const landingPage = await prisma.landingPage.findUnique({
    where: { id: "default" }
  });

  const products = await prisma.product.findMany({
    take: 3,
    orderBy: { createdAt: "desc" }
  });

  const content = {
    logoUrl: landingPage?.logoUrl || "/landing-page/logo.jpg",
    whatsappUrl: landingPage?.whatsappUrl || "https://wa.me/6287855310680?text=Halo%20Admin%20Cleanova,%20saya%20tertarik%20untuk%20mendaftar%20langganan%20web%20edukasi%20Cleanova%20Circle.",
    heroTitle: landingPage?.heroTitle || "Solusi Kebersihan Modern",
    heroSubtitle: landingPage?.heroSubtitle || "untuk Barang Berharga Anda",
    heroDescription: landingPage?.heroDescription || "Memadukan formula premium ramah lingkungan dengan getaran ultrasonik untuk merawat, membersihkan, dan menjaga nilai perhiasan serta barang berharga Anda tetap seperti baru.",
    heroImageUrl: landingPage?.heroImageUrl || "/landing-page/671129876_17900392704423715_6523539329292204971_n..jpg",
    
    // Education Section (Section 3) - utilizing all feature fields for CMS editability
    eduSubtitle: landingPage?.featureSubtitle || "Cleanova Circle",
    eduTitle: landingPage?.featureTitle || "Komunitas dan Web Edukasi untuk membersihkan barang anda",
    feature1Title: landingPage?.feature1Title || "DIY Hacks & Tricks",
    feature1Description: landingPage?.feature1Description || "Pelajari rahasia merawat perak, emas, hingga berlian menggunakan bahan-bahan aman yang bisa Anda temukan di rumah.",
    feature1ImageUrl: landingPage?.feature1ImageUrl || "/landing-page/656353206_17897386137423715_5989968134986280728_n..jpg",
    feature2Title: landingPage?.feature2Title || "Step-by-Step Video",
    feature2Description: landingPage?.feature2Description || "Tonton panduan visual visual untuk proses restorasi perhiasan kusam mulai dari persiapan hingga tahap pemolesan akhir.",
    feature2ImageUrl: landingPage?.feature2ImageUrl || "/landing-page/656701773_17898483894423715_5763756912223990821_n..jpg",
    feature3Title: landingPage?.feature3Title || "Product Rating & Guide",
    feature3Description: landingPage?.feature3Description || "Rekomendasi independen dan panduan dosis pemakaian produk pembersih pabrikan dari para kurator pengalaman.",
    feature3ImageUrl: landingPage?.feature3ImageUrl || "/landing-page/656817205_17899009773423715_4292222626302527645_n..jpg",
    
    // Value Propositions (Section 4)
    valueTitle: landingPage?.valueTitle || "Mengapa Memilih Cleanova?",
    valueDescription: landingPage?.valueDescription || "",
    valueCard1Title: landingPage?.valueCard1Title || "Teknologi Canggih",
    valueCard1Text: landingPage?.valueCard1Text || "Formula aman ramah lingkungan dengan pembersihan getaran ultrasonik mikro.",
    valueCard2Title: landingPage?.valueCard2Title || "Ekosistem Lengkap",
    valueCard2Text: landingPage?.valueCard2Text || "Edukasi perawatan mendalam dan produk pendukung dalam satu genggaman.",
    valueCard3Title: landingPage?.valueCard3Title || "Transaksi & Pengiriman Aman",
    valueCard3Text: landingPage?.valueCard3Text || "Terintegrasi langsung dengan kurir terpercaya dan gateway pembayaran yang aman.",

    // Hero Action Buttons
    shopCardTitle: landingPage?.shopCardTitle || "Jelajahi Produk",
    eduCardTitle: landingPage?.eduCardTitle || "Pelajari Tips Bersih",

    // Bottom CTA Section (Retained)
    ctaTitle: landingPage?.ctaTitle || "Mulai Merawat",
    ctaSubtitle: landingPage?.ctaSubtitle || "Koleksi Kesayangan Anda.",
    ctaDescription: landingPage?.ctaDescription || "Tingkatkan standar kebersihan dan estetika koleksi Anda hari ini juga tanpa menghabiskan budget berlebih di jasa terpadu.",
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
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

      {/* Hero Section (The Master Brand) */}
      <section className="relative pt-28 sm:pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-gradient-to-bl from-amber-200/30 to-transparent rounded-full blur-3xl pointer-events-none dark:from-amber-900/10"></div>
        <div className="absolute top-1/2 left-0 -ml-40 w-[400px] h-[400px] bg-gradient-to-tr from-amber-100/20 to-transparent rounded-full blur-2xl pointer-events-none dark:from-stone-900/20"></div>

        <div className="relative flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 text-center lg:text-left space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 text-[11px] font-semibold tracking-widest uppercase rounded-full">
              Cleanova
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-tight leading-tight text-stone-900 dark:text-white">
              {content.heroTitle} <br />
              <span className="font-semibold text-amber-600 dark:text-amber-500 italic block mt-2">
                {content.heroSubtitle}
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed font-light">
              {content.heroDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-xs font-semibold tracking-widest uppercase text-stone-900 bg-amber-400 hover:bg-amber-500 active:scale-95 duration-150 rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 dark:text-stone-950 w-full sm:w-auto text-center"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272" />
                </svg>
                {content.shopCardTitle}
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-xs font-semibold tracking-widest uppercase text-white bg-stone-900 hover:bg-amber-600 active:scale-95 duration-150 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 dark:bg-stone-850 dark:hover:bg-amber-500 dark:text-white w-full sm:w-auto text-center border border-stone-850 dark:border-stone-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {content.eduCardTitle}
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a 
                href={content.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-xs font-medium text-stone-500 hover:text-green-600 dark:text-stone-400 dark:hover:text-green-400 transition-colors"
              >
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Tanya Admin via WhatsApp
              </a>
            </div>
          </div>
          
          <div className="flex-1 w-full relative z-10 lg:pl-8">
            <div className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-850 dark:to-stone-900 rounded-3xl shadow-2xl overflow-hidden before:absolute before:inset-0 before:ring-1 before:ring-inset before:ring-black/10 border border-stone-200/40 dark:border-stone-850">
              <Image 
                src={content.heroImageUrl} 
                alt="Cleanova Premium Solution" 
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-1000 hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent"></div>
              {/* Elegant Accent Box */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/85 dark:bg-stone-900/85 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-lg flex items-center justify-between gap-4">
                <div>
                  <span className="block text-[10px] uppercase tracking-widest font-bold text-amber-600 dark:text-amber-500">Premium Product</span>
                  <span className="text-xs text-stone-800 dark:text-stone-250 font-serif">Original &amp; Certified Care</span>
                </div>
                <span className="px-3 py-1 bg-amber-400 text-stone-900 text-[10px] uppercase tracking-wider font-extrabold rounded-lg">Eco-Friendly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Product Showcase */}
      <section className="py-24 bg-stone-50 dark:bg-stone-900/30 border-y border-stone-200/50 dark:border-stone-850">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-amber-600 dark:text-amber-500 text-xs font-semibold tracking-wider uppercase bg-amber-50 dark:bg-amber-950/40 border border-amber-150 dark:border-amber-900/30 px-3.5 py-1.5 rounded-full">
              Cleanova Shop
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-stone-900 dark:text-white leading-tight">
              Koleksi Produk <span className="italic text-amber-600 dark:text-amber-500 font-medium">Perawatan Utama</span>
            </h2>
            <div className="w-16 h-px bg-amber-500 mx-auto"></div>
            <p className="text-stone-500 dark:text-stone-400 font-light text-sm sm:text-base leading-relaxed">
              Dapatkan produk orisinal Cleanova untuk memulihkan dan merawat ketahanan barang berharga Anda dengan standar industri profesional.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="border border-dashed border-stone-300 dark:border-stone-850 rounded-3xl py-16 text-center">
              <p className="text-stone-500 dark:text-stone-455 font-light">Belum ada produk yang tersedia saat ini.</p>
              <Link href="/shop" className="mt-4 inline-flex items-center text-xs font-bold text-amber-600 hover:text-amber-500 uppercase tracking-widest gap-1">
                Kunjungi Toko <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map((product) => {
                const isOut = product.stock <= 0;
                return (
                  <div
                    key={product.id}
                    className="group relative bg-white dark:bg-stone-950 rounded-3xl border border-stone-200/60 dark:border-stone-850 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-stone-900/30"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square bg-stone-50 dark:bg-stone-900/40 overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center text-stone-400 text-xs">Tidak ada gambar</div>
                      )}
                      
                      {isOut && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-stone-950/90 text-white text-[9px] uppercase tracking-widest font-extrabold rounded-full backdrop-blur-sm shadow">
                          Habis
                        </span>
                      )}
                    </div>

                    {/* Content Container */}
                    <div className="p-6 flex flex-col flex-1 gap-4">
                      <div className="space-y-2 flex-1">
                        <h3 className="font-serif text-lg leading-snug text-stone-900 dark:text-white line-clamp-2">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-xs text-stone-500 dark:text-stone-400 font-light line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-stone-100 dark:border-stone-900 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500">Harga</p>
                          <p className="font-semibold text-stone-900 dark:text-white text-base">{formatRupiah(product.price)}</p>
                        </div>

                        <Link
                          href="/shop"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-900 text-white hover:bg-amber-500 hover:text-stone-950 dark:bg-white dark:text-stone-950 dark:hover:bg-amber-400 font-semibold text-[11px] uppercase tracking-wider rounded-xl transition-all active:scale-95 duration-150"
                        >
                          Lihat Detail
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Section Cleanova Circle (Lead Magnet & Edukasi) */}
      <section className="py-24 bg-white dark:bg-stone-900 border-b border-stone-200/50 dark:border-stone-850">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-amber-600 dark:text-amber-500 text-xs font-semibold tracking-wider uppercase bg-amber-50 dark:bg-amber-950/40 border border-amber-150 dark:border-amber-900/30 px-3.5 py-1.5 rounded-full">
              {content.eduSubtitle}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-stone-900 dark:text-white leading-tight">
              {content.eduTitle}
            </h2>
            <div className="w-16 h-px bg-amber-500 mx-auto"></div>
            <p className="text-stone-500 dark:text-stone-400 font-light text-sm sm:text-base leading-relaxed">
              Platform pembelajaran khusus bagi para pecinta perhiasan dan barang berharga untuk mempelajari rahasia perawatan terbaik di bawah bimbingan ahli.
            </p>
          </div>

          {/* 3 Column Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
            
            {/* Feature 1 */}
            <div className="group flex flex-col bg-stone-50 dark:bg-stone-950 rounded-3xl p-6 border border-stone-200/60 dark:border-stone-850 hover:border-amber-300 dark:hover:border-amber-900/60 transition-all duration-300 shadow-sm hover:shadow-lg">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 mb-6">
                {content.feature1ImageUrl ? (
                  <Image 
                    src={content.feature1ImageUrl} 
                    alt={content.feature1Title} 
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-stone-400 text-xs">Tidak ada gambar</div>
                )}
              </div>
              <h3 className="text-xl font-serif font-medium text-stone-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                {content.feature1Title}
              </h3>
              <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed text-sm flex-1">
                {content.feature1Description}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group flex flex-col bg-stone-50 dark:bg-stone-950 rounded-3xl p-6 border border-stone-200/60 dark:border-stone-850 hover:border-amber-300 dark:hover:border-amber-900/60 transition-all duration-300 shadow-sm hover:shadow-lg">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 mb-6">
                {content.feature2ImageUrl ? (
                  <Image 
                    src={content.feature2ImageUrl} 
                    alt={content.feature2Title} 
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-stone-400 text-xs">Tidak ada gambar</div>
                )}
              </div>
              <h3 className="text-xl font-serif font-medium text-stone-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                {content.feature2Title}
              </h3>
              <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed text-sm flex-1">
                {content.feature2Description}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group flex flex-col bg-stone-50 dark:bg-stone-950 rounded-3xl p-6 border border-stone-200/60 dark:border-stone-850 hover:border-amber-300 dark:hover:border-amber-900/60 transition-all duration-300 shadow-sm hover:shadow-lg">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 mb-6">
                {content.feature3ImageUrl ? (
                  <Image 
                    src={content.feature3ImageUrl} 
                    alt={content.feature3Title} 
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-stone-400 text-xs">Tidak ada gambar</div>
                )}
              </div>
              <h3 className="text-xl font-serif font-medium text-stone-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                {content.feature3Title}
              </h3>
              <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed text-sm flex-1">
                {content.feature3Description}
              </p>
            </div>

          </div>

          {/* Lead Magnet CTA */}
          <div className="text-center bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 dark:from-amber-950/20 dark:via-amber-950/10 dark:to-amber-950/20 p-8 rounded-3xl border border-amber-500/20 max-w-4xl mx-auto space-y-4 shadow-inner">
            <p className="text-stone-800 dark:text-stone-200 font-serif italic text-base sm:text-lg">
              "Gabung Cleanova Circle: Ribuan Tips &amp; Video Panduan Merawat Barang Kesayangan Anda Gratis!"
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-xs font-semibold tracking-widest uppercase text-stone-900 bg-amber-400 hover:bg-amber-500 active:scale-95 duration-150 rounded-xl transition-all shadow-md hover:shadow-lg dark:text-stone-950"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                Daftar Akun Gratis Sekarang
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Section Mengapa Memilih Cleanova? (Value Propositions) */}
      <section className="py-24 bg-stone-900 text-stone-50 dark:bg-stone-950 border-y border-stone-850">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-amber-500 text-xs font-semibold tracking-wider uppercase border border-amber-900/60 bg-amber-950/20 px-3.5 py-1.5 rounded-full">
              Keunggulan Brand
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-white">{content.valueTitle}</h2>
            <div className="w-16 h-px bg-amber-500 mx-auto"></div>
            {content.valueDescription && (
              <p className="text-stone-300 font-light text-sm sm:text-base leading-relaxed">
                {content.valueDescription}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-stone-800 bg-stone-950/40 rounded-3xl space-y-4 hover:border-stone-700 transition-colors duration-300">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-amber-500 font-serif italic text-xl">{content.valueCard1Title}</h3>
              <p className="text-stone-400 text-sm font-light leading-relaxed">{content.valueCard1Text}</p>
            </div>

            <div className="p-8 border border-stone-800 bg-stone-950/40 rounded-3xl space-y-4 hover:border-stone-700 transition-colors duration-300">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-amber-500 font-serif italic text-xl">{content.valueCard2Title}</h3>
              <p className="text-stone-400 text-sm font-light leading-relaxed">{content.valueCard2Text}</p>
            </div>

            <div className="p-8 border border-stone-800 bg-stone-950/40 rounded-3xl space-y-4 hover:border-stone-700 transition-colors duration-300">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-amber-500 font-serif italic text-xl">{content.valueCard3Title}</h3>
              <p className="text-stone-400 text-sm font-light leading-relaxed">{content.valueCard3Text}</p>
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
