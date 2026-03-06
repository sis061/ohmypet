"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <section className="flex w-full max-w-screen-2xl mx-auto max-md:!px-8 min-h-screen items-center justify-center bg-green-400">
      <div className="w-full max-w-sm !p-8 bg-[#F6F4F2] rounded-2xl flex flex-col items-center justify-center gap-4 min-h-[75dvh] text-center">
        <h1 className="text-xl font-bold text-center !text-pilltime-grayDark !mb-12">
          페이지를 표시할 수 없습니다.
        </h1>
        <p>
          요청하신 페이지를 찾을 수 없습니다. <br /> 입력하신 주소를 다시
          확인해주세요.
        </p>

        <div className="flex gap-2 items-center !mt-4">
          <button
            className="rounded-md shadow-sm !px-3 !py-2 bg-green-600 !text-white transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-95 hover:scale-110"
            onClick={() => router.push("/")}
          >
            홈으로
          </button>
          <button
            className="rounded-md shadow-sm !px-3 !py-2 transition-transform duration-200 ease-in-out scale-100 cursor-pointer touch-manipulation active:scale-95 hover:scale-110"
            onClick={() => router.back()}
          >
            뒤로가기
          </button>
        </div>
      </div>
    </section>
  );
}
