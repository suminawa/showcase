"use client";
/*
 * ページを開いたときに ?ref= があれば、カスタムイベント「arrive」を 1 回だけ送る（ref と path の 2 つ）。
 * 根のレイアウトに置くので、紙から紙へ移っても送り直さない。何も保存しない。
 */
import { track } from "@vercel/analytics";
import { useEffect } from "react";

import { arriveRef } from "./arrive";

export function ArriveTracker() {
  useEffect(() => {
    const ref = arriveRef(window.location.search);
    if (ref) track("arrive", { ref, path: window.location.pathname });
  }, []);
  return null;
}
