import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LandingNavbar from "./LandingNavbar";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;
  const dashboardUrl =
    session?.user?.role === "ADMIN"
      ? "/admin/dashboard"
      : session?.user?.role === "CALL_CENTER"
      ? "/call-center/dashboard"
      : "/seller/dashboard";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Cairo',sans-serif]" dir="rtl">
      <LandingNavbar isLoggedIn={isLoggedIn} dashboardUrl={dashboardUrl} />

      {/* ══════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-[#4361EE] via-[#3a58e8] to-[#3254D4] min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute top-1/4 -right-24 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#FB923C]/10 rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/40 rounded-full" />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-[#FB923C]/60 rounded-full" />
          <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-white/30 rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white/90 text-sm font-bold mb-8">
              <span className="w-2 h-2 bg-[#FB923C] rounded-full animate-pulse" />
              منصة الدروب شيبينغ #1 في المغرب
            </div>

            <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              تاجر بدون<br />
              <span className="text-[#FB923C]">رأس مال</span>
            </h1>
            <h2 className="text-2xl lg:text-3xl font-bold text-white/80 mb-6">
              بنظام الدفع عند الاستلام
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-lg">
              نوفر لك المنتجات، التخزين، والتوصيل لجميع أنحاء المغرب.
              مهمتك الوحيدة هي التسويق وجني الأرباح — بدون مخاطرة، بدون مخزون.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="bg-[#FB923C] hover:bg-orange-500 text-white px-8 py-4 rounded-2xl text-lg font-black shadow-2xl shadow-orange-500/30 transition hover:-translate-y-0.5"
              >
                ابدأ مجاناً الآن ←
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-6 py-4 rounded-2xl text-base font-bold transition hover:bg-white/5"
              >
                <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">▶</span>
                شاهد كيف يعمل
              </a>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-white/20">
              {[
                { num: "+1000", label: "بائع نشط" },
                { num: "95%",   label: "نسبة التسليم" },
                { num: "24h",   label: "دعم متواصل" },
                { num: "+50",   label: "مدينة مغربية" },
              ].map(({ num, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-black text-white">{num}</p>
                  <p className="text-white/60 text-xs font-bold mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating cards mockup */}
          <div className="hidden lg:flex items-center justify-center relative h-[500px]">
            {/* Card 1 — new order notification */}
            <div className="animate-float absolute top-8 right-4 bg-white rounded-2xl shadow-2xl shadow-blue-900/30 p-4 w-64 border border-white/60">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#EEF2FF] rounded-xl flex items-center justify-center text-sm">📦</div>
                <div>
                  <p className="text-[10px] font-black text-[#4361EE] uppercase tracking-wider">طلب جديد</p>
                  <p className="text-[10px] text-slate-400">منذ ثوانٍ</p>
                </div>
                <span className="mr-auto w-2 h-2 bg-[#4361EE] rounded-full animate-pulse" />
              </div>
              <p className="font-black text-[#1E293B] text-sm">يونس المغراوي</p>
              <p className="text-xs text-slate-400 mb-2">الدار البيضاء — مرتيل</p>
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-[#1E293B]">450 <span className="text-xs font-bold text-slate-400">د.م</span></span>
                <span className="bg-[#EEF2FF] text-[#4361EE] text-[10px] font-black px-2 py-1 rounded-full">قيد التجهيز</span>
              </div>
            </div>

            {/* Card 2 — delivered */}
            <div className="animate-float2 absolute top-1/2 -translate-y-1/2 left-0 bg-white rounded-2xl shadow-2xl shadow-blue-900/30 p-4 w-56 border border-white/60">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-sm">✅</div>
                <p className="text-[10px] font-black text-green-600 uppercase tracking-wider">تم التسليم</p>
              </div>
              <p className="font-black text-[#1E293B] text-sm">سعاد الحسني</p>
              <p className="text-xs text-slate-400 mb-3">مراكش</p>
              <div className="bg-green-50 rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-green-600 font-bold">ربحك الصافي</p>
                <p className="text-xl font-black text-green-600">+120 <span className="text-xs">د.م</span></p>
              </div>
            </div>

            {/* Card 3 — daily earnings */}
            <div className="animate-float3 absolute bottom-8 right-8 bg-gradient-to-br from-[#4361EE] to-[#3254D4] rounded-2xl shadow-2xl shadow-blue-900/40 p-4 w-52 text-white">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-200">أرباح اليوم</p>
                <span className="text-lg">💰</span>
              </div>
              <p className="text-3xl font-black mb-1">3,240</p>
              <p className="text-sm font-bold text-blue-200 mb-3">درهم مغربي</p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-200">
                <span className="text-green-300">↑</span> 12 طلب مسلّم اليوم
              </div>
            </div>

            {/* Card 4 — center main card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 w-72 text-white text-center shadow-xl">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🚀</div>
              <p className="text-lg font-black mb-1">لوحة تحكم واحدة</p>
              <p className="text-white/70 text-sm">لإدارة كل طلباتك وأرباحك في مكان واحد</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["📦 طلبات", "🚚 شحن", "💵 أرباح"].map((item) => (
                  <div key={item} className="bg-white/10 rounded-xl py-2 text-[11px] font-bold text-white/80">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V30C240 0 480 60 720 40C960 20 1200 50 1440 20V60H0Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#4361EE] font-black text-sm uppercase tracking-widest">خطوات بسيطة</span>
            <h2 className="text-4xl font-black text-[#1E293B] mt-2">كيف يعمل WinWinCOD؟</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto text-lg">أربع خطوات فقط تفصلك عن أول ربح</p>
          </div>

          <div className="relative grid md:grid-cols-4 gap-8">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-10 right-[12.5%] left-[12.5%] h-0.5 bg-gradient-to-l from-[#4361EE] to-[#FB923C] opacity-20" />

            {[
              { num: "01", icon: "📝", title: "سجل مجاناً", desc: "أنشئ حسابك في ثوانٍ وانضم لمجتمع الآلاف من البائعين" },
              { num: "02", icon: "🛍️", title: "اختر منتجاتك", desc: "تصفح كتالوجنا المتنوع واختر المنتجات التي تريد بيعها" },
              { num: "03", icon: "📤", title: "أضف طلباتك", desc: "أدخل طلبات زبائنك بسهولة وتابع حالتها لحظة بلحظة" },
              { num: "04", icon: "💸", title: "اسحب أرباحك", desc: "بعد التسليم، احسب أرباحك واسحبها فوراً لحسابك البنكي" },
            ].map(({ num, icon, title, desc }, i) => (
              <div key={num} className="relative text-center group">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg shadow-blue-100 border border-[#E2E8F0] flex items-center justify-center text-3xl group-hover:scale-110 group-hover:shadow-blue-200 transition-all duration-300">
                    {icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#4361EE] rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-md">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-lg font-black text-[#1E293B] mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[180px] mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. FEATURES
      ══════════════════════════════════════════ */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#4361EE] font-black text-sm uppercase tracking-widest">كل ما تحتاجه</span>
            <h2 className="text-4xl font-black text-[#1E293B] mt-2">ميزات صُممت للبائع المغربي</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto text-lg">أدوات احترافية في متناول يدك</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "📦", color: "#EEF2FF", iconColor: "#4361EE",
                title: "بدون مخزون",
                desc: "لا حاجة لشراء أي منتج مسبقاً. اختر من كتالوجنا وابدأ البيع فوراً بدون أي مخاطرة مالية.",
              },
              {
                icon: "🚚", color: "#ECFDF5", iconColor: "#059669",
                title: "شحن سريع لكل المغرب",
                desc: "نغطي أكثر من 50 مدينة مغربية بشركاء توصيل موثوقين وتتبع لحظي للطلبات.",
              },
              {
                icon: "💰", color: "#FFF7ED", iconColor: "#EA580C",
                title: "أرباح مضمونة",
                desc: "كل درهم ربحته في حسابك فور تسليم الطلب. سحب فوري بدون تأخير ولا رسوم خفية.",
              },
              {
                icon: "📊", color: "#F0FDF4", iconColor: "#16A34A",
                title: "لوحة تحكم ذكية",
                desc: "تابع طلباتك وأرباحك وإحصاءاتك في الوقت الفعلي من أي جهاز وأي مكان.",
              },
              {
                icon: "🎧", color: "#FDF4FF", iconColor: "#9333EA",
                title: "دعم 24/7",
                desc: "فريق الدعم متاح على مدار الساعة لحل أي مشكلة وضمان تجربة بيع سلسة دائماً.",
              },
              {
                icon: "📈", color: "#FFF1F2", iconColor: "#E11D48",
                title: "تقارير مفصلة",
                desc: "احصل على تقارير يومية وأسبوعية وشهرية عن أداء مبيعاتك لاتخاذ قرارات أفضل.",
              },
            ].map(({ icon, color, iconColor, title, desc }) => (
              <div
                key={title}
                className="group bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] hover:border-[#4361EE]/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: color }}
                >
                  {icon}
                </div>
                <h3 className="text-lg font-black text-[#1E293B] mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#4361EE] font-black text-sm uppercase tracking-widest">قالوا عنا</span>
            <h2 className="text-4xl font-black text-[#1E293B] mt-2">بائعون حقيقيون، نتائج حقيقية</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "يونس البكاوي",
                city: "الدار البيضاء",
                avatar: "ي",
                color: "bg-[#4361EE]",
                stars: 5,
                text: "كنت خايف نبدأ تجارة إلكترونية بسبب رأس المال. مع WinWinCOD بدأت بصفر ودرت 8,000 درهم في الشهر الأول! المنصة سهلة بزاف والدعم دايما موجود.",
                orders: "+230 طلب",
              },
              {
                name: "سعاد الأمراني",
                city: "مراكش",
                avatar: "س",
                color: "bg-[#FB923C]",
                stars: 5,
                text: "كاملة من البيت كنت تجمع آلاف الدراهم! المنتجات باغية، التوصيل سريع، والأرباح تتسحب في نفس اليوم. أنصح بيها كل واحد بغا يبدأ من الصفر.",
                orders: "+180 طلب",
              },
              {
                name: "محمد الإدريسي",
                city: "فاس",
                avatar: "م",
                color: "bg-purple-500",
                stars: 5,
                text: "دربت في عدة منصات وما لقيت أسهل من WinWinCOD. لوحة التحكم واضحة، التقارير مفيدة، والشحن موثوق. الأن عندي 15,000 درهم ربح شهري منتظم.",
                orders: "+390 طلب",
              },
            ].map(({ name, city, avatar, color, stars, text, orders }) => (
              <div key={name} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col gap-4 hover:shadow-lg hover:border-[#4361EE]/20 transition-all duration-300">
                <div className="flex text-[#FB923C] gap-0.5 text-lg">
                  {"★".repeat(stars)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">"{text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E2E8F0]">
                  <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                    {avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[#1E293B] text-sm">{name}</p>
                    <p className="text-slate-400 text-xs">{city}</p>
                  </div>
                  <div className="bg-[#EEF2FF] text-[#4361EE] text-[10px] font-black px-2.5 py-1 rounded-full flex-shrink-0">
                    {orders}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. PRICING
      ══════════════════════════════════════════ */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-[#4361EE] font-black text-sm uppercase tracking-widest">بسيط وشفاف</span>
          <h2 className="text-4xl font-black text-[#1E293B] mt-2 mb-4">الانضمام مجاني 100%</h2>
          <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">
            لا رسوم شهرية، لا اشتراكات — تدفع فقط عمولة صغيرة على كل طلب مسلّم بنجاح.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: "🎯", title: "تسجيل مجاني", desc: "أنشئ حسابك بدون أي رسوم أو بطاقة بنكية مطلوبة" },
              { icon: "💳", title: "ادفع عند البيع فقط", desc: "عمولة رمزية فقط عند تسليم الطلب بنجاح. لا مبيعات = لا رسوم" },
              { icon: "🔓", title: "بدون قيود", desc: "أضف طلبات غير محدودة، وصول كامل لجميع الميزات من اليوم الأول" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 text-center hover:border-[#4361EE]/40 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-black text-[#1E293B] mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. CTA
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-br from-[#4361EE] to-[#3254D4] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#FB923C]/10 rounded-full" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
            انضم إلى آلاف البائعين<br />
            <span className="text-[#FB923C]">المغاربة الناجحين</span>
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            ابدأ رحلتك في التجارة الإلكترونية اليوم. مجاني تماماً، لا خطر، لا مخزون.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="bg-[#FB923C] hover:bg-orange-500 text-white px-10 py-4 rounded-2xl text-lg font-black shadow-2xl shadow-orange-500/30 transition hover:-translate-y-0.5"
            >
              أنشئ حسابك مجاناً ←
            </Link>
            <Link
              href="/login"
              className="border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-2xl text-base font-bold transition hover:bg-white/5"
            >
              تسجيل الدخول
            </Link>
          </div>
          <p className="text-white/40 text-xs mt-6 font-bold">
            لا بطاقة بنكية مطلوبة · إلغاء في أي وقت
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-[#0F172A] text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-2xl font-black text-white">WinWin</span>
                <span className="text-2xl font-black text-[#FB923C]">COD</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                منصة الدروب شيبينغ الأولى في المغرب بنظام الدفع عند الاستلام. ابدأ البيع بدون رأس مال اليوم.
              </p>
              <div className="flex gap-3 mt-5">
                {["📘", "📸", "🐦"].map((icon, i) => (
                  <div key={i} className="w-9 h-9 bg-white/10 hover:bg-[#4361EE] rounded-xl flex items-center justify-center text-sm cursor-pointer transition" />
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-black text-white mb-4 text-sm">المنصة</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "الميزات", href: "#features" },
                  { label: "كيف يعمل", href: "#how-it-works" },
                  { label: "الأسعار", href: "#pricing" },
                  { label: "إنشاء حساب", href: "/register" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-slate-400 hover:text-white text-sm transition">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-black text-white mb-4 text-sm">تواصل معنا</h4>
              <ul className="space-y-2.5">
                {[
                  { icon: "✉️", text: "support@winwincod.ma" },
                  { icon: "📱", text: "واتساب 24/7" },
                  { icon: "📍", text: "المغرب 🇲🇦" },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-slate-400 text-sm">
                    <span>{icon}</span> {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} WinWinCOD. جميع الحقوق محفوظة.</p>
            <div className="flex gap-5">
              {["سياسة الخصوصية", "الشروط والأحكام"].map((t) => (
                <a key={t} href="#" className="text-slate-500 hover:text-slate-300 text-xs transition">{t}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
