"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Clock, Play, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { TikTokContent } from "@/types/tiktok";

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  published: 'bg-green-50 text-green-700 border-green-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  scheduled: <Clock className="h-2.5 w-2.5" />,
  published: <Play className="h-2.5 w-2.5" />,
  failed: <AlertCircle className="h-2.5 w-2.5" />,
};

export default function CalendrierPage() {
  const [content, setContent] = useState<TikTokContent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchContent = useCallback(async () => {
    const res = await fetch('/api/tiktok/analytics');
    if (res.ok) {
      const data = await res.json();
      setContent(data.recent_content || []);
    }
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Monday start

  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const getContentForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return content.filter((c) => {
      const date = c.scheduled_at || c.published_at || c.created_at;
      return date?.startsWith(dateStr);
    });
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendrier de publication</h1>
      </div>

      {/* Legend */}
      <div className="flex gap-3">
        {(['draft', 'scheduled', 'published', 'failed'] as const).map((s) => (
          <div key={s} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${STATUS_COLORS[s]}`}>
            {STATUS_ICONS[s]}
            {s === 'draft' ? 'Brouillon' : s === 'scheduled' ? 'Programmé' : s === 'published' ? 'Publié' : 'Échec'}
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-semibold text-gray-900">{months[month]} {year}</h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-50">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {days.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const dayContent = day ? getContentForDay(day) : [];
            return (
              <div
                key={idx}
                className={`min-h-24 p-2 border-b border-r border-gray-50 ${!day ? 'bg-gray-50/30' : ''} ${day && isToday(day) ? 'bg-blue-50/30' : ''}`}
              >
                {day && (
                  <>
                    <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday(day) ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayContent.slice(0, 3).map((c) => (
                        <Link key={c.id} href={`/tiktok/contenu/${c.id}`}>
                          <div className={`text-xs px-1.5 py-0.5 rounded border truncate flex items-center gap-1 ${STATUS_COLORS[c.status]} hover:opacity-80`}>
                            {STATUS_ICONS[c.status]}
                            <span className="truncate">{c.hook}</span>
                          </div>
                        </Link>
                      ))}
                      {dayContent.length > 3 && (
                        <p className="text-xs text-gray-400 pl-1">+{dayContent.length - 3}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's content */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Aujourd'hui</h3>
        </div>
        {getContentForDay(today.getDate()).length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">Aucun contenu prévu aujourd'hui</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {getContentForDay(today.getDate()).map((c) => (
              <Link key={c.id} href={`/tiktok/contenu/${c.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50">
                <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[c.status]}`}>
                  {STATUS_ICONS[c.status]}
                  {c.status === 'scheduled' ? 'Programmé' : c.status === 'published' ? 'Publié' : 'Brouillon'}
                </div>
                <p className="flex-1 text-sm text-gray-700 truncate">{c.hook}</p>
                {c.scheduled_at && (
                  <span className="text-xs text-gray-400">
                    {new Date(c.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
