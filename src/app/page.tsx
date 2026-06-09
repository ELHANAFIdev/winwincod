import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-[var(--gold-accent)]/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <header className="container mx-auto p-6 flex justify-between items-center relative z-10">
        <h1 className="text-3xl font-extrabold text-[var(--gold-accent)] drop-shadow-md">
          WinWinCOD
        </h1>
        <nav className="flex gap-4 items-center">
          {session ? (
            <Link 
              href={session.user.role === 'ADMIN' ? '/admin/dashboard' : '/seller/dashboard'}
              className="glass-panel text-[var(--gold-accent)] px-6 py-2.5 rounded-full font-bold hover:bg-white/10 transition"
            >
              لوحة التحكم
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-gray-300 font-medium hover:text-[var(--gold-accent)] px-4 py-2 transition">
                دخول
              </Link>
              <Link href="/register" className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-6 py-2.5 rounded-full font-bold shadow-[0_0_20px_rgba(208,193,148,0.3)] hover:shadow-[0_0_30px_rgba(208,193,148,0.5)] transition">
                ابدأ البيع الآن
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-right space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--gold-accent)]/30 text-[var(--gold-accent)] text-sm font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              المنصة الأولى للدروبشيبينغ في المغرب
            </div>
            
            <h2 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
              تاجر بدون رأس مال <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
                بنظام الدفع عند الاستلام
              </span>
            </h2>
            
            <p className="text-xl text-gray-400 max-w-xl leading-relaxed">
              نوفر لك المنتجات المربحة، نتكفل بالتخزين والتوصيل. مهمتك الوحيدة هي التسويق وجني الأرباح. منصة WinWinCOD هي شريكك للنجاح المضمون.
            </p>
            
            <div className="flex gap-4 pt-4">
              <Link href="/register" className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-yellow-500/25 transition transform hover:-translate-y-1">
                انشئ حساب بائع مجاناً
              </Link>
              <Link href="#steps" className="glass-panel text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-white/10 transition">
                كيف يعمل النظام؟
              </Link>
            </div>
          </div>
          
          <div className="relative h-[500px] w-full animate-[float_6s_ease-in-out_infinite]">
            <Image 
              src="/hero-3d.webp" 
              alt="Logistics 3D"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="steps" className="py-24 relative z-10 bg-black/40 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">مسار النجاح في 4 خطوات</h2>
            <p className="text-gray-400 text-lg">أسهل طريقة لبدء تجارتك الإلكترونية بدون مخاطر</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[var(--gold-accent)]/10 via-[var(--gold-accent)]/50 to-[var(--gold-accent)]/10 z-0"></div>
            
            <StepCard number="1" title="سجل حسابك" desc="افتح حساب بائع مجاني في ثوانٍ وانضم إلينا." />
            <StepCard number="2" title="اختر منتجاً" desc="تصفح الكتالوج واختر المنتجات الأكثر مبيعاً." />
            <StepCard number="3" title="سوق وبع" desc="قم بالترويج للمنتج واجلب الطلبيات لمنصتنا." />
            <StepCard number="4" title="اسحب أرباحك" desc="نقوم بالتوصيل، وتستلم أرباحك الصافية فوراً." />
          </div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="📦" 
              title="بدون مخزون (Zero Inventory)" 
              desc="لا داعي لشراء المنتجات مسبقاً أو تجميد رأس مالك. وفرنا لك مستودعاً مليئاً بالمنتجات." 
            />
            <FeatureCard 
              icon="🚚" 
              title="شحن وتوصيل (Logistics)" 
              desc="نتكفل بتغليف وتوصيل الطلبات لزبائنك في كل مدن المغرب وتحصيل الأموال باحترافية." 
            />
            <FeatureCard 
              icon="💰" 
              title="أرباح مضمونة (Guaranteed Profits)" 
              desc="بمجرد تسليم الطلب، يتم إيداع الأرباح في محفظتك ويمكنك سحبها لحسابك البنكي بكل سهولة." 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-white/10 text-gray-400 py-12 text-center relative z-10">
        <div className="container mx-auto px-6">
          <h3 className="text-2xl font-bold text-[var(--gold-accent)] mb-4">WinWinCOD</h3>
          <p className="mb-8">شريكك الموثوق في التجارة الإلكترونية بنظام الدفع عند الاستلام.</p>
          <p>© {new Date().getFullYear()} WinWinCOD Platform. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="relative z-10 text-center group">
      <div className="w-24 h-24 mx-auto glass-panel rounded-2xl flex items-center justify-center text-3xl font-black text-[var(--gold-accent)] mb-6 transform group-hover:scale-110 transition duration-300 shadow-[0_0_15px_rgba(208,193,148,0.2)] group-hover:shadow-[0_0_30px_rgba(208,193,148,0.4)]">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-400">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-[var(--gold-accent)]/50 transition duration-300 group">
      <div className="text-5xl mb-6 transform group-hover:-translate-y-2 transition duration-300 filter drop-shadow-[0_0_10px_rgba(208,193,148,0.5)]">{icon}</div>
      <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}