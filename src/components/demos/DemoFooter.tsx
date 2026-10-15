import Link from "next/link";

import { yen } from "@/lib/prices";
import { projects } from "@/lib/projects";

import { LpPackLink } from "./LpPackLink";

import { spacedWord, trailingSpacedWord } from "./spacedWord";
import s from "./demo-shared.module.css";

/**
 * 見本ページ共通の結び。免責の一行と、次の一歩の 2 択（型を買う／制作を頼む）、トップへの戻り。
 * 「この見た目でいい」と思った人が、LP パック（BOOTH）か /contact へそのまま進めるようにする
 * （2026-10-15 監査 改善 6）。ほかの導線（SNS・他サイト）は置かない。
 */
const LP_PACK_PRICE = yen(projects.find((p) => p.slug === "lp-pack")?.sale?.price ?? 0);

export function DemoFooter({
  brand,
  kind = "サービス",
  page = "LP",
  entity = "会社",
}: {
  brand: string;
  /** 「架空の〜」に入る語。店の見本なら "店"、建物なら "建物"。既定は "サービス" */
  kind?: string;
  /** 「この〜は」に入る語。LP でない見本（3D ビューアなど）は "ページ"。既定は "LP" */
  page?: string;
  /** 「実在の〜ではありません」に入る語。医院の見本なら "医院"。既定は "会社" */
  entity?: string;
}) {
  const pageLabel = spacedWord(page);
  // 句点「。」の直後に来るので、前には空白を置かない
  const brandLabel = trailingSpacedWord(brand);

  return (
    <footer className={s.footer}>
      <p className={s.disclaimer}>
        この{pageLabel}は suminawa の見本です。{brandLabel}は架空の{kind}で、実在の{entity}ではありません。
      </p>
      <p className={s.cta}>
        この{pageLabel}の型は『業種別 LP テンプレ パック』（{LP_PACK_PRICE}・買い切り）に入っています ── <LpPackLink />
      </p>
      <p className={s.cta}>
        文言と写真を差し替えて公開するまでのご依頼は 150,000 円から ── <Link href="/contact">ご相談はこちら</Link>
      </p>
      <p className={s.links}>
        <Link href="/">suminawa.dev の作品一覧へ</Link>
      </p>
    </footer>
  );
}
