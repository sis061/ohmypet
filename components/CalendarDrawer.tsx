import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import UndoButton from "./UndoButton";
import CardRadioGroup from "./CardRadioGroup";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { supabase } from "@/lib/supabase";
import { kstNowParts, slots, toYmdKst } from "@/lib/utils";

import { CompletedMap, FeedLog } from "@/types/global";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLogs: FeedLog[];
  selectedDate: Date;
  onLogChanged: () => void;
}

/* ---------- FUNC ---------- */

function combineKstDateAndTime(date: Date, hhmm: string) {
  const ymd = toYmdKst(date);
  return `${ymd}T${hhmm}:00+09:00`;
}

export default function CalendarDrawer({
  open,
  onOpenChange,
  selectedLogs,
  selectedDate,
  onLogChanged,
}: DrawerProps) {
  /* ---------- STATE ---------- */
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState<CompletedMap>({});
  const [pendingSlot, setPendingSlot] = useState<FeedLog["slot"] | null>(null);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [undoInfo, setUndoInfo] = useState<{
    slot: FeedLog["slot"];
    date: string;
    done_at: string;
  } | null>(null);

  /* ---------- CONST ---------- */

  const selectedYmd = useMemo(() => toYmdKst(selectedDate), [selectedDate]);
  const getTodayYmd = () => toYmdKst(new Date());

  const isToday = selectedYmd === getTodayYmd();
  const showSpecial = !!completed.special;
  const visibleSlots = showSpecial ? [...slots, "special"] : [...slots];

  const dayRender = kstNowParts(selectedDate);
  const { year, month, day, weekday } = dayRender;

  const timeInputRef = useRef<HTMLInputElement | null>(null);

  /* ---------- ASYNC FUNC ---------- */

  async function handleClick(slot: FeedLog["slot"]) {
    if (completed[slot] || loading) return;

    if (isToday) {
      const done_at = new Date().toISOString();
      await insertLog({ date: getTodayYmd(), slot, done_at });
      return;
    }
    setPendingSlot(slot);

    setTimeout(() => {
      const el = timeInputRef.current;
      if (!el) return;

      if (el?.showPicker) {
        el.showPicker();
      } else {
        el.focus();
        el.click();
      }
    }, 250);
  }

  async function insertLog(params: {
    date: string;
    slot: FeedLog["slot"];
    done_at: string;
  }) {
    const { date, slot, done_at } = params;

    setLoading(true);

    setCompleted((prev) => ({
      ...prev,
      [slot]: done_at,
    }));
    setUndoInfo({
      slot,
      date,
      done_at,
    });

    if (timer) clearTimeout(timer);
    const timeout = setTimeout(() => {
      setUndoInfo(null);
    }, 7500);
    setTimer(timeout);

    const { error } = await supabase
      .from("feed_logs")
      .insert({ date, slot, done_at });

    if (error) {
      console.error("db insert 에러 발생:", error);

      setCompleted((prev) => {
        const next = { ...prev };
        delete next[slot];
        return next;
      });
      setUndoInfo(null);
      clearTimeout(timeout);

      setLoading(false);
      return false;
    }

    onLogChanged();
    setLoading(false);
    setPendingSlot(null);
    return true;
  }

  async function onPastTimeChange(
    e: ChangeEvent<HTMLInputElement>,
    targetSlot: FeedLog["slot"],
  ) {
    e.stopPropagation();
    const v = e.target.value;
    if (!v || !targetSlot || loading) return;

    const done_at = combineKstDateAndTime(selectedDate, v);
    await insertLog({ date: selectedYmd, slot: targetSlot, done_at });
    setPendingSlot(null);

    // input 값을 초기화
    e.target.value = "";
  }

  async function handleUndo() {
    if (!undoInfo) return;
    if (timer) clearTimeout(timer);

    const { slot, date, done_at } = undoInfo;

    setCompleted((prev) => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });

    const { error } = await supabase
      .from("feed_logs")
      .delete()
      .eq("date", date)
      .eq("slot", slot);

    if (error) {
      console.error("db delete 에러 발생:", error);
      setCompleted((prev) => ({
        ...prev,
        [slot]: done_at ?? new Date().toISOString(),
      }));
    }

    onLogChanged();
    setUndoInfo(null);
  }

  useEffect(() => {
    const map: CompletedMap = {};
    if (selectedLogs) {
      selectedLogs.forEach((log) => {
        map[log.slot as FeedLog["slot"]] = log.done_at;
      });
    }
    setCompleted(map);
  }, [selectedLogs]);

  useEffect(() => {
    !open && setPendingSlot(null);
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent
        className="!p-4 bg-white max-h-[96dvh] mb-8 flex flex-col items-center"
        aria-describedby="기록 확인 및 수정"
      >
        <DrawerHeader>
          <DrawerTitle>
            <div className="flex items-center justify-center [&_*]:!text-black/50">
              <div className="flex gap-2 items-start justify-center[&_h3]:!text-lg [&_span]:!text-[16px] [&_span]:opacity-75 transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-95 *:leading-tight *:tracking-tight">
                <h3 suppressHydrationWarning>
                  {year}
                  <span>년</span> {month}
                  <span>월</span> {day}
                  <span>일</span>
                </h3>
                <h3 suppressHydrationWarning>
                  {weekday}
                  <span>요일</span>
                </h3>
              </div>
            </div>
          </DrawerTitle>
        </DrawerHeader>

        {/* <input
          type="time"
          ref={timeInputRef}
          className="fixed top-0 left-0 w-[1px] h-[1px] opacity-0"
          onChange={(e) => onPastTimeChange(e.target.value)}
          // onBlur={() => setPendingSlot(null)}
        /> */}
        <div
          className={`border-2 bg-white rounded-md px-4 py-6 flex flex-col items-center gap-4 shadow-md border-green-600 max-w-100 w-full relative`}
        >
          {visibleSlots.map((slot) => {
            const s = slot as FeedLog["slot"];
            const doneAt = completed[s];
            const isPastSlot =
              !isToday && !doneAt && !loading && s === pendingSlot;
            return (
              <div key={slot} className="relative w-full flex justify-center">
                <CardRadioGroup
                  slot={s}
                  doneAt={doneAt}
                  loading={loading}
                  onClick={handleClick}
                  isPending={s === pendingSlot}
                />

                {isPastSlot && (
                  <input
                    ref={timeInputRef}
                    type="time"
                    defaultValue=""
                    disabled={loading}
                    aria-label={`${s} 시간 선택`}
                    placeholder="시간을 선택하세요"
                    className="absolute left-37.5 z-[999] w-[47.5%] h-full cursor-pointer shadow-2xs border border-[#99999925] rounded-lg px-2"
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                      if (e.target.value && !loading) {
                        onPastTimeChange(e, s);
                      }
                    }}
                    onPointerDown={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch {
                        console.warn("showPicker not supported");
                      }
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ---------- UNDO BTN ---------- */}
        {isToday && undoInfo && (
          <UndoButton slot={undoInfo.slot} undo={handleUndo} />
        )}
      </DrawerContent>
    </Drawer>
  );
}
