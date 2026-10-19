"use client";

/*
 * コピーの押す先。設定の 1 行・.env・雛形の TSV を、1 回で持ち帰れるようにする。
 * 済んだことは押す先の字と aria-live で知らせる（2 秒で戻す）。クリップボードが使えない端末では、字を選んでコピーできる形のまま残る。
 */
import { useState } from "react";

import m from "./mcp-server.module.css";

export function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false),
    );
  };
  return (
    <button type="button" className={m.copy} onClick={copy}>
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}
