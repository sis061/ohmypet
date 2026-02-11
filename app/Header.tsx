"use client";

import Image from "next/image";

export default function Header() {
  const handleClick = () => {
    window && window?.location.reload();
  };
  return (
    <header className="h-20 bg-green-500 flex items-center justify-between !px-4 shadow-sm">
      <div className="inner flex justify-between items-center !mx-auto h-full gap-2">
        <Image
          src={"/ohmypet_icon.png"}
          alt="favcon_png"
          width={60}
          height={60}
          onClick={handleClick}
          className="transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-90"
          loading="eager"
        />
        <div className="flex flex-col rotate-6 -space-y-1.5">
          <span className="font-extrabold text-xl !text-white leading-tight tracking-tight">
            아맞
          </span>
          <span className="font-extrabold text-xl !text-white leading-tight tracking-tight">
            다밥!
          </span>
        </div>
      </div>
    </header>
  );
}
