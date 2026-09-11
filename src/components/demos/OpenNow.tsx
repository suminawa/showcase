"use client";

import { useEffect, useState } from "react";

import { isOpenAt } from "./shop/hours";

/**
 * いま開いているかどうかの一行。店なら「いまは開いています」、医院なら「いまは診療中です」。
 * このページは静的に書き出すので、サーバーでは何も出さず、画面に出てから判定する
 * ── そうしないと「ビルドした時刻の営業中」が貼り付いたままになる。
 * 出てからは 1 分ごとに見直すので、開店・閉店の時刻をまたいでも表示が追いつく。
 *
 * isOpen には「その Date に開いているか」を返す関数を渡す。
 * 呼び出し側はモジュールの外に置いた関数をそのまま渡すこと（毎回その場で作る関数を渡すと、
 * 描画のたびに useEffect が張り直される）。
 */
export function OpenNow({
  className,
  isOpen = isOpenAt,
  openLabel = "いまは開いています",
  closedLabel = "いまは閉まっています",
}: {
  className?: string;
  /** 既定は shop-lp の営業時間。ほかの見本は自分の判定を渡す */
  isOpen?: (date: Date) => boolean;
  openLabel?: string;
  closedLabel?: string;
}) {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setOpen(isOpen(new Date()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [isOpen]);

  if (open === null) return null;

  return (
    <span className={className} data-open={open}>
      {open ? openLabel : closedLabel}
    </span>
  );
}
