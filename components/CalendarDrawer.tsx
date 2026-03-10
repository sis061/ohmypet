import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CompletedMap, FeedLog, formatHM, slotKr, slots } from "@/app/page";
import { Check, Undo2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLogs: FeedLog[];
  selectedDate: Date;
  onLogChanged: () => void;
}

/* ---------- FUNC ---------- */

function toYmdKst(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function stripKstDate(date: Date) {
  // KST로 안전 변환
  const kst = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
  );
  const d = {
    year: String(kst.getFullYear()),
    month: String(kst.getMonth() + 1),
    day: String(kst.getDate()),
    weekday: new Intl.DateTimeFormat("ko-KR", {
      weekday: "short",
      timeZone: "Asia/Seoul",
    }).format(date),
  };
  return `${d.year}년 ${d.month}월 ${d.day}일 ${d.weekday}요일`;
}

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
  const [completed, setCompleted] = useState<CompletedMap>({});
  const [undoInfo, setUndoInfo] = useState<{
    slot: FeedLog["slot"];
    date: string;
    done_at: string;
  } | null>(null);
  const [pendingSlot, setPendingSlot] = useState<FeedLog["slot"] | null>(null);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const map: CompletedMap = {};
    if (selectedLogs) {
      selectedLogs.forEach((log) => {
        map[log.slot as FeedLog["slot"]] = log.done_at;
      });
    }
    setCompleted(map);
  }, [selectedLogs]);

  const selectedYmd = useMemo(() => toYmdKst(selectedDate), [selectedDate]);
  const getTodayYmd = () => toYmdKst(new Date());

  const isToday = selectedYmd === getTodayYmd();
  const showSpecial = !!completed.special;
  const visibleSlots = showSpecial ? [...slots, "special"] : [...slots];

  const timeInputRef = useRef<HTMLInputElement | null>(null);

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
    return true;
  }

  async function handleClick(slot: FeedLog["slot"]) {
    if (completed[slot] || loading) return;

    if (isToday) {
      const done_at = new Date().toISOString();
      await insertLog({ date: getTodayYmd(), slot, done_at });
      return;
    } else {
      setPendingSlot(slot);
      const el = timeInputRef.current as
        | (HTMLInputElement & { showPicker?: () => void })
        | null;

      if (!el) return;

      if (el.showPicker) {
        el.showPicker();
      } else {
        el.focus();
        el.click();
      }
    }
  }

  async function onPastTimeChange(v: string) {
    if (!v || !pendingSlot) return;

    const slot = pendingSlot;
    const done_at = combineKstDateAndTime(selectedDate, v);
    await insertLog({ date: selectedYmd, slot, done_at });

    setPendingSlot(null);

    if (timeInputRef.current) {
      timeInputRef.current.value = "";
    }
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent
        className="!p-4 bg-white max-h-[96dvh] mb-8 flex flex-col items-center"
        aria-describedby="기록 확인 및 수정"
      >
        <DrawerHeader>
          <DrawerTitle>{stripKstDate(selectedDate)}</DrawerTitle>
        </DrawerHeader>

        <input
          type="time"
          ref={timeInputRef}
          className="sr-only"
          onChange={(e) => onPastTimeChange(e.target.value)}
          onBlur={() => setPendingSlot(null)}
        />
        <div
          className={`border-2 bg-white rounded-md px-4 py-6 flex flex-col items-center gap-4 shadow-md border-green-600 max-w-100 w-full relative`}
        >
          {visibleSlots.map((slot) => {
            const s = slot as FeedLog["slot"];
            const doneAt = completed[s];
            return (
              <div
                key={slot}
                className="flex w-full items-center justify-start gap-6"
              >
                <button
                  onClick={() => handleClick(s)}
                  disabled={!!doneAt || loading}
                  className={` transition shadow-2xs border border-[#99999925] rounded-lg !p-2 ${doneAt && "bg-green-500"} transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-95`}
                >
                  <Check
                    strokeWidth={2.5}
                    size={36}
                    color={doneAt ? "#fafafa" : "#99999950"}
                  />
                </button>
                <div className="flex items-center justify-start gap-4">
                  <span
                    className={`text-4xl transition-all duration-200 ${doneAt && "line-through !text-[#99999950]"}`}
                  >
                    {slotKr(s)}
                  </span>
                  {doneAt && (
                    <span className="text-2xl !text-[#999999] transition-all duration-200">
                      {formatHM(doneAt)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ---------- UNDO BTN ---------- */}
        {isToday && undoInfo && (
          <div
            onClick={handleUndo}
            className="fixed left-1/2 -translate-x-1/2 bottom-6 shadow-lg max-w-[95%] transition-all duration-200 ease-in-out"
          >
            <div className="bg-fill w-full h-full *:!text-white px-6 py-3 rounded-xl flex items-center justify-center gap-8 ">
              <span className="text-base !text-white z-10 whitespace-nowrap overflow-hidden text-ellipsis">
                <b className="text-base !text-white">
                  <span>🦴 </span>
                  {slotKr(undoInfo.slot as FeedLog["slot"])}
                </b>{" "}
                밥을 먹었어요!
              </span>
              <button
                onClick={handleUndo}
                className="whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center gap-1 font-semibold text-sm transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-95"
              >
                <Undo2 size={12} color="#fff" className="!mb-1.5" />
                되돌리기
              </button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
