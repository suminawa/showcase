"use client";
/*
 * 英仏の紙の <html lang>。最初の描画は [lang]/layout.tsx の一行の script が替え、
 * ここは紙の中の移動（英仏 → 日本語の見本など）で ja に戻すためだけにある。
 */
import { useEffect } from "react";

export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = "ja";
    };
  }, [lang]);
  return null;
}
