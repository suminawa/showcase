"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    SheetApp?: { mount: (root: HTMLElement) => unknown };
  }
}

/** 見本の画面。app.js（キットの demo と同じもの）を読み、この要素に組み立てる */
export function Tool() {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!ready || mounted.current || !root.current || !window.SheetApp) return;
    mounted.current = true;
    window.SheetApp.mount(root.current);
  }, [ready]);

  return (
    <>
      {/* public 直下の静的アセット（キットの demo と同じ app.css）を読む。
          next/head が使えないクライアント部品なので、この一枚だけ手書きの link にする */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/demos/sheet-app/app.css" />
      <div ref={root} className="sa" aria-busy={!ready}>
        {!ready && <p style={{ padding: "24px 0", textAlign: "center", color: "#6b716c" }}>見本を読み込んでいます…</p>}
      </div>
      <Script src="/demos/sheet-app/app.js" strategy="afterInteractive" onLoad={() => setReady(true)} onReady={() => setReady(true)} />
    </>
  );
}
