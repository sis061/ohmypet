"use client";

import { useEffect, useState } from "react";
import { kstNowParts } from "@/lib/utils";

type NowParts = ReturnType<typeof kstNowParts>;

export default function Today() {
  const [now, setNow] = useState<NowParts | null>(null);

  useEffect(() => {
    const updateDate = () => {
      setNow(kstNowParts(new Date()));
    };

    updateDate();

    const timer = setInterval(() => {
      setNow(kstNowParts(new Date()));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`flex items-center justify-center [&_*]:!text-black/50 ${!now && `blur-xs`}`}
    >
      <div className="flex flex-col items-start justify-center !pb-2 !px-4 rounded-md [&_h3]:!text-lg [&_span]:!text-[16px] [&_span]:opacity-75 transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-95 *:leading-tight *:tracking-tight">
        <h3 suppressHydrationWarning>
          {now?.year ?? "-----"}
          <span>년</span> {now?.month ?? "--"}
          <span>월</span> {now?.day ?? "--"}
          <span>일</span>
        </h3>
        <h3 suppressHydrationWarning>
          {now?.weekday ?? "--"}
          <span>요일</span>
        </h3>
      </div>
    </div>
  );
}
