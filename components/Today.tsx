export function kstNowParts() {
  const now = new Date();
  // KST로 안전 변환
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  return {
    ymd: toYYYYMMDD(kst, "Asia/Seoul"),
    year: String(kst.getFullYear()),
    month: String(kst.getMonth() + 1),
    day: String(kst.getDate()),
    weekday: new Intl.DateTimeFormat("ko-KR", {
      weekday: "short",
      timeZone: "Asia/Seoul",
    }).format(now),
  };
}

export function toYYYYMMDD(date: Date, tz = "Asia/Seoul") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default function Today() {
  const { ymd, year, month, day, weekday } = kstNowParts();

  return (
    <div className="flex items-center justify-center [&_*]:!text-black/50">
      <div className="flex flex-col items-start justify-center !pb-2 !px-4 rounded-md [&_h3]:!text-lg [&_span]:!text-[16px] [&_span]:opacity-75 transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-95 *:leading-tight *:tracking-tight">
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
  );
}
