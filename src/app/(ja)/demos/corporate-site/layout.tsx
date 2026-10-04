/*
 * 見本: 会社案内サイトの共通の枠。4 枚の面がこれを共有する。
 * 入れ子の layout なので <html> と <body> は書かない（root layout が持っている）。
 * 色のトークンもここ（.page）で決める ── 下の面は --d-* を継承するだけ。
 */
import Link from "next/link";

import { DemoFooter } from "@/components/demos/DemoFooter";
import { CorporateNav } from "@/components/demos/corporate/CorporateNav";
import { NAV_BASE } from "@/components/demos/corporate/nav";

import s from "./corporate.module.css";

const BRAND = "潮見計測";

export default function CorporateSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={`${s.container} ${s.headerRow}`}>
          <Link href={NAV_BASE} className={s.logo}>
            {BRAND}
          </Link>
          <CorporateNav />
        </div>
      </header>

      <main className={s.body}>{children}</main>

      <div className={s.container}>
        <DemoFooter brand={BRAND} kind="計測会社" page="サイト" />
      </div>
    </div>
  );
}
