"use client";

import { OpenNow } from "@/components/demos/OpenNow";
import { isOpenAtClinic } from "@/components/demos/clinic/hours";

/**
 * OpenNow のクリニック向けの薄い包み。
 * page.tsx は metadata を export するのでサーバー部品のままにする必要があり、
 * 関数（isOpenAtClinic）を props でそのまま渡すと
 * 「Functions cannot be passed directly to Client Components」でビルドが落ちる
 * （サーバー→クライアントの境界は値をシリアライズするため、関数を越えられない）。
 * ここをクライアント部品にして関数をこちら側で直接束ねることで、
 * 境界を越える props を className だけ（シリアライズできる値だけ）にする。
 */
export function ClinicOpenNow({ className }: { className?: string }) {
  return (
    <OpenNow
      className={className}
      isOpen={isOpenAtClinic}
      openLabel="いまは診療中です"
      closedLabel="いまは診療時間外です"
    />
  );
}
