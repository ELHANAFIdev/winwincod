import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md w-full">
        <div className="bg-[#4361EE] rounded-2xl p-4">
          <Image src="/logo-white.svg" alt="WinWinCOD" width={120} height={40} priority />
        </div>

        <p className="text-[#4361EE] text-9xl font-black leading-none select-none">
          404
        </p>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#1E293B]">
            عذراً، الصفحة غير موجودة
          </h1>
          <p className="text-[#64748B] text-base font-medium">
            الصفحة التي تبحث عنها غير موجودة أو تم نقلها
          </p>
        </div>

        <Link
          href="/"
          className="bg-[#FB923C] hover:bg-[#f97316] text-white font-bold text-base px-8 py-3 rounded-xl transition-colors duration-200"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
