"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Rocket, CheckCircle, Package, Truck, Banknote, BarChart3, Bell } from "lucide-react";

/* ── tiny count-up hook ──────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800, started = false, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => {
      let startTs: number | null = null;
      const tick = (ts: number) => {
        if (!startTs) startTs = ts;
        const p = Math.min((ts - startTs) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        setVal(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [started, target, duration, delay]);
  return val;
}

/* ── stat card with counter ─────────────────────────────────────────── */
function StatCard({
  target, prefix = "", suffix = "", label, icon, started, delay, cls,
}: {
  target: number; prefix?: string; suffix?: string; label: string;
  icon: ReactNode; started: boolean; delay: number; cls: string;
}) {
  const val = useCountUp(target, 1800, started, delay);
  return (
    <div className={`${cls} bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3.5 text-center`}>
      <span className="inline-flex justify-center text-white/70">{icon}</span>
      <p className="text-xl font-black text-white mt-1 tabular-nums">
        {prefix}{val.toLocaleString()}{suffix}
      </p>
      <p className="text-white/55 text-[11px] font-bold mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

/* ── main component ─────────────────────────────────────────────────── */
export default function HeroSection({
  isLoggedIn,
  dashboardUrl,
}: {
  isLoggedIn: boolean;
  dashboardUrl: string;
}) {
  /* profit count-up starts 0.7s after mount */
  const profit = useCountUp(3240, 2600, true, 700);

  /* stats counters start when the stats row scrolls into view */
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsStarted, setStatsStarted] = useState(false);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStatsStarted(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      className="relative bg-gradient-to-br from-[#4361EE] via-[#3a58e8] to-[#3254D4] min-h-screen flex flex-col justify-center overflow-hidden pt-16"
    >
      {/* ── Background: grid ── */}
      <div className="absolute inset-0 hero-grid pointer-events-none" />

      {/* ── Background: blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="anim-blob1 absolute -top-52 -left-52 w-[560px] h-[560px] bg-white/5 rounded-full" />
        <div className="anim-blob2 absolute top-1/3 -right-36 w-[440px] h-[440px] rounded-full" style={{ background: "rgba(251,146,60,.07)" }} />
        <div className="anim-blob3 absolute -bottom-40 left-[30%] w-[380px] h-[380px] bg-white/4 rounded-full" />

        {/* particles */}
        <div className="anim-p1 absolute top-[22%] left-[18%]  w-2   h-2   bg-white/40 rounded-full" />
        <div className="anim-p2 absolute top-[38%] right-[28%] w-1.5 h-1.5 rounded-full" style={{ background: "rgba(251,146,60,.55)" }} />
        <div className="anim-p3 absolute bottom-[32%] left-[58%] w-1  h-1   bg-white/30 rounded-full" />
        <div className="anim-p4 absolute top-[62%] left-[12%]  w-2   h-2   bg-white/20 rounded-full" />
        <div className="anim-p5 absolute top-[15%] right-[22%] w-1.5 h-1.5 rounded-full" style={{ background: "rgba(251,146,60,.40)" }} />
        <div className="anim-p6 absolute bottom-[22%] right-[14%] w-1 h-1  bg-white/50 rounded-full" />
      </div>

      {/* ── Main content grid ── */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 py-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* ════ LEFT: copy ════ */}
        <div>
          {/* Badge */}
          <div className="anim-fsu inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white/90 text-sm font-bold mb-8 w-fit">
            <span className="anim-blink w-2.5 h-2.5 bg-green-400 rounded-full flex-shrink-0" />
            <Rocket className="w-4 h-4" /> انضم لـ +500 بائع مغربي ناجح
          </div>

          {/* Headline */}
          <div className="mb-5 space-y-1">
            <h1 className="anim-fsu-1 text-4xl lg:text-5xl xl:text-[3.4rem] font-black text-white leading-tight">
              ابدأ التجارة الإلكترونية
            </h1>
            <h1 className="anim-fsu-2 anim-glow text-5xl lg:text-6xl xl:text-7xl font-black text-[#FB923C] leading-tight">
              بـ 0 درهم
            </h1>
          </div>

          {/* Subtitle */}
          <p className="anim-fsu-3 text-white/80 text-xl lg:text-2xl font-bold mb-10">
            لا مخزون، لا رأس مال، فقط أرباح
          </p>

          {/* Buttons */}
          <div className="anim-fsu-4 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 bg-[#FB923C] hover:bg-orange-500 text-white px-8 py-4 rounded-2xl text-lg font-black shadow-2xl shadow-orange-500/30 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:-translate-y-0.5"
            >
              ابدأ مجاناً الآن
              <span className="anim-arrow inline-block">←</span>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-3 border-2 border-white/30 hover:border-white/70 text-white px-6 py-4 rounded-2xl text-base font-bold transition-all duration-300 hover:bg-white/10"
            >
              <span className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center text-sm flex-shrink-0">▶</span>
              شاهد كيف تعمل
            </a>
          </div>

          {/* Stats — 4 cards with staggered counter */}
          <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 pt-8 border-t border-white/20">
            <StatCard target={500}   prefix="+"  suffix="" label="بائع نشط"       icon={<CheckCircle className="w-5 h-5" />} started={statsStarted} delay={0}   cls="anim-s1" />
            <StatCard target={10000} prefix="" suffix="+" label="طلبية شهرياً"    icon={<Package className="w-5 h-5" />}     started={statsStarted} delay={150} cls="anim-s2" />
            <StatCard target={85}    prefix=""  suffix="%" label="معدل تسليم"      icon={<Truck className="w-5 h-5" />}        started={statsStarted} delay={300} cls="anim-s3" />
            <StatCard target={48}    prefix=""  suffix="h" label="تحويل الأرباح"  icon={<Banknote className="w-5 h-5" />}     started={statsStarted} delay={450} cls="anim-s4" />
          </div>
        </div>

        {/* ════ RIGHT: dashboard visual ════ */}
        <div className="hidden lg:block relative h-[540px]">

          {/* ① Notification: تم التسليم — bounce-in from top */}
          <div className="anim-bounce-in absolute top-2 right-2 z-30">
            <div className="backdrop-blur-md bg-white/80 rounded-2xl shadow-2xl shadow-blue-900/40 px-4 py-3 flex items-center gap-3 border border-white/20 w-60">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0"><CheckCircle className="w-5 h-5 text-green-500" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-wide">تم التسليم!</p>
                <p className="text-xs font-bold text-[#1E293B] truncate">سعاد الحسني · مراكش</p>
              </div>
              <p className="text-base font-black text-green-600 flex-shrink-0">+120<span className="text-[9px] text-slate-400 font-bold">د.م</span></p>
            </div>
          </div>

          {/* ② Main dashboard card — continuous float */}
          <div className="animate-float absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-md bg-white/80 rounded-3xl shadow-2xl shadow-blue-900/30 p-5 w-72 z-20 border border-white/20">
            {/* card header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#EEF2FF] rounded-xl flex items-center justify-center"><BarChart3 className="w-4 h-4 text-[#4361EE]" /></div>
                <div>
                  <p className="text-[10px] font-black text-[#4361EE] uppercase tracking-wider">لوحتي</p>
                  <p className="text-[10px] text-slate-400">هذا الشهر</p>
                </div>
              </div>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>

            {/* profit count-up */}
            <div className="bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] rounded-2xl p-4 mb-4">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-wider mb-1">الربح الصافي الشهري</p>
              <p className="text-3xl font-black text-green-600 tabular-nums">
                {profit.toLocaleString("fr-MA")}
                <span className="text-sm font-bold text-green-500 mr-1">د.م</span>
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-green-500 text-xs font-bold">↑ 23%</span>
                <span className="text-[10px] text-green-600">مقارنة بالشهر الماضي</span>
              </div>
            </div>

            {/* mini stats row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { l: "طلبات", v: "47", c: "text-[#4361EE]", bg: "#EEF2FF" },
                { l: "مسلمة", v: "39", c: "text-green-600", bg: "#F0FDF4" },
                { l: "مرجعة", v: "5",  c: "text-red-500",   bg: "#FEF2F2" },
              ].map(({ l, v, c, bg }) => (
                <div key={l} className="rounded-xl p-2 text-center" style={{ background: bg }}>
                  <p className={`text-base font-black ${c}`}>{v}</p>
                  <p className="text-[9px] font-bold text-slate-400">{l}</p>
                </div>
              ))}
            </div>

            {/* delivery rate bar */}
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                <span>معدل التسليم</span>
                <span className="text-green-600 font-black">83%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-l from-green-400 to-green-500 rounded-full" style={{ width: "83%" }} />
              </div>
            </div>
          </div>

          {/* ③ New order card — slides in from right */}
          <div className="anim-slide-right absolute bottom-10 right-0 z-30">
            <div className="backdrop-blur-md bg-white/80 rounded-2xl shadow-xl shadow-blue-900/25 p-4 w-56 border border-white/20">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0"><Bell className="w-4 h-4 text-[#FB923C]" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-[#FB923C] uppercase tracking-wide">طلب جديد</p>
                  <p className="text-[10px] text-slate-400">منذ دقيقتين</p>
                </div>
                <span className="anim-blink w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#FB923C" }} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#1E293B]">أيت بها · أكادير</p>
                <p className="text-base font-black text-[#4361EE]">+350 <span className="text-[9px] font-bold text-slate-400">د.م</span></p>
              </div>
            </div>
          </div>

          {/* ④ Daily bar chart mini-card — float2 */}
          <div className="animate-float2 absolute top-12 left-0 z-10">
            <div className="backdrop-blur-md bg-gradient-to-br from-[#4361EE]/90 to-[#3254D4]/90 rounded-2xl shadow-xl p-4 w-44 text-white border border-white/20">
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-wider mb-1">طلبات اليوم</p>
              <p className="text-2xl font-black mb-3">12 <span className="text-sm font-bold text-blue-200">طلب</span></p>
              <div className="flex items-end gap-1 h-10">
                {[55, 70, 45, 82, 60, 90, 75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: i === 5 ? "#FB923C" : "rgba(255,255,255,0.25)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="relative z-10 flex flex-col items-center gap-2 pb-8 text-white/45">
        <p className="text-[10px] font-black tracking-widest uppercase">اكتشف المزيد</p>
        <div className="anim-scroll w-8 h-8 border-2 border-white/30 rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* ── Wave divider ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0 56V28C240 0 480 56 720 36C960 16 1200 48 1440 18V56H0Z" fill="#F8FAFC" />
        </svg>
      </div>
    </section>
  );
}
