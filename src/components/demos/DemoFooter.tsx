import Link from "next/link";

import s from "./demo-shared.module.css";

/**
 * 見本ページ共通の結び。免責の一行と、トップへの戻り、連絡先。
 * 連絡先はこのメールだけ。ほかの導線（SNS・他サイト）は置かない。
 */
export function DemoFooter({
  brand,
  kind = "サービス",
  page = "LP",
}: {
  brand: string;
  /** 「架空の〜」に入る語。店の見本なら "店"、建物なら "建物"。既定は "サービス" */
  kind?: string;
  /** 「この〜は」に入る語。LP でない見本（3D ビューアなど）は "ページ"。既定は "LP" */
  page?: string;
}) {
  // 英数字の語は前後に半角スペースを置く（この LP は）。仮名や漢字の語は詰める（このページは）
  const pageLabel = /^[A-Za-z0-9]/.test(page) ? ` ${page} ` : page;

  return (
    <footer className={s.footer}>
      <p className={s.disclaimer}>
        この{pageLabel}は suminawa の見本です。{brand} は架空の{kind}で、実在の会社ではありません。
      </p>
      <p className={s.links}>
        <Link href="/">suminawa.dev の作品一覧へ</Link>
        <a href="mailto:hello@suminawa.dev">制作の相談は hello@suminawa.dev へ</a>
      </p>
    </footer>
  );
}
