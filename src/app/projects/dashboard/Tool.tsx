"use client";

import Script from "next/script";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type Instance = { destroy: () => void };
type MountOptions = { source: "memory"; lang: "ja" | "en"; theme: "light" };

declare global {
  interface Window {
    Dashboard?: { mount: (root: HTMLElement, options: MountOptions) => Instance };
  }
}

type Lang = "ja" | "en";

const subscribeNothing = () => () => {};
const readUrlLang = (): Lang => (new URLSearchParams(window.location.search).get("lang") === "en" ? "en" : "ja");
const readServerLang = (): Lang => "ja";

/** 見本の画面。app.js（キットの demo と同じもの）を読み、この要素に組み立てる。言語は切り替えのたびに組み直す */
export function Tool() {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  // ?lang=en で開かれたときは英語から始める（提案に添える URL 用）。URL は外の状態なので購読の形で読む
  const urlLang = useSyncExternalStore(subscribeNothing, readUrlLang, readServerLang);
  const [chosen, setChosen] = useState<Lang | null>(null);
  const lang = chosen ?? urlLang;
  const setLang = setChosen;

  useEffect(() => {
    if (!ready || !root.current || !window.Dashboard) return;
    // 紙の上に載せるので、配色は明るい側に固定する
    const instance = window.Dashboard.mount(root.current, { source: "memory", lang, theme: "light" });
    return () => instance.destroy();
  }, [ready, lang]);

  return (
    <>
      {/* public 直下の静的アセット（キットの demo と同じ app.css）を読む。
          next/head が使えないクライアント部品なので、この一枚だけ手書きの link にする */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/demos/dashboard/app.css" />
      <div className="dashboard-demo-lang" role="group" aria-label="表示する言語">
        <button type="button" aria-pressed={lang === "ja"} onClick={() => setLang("ja")}>
          日本語
        </button>
        <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
          English
        </button>
      </div>
      <div ref={root} aria-busy={!ready}>
        {!ready && <p style={{ padding: "24px 0", textAlign: "center", color: "#6b716c" }}>見本を読み込んでいます…</p>}
      </div>
      <Script src="/demos/dashboard/app.js" strategy="afterInteractive" onLoad={() => setReady(true)} onReady={() => setReady(true)} />
    </>
  );
}
