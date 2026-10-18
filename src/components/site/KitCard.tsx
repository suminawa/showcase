/*
 * キットのカード。セルの範囲として並べる（境目を共有する）。トップと /kits が使う。
 *
 *   ふつう … スマホは写真を左に置いた行、640px から写真が上のカード（2 列 → 3 列）
 *   large  … 看板 3 本。どの幅でも写真が上で、帳票（月額・置く時間ほか）を持つ
 *
 * 触れる・Tab で来ると、選択の枠（朱）が出る。押す先は品名のリンク一つで、カード全体に広げる。
 */
import Link from "next/link";
import { ViewTransition } from "react";

import { localProject } from "@/i18n/catalog";
import { hrefFor, type Lang } from "@/i18n/routes";
import { UI, dateLabel, money } from "@/i18n/ui";
import type { KitFact } from "@/lib/kit-facts";
import { FREE_EDITION } from "@/lib/kit-facts";
import { priceNow } from "@/lib/prices";
import { projectHref, type Project } from "@/lib/projects";

import c from "./kit-card.module.css";
import u from "./ui.module.css";

/** カードの短い言葉（値段の添え・無料版の札）。値札の本体は UI（i18n/ui.ts）と同じ出どころ */
const T: Record<Lang, { freeNote: string; tax: string; intro: (until: string, list: string) => string; freeEdition: string }> = {
  ja: {
    freeNote: "BOOTH でお配りしています",
    tax: "税込・買い切り",
    intro: (until, list) => `発売記念（${until} まで・定価 ${list}）`,
    freeEdition: "無料版あり",
  },
  en: {
    freeNote: "Free on BOOTH",
    tax: "Tax included · one-time purchase",
    intro: (until, list) => `Launch price (until ${until}, then ${list})`,
    freeEdition: "Free version available",
  },
  fr: {
    freeNote: "Gratuit sur BOOTH",
    tax: "TTC · achat unique",
    intro: (until, list) => `Prix de lancement (jusqu’au ${until}, puis ${list})`,
    freeEdition: "Version gratuite disponible",
  },
};

/** 値段の大きな字と、その下の添え。記念価格の期間中は最終日と定価を添える */
function priceParts(lang: Lang, project: Project, now?: Date): { big: string; small: string } | null {
  const sale = project.sale;
  if (!sale) return null;
  const t = T[lang];
  if (sale.status === "free") return { big: UI[lang].free, small: t.freeNote };
  if (sale.status === "onsale" && sale.price != null) {
    const p = priceNow(project.slug, sale.price, now);
    return {
      big: money(lang, p.price),
      small: p.intro ? t.intro(dateLabel(lang, p.intro.until), money(lang, p.intro.list)) : t.tax,
    };
  }
  return { big: UI[lang].upcoming, small: "" };
}

export function KitCard({
  project: source,
  lang = "ja",
  large = false,
  facts,
  showTags = false,
  eager = false,
  shot = `/kits/${source.slug}`,
  heading: Heading = "h3",
}: {
  project: Project;
  lang?: Lang;
  large?: boolean;
  facts?: KitFact[];
  showTags?: boolean;
  /** 第一画面に入るカードだけ、写真を先に読む */
  eager?: boolean;
  /** 写真の道の頭（-480.webp・-960.webp を足す）。既定はキットの写真。見本サイトは /sites/<slug> */
  shot?: string;
  /** 品名の見出しの段。棚（h2）の下では h3、題（h1）の直下に並ぶ /sites では h2 */
  heading?: "h2" | "h3";
}) {
  // 題・一行・札はその言語で（日本語はそのまま）。値段と道はレジストリのまま
  const project = localProject(lang, source);
  const price = priceParts(lang, project);
  const free = FREE_EDITION[project.slug];
  return (
    <li className={`${c.card} ${large ? c.large : ""} ${u.select}`}>
      <div className={c.shot}>
        {/* 実画面の切り抜き（scripts/kit-cards.mjs）。寸法を書いて、読み込みで行が跳ねないようにする */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${shot}-960.webp`}
          srcSet={`${shot}-480.webp 480w, ${shot}-960.webp 960w`}
          sizes={large ? "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 120px"}
          width={960}
          height={720}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          alt={UI[lang].figureAlt(project.title)}
        />
      </div>
      <div className={c.body}>
        <Heading className={c.name}>
          <Link href={hrefFor(lang, projectHref(project))} className={c.stretch}>
            {/* 品名が、品物のページの題へ伸びる（ProjectShell の h1 と同じ名） */}
            <ViewTransition name={`t-${project.slug}`} share="morph" default="none">
              <span>{project.title}</span>
            </ViewTransition>
          </Link>
        </Heading>
        <p className={c.desc}>{project.description}</p>
        {facts && (
          <dl className={`${u.spec} ${c.facts}`}>
            {facts.map((f) => (
              <div key={f.label} className={c.fact}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {showTags && project.tags.length > 0 && <p className={c.tags}>{project.tags.join(" ・ ")}</p>}
        {price && (
          <p className={c.price}>
            <span className={c.yen}>{price.big}</span>
            {price.small && <span className={c.tax}>{price.small}</span>}
            {free && !facts && <span className={c.free}>{T[lang].freeEdition}</span>}
          </p>
        )}
      </div>
    </li>
  );
}

/**
 * カードの並び。最後の段が欠けるときは、空のセルで埋める（表が途中で切れて見えないように）。
 * 空のセルは 2 列・3 列のときだけ出し、読み上げには出さない。
 */
export function KitGrid({
  children,
  count,
  large = false,
  label,
}: {
  children: React.ReactNode;
  count: number;
  large?: boolean;
  label?: string;
}) {
  const fill3 = (3 - (count % 3)) % 3;
  const fill2 = (2 - (count % 2)) % 2;
  const blanks = Math.max(fill3, fill2);
  return (
    <ul className={`${c.grid} ${large ? c.gridLarge : ""}`} aria-label={label}>
      {children}
      {Array.from({ length: blanks }, (_, i) => (
        <li key={`blank-${i}`} className={c.blank} data-c3={i < fill3} data-c2={i < fill2} aria-hidden="true" />
      ))}
    </ul>
  );
}
