/*
 * 売り物のキットのページの部品（2026-10-20。見直し C1〜C8 の型。手本は /projects/deadline）。
 * 使い方と KitCopy の書き方は kit-sheet.tsx の頭のコメントにある。ここは部品だけ。
 *
 *   KitOffer    (a) 頭の右の購入の箱: 値段 → 「BOOTH で買う」「note で読む」→ 設置込みの総額への一行 → 無料版
 *               制作会社用のライセンス（projects.ts の sale.agency）があるキットは、値段の下に 2 つのライセンスの表
 *   KitBuyBar   (a) スマホで画面の下に留める帯: 値段と 2 つの押す先（ProjectShell の bar に渡す）
 *   KitAudience (b) 向いている方／向いていない方の 2 列
 *   KitCompare  (c) 4 行の比較表（無料・標準の機能・似たサービス・このキット）と「無料をおすすめ」の一行
 *   KitPricing  (d) 設置込みの一本の値段（キット ＋ 設置代行 ＝ 総額）。設置代行は projects.ts の sale.service.price（税別）
 *   KitReceipt  (e) 領収書・インボイスの一節（文は全キット共通。ここにだけ書く）
 *   KitProof    (f) 証拠の帯（テストの件数・月額など、購入者がいなくても確かめられる数字）
 *   KitSteps    (g) つまずきやすいところの手順（「Google で確認されていません」の画面など。文だけ。画像は後日）
 *   KitSales    (b)〜(g) をこの順に並べたもの: 証拠 → 誰向け → 比較 → 値段（＋領収書）→ つまずき
 *
 * 値段はすべて projects.ts（と prices.ts の記念価格）から要求のたびに組む。文に値段を書かない。
 * 売り場への道は /go/ を通す（links.json の鍵）。
 */
import Image from "next/image";
import Link from "next/link";

import u from "@/components/site/ui.module.css";
import { projectPriceNow } from "@/i18n/catalog";
import { hrefFor, localePath, type Lang } from "@/i18n/routes";
import { PURCHASE_NOTE, dateLabel, money } from "@/i18n/ui";
import { goHref, type LinkKey } from "@/lib/go";
import { FREE_EDITION } from "@/lib/kit-facts";
import { kitSetListTotal, projects, setsFor } from "@/lib/projects";

import p from "./kit-parts.module.css";

/* ---- 文の型（各ページの copy.ts が持つ。ja・en・fr で同じ形） ------------------- */

/** (b) 誰向け。各 3〜4 行。向いていない方には、代わりの道（無料の道具・設置の依頼）を添える */
export type KitAudienceCopy = { fits: string[]; notFor: string[] };

/** (f) 証拠の帯の 1 マス。figure は大きな字（「158 件」）、label はその説明。4 つ（スマホ 2 列・PC 4 列で欠けない数） */
export type KitProofItem = { figure: string; label: string };

/** (c) 比べる相手 1 行。kind は「無料の道具」「標準の機能」「似たサービス」。href は内容と費用の出どころ（ピボットのような一般の手立てで、出どころのページが無い行だけ省く） */
export type KitCompareRow = { kind: string; name: string; href?: string; cost: string; note: string };

/** (c) 比較表。rows は 3 行（無料・標準の機能・似たサービス）、4 行目の「このキット」は部品が値段から組む */
export type KitCompareCopy = {
  rows: KitCompareRow[];
  /** 「このキット」の行の、できること・違い */
  kit: string;
  /** 比べる相手のページを読んだ日（「2026-09-29」） */
  checkedOn: string;
  /** 「このキット」の行の費用の文。値段を持たない無料の品物（mcp-server）だけが書く。無ければ値段から組む */
  kitCost?: string;
};

/** (g) つまずきの手順 1 組。items は画面の言葉のままの手順（1 行 1 手） */
export type KitStepImage = { src: string; alt: string; width: number; height: number };
export type KitStepGroup = { heading: string; intro: string; items: string[]; after: string; image?: KitStepImage };


export type KitSales = {
  audience: KitAudienceCopy;
  proof: KitProofItem[];
  compare: KitCompareCopy;
  steps: KitStepGroup[];
};

/* ---- 部品が持つ決まりの文 ------------------------------------------------------- */

const T = {
  ja: {
    buy: "BOOTH で買う",
    read: "note で読む",
    barBuy: "BOOTH で買う",
    barRead: "note で読む",
    tax: "税込・買い切り",
    intro: (until: string, list: string) => `${until} までの発売記念の値です（定価 ${list}）。`,
    toTotal: (total: string) => `設置まで頼むと、合計 ${total}〜（税込）`,
    toTotalAlone: (total: string) => `制作ごと頼むと ${total}〜（税込。テンプレの購入は不要）`,
    inSet: (name: string, price: string, total: string) => `${name}なら ${price}（税込。単品の合計 ${total}）。BOOTH の同じページで選べます`,
    free: "無料版を受け取る（BOOTH）",
    bar: "購入",
    audience: "向いている方・向いていない方",
    fits: "向いている方",
    notFor: "向いていない方",
    proof: "購入の前に確かめられること",
    compare: "ほかの方法と比べる",
    cols: ["種類", "名前", "費用", "できること・違い"],
    kitKind: "このキット",
    recommend: "無料の道具で足りる方には、そちらをおすすめします。",
    checked: (date: string) => `ほかの方法の内容と費用は、${date} に各社のページで確かめたものです。`,
    pricing: "お値段",
    kitOnly: "キットだけ（ご自身で貼る）",
    withSetup: "設置まで頼む",
    total: (total: string) => `合計 ${total}〜（税込）`,
    breakdown: (kit: string, svcIn: string, svc: string) => `キット ${kit} ＋ 設置代行 ${svcIn}〜（税別 ${svc}〜）`,
    breakdownAlone: (svcIn: string, svc: string) => `制作 ${svcIn}〜（税別 ${svc}〜）。テンプレをお求めいただく必要はありません`,
    ask: "設置を頼む（ご相談の窓口へ）",
    freeRow: "無料版",
    freeValue: "0 円",
    receipt: "領収書・インボイス",
    receiptText: "宛名入りの領収書は BOOTH の購入履歴から発行できます。適格請求書発行事業者ではありません（消費税の仕入税額控除の対象になりません）。",
    steps: "つまずきやすいところ",
    personal: "個人・社内用",
    agency: "制作会社用",
    agencyNote: "複数人で共有・案件数の上限なし。BOOTH の同じページで選べます",
    agencyShort: "複数人で共有・案件数の上限なし",
    advisor: "社労士・制作会社用",
    advisorNote: "顧問先・取引先のスプレッドシートに設置して渡せます。設置する先の数に上限はありません。BOOTH の同じページで選べます",
    advisorShort: "顧問先に設置して渡せる",
  },
  en: {
    buy: "Buy on BOOTH",
    read: "Read on note",
    barBuy: "Buy (BOOTH)",
    barRead: "Read (note)",
    tax: "tax included, one-time purchase",
    intro: (until: string, list: string) => `Launch price until ${until} (regular price ${list}).`,
    toTotal: (total: string) => `With setup done for you: from ${total} in total (tax incl.)`,
    toTotalAlone: (total: string) => `Have it built for you: from ${total} (tax incl.; no template purchase needed)`,
    inSet: (name: string, price: string, total: string) => `${name}: ${price} (tax incl.; ${total} separately), on the same BOOTH page`,
    free: "Get the free version (BOOTH)",
    bar: "Purchase",
    audience: "Who it’s for, and who it isn’t",
    fits: "A good fit if you",
    notFor: "Not the right fit if you",
    proof: "What you can check before buying",
    compare: "Compared with other options",
    cols: ["Type", "Name", "Cost", "What it does / how it differs"],
    kitKind: "This kit",
    recommend: "If a free tool covers your needs, we recommend using it.",
    checked: (date: string) => `Features and costs of the other options were checked on each vendor’s site on ${date}.`,
    pricing: "Price",
    kitOnly: "Kit only (you install it)",
    withSetup: "Setup done for you",
    total: (total: string) => `From ${total} in total (tax incl.)`,
    breakdown: (kit: string, svcIn: string, svc: string) => `Kit ${kit} + setup from ${svcIn} (${svc} before tax)`,
    breakdownAlone: (svcIn: string, svc: string) => `Build from ${svcIn} (${svc} before tax). You do not need to buy the template`,
    ask: "Request setup (contact page)",
    freeRow: "Free version",
    freeValue: "¥0",
    receipt: "Receipts and invoices",
    receiptText: "A receipt with your company name can be issued from your BOOTH purchase history. We are not a registered qualified invoice issuer under Japan’s invoice system, so the purchase does not qualify for a consumption tax input credit.",
    steps: "Where people usually get stuck",
    personal: "Personal / in-house",
    agency: "Agency",
    agencyNote: "Shared by a team, no limit on projects. Choose it on the same BOOTH page",
    agencyShort: "Shared by a team, unlimited projects",
    advisor: "Payroll advisor / agency",
    advisorNote: "Install it in your clients’ spreadsheets and hand it over, with no limit on the number of clients. Choose it on the same BOOTH page",
    advisorShort: "Install it for your clients",
  },
  fr: {
    buy: "Acheter sur BOOTH",
    read: "Lire sur note",
    barBuy: "Acheter",
    barRead: "Lire (note)",
    tax: "TTC, achat unique",
    intro: (until: string, list: string) => `Prix de lancement jusqu’au ${until} (prix normal ${list}).`,
    toTotal: (total: string) => `Avec installation : à partir de ${total} au total (TTC)`,
    toTotalAlone: (total: string) => `Réalisation complète : à partir de ${total} (TTC, sans acheter le modèle)`,
    inSet: (name: string, price: string, total: string) => `${name} : ${price} (TTC ; ${total} séparément), sur la même page BOOTH`,
    free: "Obtenir la version gratuite (BOOTH)",
    bar: "Achat",
    audience: "À qui il s’adresse, et à qui non",
    fits: "Il vous convient si vous",
    notFor: "Il ne vous convient pas si vous",
    proof: "Ce que vous pouvez vérifier avant d’acheter",
    compare: "Comparé aux autres solutions",
    cols: ["Type", "Nom", "Coût", "Ce qu’il fait / la différence"],
    kitKind: "Ce kit",
    recommend: "Si un outil gratuit vous suffit, nous vous le recommandons.",
    checked: (date: string) => `Le contenu et le coût des autres solutions ont été vérifiés sur le site de chaque éditeur le ${date}.`,
    pricing: "Prix",
    kitOnly: "Kit seul (vous l’installez)",
    withSetup: "Installation comprise",
    total: (total: string) => `À partir de ${total} au total (TTC)`,
    breakdown: (kit: string, svcIn: string, svc: string) => `Kit ${kit} + installation à partir de ${svcIn} (${svc} HT)`,
    breakdownAlone: (svcIn: string, svc: string) => `Réalisation à partir de ${svcIn} (${svc} HT). Pas besoin d’acheter le modèle`,
    ask: "Demander l’installation (page de contact)",
    freeRow: "Version gratuite",
    freeValue: "0 ¥",
    receipt: "Reçus et factures",
    receiptText: "Un reçu à votre nom peut être émis depuis votre historique d’achats BOOTH. Nous ne sommes pas émetteur de factures qualifiées au sens du système japonais : l’achat n’ouvre pas droit à la déduction de la taxe à la consommation.",
    steps: "Là où l’on bloque le plus souvent",
    personal: "Personnelle / interne",
    agency: "Agence",
    agencyNote: "Partagée par une équipe, sans limite de projets. À choisir sur la même page BOOTH",
    agencyShort: "Équipe, projets illimités",
    advisor: "Cabinet de paie / agence",
    advisorNote: "À installer dans les tableurs de vos clients et à leur remettre, sans limite de clients. À choisir sur la même page BOOTH",
    advisorShort: "À installer chez vos clients",
  },
} satisfies Record<Lang, unknown>;

/* ---- 値段 --------------------------------------------------------------------- */

/** 設置代行の税込（税別の 10% を足す。円未満なし） */
const withTax = (price: number) => Math.round((price * 110) / 100);

/**
 * キットのいまの値段と、設置込みの総額（設置代行の値段があるキットだけ）。
 * 総額 ＝ キット（税込）＋ 設置代行（税別 sale.service.price に 10%）
 */
export function kitTotals(slug: string, now?: Date) {
  const kit = projectPriceNow(slug, now).price;
  const sale = projects.find((x) => x.slug === slug)?.sale;
  // 制作会社用のライセンス（BOOTH の 2 つめの選択肢。あるキットだけ）
  const agency = sale?.agency?.price;
  // 社労士・制作会社用（顧問先に設置して渡せる）か、制作会社用（複数人で共有）か。名前と説明の文を分ける
  const advisor = sale?.agency?.kind === "advisor";
  const service = sale?.service?.price;
  if (service == null) return { kit, agency, advisor };
  // standalone（制作を頼む）はキットを買わなくてよいので、総額にキットを足さない
  const standalone = sale?.service?.standalone === true;
  return { kit, agency, advisor, service, standalone, serviceInTax: withTax(service), total: (standalone ? 0 : kit) + withTax(service) };
}

const from = (lang: Lang, slug: string) => localePath(lang, `/projects/${slug}`);

/* ---- (a) 頭の右の購入の箱・スマホの帯 ------------------------------------------- */

export function KitOffer({ lang, slug, linkKey }: { lang: Lang; slug: string; linkKey: LinkKey }) {
  const t = T[lang];
  const v = kitTotals(slug);
  const freeKey = FREE_EDITION[slug];
  const intro = projectPriceNow(slug).intro;
  return (
    <div className={p.offer}>
      {v.agency == null ? (
        <p className={p.price}>
          <span className={p.yen}>{money(lang, v.kit)}</span>
          <span className={p.tax}>{t.tax}</span>
        </p>
      ) : (
        <Licenses lang={lang} kit={v.kit} agency={v.agency} advisor={v.advisor} />
      )}
      {intro && <p className={p.small}>{t.intro(dateLabel(lang, intro.until), money(lang, intro.list))}</p>}
      <div className={p.buttons}>
        <a href={goHref(linkKey, "booth", from(lang, slug))} rel="nofollow" className={u.btn}>
          {t.buy}
        </a>
        <a href={goHref(linkKey, "note", from(lang, slug))} rel="nofollow" className={u.btnGhost}>
          {t.read}
        </a>
      </div>
      <ul className={p.more}>
        {v.total != null && (
          <li>
            <a href="#price" className={u.linkLine}>
              {v.standalone ? t.toTotalAlone(money(lang, v.total)) : t.toTotal(money(lang, v.total))}
            </a>
          </li>
        )}
        {freeKey && (
          <li>
            <a href={goHref(freeKey, "booth", from(lang, slug))} rel="nofollow" className={u.linkLine}>
              {t.free}
            </a>
          </li>
        )}
        {setsFor(slug).map((set) => (
          <li key={set.id}>
            <a href={goHref(linkKey, "booth", from(lang, slug))} rel="nofollow" className={u.linkLine}>
              {t.inSet(lang === "ja" ? set.name : set.names[lang], money(lang, set.price), money(lang, kitSetListTotal(set)))}
            </a>
          </li>
        ))}
      </ul>
      {lang !== "ja" && <p className={p.small}>{PURCHASE_NOTE[lang]}</p>}
    </div>
  );
}

/** 個人・社内用と制作会社用の 2 つのライセンスの値段（BOOTH の 2 つの選択肢）。購入の箱で、値段の大きな字の代わりに出す */
function Licenses({ lang, kit, agency, advisor }: { lang: Lang; kit: number; agency: number; advisor: boolean }) {
  const t = T[lang];
  return (
    <dl className={p.licenses}>
      <dt>
        {t.personal}
        <span className={p.licenseNote}>{t.tax}</span>
      </dt>
      <dd className={p.yen}>{money(lang, kit)}</dd>
      <dt>
        {advisor ? t.advisor : t.agency}
        <span className={p.licenseNote}>{advisor ? t.advisorShort : t.agencyShort}</span>
      </dt>
      <dd>{money(lang, agency)}</dd>
    </dl>
  );
}

export function KitBuyBar({ lang, slug, linkKey }: { lang: Lang; slug: string; linkKey: LinkKey }) {
  const t = T[lang];
  return (
    <div className={p.bar} role="region" aria-label={t.bar}>
      <p className={p.barPrice}>
        {money(lang, kitTotals(slug).kit)}
        <span className={p.barTax}>{t.tax}</span>
      </p>
      <a href={goHref(linkKey, "booth", from(lang, slug))} rel="nofollow" className={u.btn}>
        {t.barBuy}
      </a>
      <a href={goHref(linkKey, "note", from(lang, slug))} rel="nofollow" className={u.btnGhost}>
        {t.barRead}
      </a>
    </div>
  );
}

/* ---- (b) 誰向け --------------------------------------------------------------- */

export function KitAudience({ lang, copy }: { lang: Lang; copy: KitAudienceCopy }) {
  const t = T[lang];
  return (
    <section className={p.section} aria-labelledby="kit-audience">
      <h2 id="kit-audience" className={p.h2}>
        {t.audience}
      </h2>
      <div className={p.pair}>
        <div className={p.cell}>
          <h3 className={p.h3}>{t.fits}</h3>
          <ul className={p.list}>
            {copy.fits.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div className={p.cell}>
          <h3 className={p.h3}>{t.notFor}</h3>
          <ul className={p.list}>
            {copy.notFor.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---- (c) 比較表 --------------------------------------------------------------- */

export function KitCompare({ lang, slug, name, copy }: { lang: Lang; slug: string; name: string; copy: KitCompareCopy }) {
  const t = T[lang];
  const [cKind, cName, cCost, cNote] = t.cols;
  const date = lang === "ja" ? copy.checkedOn.replace(/-/g, "/") : `${dateLabel(lang, copy.checkedOn)}${lang === "en" ? "," : ""} ${copy.checkedOn.slice(0, 4)}`;
  return (
    <section className={p.section} aria-labelledby="kit-compare">
      <h2 id="kit-compare" className={p.h2}>
        {t.compare}
      </h2>
      <table className={p.table}>
        <thead>
          <tr>
            {t.cols.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {copy.rows.map((row) => (
            <tr key={row.name}>
              <th scope="row" data-label={cKind}>
                {row.kind}
              </th>
              <td data-label={cName}>
                {row.href ? (
                  <a href={row.href} className={u.link} rel="noopener noreferrer">
                    {row.name}
                  </a>
                ) : (
                  row.name
                )}
              </td>
              <td data-label={cCost}>{row.cost}</td>
              <td data-label={cNote}>{row.note}</td>
            </tr>
          ))}
          <tr className={p.mine}>
            <th scope="row" data-label={cKind}>
              {t.kitKind}
            </th>
            <td data-label={cName}>{name}</td>
            <td data-label={cCost}>{copy.kitCost ?? `${money(lang, kitTotals(slug).kit)}（${t.tax}）`}</td>
            <td data-label={cNote}>{copy.kit}</td>
          </tr>
        </tbody>
      </table>
      <p className={p.recommend}>{t.recommend}</p>
      <p className={p.small}>{t.checked(date)}</p>
    </section>
  );
}

/* ---- (d) 設置込みの値段 ＋ (e) 領収書 --------------------------------------------- */

export function KitPricing({ lang, slug, linkKey }: { lang: Lang; slug: string; linkKey: LinkKey }) {
  const t = T[lang];
  const v = kitTotals(slug);
  const freeKey = FREE_EDITION[slug];
  return (
    <section className={p.section} aria-labelledby="price">
      <h2 id="price" className={p.h2}>
        {t.pricing}
      </h2>
      <dl className={`${u.spec} ${p.spec}`}>
        <dt>{t.kitOnly}</dt>
        <dd>
          <span className={p.figure}>{money(lang, v.kit)}</span>（{t.tax}）{" "}
          <a href={goHref(linkKey, "booth", from(lang, slug))} rel="nofollow" className={u.linkLine}>
            {t.buy}
          </a>
        </dd>
        {v.agency != null && (
          <>
            <dt>{v.advisor ? t.advisor : t.agency}</dt>
            <dd>
              <span className={p.figure}>{money(lang, v.agency)}</span>（{t.tax}）
              <span className={p.breakdown}>{v.advisor ? t.advisorNote : t.agencyNote}</span>
            </dd>
          </>
        )}
        {v.total != null && (
          <>
            <dt>{t.withSetup}</dt>
            <dd>
              <span className={p.figure}>{t.total(money(lang, v.total))}</span>
              <span className={p.breakdown}>{v.standalone ? t.breakdownAlone(money(lang, v.serviceInTax), money(lang, v.service)) : t.breakdown(money(lang, v.kit), money(lang, v.serviceInTax), money(lang, v.service))}</span>
              <Link href={hrefFor(lang, "/contact")} className={u.linkLine}>
                {t.ask}
              </Link>
            </dd>
          </>
        )}
        {freeKey && (
          <>
            <dt>{t.freeRow}</dt>
            <dd>
              <span className={p.figure}>{t.freeValue}</span>{" "}
              <a href={goHref(freeKey, "booth", from(lang, slug))} rel="nofollow" className={u.linkLine}>
                {t.free}
              </a>
            </dd>
          </>
        )}
      </dl>
      <KitReceipt lang={lang} />
    </section>
  );
}

export function KitReceipt({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <div className={p.receipt}>
      <h3 className={p.h3}>{t.receipt}</h3>
      <p className={p.body}>{t.receiptText}</p>
    </div>
  );
}

/* ---- (f) 証拠の帯 ------------------------------------------------------------- */

export function KitProof({ lang, items }: { lang: Lang; items: KitProofItem[] }) {
  return (
    <section className={p.proof} aria-label={T[lang].proof}>
      <ul className={p.proofList}>
        {items.map((it) => (
          <li key={it.label} className={p.proofCell}>
            <span className={p.proofFigure}>{it.figure}</span>
            <span className={p.proofLabel}>{it.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---- (g) つまずきの手順 --------------------------------------------------------- */

export function KitSteps({ lang, groups }: { lang: Lang; groups: KitStepGroup[] }) {
  return (
    <section className={p.section} aria-labelledby="kit-steps">
      <h2 id="kit-steps" className={p.h2}>
        {T[lang].steps}
      </h2>
      <div className={p.pair}>
        {groups.map((g) => (
          <div key={g.heading} className={p.cell}>
            <h3 className={p.h3}>{g.heading}</h3>
            <p className={p.body}>{g.intro}</p>
            <ol className={p.steps}>
              {g.items.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
            {g.image ? (
              <a className={p.stepImage} href={g.image.src} target="_blank" rel="noopener">
                <Image src={g.image.src} alt={g.image.alt} width={g.image.width} height={g.image.height} sizes="(max-width: 768px) 100vw, 560px" />
              </a>
            ) : null}
            <p className={p.body}>{g.after}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---- (b)〜(g) をまとめて --------------------------------------------------------- */

export function KitSales({
  lang,
  slug,
  name,
  linkKey,
  copy,
}: {
  lang: Lang;
  slug: string;
  name: string;
  linkKey: LinkKey;
  copy: KitSales;
}) {
  return (
    <>
      <KitProof lang={lang} items={copy.proof} />
      <KitAudience lang={lang} copy={copy.audience} />
      <KitCompare lang={lang} slug={slug} name={name} copy={copy.compare} />
      <KitPricing lang={lang} slug={slug} linkKey={linkKey} />
      <KitSteps lang={lang} groups={copy.steps} />
    </>
  );
}
