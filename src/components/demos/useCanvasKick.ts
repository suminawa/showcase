"use client";

/*
 * 3D の枠を、開いただけで描き始めさせる。理由は src/lib/canvas-kick.ts に。
 * ref を付けた要素の中の canvas が測られるまで、window に resize を送る。
 */
import { useEffect, type RefObject } from "react";

import { kickUntilSized } from "@/lib/canvas-kick";

export function useCanvasKick(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    return kickUntilSized({
      findCanvas: () => ref.current?.querySelector("canvas") ?? null,
      kick: () => window.dispatchEvent(new Event("resize")),
      every: (fn, ms) => {
        const id = window.setInterval(fn, ms);
        return () => window.clearInterval(id);
      },
    });
  }, [ref]);
}
