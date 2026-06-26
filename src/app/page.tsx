import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LandingNavbar from "./LandingNavbar";
import HeroSection from "./HeroSection";
import {
  UserPlus, ShoppingBag, Package, DollarSign,
  Wallet, Truck, BarChart3, Bell, FileSpreadsheet, Phone,
  Zap, MapPin, Mail, MessageCircle,
  CheckCircle, ArrowLeft,
} from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;
  const dashboardUrl =
    session?.user?.role === "ADMIN"
      ? "/admin/dashboard"
      : session?.user?.role === "CALL_CENTER"
      ? "/call-center/dashboard"
      : "/seller/dashboard";

  const cities = [
    "الدار البيضاء", "الرباط", "مراكش", "فاس", "أكادير",
    "طنجة", "وجدة", "مكناس", "الجديدة", "تطوان",
    "القنيطرة", "سلا", "بني ملال", "خريبكة", "سطات",
  ];

  return (
    <div className="min-h-screen bg-white font-['Cairo',sans-serif]" dir="rtl">
      <LandingNavbar isLoggedIn={isLoggedIn} dashboardUrl={dashboardUrl} />

      {/* ══════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════ */}
      <HeroSection isLoggedIn={isLoggedIn} dashboardUrl={dashboardUrl} />

      {/* ══════════════════════════════════════════
          2. TRUST BAR — cities
      ══════════════════════════════════════════ */}
      <section className="py-14 bg-white border-b border-[#F1F5F9]">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-sm font-bold text-slate-400 mb-7 flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4 text-[#4361EE]" />
            يثق بنا بائعون من جميع أنحاء المغرب
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {cities.map(city => (
              <span
                key={city}
                className="bg-[#F8FAFC] border border-[#E2E8F0] text-slate-500 font-bold text-sm px-4 py-2 rounded-full hover:border-[#4361EE]/40 hover:text-[#4361EE] hover:bg-[#EEF2FF] transition-all duration-200 cursor-default select-none"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#EEF2FF] text-[#4361EE] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              خطوات بسيطة
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-[#1E293B] mt-1">
              كيف يعمل WinWinCOD؟
            </h2>
            <p className="text-slate-400 mt-3 max-w-md mx-auto text-lg">
              أربع خطوات فقط تفصلك عن أول ربح
            </p>
          </div>

          <div className="relative grid md:grid-cols-4 gap-6 lg:gap-8">
            {/* Connector line desktop */}
            <div className="hidden md:block absolute top-[38px] right-[calc(12.5%+32px)] left-[calc(12.5%+32px)] h-px bg-gradient-to-l from-[#4361EE]/30 to-[#FB923C]/30" />

            {[
              {
                num: "01",
                icon: <UserPlus className="w-7 h-7" />,
                title: "سجل مجاناً",
                desc: "إنشاء حساب في دقيقتين — لا بطاقة بنكية مطلوبة",
                color: "text-[#4361EE]", bg: "bg-[#EEF2FF]",
              },
              {
                num: "02",
                icon: <ShoppingBag className="w-7 h-7" />,
                title: "اختر منتجاتك",
                desc: "تصفح كتالوجنا المتنوع واختر ما تريد بيعه",
                color: "text-[#FB923C]", bg: "bg-[#FFF7ED]",
              },
              {
                num: "03",
                icon: <Package className="w-7 h-7" />,
                title: "أضف طلباتك",
                desc: "فريقنا يتصل بعملائك ويؤكد الطلبات",
                color: "text-purple-600", bg: "bg-purple-50",
              },
              {
                num: "04",
                icon: <DollarSign className="w-7 h-7" />,
                title: "استلم أرباحك",
                desc: "بعد كل تسليم ناجح — ربحك يضاف فوراً",
                color: "text-green-600", bg: "bg-green-50",
              },
            ].map(({ num, icon, title, desc, color, bg }, i) => (
              <div key={num} className="relative text-center group">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className={`w-20 h-20 ${bg} rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 shadow-sm`}>
                    {icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#0F172A] rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-md">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-base font-black text-[#1E293B] mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[160px] mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. FEATURES
      ══════════════════════════════════════════ */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#EEF2FF] text-[#4361EE] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              الميزات
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-[#1E293B] mt-1">
              كل ما تحتاجه لبدء البيع
            </h2>
            <p className="text-slate-400 mt-3 max-w-md mx-auto text-lg">
              أدوات احترافية صُممت للبائع المغربي
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Wallet className="w-6 h-6" />,
                bg: "#EEF2FF", ic: "#4361EE",
                title: "محفظة ذكية",
                desc: "تتبع أرباحك، إدارة مالية كاملة، وسحب أرباحك متى أردت.",
              },
              {
                icon: <Truck className="w-6 h-6" />,
                bg: "#ECFDF5", ic: "#059669",
                title: "شحن لجميع المدن",
                desc: "توصيل سريع لـ 40+ مدينة مغربية بـ 20 درهم فقط.",
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                bg: "#FFF7ED", ic: "#EA580C",
                title: "لوحة تحكم احترافية",
                desc: "إحصائيات وتقارير في الوقت الفعلي لاتخاذ قرارات أفضل.",
              },
              {
                icon: <Bell className="w-6 h-6" />,
                bg: "#FDF4FF", ic: "#9333EA",
                title: "إشعارات فورية",
                desc: "تنبيهات لكل تحديث على طلباتك فور حدوثه.",
              },
              {
                icon: <FileSpreadsheet className="w-6 h-6" />,
                bg: "#F0FDF4", ic: "#16A34A",
                title: "استيراد Excel",
                desc: "رفع مئات الطلبات دفعة واحدة بملف Excel واحد.",
              },
              {
                icon: <Phone className="w-6 h-6" />,
                bg: "#FFF1F2", ic: "#E11D48",
                title: "دعم مخصص",
                desc: "فريق call center يتابع طلباتك ويتواصل مع العملاء.",
              },
            ].map(({ icon, bg, ic, title, desc }) => (
              <div
                key={title}
                className="group bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] hover:border-[#4361EE]/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/60 hover:-translate-y-1"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm"
                  style={{ background: bg, color: ic }}
                >
                  {icon}
                </div>
                <h3 className="text-base font-black text-[#1E293B] mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. STATS — dark section
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-[#0F172A] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#4361EE]/10 rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#FB923C]/8 rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-black text-white">
              أرقام تتحدث عن نفسها
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "+500",  suffix: "",  label: "بائع نشط",           color: "text-[#4361EE]", bg: "bg-[#4361EE]/10 border-[#4361EE]/20" },
              { num: "+10K",  suffix: "",  label: "طلب مسلم",           color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
              { num: "85%",   suffix: "",  label: "معدل التسليم",        color: "text-[#FB923C]", bg: "bg-[#FB923C]/10 border-[#FB923C]/20" },
              { num: "20",    suffix: " د.م", label: "رسوم الشحن فقط", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
            ].map(({ num, suffix, label, color, bg }) => (
              <div key={label} className={`${bg} border rounded-2xl p-6 text-center`}>
                <p className={`text-4xl lg:text-5xl font-black ${color} mb-2`}>
                  {num}<span className="text-2xl">{suffix}</span>
                </p>
                <p className="text-slate-400 font-bold text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. PRICING
      ══════════════════════════════════════════ */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block bg-[#EEF2FF] text-[#4361EE] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              الأسعار
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-[#1E293B] mt-1">
              أسعار شفافة — بدون مفاجآت
            </h2>
            <p className="text-slate-400 mt-3 text-lg">
              لا رسوم شهرية، لا اشتراكات. فقط شحن بسيط لكل طلب.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-gradient-to-br from-[#EEF2FF] to-white border border-[#4361EE]/20 rounded-3xl p-10 shadow-xl shadow-blue-100/60 text-center">
              <ul className="space-y-5 mb-10">
                {[
                  "لا رسوم شهرية",
                  "لا اشتراكات",
                  "فقط 20 درهم رسوم شحن لكل طلب مسلم",
                ].map(item => (
                  <li key={item} className="flex items-center justify-center gap-3 text-base font-bold text-[#1E293B]">
                    <CheckCircle className="w-5 h-5 text-[#4361EE] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="inline-flex items-center gap-3 bg-[#4361EE] hover:bg-[#3254D4] text-white px-10 py-4 rounded-2xl text-lg font-black shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
              >
                ابدأ مجاناً الآن
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block bg-[#EEF2FF] text-[#4361EE] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              قالوا عنا
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-[#1E293B] mt-1">
              ماذا يقول بائعونا؟
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                text: "بدأت ببيع منتجات الجمال وربحت 3000 درهم في أول أسبوع! المنصة سهلة جداً وفريق الدعم رهيب.",
                name: "سعاد م.",
                city: "الدار البيضاء",
                avatar: "س",
                color: "bg-[#FB923C]",
                stars: 5,
                tag: "+120 طلب",
              },
              {
                text: "المنصة سهلة جداً، فريق الدعم دائماً متواجد. بدأت من الصفر والآن عندي دخل شهري ثابت.",
                name: "أيمن ب.",
                city: "مراكش",
                avatar: "أ",
                color: "bg-[#4361EE]",
                stars: 5,
                tag: "+200 طلب",
              },
              {
                text: "أفضل منصة COD في المغرب، نسبة التسليم عالية جداً والأرباح تسحب في نفس اليوم.",
                name: "فاطمة ز.",
                city: "فاس",
                avatar: "ف",
                color: "bg-purple-500",
                stars: 5,
                tag: "+350 طلب",
              },
            ].map(({ text, name, city, avatar, color, stars, tag }) => (
              <div
                key={name}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col gap-4 hover:shadow-lg hover:border-[#4361EE]/20 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: stars }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-[#FB923C]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-slate-600 text-sm leading-relaxed flex-1">"{text}"</p>

                <div className="flex items-center gap-3 pt-4 border-t border-[#F1F5F9]">
                  <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                    {avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[#1E293B] text-sm">{name}</p>
                    <p className="text-slate-400 text-xs">{city}</p>
                  </div>
                  <span className="bg-[#EEF2FF] text-[#4361EE] text-[10px] font-black px-2.5 py-1 rounded-full flex-shrink-0">
                    {tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          8. CTA
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-br from-[#4361EE] via-[#3a58e8] to-[#3254D4] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#FB923C]/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full" />
        </div>

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white/80 text-sm font-bold mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            المنصة تعمل الآن
          </div>

          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
            جاهز تبدأ؟
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-lg mx-auto font-bold">
            انضم لأكثر من 500 بائع مغربي يربحون كل يوم مع WinWinCOD
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-3 bg-white hover:bg-slate-50 text-[#4361EE] px-10 py-4 rounded-2xl text-lg font-black shadow-2xl shadow-black/20 transition hover:-translate-y-0.5"
            >
              ابدأ مجاناً الآن
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-2xl text-base font-bold transition hover:bg-white/5"
            >
              تسجيل الدخول
            </Link>
          </div>

          <p className="text-white/40 text-xs mt-6 font-bold">
            لا بطاقة بنكية · لا رسوم شهرية · إلغاء في أي وقت
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          9. FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-[#0F172A] text-white">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 bg-gradient-to-br from-[#4361EE] to-[#FB923C] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4.5 h-4.5 text-white" fill="white" />
                </div>
                <div className="leading-none">
                  <span className="text-2xl font-black text-white">WinWin</span>
                  <span className="text-2xl font-black text-[#FB923C]">COD</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
                منصة COD الأولى في المغرب — ابدأ البيع بدون رأس مال اليوم.
              </p>
              <div className="flex gap-3">
                {/* Instagram */}
                <a href="#" aria-label="Instagram"
                  className="w-9 h-9 bg-white/[0.08] hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 rounded-xl flex items-center justify-center transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a href="#" aria-label="Facebook"
                  className="w-9 h-9 bg-white/[0.08] hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                {/* WhatsApp */}
                <a href="#" aria-label="WhatsApp"
                  className="w-9 h-9 bg-white/[0.08] hover:bg-green-600 rounded-xl flex items-center justify-center transition-all duration-300">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-black text-white mb-5 text-sm">المنصة</h4>
              <ul className="space-y-3">
                {[
                  { label: "الميزات",        href: "#features"     },
                  { label: "كيف يعمل",      href: "#how-it-works" },
                  { label: "الأسعار",        href: "#pricing"      },
                  { label: "تسجيل الدخول",  href: "/login"        },
                  { label: "إنشاء حساب",    href: "/register"     },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-slate-400 hover:text-white text-sm transition-colors font-medium">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-black text-white mb-5 text-sm">تواصل معنا</h4>
              <ul className="space-y-3">
                {[
                  { icon: <Mail className="w-4 h-4" />,           text: "support@winwincod.ma" },
                  { icon: <MessageCircle className="w-4 h-4" />,  text: "واتساب — دعم 24/7"    },
                  { icon: <MapPin className="w-4 h-4" />,         text: "المغرب"                },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5 text-slate-400 text-sm font-medium">
                    <span className="text-slate-500 flex-shrink-0">{icon}</span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} WinWinCOD. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-5">
              {["سياسة الخصوصية", "الشروط والأحكام"].map(t => (
                <a key={t} href="#" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">{t}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
