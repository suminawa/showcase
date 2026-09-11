/*
 * 見本: 会社案内サイトの TOP。架空の海洋・環境調査の計測会社「潮見計測」。
 * 見せどころは 4 枚でも軽いことと、下層への案内の分かりやすさ。
 * 背景の波は CSS だけで動く（JavaScript を積まない）。数字は画面に入ったら数え上げる。
 */
import type { Metadata } from "next";
import Link from "next/link";

import { CountUp } from "@/components/demos/corporate/CountUp";
import { NAV_BASE } from "@/components/demos/corporate/nav";
import { NewsList } from "@/components/demos/corporate/NewsList";
import { PillarIcon } from "@/components/demos/corporate/PillarIcon";
import { PILLARS } from "@/components/demos/corporate/services";
import { formatCount, STATS } from "@/components/demos/corporate/stats";
import { WaveField } from "@/components/demos/corporate/WaveField";

import c from "./corporate.module.css";
import s from "./top.module.css";

const TITLE = "見本 ｜ 会社案内サイト";
const DESCRIPTION =
  "架空の海洋・環境調査の計測会社「潮見計測」の会社案内サイト。TOP と下層 3 枚の見本。";

export const metadata: Metadata = {
  // レイアウトの title.template（"%s | Showcase"）がタブに付け足されるのを防ぐ
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: NAV_BASE,
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

export default function CorporateTopPage() {
  return (
    <>
      <section className={s.hero}>
        <WaveField className={s.waves} />
        <div className={c.container}>
          <p className={s.heroEyebrow}>海洋・環境調査の計測</p>
          <h1 className={c.h1}>海を測り、記録を残す。</h1>
          <p className={s.heroLead}>
            水深も、流れも、水の質も。船を出して測り、設置した機器で記録を続け、図と報告書にしてお渡しします。
          </p>
          <div className={s.heroCtas}>
            <Link href={`${NAV_BASE}/services`} className={c.primary}>
              事業内容を見る
            </Link>
            <Link href={`${NAV_BASE}/contact`} className={c.secondary}>
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>

      <section className={c.section}>
        <div className={c.container}>
          <h2 className={c.h2}>三つの柱</h2>
          <ul className={s.pillars}>
            {PILLARS.map((pillar) => (
              <li key={pillar.id} className={s.pillar}>
                <PillarIcon id={pillar.id} className={s.pillarIcon} />
                <h3 className={s.pillarName}>{pillar.name}</h3>
                <p className={s.pillarBody}>{pillar.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${c.section} ${c.soft}`}>
        <div className={c.container}>
          <h2 className={c.h2}>これまでに測ったもの</h2>
          <dl className={s.stats}>
            {STATS.map((stat) => (
              <div key={stat.id} className={s.stat}>
                <dt className={s.statLabel}>{stat.label}</dt>
                <dd className={s.statValue}>
                  <CountUp target={stat.value} className={s.statNumber} />
                  <span className={s.statUnit} aria-hidden="true">
                    {stat.unit}
                  </span>
                  <span className={c.srOnly}>
                    {formatCount(stat.value)}
                    {stat.unit}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={c.section}>
        <div className={c.container}>
          <h2 className={c.h2}>お知らせ</h2>
          <NewsList />
        </div>
      </section>

      <section className={c.section}>
        <div className={c.container}>
          <div className={s.cta}>
            <div>
              <h2 className={s.ctaTitle}>
                調査のご相談は、まず内容をお聞かせください
              </h2>
              <p className={s.ctaBody}>
                測る範囲や期間が決まっていない段階でも、ご相談いただけます。現場の条件をうかがったうえで、進め方をご提案します。
              </p>
            </div>
            <Link href={`${NAV_BASE}/contact`} className={s.ctaButton}>
              お問い合わせへ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
