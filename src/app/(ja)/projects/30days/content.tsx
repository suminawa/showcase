/*
 * THESIS: 帳面をもう一冊。見積もりの帳面が「決める」ためのものなら、この帳面は「起きたことを足す」ためのもの（Operate）。
 * OWN-WORLD: 料紙の作品ページ。字は大と小の二段、箱なし、罫は墨の一本。合計だけが大に立つ。
 * COLOR: 朱は使わない（この面に「選ぶ」行為が無いから）。折れ線も墨の一色。
 * STORY: 毎晩、一行ずつ増える。
 * FIRST VIEWPORT: 頭（戻り・名乗り・一行）、累計、四つの小さな数、折れ線、表の頭。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 */
import { Board, type Product } from "@/components/thirtydays/Board";
import board from "@/data/thirtydays.json";
import links from "@/data/links.json";
import { CATALOG } from "@/i18n/catalog";
import { localePath, type Lang } from "@/i18n/routes";
import { goHref, type LinkKey } from "@/lib/go";

import { DemoNote, ProjectShell, projectMetadata } from "../shell";
import s from "../projects.module.css";
import { copy } from "./copy";

/** チャレンジの中で出した売り物（発売順）。URL は links.json（空なら値札を出さない）。英仏の名は目録（slug）から引く */
const PRODUCTS: { name: string; slug: string; date: string; key: LinkKey }[] = [
  { name: "見積もり電卓テンプレ", slug: "quote-simulator", date: "9/11", key: "s1" },
  { name: "期限アラート GAS キット", slug: "deadline", date: "9/12", key: "s2" },
  { name: "フォーム受付 GAS キット", slug: "form", date: "9/12", key: "s3" },
  { name: "業種別 LP テンプレ パック", slug: "lp-pack", date: "9/13", key: "lp" },
  { name: "間取りシミュレーター", slug: "floorplan", date: "9/13", key: "floorplan" },
  { name: "AI 案内窓口キット", slug: "ai-concierge", date: "9/21", key: "ai-concierge" },
  { name: "AI 書類読み取りキット", slug: "doc-reader", date: "9/21", key: "doc-reader" },
  { name: "スプレッドシート業務アプリ キット", slug: "sheet-app", date: "9/22", key: "sheet-app" },
  { name: "予約ページ キット", slug: "booking", date: "9/22", key: "booking" },
  { name: "AI 問い合わせ整理キット", slug: "inbox-triage", date: "9/23", key: "inbox-triage" },
  { name: "ダッシュボード キット", slug: "dashboard", date: "9/23", key: "dashboard" },
  { name: "LINE 案内窓口キット", slug: "line-concierge", date: "9/24", key: "line-concierge" },
  { name: "3D 商品コンフィギュレーター", slug: "configurator", date: "9/24", key: "configurator" },
  { name: "SaaS スターター キット", slug: "saas-starter", date: "9/24", key: "saas-starter" },
];

function products(lang: Lang): Product[] {
  return PRODUCTS.map(({ name, slug, date, key }) => ({
    name: lang === "ja" ? name : CATALOG[lang].projects[slug].title,
    date,
    key,
    links: links[key],
  }));
}

export const metadataFor = (lang: Lang) => projectMetadata(lang, "30days", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell
      lang={lang}
      slug="30days"
      title={t.title}
      latin="Thirty Days"
      lede={
        <>
          {t.lede}
          <br />
          {t.daily}
          {links.challenge.note && (
            <>
              {" ── "}
              <a
                href={goHref("challenge", "note", localePath(lang, "/projects/30days"))}
                rel="nofollow"
                className={s.textLink}
              >
                {t.posts}
              </a>
            </>
          )}
        </>
      }
    >
      <DemoNote lang={lang} text={t.demoNote} />
      <Board board={board} products={products(lang)} />
    </ProjectShell>
  );
}
