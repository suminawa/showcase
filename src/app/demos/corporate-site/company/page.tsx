/*
 * 見本: 会社案内サイトの下層（会社概要）。架空の会社の、架空の数字。
 * 氏名は書かない（代表は役職だけ）。所在地は「◯◯港エリア」と伏せる。
 */
import type { Metadata } from "next";

import { NAV_BASE } from "@/components/demos/corporate/nav";

import c from "../corporate.module.css";
import s from "../sub.module.css";

const TITLE = "見本 ｜ 会社案内サイト（会社概要）";
const DESCRIPTION =
  "架空の計測会社「潮見計測」の会社概要と沿革。会社案内サイトの下層ページの見本。";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${NAV_BASE}/company`,
    type: "website",
    images: ["/opengraph-image.png"],
    siteName: "Showcase",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
};

const PROFILE = [
  { term: "社名", body: "潮見計測" },
  { term: "設立", body: "2002 年 4 月" },
  { term: "資本金", body: "4,800 万円" },
  { term: "従業員数", body: "38 名（うち技術職 27 名）" },
  { term: "代表者", body: "代表取締役" },
  { term: "所在地", body: "◯◯港エリア（最寄り駅から徒歩 12 分）" },
  { term: "事業内容", body: "海域調査／環境モニタリング／データ解析" },
  { term: "主な取引先", body: "自治体、建設会社、大学の研究室" },
];

const HISTORY = [
  { year: "2002 年", body: "計測機器の保守を請け負う会社として創業しました。" },
  {
    year: "2007 年",
    body: "自社の観測ブイを海に設置し、水温と塩分の記録を始めました。",
  },
  {
    year: "2012 年",
    body: "解析の部署を設け、報告書の作成まで自社で行う体制を整えました。",
  },
  {
    year: "2018 年",
    body: "観測データを自動で集める仕組みを導入し、現場に出る回数を減らしています。",
  },
  {
    year: "2024 年",
    body: "長期の記録を公開する仕組みをつくり、大学との共同研究を始めています。",
  },
];

const POLICIES = [
  {
    title: "測った数字を、そのまま出す。",
    body: "都合のよい数字だけを選ぶことはしません。測れなかったことも報告書に記します。数字は加工せず、そのままお渡しします。",
  },
  {
    title: "現場を見てから決める。",
    body: "海の条件は場所ごとに違います。機器の置き方は、現地を確かめてから決めています。",
  },
  {
    title: "記録を絶やさない。",
    body: "一度はじめた観測を途切れさせないことを、何よりも優先しています。",
  },
];

export default function CorporateCompanyPage() {
  return (
    <>
      <section className={c.pageHead}>
        <div className={c.container}>
          <h1 className={c.h1}>会社概要</h1>
          <p className={c.lead}>海の計測を、2002 年から続けています。</p>
        </div>
      </section>

      <section className={c.section}>
        <div className={c.container}>
          <h2 className={c.h2}>概要</h2>
          <dl className={s.profile}>
            {PROFILE.map((row) => (
              <div key={row.term} className={s.profileRow}>
                <dt>{row.term}</dt>
                <dd>{row.body}</dd>
              </div>
            ))}
          </dl>
          <p className={s.note}>
            この会社は架空です。氏名と所在地は載せていません。
          </p>
        </div>
      </section>

      <section className={`${c.section} ${c.soft}`}>
        <div className={c.container}>
          <h2 className={c.h2}>沿革</h2>
          <dl className={s.history}>
            {HISTORY.map((row) => (
              <div key={row.year} className={s.historyRow}>
                <dt>{row.year}</dt>
                <dd>{row.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={c.section}>
        <div className={c.container}>
          <h2 className={c.h2}>方針</h2>
          <ul className={s.policies}>
            {POLICIES.map((policy) => (
              <li key={policy.title}>
                <h3 className={s.policyTitle}>{policy.title}</h3>
                <p className={s.policyBody}>{policy.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
