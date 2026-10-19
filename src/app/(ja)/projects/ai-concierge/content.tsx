/*
 * THESIS: 料紙の上に、窓を一つだけ開ける（Operate）。ここにある案内窓口は見本ではなく実物で、
 *   suminawa 自身の文書（売り物・受託・よくあるご質問）だけを根拠に答える。
 * 売り物のページの型（kit-parts.tsx。手本は deadline/content.tsx。2026-10-20）:
 *   頭: 題は検索語（自社の資料だけで答える、サイトの AI 案内窓口）、品物の名は題の下。右に購入の箱（KitOffer）。
 *   1 画面目: 頭のすぐ下に窓（実物）。スマホは右の箱を出さず、値段と 2 つの押す先を下の帯（KitBuyBar）に。
 *   窓のあと: 証拠 → 誰向け → 比較 → 値段（設置込み・領収書）→ つまずき（KitSales）→ 結び（KitClose）→ 連絡先（窓の「問い合わせ」の行き先）
 * FORM: 方眼（DESIGN.md）。窓は白いセル（マス目の縁）の上に置き、紙の上の一枚の製品として見せる。
 *   窓の中は部品の文法（--ac-* の値だけ方眼に寄せる）。
 * COLOR: 朱は落款だけ。窓の送信ボタンは墨。
 * 札（動く見本）は共通の DemoLabel を使わない ── あちらは「外へ送らない」と言うが、この窓は質問を API へ送るため。
 */
import Script from "next/script";

import "@suminawa/ai-concierge/ai-concierge.css";
import "./skin.css";

import { KitClose } from "@/components/kit-demo/KitClose";
import type { Lang } from "@/i18n/routes";

import { KitBuyBar, KitOffer, KitSales } from "../kit-parts";
import {
  AFTER_TOOL,
  ContactLine,
  DemoNote,
  ProjectShell,
  projectMetadata,
} from "../shell";
import s from "../projects.module.css";
import sh from "../shell.module.css";
import { copy } from "./copy";

/** BOOTH・note の鍵（links.json。kit-demos.ts の linkKey と同じ） */
const LINK = "ai-concierge";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "ai-concierge", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell
      lang={lang}
      slug="ai-concierge"
      title={t.title}
      name={t.name}
      latin="Concierge"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug="ai-concierge" linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug="ai-concierge" linkKey={LINK} />}
    >
      <p className={sh.demoLabel}>
        <span className={sh.demoTag}>{t.demo.label}</span>
        <span>{t.demo.text}</span>
      </p>
      <DemoNote lang={lang} />
      <div
        id="suminawa-concierge"
        style={
          {
            /* 紙の色と墨の四段は globals.css の --ryoushi-*。窓の中だけ、罫と同じ淡さの一本を持つ */
            "--ac-bg": "var(--m-cell)",
            "--ac-fg": "var(--ryoushi-sumi)",
            "--ac-muted": "var(--ryoushi-sumi-4)",
            "--ac-brand": "var(--ryoushi-sumi)",
            "--ac-brand-fg": "var(--ryoushi-paper)",
            "--ac-border": "color-mix(in srgb, var(--ryoushi-sumi) 26%, transparent)",
            "--ac-radius": "0px",
            /* inherit は var() の中では字の名として読めず、既定のゴシックに落ちていた（2026-10-07） */
            "--ac-font": "var(--hi-mincho), 'Hiragino Mincho ProN', 'Yu Mincho', YuMincho, serif",
            "--ac-shadow": "none",
          } as React.CSSProperties
        }
      />
      {/* 窓口の中は日本語のまま（読む文書が日本語の案内なので） */}
      <Script
        src="/ai-concierge.js"
        strategy="afterInteractive"
        data-endpoint="/api/concierge"
        data-inline="#suminawa-concierge"
        data-greeting="こんにちは。suminawa の案内窓口です。売り物の内容や価格、受託の料金、進め方などをお答えします。"
        data-suggestions="AI 案内窓口キットは何ができますか|GAS の自動化はいくらからですか|買ったあとの更新は無料ですか"
        data-contact-url="#contact"
        data-storage-key="suminawa"
        data-max-input-chars="300"
      />

      <p className={s.lede} style={AFTER_TOOL}>
        {t.sources}
      </p>
      <KitSales lang={lang} slug="ai-concierge" name={t.name} linkKey={LINK} copy={t.sales} />
      <KitClose slug="ai-concierge" lang={lang} made={t.made} compare={false} />
      <ContactLine lang={lang} />
    </ProjectShell>
  );
}
