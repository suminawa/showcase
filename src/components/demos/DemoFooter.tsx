import Link from "next/link";

import s from "./demo-shared.module.css";

/**
 * 見本ページ共通の結び。免責の一行と、トップへの戻り、連絡先。
 * 連絡先はこのメールだけ。ほかの導線（SNS・他サイト）は置かない。
 */
export function DemoFooter({ brand }: { brand: string }) {
  return (
    <footer className={s.footer}>
      <p className={s.disclaimer}>
        この LP は suminawa の見本です。{brand} は架空のサービスで、実在の会社ではありません。
      </p>
      <p className={s.links}>
        <Link href="/">suminawa.dev の作品一覧へ</Link>
        <a href="mailto:hello@suminawa.dev">制作の相談は hello@suminawa.dev へ</a>
      </p>
    </footer>
  );
}
