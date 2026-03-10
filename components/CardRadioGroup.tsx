import { Check } from "lucide-react";
import { formatHM, slotKr } from "@/lib/utils";
import { FeedLog } from "@/types/global";

interface CardRadioGroupProps {
  slot: FeedLog["slot"];
  doneAt: string | undefined;
  loading: boolean;
  onClick: (slot: FeedLog["slot"]) => Promise<void>;
}

export default function CardRadioGroup({
  slot,
  doneAt,
  loading,
  onClick,
}: CardRadioGroupProps) {
  return (
    <div className="flex w-full items-center justify-start gap-6">
      <button
        onClick={() => onClick(slot)}
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
          {slotKr(slot)}
        </span>
        {doneAt && (
          <span className="text-2xl !text-[#999999] transition-all duration-200">
            {formatHM(doneAt)}
          </span>
        )}
      </div>
    </div>
  );
}
