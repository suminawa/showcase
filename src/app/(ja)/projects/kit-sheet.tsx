/*
 * 画面の見本をこの紙に置けないキット（LINE の中・スプレッドシートの中・手元の端末で動くもの、
 * 中身がほかの紙にあるもの）の作品ページ。料紙の頭（ProjectShell）の下に、
 * 一行の前置き → 見本（あるキットだけ。children）→ 節（できること・入っているもの…）→ 値段と売り場。
 * 節の字と箇条は悩みから読む紙と同じ（guides.module.css）。
 * 値段は projects.ts の sale.price（発売記念の期間中は prices.ts の表）から、要求のたびに組む。
 *
 * ── 売り物のページの型（2026-10-20。見直し C1〜C8。手本は /projects/deadline の content.tsx と copy.ts）────────
 * 部品は kit-parts.tsx。KitCopy に次の 2 つを足すと、このシートが型どおりに組む（無いキットは前のまま）:
 *
 *   name   品物の名（「期限アラート GAS キット」）。title は検索語と差を前にした題にし、GAS・Next.js は後ろか name へ
 *          （例「契約・車検・支払いの期限を、毎朝 1 通で」）。name は題の下に小さく出て、現在地・構造化データ・
 *          一覧のカードから伸びる名に使う。meta.title は「題｜差（品物の名）」の順。
 *   sales  KitSales（kit-parts.tsx）。ja・en・fr で同じ形（src/i18n/copy.test.ts が配列の長さまで照らす）:
 *     proof     (f) 証拠の帯 4 マス { figure, label }。購入者がいなくても確かめられる数字だけ（テストの件数・月額・
 *               実費・作者への送信 0 件・14 日の確認など）。数字は同梱物や決まりの文に出どころがあるものだけ
 *     audience  (b) { fits, notFor } 各 3〜4 行。制作会社・フリーランスには「納品可」、事務担当には「設置まで頼める」を
 *               fits に。notFor には、できないこと（例: LINE 非対応）と代わりの道（無料の道具）を正直に
 *     compare   (c) { rows: 3 行（無料の道具・標準の機能・似たサービス）, kit: このキットの行の一言, checkedOn }。
 *               各行の href は内容と費用の出どころ。4 行目と「足りる方には無料をおすすめ」の一行は部品が足す
 *     steps     (g) つまずきの手順 [{ heading, intro, items, after }]。画面の言葉のまま（手順書 README.ja.md から写す）。
 *               GAS・AI 系は「Google で確認されていません」の画面、API キーの取得・カード登録など。1〜2 組（2 組で PC は 2 列）
 *
 * 値段の文は copy に書かない。部品が projects.ts から組む:
 *   (a) KitOffer（頭の右の箱: 値段・「BOOTH で買う」「note で読む」・設置込みの総額・無料版）と
 *       KitBuyBar（スマホの下の帯）。ProjectShell の aside と bar に渡す（bar があるとスマホでは aside を出さない）
 *   (d) KitPricing: キットだけ／設置まで頼む（総額 ＝ キット税込 ＋ sale.service.price 税別に 10%）／無料版。
 *       設置代行の値段は projects.ts のその品物の sale.service.price（税別・「から」）を正にする。無いキットは総額の行を出さない
 *   (e) KitReceipt: 領収書・インボイスの一節（文は kit-parts.tsx に固定。KitPricing の中に出る）
 *
 * 見本のあるページ（ProjectShell を直に使うページ）は、deadline/content.tsx のとおりに並べる:
 *   <ProjectShell title name lede aside={<KitOffer/>} bar={<KitBuyBar/>}> 見本 → <KitSales/> → 結び（KitClose は compare={false}）
 * 1 画面目に結果の画面を出すため、頭の帳票（KitFacts）は外し、見本は頭のすぐ下に置く。英仏も同じ部品を通る。
 * 確かめ: 375px で横にはみ出さない・1280×900 で結果の画面が見え始める（Playwright でスクリーンショット）。
 */
import { projectPriceNow } from "@/i18n/catalog";
import type { Lang } from "@/i18n/routes";
import { listOf, longDate, money } from "@/i18n/ui";
import type { LinkKey } from "@/lib/go";

import g from "../guides/guides.module.css";
import {
  ProjectShell,
  PurchaseNote,
  ShopEmbed,
  ShopLinks,
  projectMetadata,
  type PageMeta,
} from "./shell";
import { KitBuyBar, KitOffer, KitSales, type KitSales as KitSalesCopy } from "./kit-parts";
import s from "./projects.module.css";

export type KitSection = { heading: string; text?: string[]; list?: string[] };

export type KitCopy = {
  meta: PageMeta;
  /** 品物の名。title を検索語の題にしたときに持つ（上のコメント） */
  name?: string;
  title: string;
  lede: string;
  intro: string;
  sections: KitSection[];
  buyHeading: string;
  /** 値段の一文のあと、売り場への道の前に置く一文 */
  buy: string;
  /** 設定ごと頼めるときの一文（あるキットだけ） */
  service?: string;
  /** 売り物のページの型（上のコメント）。あると購入の箱・帯・証拠・誰向け・比較・値段・つまずきを出す */
  sales?: KitSalesCopy;
};

export const kitMetadata = (lang: Lang, slug: string, copy: KitCopy) =>
  projectMetadata(lang, slug, copy.meta);

function priceSentence(lang: Lang, slug: string): string {
  const p = projectPriceNow(slug);
  const list = money(lang, listOf(p));
  if (lang === "en") {
    return `${list} (tax included), one-time purchase.${p.intro ? ` Launch price ${money(lang, p.price)} until ${longDate(lang, p.intro.until)}.` : ""}`;
  }
  if (lang === "fr") {
    return `${list} TTC, achat unique.${p.intro ? ` Prix de lancement ${money(lang, p.price)} jusqu’au ${longDate(lang, p.intro.until)}.` : ""}`;
  }
  return `${list}（税込）の買い切りです。${p.intro ? `${longDate(lang, p.intro.until)}までは発売記念の ${money(lang, p.price)} です。` : ""}`;
}

export function KitSheet({
  lang,
  slug,
  latin,
  linkKey,
  copy: t,
  children,
}: {
  lang: Lang;
  slug: string;
  latin: string;
  linkKey: LinkKey;
  copy: KitCopy;
  /** 見本（ほかの紙にある実物への道、記録の再生の写しなど）。無いキットは置かない */
  children?: React.ReactNode;
}) {
  return (
    <ProjectShell
      lang={lang}
      slug={slug}
      title={t.title}
      name={t.name}
      latin={latin}
      lede={t.lede}
      aside={t.sales && <KitOffer lang={lang} slug={slug} linkKey={linkKey} />}
      bar={t.sales && <KitBuyBar lang={lang} slug={slug} linkKey={linkKey} />}
    >
      <p className={s.lede}>{t.intro}</p>
      {children}
      {t.sections.map((sec) => (
        <section key={sec.heading} className={g.section}>
          <h2 className={g.heading}>{sec.heading}</h2>
          {sec.text?.map((p) => (
            <p key={p} className={g.text}>
              {p}
            </p>
          ))}
          {sec.list && (
            <ul className={g.list}>
              {sec.list.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
      {t.sales && <KitSales lang={lang} slug={slug} name={t.name ?? t.title} linkKey={linkKey} copy={t.sales} />}
      <section className={g.section}>
        <h2 className={g.heading}>{t.buyHeading}</h2>
        <p className={g.text}>
          {priceSentence(lang, slug)}
          {t.buy}
          <ShopLinks lang={lang} slug={slug} linkKey={linkKey} />
        </p>
        <ShopEmbed linkKey={linkKey} />
        <PurchaseNote lang={lang} className={g.text} />
        {t.service && <p className={g.text}>{t.service}</p>}
      </section>
    </ProjectShell>
  );
}
