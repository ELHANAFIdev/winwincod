"use client";

import Image from "next/image";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md w-full">
        <div className="bg-[#4361EE] rounded-2xl p-4">
          <Image src="/logo-white.svg" alt="WinWinCOD" width={120} height={40} priority />
        </div>

        <p className="text-red-500 text-9xl font-black leading-none select-none">
          500
        </p>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#1E293B]">
            حدث خطأ غير متوقع
          </h1>
          <p className="text-[#64748B] text-base font-medium">
            نعتذر عن هذا الخلل، فريقنا يعمل على إصلاحه
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button
            onClick={reset}
            className="bg-[#4361EE] hover:bg-[#3254D4] text-white font-bold text-base px-8 py-3 rounded-xl transition-colors duration-200"
          >
            إعادة المحاولة
          </button>
          <Link
            href="/"
            className="bg-[#FB923C] hover:bg-[#f97316] text-white font-bold text-base px-8 py-3 rounded-xl transition-colors duration-200"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
