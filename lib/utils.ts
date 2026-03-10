import { FeedLog } from "@/types/global";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ---------- CONST ---------- */

export const slots = ["morning", "afternoon", "evening", "night"];

/* ---------- TIME ---------- */

export function formatHM(iso: string) {
  const timeFmt = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return timeFmt.format(new Date(iso));
}

export function kstNowParts(date: Date) {
  // KST로 안전 변환
  const kst = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
  );
  return {
    year: String(kst.getFullYear()),
    month: String(kst.getMonth() + 1),
    day: String(kst.getDate()),
    weekday: new Intl.DateTimeFormat("ko-KR", {
      weekday: "short",
      timeZone: "Asia/Seoul",
    }).format(date),
  };
}

/* ---------- DATE ---------- */

export function toYmdKst(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/* ---------- UI RENDER ---------- */

export function slotKr(slot: FeedLog["slot"]) {
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
