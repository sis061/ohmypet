"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import CalendarDrawer from "./CalendarDrawer";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";

import { supabase } from "@/lib/supabase";
import { ko } from "date-fns/locale";
import { format } from "date-fns";
import { toYmdKst } from "@/lib/utils";

import { FeedLog } from "@/types/global";

type CompletedByDate = Record<string, FeedLog[]>;

export default function CalendarClient() {
  /* ---------- STATE ---------- */
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [completedByDate, setCompletedByDate] = useState<CompletedByDate>({});
  const [loading, setLoading] = useState(true);
  const [openCard, setOpenCard] = useState(false);

  /* ---------- CONST ---------- */

  const selectedLogs = useMemo(() => {
    if (!selectedDate) return [];
    return completedByDate[toYmdKst(selectedDate)] ?? [];
  }, [selectedDate, completedByDate]);

  const formatters = useMemo(
    () => ({
      formatCaption: (m: Date) => format(m, "yyyy년 M월", { locale: ko }),
      formatWeekdayName: (d: Date) => format(d, "EEEEE", { locale: ko }),
      formatDay: (d: Date) => format(d, "d", { locale: ko }),
    }),
    [],
  );

  const labels = useMemo(
    () => ({
      labelDayButton: (date: Date) =>
        format(date, "yyyy년 M월 d일 (EEE)", { locale: ko }),
      labelNext: () => "다음 달",
      labelPrevious: () => "이전 달",
    }),
    [],
  );

  const disabledMatcher = { after: getKstToday() };

  /* ---------- FUNC ---------- */

  function getKstToday() {
    const now = new Date();
    const kst = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
    );

    return new Date(kst.getFullYear(), kst.getMonth(), kst.getDate());
  }

  function getMonthRange(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    return {
      start: toYmdKst(start),
      end: toYmdKst(end),
    };
  }

  function makeCompletedByDate(data: FeedLog[]) {
    const map: CompletedByDate = {};
    data.forEach((d) => {
      if (!map[d.date]) {
        map[d.date] = [];
      }

      map[d.date].push(d);
    });
    return map;
  }

  function renderLogPie(logs: FeedLog[]) {
    const slotOrder = [
      "morning",
      "afternoon",
      "evening",
      "night",
      "special",
    ] as const;

    const hasSpecial = logs.some((log) => log.slot === "special");
    const max = hasSpecial ? 5 : 4;
    const slots = slotOrder.slice(0, max);
    const filled = new Set(logs.map((l) => l.slot));
    const step = 100 / max;
    let start = 0;

    const segments = slots
      .map((slot) => {
        const end = start + step;
        const color = filled.has(slot) ? "#22c55e" : "#99999950";
        const segment = `${color} ${start}% ${end}%`;
        start = end;
        return segment;
      })
      .join(", ");

    return (
      <div className="relative h-10 w-10 rounded-full overflow-hidden">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${segments})`,
          }}
        />

        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className="absolute left-[52.5%] top-0 h-1/2 w-[2px] origin-bottom -translate-x-1/2 bg-[#e5e7eb]"
            style={{
              transform: `translateX(-50%) rotate(${(360 / max) * i}deg)`,
            }}
          />
        ))}
      </div>
    );
  }

  /* ---------- ASYNC FUNC ---------- */

  async function loadMonth(targetMonth: Date) {
    setLoading(true);

    const { start, end } = getMonthRange(targetMonth);

    const { data, error } = await supabase
      .from("feed_logs")
      .select("date, slot, done_at")
      .gte("date", start)
      .lt("date", end)
      .order("date", { ascending: true })
      .order("done_at", { ascending: true });

    if (error) {
      console.warn("월 로딩 중 에러 발생:", error);
      setCompletedByDate({});
      setLoading(false);
      return;
    }

    const map = makeCompletedByDate((data ?? []) as FeedLog[]);
    setCompletedByDate(map);
    setLoading(false);
  }

  /* ---------- SUPABASE REALTIME ---------- */

  useEffect(() => {
    const channel = supabase
      .channel("feed_logs_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feed_logs",
        },
        () => {
          loadMonth(month);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [month]);

  /* ---------- RE-RENDER : 월 변경 시 ---------- */

  useEffect(() => {
    loadMonth(month);
  }, [month]);

  /* ---------- 요일 버튼 ---------- */

  function DayButton({ children, modifiers, day, ...props }: any) {
    const logs = completedByDate[toYmdKst(day.date)] ?? [];

    return (
      <CalendarDayButton
        day={day}
        modifiers={modifiers}
        {...props}
        className="flex flex-col items-center justify-start gap-1 transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-90 !bg-transparent"
      >
        {children}
        <div className="mt-1 flex flex-col items-center justify-center gap-0.5">
          {renderLogPie(logs)}
        </div>
      </CalendarDayButton>
    );
  }

  return (
    <div className={"grid gap-4 grid-rows-[auto_auto_1fr] h-full"}>
      <div className="rounded-lg bg-card text-base text-foreground w-full h-full shadow-md relative">
        {!!loading && (
          <div className="absolute top-0 left-0 w-full h-full backdrop-blur-xs z-50 rounded-lg flex items-center justify-center">
            <Image
              src={"/ohmypet_icon.png"}
              alt="favcon_png"
              width={72}
              height={72}
              className="animate-spin"
              loading="eager"
            />
          </div>
        )}
        <Calendar
          month={month}
          onMonthChange={(m) =>
            setMonth(new Date(m.getFullYear(), m.getMonth(), 1))
          }
          mode="single"
          selected={selectedDate}
          onDayClick={(day) => {
            setSelectedDate(day);
            setOpenCard(true);
          }}
          captionLayout="label"
          showOutsideDays
          weekStartsOn={0}
          locale={ko}
          formatters={formatters}
          labels={labels}
          disabled={disabledMatcher}
          className={[
            "w-full !p-2",
            "[&_.rdp-table]:table-fixed [&_.rdp-table]:w-full",
            "[&_.rdp-head_cell]:p-0",
            "[&_.rdp-cell]:p-0 [&_.rdp-cell]:align-top",
            "[&_.rdp-day]:aspect-auto [&_.rdp-day]:w-full",
            "[&_.rdp-day]:h-[calc(var(--cell-size)*1.85)] md:[&_.rdp-day]:h-[calc(var(--cell-size)*2)]",
            "[&_.rdp-day]:box-border",
            "[--cell-size:--spacing(10)] md:[--cell-size:--spacing(13)]",
          ].join(" ")}
          classNames={{
            day: "w-full outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 transition-none !p-1",
            button_previous:
              "transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-95 hover:scale-110",
            button_next:
              "transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-95 hover:scale-110",
          }}
          modifiersClassNames={{
            today: "ring-2 ring-green-400 text-foreground rounded-md",
            selected: "ring-2 ring-green-600 rounded-md",
          }}
          components={{
            DayButton: (props) => <DayButton {...props} />,
          }}
        />
      </div>
      <CalendarDrawer
        open={openCard}
        onOpenChange={(open) => {
          setOpenCard(open);
          if (!open) {
            setSelectedDate(undefined);
          }
        }}
        selectedLogs={selectedLogs}
        selectedDate={selectedDate ?? new Date()}
        onLogChanged={() => loadMonth(month)}
      />
    </div>
  );
}
