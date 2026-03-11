"use client";

import { useRouter, usePathname } from "next/navigation";
import { CalendarSearch, ListChecks } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const handleReload = () => {
    window && window?.location.reload();
  };

  return (
    <header className="h-20 bg-green-500 flex items-center justify-between !px-4 shadow-sm">
      <div className="inner flex justify-between items-center !mx-auto h-full gap-2">
        {/* <Image
          src={"/ohmypet_icon.png"}
          alt="favcon_png"
          width={60}
          height={60}
          onClick={handleClick}
          className="transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-90"
          loading="eager"
        /> */}
        <div
          className="flex flex-col rotate-6 -space-y-1.5 transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-90"
          onClick={handleReload}
        >
          <span className="font-extrabold text-xl !text-white leading-tight tracking-tight">
            아맞
          </span>
          <span className="font-extrabold text-xl !text-white leading-tight tracking-tight">
            다밥!
          </span>
        </div>
        <div>
          {pathname !== "/" ? (
            <div
              className="flex flex-col items-center justify-center gap-2 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <ListChecks color="#fff" size={24} />
              <span className="font-extrabold text-xs !text-white leading-tight tracking-tight">
                홈으로 돌아가기
              </span>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-2 cursor-pointer"
              onClick={() => router.push("/calendar")}
            >
              <CalendarSearch color="#fff" size={24} />
              <span className="font-extrabold text-xs !text-white leading-tight tracking-tight">
                지난 기록 보기
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
