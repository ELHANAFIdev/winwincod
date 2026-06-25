import CalendarView from "@/components/ui/CalendarView";

export default function SellerCalendarPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">التقويم</h1>
        <p className="text-sm text-slate-500 mt-1">جدول مواعيدك وتذكيراتك</p>
      </div>
      <CalendarView />
    </div>
  );
}
