"use client";

import { useEffect, useState } from "react";

import { isOpenAt } from "./hours";

/**
 * いま開いているかどうかの一行。
 * このページは静的に書き出すので、サーバーでは何も出さず、画面に出てから判定する
 * ── そうしないと「ビルドした時刻の営業中」が貼り付いたままになる。
 * 出てからは 1 分ごとに見直すので、開店・閉店の時刻をまたいでも表示が追いつく。
 */
export function OpenNow({ className }: { className?: string }) {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setOpen(isOpenAt(new Date()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (open === null) return null;

  return (
    <span className={className} data-open={open}>
      {open ? "いまは開いています" : "いまは閉まっています"}
    </span>
  );
}
