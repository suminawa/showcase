"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Booking?: { mount: (root: HTMLElement) => unknown };
  }
}

/** 見本の画面。app.js（キットの demo と同じもの）を読み、この要素に組み立てる */
export function Tool() {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!ready || !el || !window.Booking) return;
    if (!mounted.current) {
      mounted.current = true;
      window.Booking.mount(el);
    }
    // 見本の画面は自前の <main> を描く（キットのお客さま向けの画面そのもの）。このページの中では
    // 主の領域が二つになるので、描き直すたびに「見本の領域」として名乗り直す（画面の見た目は変えない）
    const rename = () => {
      const main = el.querySelector("main.bk-main");
      if (main && main.getAttribute("role") !== "region") {
        main.setAttribute("role", "region");
        main.setAttribute("aria-label", "予約ページの見本");
      }
    };
    rename();
    const observer = new MutationObserver(rename);
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [ready]);

  return (
    <>
      {/* public 直下の静的アセット（キットの demo と同じ app.css）を読む。
          next/head が使えないクライアント部品なので、この一枚だけ手書きの link にする */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/demos/booking/app.css" />
      <div ref={root} className="bk" aria-busy={!ready}>
        {!ready && <p style={{ padding: "24px 0", textAlign: "center", color: "#6b716c" }}>見本を読み込んでいます…</p>}
      </div>
      <Script src="/demos/booking/app.js" strategy="afterInteractive" onLoad={() => setReady(true)} onReady={() => setReady(true)} />
    </>
  );
}
