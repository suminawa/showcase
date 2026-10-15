/*
 * 運営者について。全ページの共通の一行（SiteFooter）から結ぶ紙。
 * いまは置き場だけ（2026-10-15）。名義・引き受ける範囲・実績・インボイス・プライバシー方針の本文は
 * 監査 改善 2 に沿って別に書き、ここへ入れる。sitemap にはまだ載せない（中身が入ってから）。
 * FORM: 料紙（分類のページ）— 文法は DESIGN.md
 */
import { Sheet, SheetClose, SheetSection } from "@/components/ryoushi";
import { pageMetadata } from "@/i18n/meta";

import s from "../ryoushi.module.css";

const PAGE = {
  title: "運営者について",
  latin: "About",
  lede: "suminawa（墨縄）の運営者情報です。",
};

// 日本語だけの紙なので、英仏の道は添えない（pageMetadata は三言語の組を付ける）
export const aboutMetadata = {
  ...pageMetadata("ja", "/about", { title: PAGE.title, description: PAGE.lede }),
  alternates: { canonical: "/about" },
};

export function AboutPage() {
  return (
    <Sheet title={PAGE.title} latin={PAGE.latin} lede={PAGE.lede}>
      <SheetSection>
        <p className={s.closeText}>運営者情報は準備中です。</p>
      </SheetSection>
      <SheetClose />
    </Sheet>
  );
}
