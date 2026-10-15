"use client";
/* 見本の結びから BOOTH の LP パックへ。/go/ を通し、どの見本から出たか（from）を数える */
import { usePathname } from "next/navigation";

import { goHref } from "@/lib/go";

export function LpPackLink() {
  const from = usePathname();
  return (
    <a href={goHref("lp", "booth", from)} rel="nofollow">
      BOOTH で見る
    </a>
  );
}
