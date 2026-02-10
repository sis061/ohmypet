"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Today from "@/components/Today";
import { Check, Undo2 } from "lucide-react";
import Image from "next/image";

const slots = ["morning", "afternoon", "evening", "night"];

type FeedLog = {
  date: string;
  slot: "morning" | "afternoon" | "evening" | "night" | "special";
  done_at: string;
};
type CompletedMap = Partial<Record<FeedLog["slot"], string>>;

export default function Home() {
  const [completed, setCompleted] = useState<CompletedMap>({});
  const [undoSlot, setUndoSlot] = useState<string | null>(null);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
  }).format(new Date());

  const timeFmt = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const showSpecial = !!completed.special;
  const visibleSlots = showSpecial ? [...slots, "special"] : [...slots];

  function formatHM(iso: string) {
    return timeFmt.format(new Date(iso));
  }

  async function loadToday() {
    const { data } = await supabase
      .from("feed_logs")
      .select("slot, done_at")
      .eq("date", today);

    if (data) {
      const map: CompletedMap = {};
      data.forEach((d) => {
        map[d.slot as FeedLog["slot"]] = d.done_at;
      });
      setCompleted(map);
    }
  }

  async function handleClick(slot: string) {
    const done_at = new Date().toISOString();

    const { error } = await supabase
      .from("feed_logs")
      .insert({ date: today, slot, done_at });

    if (!error) {
      setUndoSlot(slot);

      const timeout = setTimeout(() => {
        setUndoSlot(null);
      }, 5000);

      setTimer(timeout);
    }
  }

  async function handleUndo() {
    if (!undoSlot) return;

    if (timer) clearTimeout(timer);

    await supabase
      .from("feed_logs")
      .delete()
      .eq("date", today)
      .eq("slot", undoSlot);

    setUndoSlot(null);
  }

  function slotKr(slot: FeedLog["slot"]) {
    let slotKr;
    switch (slot) {
      case "morning":
        slotKr = "아침";
        break;
      case "afternoon":
        slotKr = "오전";
        break;
      case "evening":
        slotKr = "오후";
        break;
      case "night":
        slotKr = "저녁";
        break;
      case "special":
        slotKr = "특식";
        break;
      default:
        slotKr = slot;
        break;
    }
    return slotKr;
  }

  useEffect(() => {
    loadToday();

    const channel = supabase
      .channel("feed_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "feed_logs",
        },
        (payload) => {
          const row = payload.new as FeedLog;
          if (row.date === today) {
            setCompleted((prev) => ({ ...prev, [row.slot]: row.done_at }));
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "feed_logs",
        },
        (payload) => {
          const row = payload.old as FeedLog;
          if (row.date === today) {
            setCompleted((prev) => {
              const next = { ...prev };
              delete next[row.slot];
              return next;
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(loadToday, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="wrapper">
      <section className="inner min-h-[calc(100dvh-10.75rem)] text-3xl !mx-auto !w-full h-full !mb-8 !p-2 flex flex-col items-center justify-start">
        <div className="flex flex-col items-start !pb-4 !pt-4 justify-center max-w-100 w-full">
          <Today />
        </div>
        <div
          className={`border-2 bg-white rounded-md px-4 flex flex-col gap-4 shadow-md border-green-600 max-w-100 w-full relative ${!showSpecial ? "pb-12" : "pb-4"}`}
        >
          <div className="flex gap-4 items-center justify-between border-b border-black/25 p-4 relative">
            <div className="flex flex-col gap-4 min-w-1/2 grow">
              <b className="text-4xl !text-green-400">유월이</b>
              <ul className="flex flex-col *:text-lg *:!text-[#999] gap-0 -ml-1">
                <li>
                  <span className="text-base">🐾</span> 하루에 4번
                </li>
                <li>
                  <span className="text-base">🐾</span> 30g 씩 먹어요~
                </li>
              </ul>
            </div>
            <div className="absolute -top-12 -right-4 z-30">
              <Image
                src={"/cardIcon.png"}
                alt="카드 유월 이미지"
                width={190}
                height={190}
                loading="eager"
                className="transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-150"
              />
            </div>
          </div>
          <div className="p-4 w-full flex flex-col gap-8 items-center">
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
                    disabled={!!doneAt}
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
          {!showSpecial && (
            <button
              onClick={() => {
                handleClick("special");
              }}
              className="border border-green-600 bg-green-500 w-20 h-20 absolute -bottom-10 left-1/2 -translate-x-1/2 rounded-full shadow-md flex flex-col items-center justify-center transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-90"
            >
              <div className="relative w-full h-full">
                <div className="w-20 h-20 absolute top-0 left-0">
                  <svg viewBox="0 0 200 100" className="w-full h-full">
                    <path
                      id="curve"
                      d="M 15 100 A 65 90 0 0 1 180 110"
                      fill="transparent"
                    />
                    <text className="text-4xl font-bold fill-white">
                      <textPath
                        href="#curve"
                        startOffset="50%"
                        textAnchor="middle"
                      >
                        특 식 이 다 !
                      </textPath>
                    </text>
                  </svg>
                </div>
              </div>

              <span className="text-4xl mb-2">🍖</span>
            </button>
          )}
        </div>

        {undoSlot && (
          <div
            onClick={handleUndo}
            className="fixed left-1/2 -translate-x-1/2 bottom-6 shadow-lg max-w-[95%] transition-all duration-200 ease-in-out"
          >
            <div className="bg-fill w-full h-full *:!text-white px-6 py-3 rounded-xl flex items-center justify-center gap-8 ">
              <span className="text-base !text-white z-10 whitespace-nowrap overflow-hidden text-ellipsis">
                <b className="text-base !text-white">
                  <span>🦴 </span>
                  {slotKr(undoSlot as FeedLog["slot"])}
                </b>
                을 먹었어요!
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
      </section>
    </main>
  );
}
