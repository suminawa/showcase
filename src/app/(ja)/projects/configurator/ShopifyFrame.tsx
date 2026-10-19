"use client";

/*
 * 見本: Shopify 版。売り物に同梱の架空の商品ページ（page/mock-product.html）を、
 * そのまま public/demos/shopify-configurator/ に写して枠で見せる（中身は 1 字も変えない）。
 *
 * 枠の高さは中の紙に合わせて伸び縮みさせる ── 中で選ぶと価格の行が増え、
 * 「カートに入れる」を押すと下に届いた内容が並ぶので、決め打ちの高さでは
 * 枠の中にもう一本スクロールが生まれる。同じ origin の紙なので中の高さを読める。
 * 読めないとき（読み込み前・拒まれたとき）は CSS の高さのまま。
 *
 * sandbox: 3D のモデルを fetch で読むので allow-same-origin が要る（無いと origin が
 * null になり、同じサーバーの GLB でも CORS で拒まれる）。中の紙は自前のファイルだけ。
 * PNG の保存に allow-downloads、共有 URL のコピーに clipboard-write。
 */
import { useEffect, useRef } from "react";

import s from "./configurator.module.css";

/**
 * src は紙（page.tsx）から渡す。"use client" の束から文字列を書き出すと、サーバー側では値でなく参照になる。
 * crop: 見本の店の頭（断りの帯・店の名・パンくず・題）を枠の上に隠し、3D から見せる（Shopify 版のページの 1 画面目）。
 *   中の紙は 1 字も変えず、枠を負の余白で上へずらすだけ。隠す高さは中の紙で section の上端を測って決める（幅で変わるため）。
 *   見本であることの断りは、紙の側で枠の上に一行置く
 */
export function ShopifyFrame({ src, crop = false }: { src: string; crop?: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    let observer: ResizeObserver | null = null;

    const fit = () => {
      observer?.disconnect();
      observer = null;
      let doc: Document | null = null;
      try {
        doc = frame.contentDocument;
      } catch {
        return;
      }
      // 読み込み前の about:blank は測らない
      const body = doc?.body;
      if (!doc || !body || doc.location.href === "about:blank") return;
      // html の scrollHeight は枠の高さより小さくならず、縮むときに追えない。本文の箱で測る
      const apply = () => {
        const h = Math.ceil(body.getBoundingClientRect().height);
        // 紙は border-box で組んであるので、枠の線の分を足さないと 1px の縦スクロールが残る
        const edge = frame.offsetHeight - frame.clientHeight;
        if (h > 0) frame.style.height = `${h + edge}px`;
        if (crop) {
          const top = doc.querySelector("[data-suminawa-configurator]")?.getBoundingClientRect().top ?? 0;
          frame.style.marginTop = top > 0 ? `${-Math.floor(top)}px` : "";
        }
      };
      apply();
      // 見張りは中の紙の側で作る（外の側で作ると、中の紙の描き直しで知らせが来ないことがあった）
      const RO = doc.defaultView?.ResizeObserver ?? ResizeObserver;
      observer = new RO(apply);
      observer.observe(body);
    };

    frame.addEventListener("load", fit);
    // 見えてから読み込む（loading="lazy"）ので、ここへ来る前に読み終わっていることもある
    if (frame.contentDocument?.readyState === "complete") fit();
    return () => {
      frame.removeEventListener("load", fit);
      observer?.disconnect();
    };
  }, [crop]);

  const iframe = (
    <iframe
      ref={ref}
      className={s.shopifyFrame}
      src={src}
      title="Shopify 版の見本 ── みなと工房 オンラインストアの商品ページ（架空）"
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-downloads"
      allow="clipboard-write"
    />
  );
  return crop ? <div className={s.crop}>{iframe}</div> : iframe;
}
