/*
 * 紙をまたいで使う短い言葉。日本語は今の紙の字そのまま。
 * 値段の書き方（円の区切り・日付）もここ。値そのものは src/lib/prices.ts と projects.ts から引く。
 */
import { yen } from "@/lib/prices";

import type { Lang } from "./routes";

export const UI = {
  ja: {
    back: "Showcase へ戻る",
    languages: "言語",
    categories: "分類",
    closeText: "ご用途に合わせた制作もお引き受けします。",
    closeCta: "料金の目安と進め方を見る",
    figureAlt: (title: string) => `${title}の画面`,
    free: "無料の見本",
    upcoming: "発売前",
    onsale: (price: string) => `発売中 ${price}`,
    intro: (price: string, until: string, list: string) => `発売記念 ${price}（${until} まで・定価 ${list}）`,
    launch: (date: string, price: string) => `${date} 発売予定 ${price}`,
    count: (total: number, onsale: number) => (onsale > 0 ? `${total} 件　発売中 ${onsale} 件` : `${total} 件`),
  },
  en: {
    back: "Back to Showcase",
    languages: "Language",
    categories: "Categories",
    closeText: "Custom builds for your own use case are welcome too.",
    closeCta: "See pricing and how it works",
    figureAlt: (title: string) => `Screenshot of ${title}`,
    free: "Free sample",
    upcoming: "Coming soon",
    onsale: (price: string) => price,
    intro: (price: string, until: string, list: string) => `Launch price ${price} (until ${until}, then ${list})`,
    launch: (date: string, price: string) => `Launching ${date} · ${price}`,
    count: (total: number, onsale: number) =>
      onsale > 0 ? `${total} items · ${onsale} on sale` : `${total} items`,
  },
  fr: {
    back: "Retour à Showcase",
    languages: "Langue",
    categories: "Catégories",
    closeText: "Réalisations sur mesure possibles, selon vos besoins.",
    closeCta: "Voir les tarifs et le déroulement",
    figureAlt: (title: string) => `Capture d’écran : ${title}`,
    free: "Exemple gratuit",
    upcoming: "Bientôt disponible",
    onsale: (price: string) => price,
    intro: (price: string, until: string, list: string) =>
      `Prix de lancement ${price} (jusqu’au ${until}, puis ${list})`,
    launch: (date: string, price: string) => `Sortie prévue le ${date} · ${price}`,
    count: (total: number, onsale: number) =>
      onsale > 0 ? `${total} articles · ${onsale} en vente` : `${total} articles`,
  },
} satisfies Record<Lang, unknown>;

/** 英仏の紙にだけ出す、買い方の断り（売るのは日本語の売り場・円のまま） */
export const PURCHASE_NOTE: Record<Exclude<Lang, "ja">, string> = {
  en: "Purchases are made in Japanese on BOOTH or note, and priced in Japanese yen.",
  fr: "L’achat se fait en japonais sur BOOTH ou note, avec paiement en yens.",
};

/** 円の書き方。日本語と英語は「¥9,800」、仏語は「9 800 ¥」 */
export function money(lang: Lang, price: number): string {
  if (lang !== "fr") return yen(price);
  return `${String(price).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ¥`;
}

const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FR_MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

/** 「2026-10-02」→ 10/2・Oct 2・2 oct. */
export function dateLabel(lang: Lang, iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  if (lang === "en") return `${EN_MONTHS[m - 1]} ${d}`;
  if (lang === "fr") return `${d} ${FR_MONTHS[m - 1]}`;
  return `${m}/${d}`;
}
