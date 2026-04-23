import Link from "next/link";
import Image from "next/image";

const WHATSAPP_URL = "https://wa.me/6287855310680?text=Halo%20Admin%20Cleanova,%20saya%20tertarik%20untuk%20mendaftar%20langganan%20web%20edukasi%20Cleanova%20Circle.";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 font-sans selection:bg-amber-500 selection:text-white dark:bg-stone-950 dark:text-stone-50">
      
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 dark:bg-stone-950/80 dark:border-stone-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <Image 
                src="/landing-page/logo.jpg" 
                alt="Cleanova Circle Logo" 
                width={40} height={40}
                className="w-10 h-10 rounded-full object-contain shadow-lg shadow-amber-500/20"
              />
              <span className="font-serif font-medium text-2xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-stone-800 to-stone-500 dark:from-stone-200 dark:to-stone-400">
                Cleanova Circle
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                href="/login"
                className="hidden sm:inline-block text-sm font-medium tracking-widest uppercase text-stone-500 hover:text-amber-600 transition-colors dark:text-stone-400 dark:hover:text-amber-400"
              >
                Sudah Anggota?
              </Link>
              <Link 
                href="/login"
                className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-semibold tracking-widest uppercase text-white transition-all bg-stone-900 rounded-none border border-transparent shadow hover:bg-amber-600 dark:bg-white dark:text-stone-900 dark:hover:bg-amber-500 hover:shadow-lg hover:-translate-y-0.5"
              >
                Member Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-gradient-to-bl from-amber-200/40 to-transparent rounded-full blur-3xl pointer-events-none dark:from-amber-900/20"></div>

        <div className="relative flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 text-stone-500 dark:text-stone-400 text-xs font-medium tracking-widest uppercase backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Komunitas Perawatan Perhiasan Premium
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-tight leading-tight text-stone-900 dark:text-white">
              Kembalikan Kilau <br />
              <span className="font-medium text-amber-600 dark:text-amber-500 italic">
                Koleksi Berharga Anda.
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto lg:mx-0 text-lg text-stone-600 dark:text-stone-400 leading-relaxed font-light">
              Bergabunglah dengan <strong className="font-medium text-stone-900 dark:text-stone-200">Cleanova Circle</strong>—komunitas eksklusif yang membagikan rahasia, tips DIY, dan panduan restorasi profesional agar perhiasan dan koleksi Anda selalu tampil memukau seperti baru.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-6">
              <a 
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-semibold tracking-wide uppercase text-white bg-green-600 hover:bg-green-700 transition-all shadow-xl hover:shadow-green-600/30 w-full sm:w-auto"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Gabung Komunitas via WhatsApp
              </a>
              <a 
                href="#value" 
                className="inline-flex flex-row items-center gap-2 px-8 py-4 text-sm font-semibold tracking-wide uppercase text-stone-900 bg-transparent border border-stone-300 hover:bg-stone-100 transition-colors dark:text-stone-300 dark:border-stone-700 dark:hover:bg-stone-900 w-full sm:w-auto"
              >
                Pelajari Manfaatnya
              </a>
            </div>
          </div>
          
          <div className="flex-1 w-full relative z-10 lg:pl-10">
            <div className="relative aspect-[4/5] sm:aspect-video lg:aspect-[4/5] bg-stone-200 dark:bg-stone-800 shadow-2xl overflow-hidden before:absolute before:inset-0 before:ring-1 before:ring-inset before:ring-black/10">
              <Image 
                src="/landing-page/671129876_17900392704423715_6523539329292204971_n..jpg" 
                alt="Perbaikan perhiasan oleh Cleanova" 
                fill
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
            <h2 className="text-3xl md:text-4xl font-serif font-light">Perawatan Tepat, Investasi Selamat</h2>
            <div className="w-16 h-px bg-amber-500 mx-auto"></div>
          </div>
          
          <p className="text-lg md:text-xl text-stone-300 font-light leading-relaxed">
            Perhiasan yang kusam bukan berarti rusak permanen. Dengan teknik yang salah, Anda berisiko merusak material berharga. Di Cleanova Circle, kami mengajarkan Anda metode restorasi yang aman, hemat biaya, dan efektif, menjaga koleksi Anda tetap murni generasi demi generasi.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
            <div className="p-6 border border-stone-800 bg-stone-950/50">
              <h3 className="text-amber-500 font-serif italic text-xl mb-3">Hemat Ratusan Ribu</h3>
              <p className="text-stone-400 text-sm font-light">Kurangi ketergantungan pada jasa pembersih profesional yang mahal dengan teknik mandiri yang terbukti.</p>
            </div>
            <div className="p-6 border border-stone-800 bg-stone-950/50">
              <h3 className="text-amber-500 font-serif italic text-xl mb-3">Aman & Teruji</h3>
              <p className="text-stone-400 text-sm font-light">Lupakan risiko kerusakan akibat bahan kimia keras. Kami merekomendasikan produk dengan komposisi teraman.</p>
            </div>
            <div className="p-6 border border-stone-800 bg-stone-950/50">
              <h3 className="text-amber-500 font-serif italic text-xl mb-3">Hasil Instan</h3>
              <p className="text-stone-400 text-sm font-light">Panduan langsung ke inti yang memungkinkan Anda melihat perbedaannya (Before & After) dalam hitungan menit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sneak Peek / Features Section */}
      <section className="py-32 bg-white dark:bg-stone-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 md:flex md:justify-between md:items-end border-b border-stone-200 dark:border-stone-800 pb-6">
            <div className="max-w-2xl">
              <span className="text-amber-600 dark:text-amber-500 text-sm font-semibold tracking-wider uppercase mb-2 block">Eksklusif Untuk Member</span>
              <h2 className="text-3xl md:text-4xl font-serif text-stone-900 dark:text-white">Akses Aksesibilitas Tak Terbatas</h2>
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
                  src="/landing-page/656353206_17897386137423715_5989968134986280728_n..jpg" 
                  alt="DIY Hacks & Tricks" 
                  fill
                  className="object-contain transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="text-2xl font-serif text-stone-900 dark:text-white mb-3">DIY Hacks & Tricks</h3>
              <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed">
                Pelajari rahasia merawat perak, emas, hingga berlian menggunakan bahan-bahan aman yang bisa Anda temukan di rumah.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800 mb-6">
                <Image 
                  src="/landing-page/656701773_17898483894423715_5763756912223990821_n..jpg" 
                  alt="Step-by-Step Restoration Videos" 
                  fill
                  className="object-contain transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="text-2xl font-serif text-stone-900 dark:text-white mb-3">Step-by-Step Video</h3>
              <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed">
                Tonton panduan visual visual untuk proses restorasi perhiasan kusam mulai dari persiapan hingga tahap pemolesan akhir.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800 mb-6">
                <Image 
                  src="/landing-page/656817205_17899009773423715_4292222626302527645_n..jpg" 
                  alt="Product Recommendations" 
                  fill
                  className="object-contain transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="text-2xl font-serif text-stone-900 dark:text-white mb-3">Product Rating & Guide</h3>
              <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed">
                Rekomendasi independen dan panduan dosis pemakaian produk pembersih pabrikan dari para kurator pengalaman.
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
              Mulai Merawat <br/>
              <span className="italic text-amber-500 font-light">Koleksi Kesayangan Anda.</span>
            </h2>
            <p className="text-stone-300 max-w-xl mx-auto font-light">
              Tingkatkan standar kebersihan dan estetika koleksi Anda hari ini juga tanpa menghabiskan budget berlebih di jasa terpadu.
            </p>
            
            <a 
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 text-sm uppercase tracking-widest font-bold text-stone-900 bg-amber-500 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              <svg className="w-5 h-5 text-stone-900" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Berlangganan Sekarang
            </a>
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
