export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-[#4361EE]/20 border-t-[#4361EE] animate-spin" />
      <p className="text-[#4361EE] font-bold text-lg">جاري التحميل...</p>
    </div>
  );
}
