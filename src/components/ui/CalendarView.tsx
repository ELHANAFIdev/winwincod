"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Clock } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode   = "month" | "week" | "day";
type EventType  = "طلب" | "اجتماع" | "تذكير" | "موعد تسليم";
type EventColor = "blue" | "green" | "orange" | "red" | "purple";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:MM
  type: EventType;
  color: EventColor;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ARABIC_MONTHS = [
  "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",
];
const DAY_SHORT  = ["ح","إ","ث","أ","خ","ج","س"];
const DAY_FULL   = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
const HOURS      = Array.from({ length: 13 }, (_, i) => i + 8); // 8..20

const EVENT_TYPES: EventType[] = ["طلب","اجتماع","تذكير","موعد تسليم"];
const TYPE_COLOR: Record<EventType, EventColor> = {
  "طلب": "blue", "اجتماع": "purple", "تذكير": "orange", "موعد تسليم": "green",
};
const PILL: Record<EventColor, string> = {
  blue:   "bg-blue-100 text-blue-700",
  green:  "bg-emerald-100 text-emerald-700",
  orange: "bg-orange-100 text-orange-700",
  red:    "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
};
const SWATCHES: { v: EventColor; bg: string; label: string }[] = [
  { v:"blue",   bg:"bg-blue-500",    label:"أزرق"    },
  { v:"green",  bg:"bg-emerald-500", label:"أخضر"    },
  { v:"orange", bg:"bg-orange-500",  label:"برتقالي" },
  { v:"red",    bg:"bg-red-500",     label:"أحمر"    },
  { v:"purple", bg:"bg-purple-500",  label:"بنفسجي"  },
];
const STORAGE_KEY = "winwincod_calendar_events";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function isToday(d: Date) {
  const n = new Date();
  return d.getFullYear()===n.getFullYear() && d.getMonth()===n.getMonth() && d.getDate()===n.getDate();
}
function weekStart(d: Date) {
  const s = new Date(d);
  s.setDate(d.getDate() - d.getDay());
  return s;
}
function formatH(h: number) {
  if (h === 12) return "12 ظ";
  return h < 12 ? `${h} ص` : `${h-12} م`;
}
function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month+1, 0);
  const cells: { date: Date; cur: boolean }[] = [];
  for (let i = first.getDay()-1; i >= 0; i--) cells.push({ date: new Date(year, month, -i), cur: false });
  for (let d = 1; d <= last.getDate(); d++) cells.push({ date: new Date(year, month, d), cur: true });
  let nd = 1;
  while (cells.length < 42) cells.push({ date: new Date(year, month+1, nd++), cur: false });
  return cells;
}

// ─── Add Event Modal ──────────────────────────────────────────────────────────

function Modal({ defaultDate, onSave, onClose }: {
  defaultDate: string;
  onSave: (e: Omit<CalendarEvent,"id">) => void;
  onClose: () => void;
}) {
  const [title, setTitle]   = useState("");
  const [date,  setDate]    = useState(defaultDate);
  const [time,  setTime]    = useState("09:00");
  const [type,  setType]    = useState<EventType>("تذكير");
  const [color, setColor]   = useState<EventColor>("orange");

  const changeType = (t: EventType) => { setType(t); setColor(TYPE_COLOR[t]); };

  const save = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), date, time, type, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">إضافة حدث جديد</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">العنوان *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder="اكتب عنوان الحدث..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              autoFocus
            />
          </div>

          {/* Date + Time */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">التاريخ</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">الوقت</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">النوع</label>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_TYPES.map((t) => (
                <button key={t} onClick={() => changeType(t)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition ${
                    type===t ? "bg-blue-600 text-white border-blue-600" : "text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">اللون</label>
            <div className="flex gap-2.5">
              {SWATCHES.map((s) => (
                <button key={s.v} onClick={() => setColor(s.v)} title={s.label}
                  className={`w-8 h-8 rounded-full ${s.bg} transition-all ${
                    color===s.v ? "scale-125 ring-2 ring-offset-2 ring-slate-400" : "hover:scale-110"
                  }`} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={save}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg text-sm font-bold transition">
            حفظ الحدث
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Month view ───────────────────────────────────────────────────────────────

function MonthView({ year, month, events, onDayClick, onDelete }: {
  year: number; month: number; events: CalendarEvent[];
  onDayClick: (ds: string) => void; onDelete: (id: string) => void;
}) {
  const cells = monthGrid(year, month);
  const map = new Map<string, CalendarEvent[]>();
  events.forEach((e) => { const k = e.date; if (!map.has(k)) map.set(k,[]); map.get(k)!.push(e); });

  return (
    <div className="flex flex-col flex-1">
      <div className="grid grid-cols-7 border-b border-slate-100">
        {DAY_SHORT.map((d) => (
          <div key={d} className="text-center text-xs font-bold text-slate-400 py-3">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1">
        {cells.map((cell, idx) => {
          const ds  = dateStr(cell.date);
          const evs = map.get(ds) ?? [];
          const tod = isToday(cell.date);
          return (
            <div key={idx} onClick={() => onDayClick(ds)}
              className={`min-h-[90px] md:min-h-[108px] p-1.5 border-b border-r border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${!cell.cur ? "bg-slate-50/70" : ""}`}>
              <div className={`w-7 h-7 flex items-center justify-center text-sm font-semibold rounded-full mb-1 ${
                tod ? "bg-blue-600 text-white" : cell.cur ? "text-slate-700" : "text-slate-300"
              }`}>
                {cell.date.getDate()}
              </div>
              <div className="space-y-0.5">
                {evs.slice(0,2).map((ev) => (
                  <div key={ev.id}
                    onClick={(e) => { e.stopPropagation(); if(confirm("حذف هذا الحدث؟")) onDelete(ev.id); }}
                    title={`${ev.title} — اضغط للحذف`}
                    className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium cursor-pointer hover:opacity-70 ${PILL[ev.color]}`}>
                    {ev.title}
                  </div>
                ))}
                {evs.length > 2 && <div className="text-[10px] text-slate-400 px-1">+{evs.length-2}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week view ────────────────────────────────────────────────────────────────

function WeekView({ current, events, onDelete }: {
  current: Date; events: CalendarEvent[]; onDelete: (id: string) => void;
}) {
  const ws   = weekStart(current);
  const days = Array.from({ length: 7 }, (_, i) => { const d=new Date(ws); d.setDate(ws.getDate()+i); return d; });

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <div className="grid grid-cols-8 border-b border-slate-100 sticky top-0 bg-white z-10">
        <div className="p-3 text-xs text-slate-400 text-center border-r border-slate-100" />
        {days.map((d,i) => (
          <div key={i} className={`p-3 text-center border-r border-slate-100 last:border-r-0 ${isToday(d)?"bg-blue-50":""}`}>
            <p className="text-xs text-slate-400">{DAY_SHORT[d.getDay()]}</p>
            <p className={`text-xl font-black mt-0.5 ${isToday(d)?"text-blue-600":"text-slate-700"}`}>{d.getDate()}</p>
          </div>
        ))}
      </div>
      {HOURS.map((h) => (
        <div key={h} className="grid grid-cols-8 border-b border-slate-100 min-h-[52px]">
          <div className="border-r border-slate-100 px-2 pt-1.5 text-[11px] text-slate-400 text-center flex-shrink-0">{formatH(h)}</div>
          {days.map((d,di) => {
            const hs  = String(h).padStart(2,"0");
            const evs = events.filter((e) => e.date===dateStr(d) && e.time?.startsWith(hs));
            return (
              <div key={di} className={`border-r border-slate-100 last:border-r-0 p-0.5 space-y-0.5 ${isToday(d)?"bg-blue-50/30":""}`}>
                {evs.map((ev) => (
                  <div key={ev.id}
                    onClick={() => { if(confirm("حذف هذا الحدث؟")) onDelete(ev.id); }}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium cursor-pointer hover:opacity-70 truncate ${PILL[ev.color]}`}
                    title={ev.title}>
                    {ev.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Day view ─────────────────────────────────────────────────────────────────

function DayView({ current, events, onDelete }: {
  current: Date; events: CalendarEvent[]; onDelete: (id: string) => void;
}) {
  const ds      = dateStr(current);
  const dayEvs  = events.filter((e) => e.date===ds);

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="text-xs text-slate-400">{DAY_FULL[current.getDay()]}</p>
        <p className={`text-2xl font-black mt-0.5 ${isToday(current)?"text-blue-600":"text-slate-800"}`}>
          {current.getDate()} {ARABIC_MONTHS[current.getMonth()]} {current.getFullYear()}
        </p>
      </div>
      {HOURS.map((h) => {
        const hs  = String(h).padStart(2,"0");
        const evs = dayEvs.filter((e) => e.time?.startsWith(hs));
        return (
          <div key={h} className="flex gap-4 border-b border-slate-100 px-5 py-2 min-h-[52px]">
            <div className="w-12 text-[11px] text-slate-400 pt-1 flex-shrink-0 text-left">{formatH(h)}</div>
            <div className="flex-1 flex flex-wrap gap-1 items-start pt-0.5">
              {evs.map((ev) => (
                <div key={ev.id}
                  onClick={() => { if(confirm("حذف هذا الحدث؟")) onDelete(ev.id); }}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer hover:opacity-70 ${PILL[ev.color]}`}
                  title="اضغط للحذف">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {ev.time} — {ev.title}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main CalendarView ────────────────────────────────────────────────────────

export default function CalendarView() {
  const now = new Date();
  const [view,    setView]    = useState<ViewMode>("month");
  const [current, setCurrent] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [events,  setEvents]  = useState<CalendarEvent[]>([]);
  const [modal,   setModal]   = useState(false);
  const [defDate, setDefDate] = useState(dateStr(now));

  // Persist
  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) setEvents(JSON.parse(s)); } catch {}
  }, []);
  const persist = useCallback((evs: CalendarEvent[]) => {
    setEvents(evs);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(evs)); } catch {}
  }, []);

  const addEvent  = useCallback((ev: Omit<CalendarEvent,"id">) => persist([...events, { ...ev, id: crypto.randomUUID() }]), [events, persist]);
  const delEvent  = useCallback((id: string) => persist(events.filter((e) => e.id !== id)), [events, persist]);

  // Navigation (RTL: ChevronRight = prev, ChevronLeft = next)
  const prev = () => {
    const d = new Date(current);
    if (view==="month") { d.setMonth(d.getMonth()-1); d.setDate(1); }
    else if (view==="week") d.setDate(d.getDate()-7);
    else d.setDate(d.getDate()-1);
    setCurrent(d);
  };
  const next = () => {
    const d = new Date(current);
    if (view==="month") { d.setMonth(d.getMonth()+1); d.setDate(1); }
    else if (view==="week") d.setDate(d.getDate()+7);
    else d.setDate(d.getDate()+1);
    setCurrent(d);
  };
  const goToday = () => {
    const d = new Date(now);
    if (view==="month") d.setDate(1);
    setCurrent(d);
  };

  // Period label
  let label = "";
  if (view==="month") {
    label = `${ARABIC_MONTHS[current.getMonth()]} ${current.getFullYear()}`;
  } else if (view==="week") {
    const ws = weekStart(current);
    const we = new Date(ws); we.setDate(ws.getDate()+6);
    label = `${ws.getDate()} - ${we.getDate()} ${ARABIC_MONTHS[we.getMonth()]} ${we.getFullYear()}`;
  } else {
    label = `${current.getDate()} ${ARABIC_MONTHS[current.getMonth()]} ${current.getFullYear()}`;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col" style={{ minHeight: 580 }}>
      {/* ── Calendar Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button onClick={goToday}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            اليوم
          </button>
          <div className="flex items-center">
            <button onClick={prev} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={next} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-sm font-bold text-slate-800 min-w-[150px]">{label}</h2>
        </div>

        {/* View switcher + Add */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1">
            {(["month","week","day"] as ViewMode[]).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  view===v ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}>
                {v==="month" ? "شهر" : v==="week" ? "أسبوع" : "يوم"}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setDefDate(dateStr(now)); setModal(true); }}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة حدث</span>
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      {view==="month" && (
        <MonthView year={current.getFullYear()} month={current.getMonth()} events={events}
          onDayClick={(ds) => { setDefDate(ds); setModal(true); }} onDelete={delEvent} />
      )}
      {view==="week" && (
        <WeekView current={current} events={events} onDelete={delEvent} />
      )}
      {view==="day" && (
        <DayView current={current} events={events} onDelete={delEvent} />
      )}

      {/* ── Add Event Modal ── */}
      {modal && <Modal defaultDate={defDate} onSave={addEvent} onClose={() => setModal(false)} />}
    </div>
  );
}
