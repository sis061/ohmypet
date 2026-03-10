import { Undo2 } from "lucide-react";
import { slotKr } from "@/lib/utils";
import { FeedLog } from "@/types/global";

export default function UndoButton({
  slot,
  undo,
}: {
  slot: string;
  undo: () => Promise<void>;
}) {
  return (
    <div
      onClick={undo}
      className="fixed left-1/2 -translate-x-1/2 bottom-6 shadow-lg max-w-[95%] transition-all duration-200 ease-in-out"
    >
      <div className="bg-fill w-full h-full *:!text-white px-6 py-3 rounded-xl flex items-center justify-center gap-8 ">
        <span className="text-base !text-white z-10 whitespace-nowrap overflow-hidden text-ellipsis">
          <b className="text-base !text-white">
            <span>🦴 </span>
            {slotKr(slot as FeedLog["slot"])}
          </b>{" "}
          밥을 먹었어요!
        </span>
        <button
          onClick={undo}
          className="whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center gap-1 font-semibold text-sm transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-95"
        >
          <Undo2 size={12} color="#fff" className="!mb-1.5" />
          되돌리기
        </button>
      </div>
    </div>
  );
}
