/*
 * THESIS: 汎用の Sheets MCP との差（台帳の決まりを AI に守らせる）を題で言い、会話の再生を頭のすぐ下で見せる（Operate）。
 *   売り物のキットのページの型（kit-parts.tsx。手本は /projects/deadline）を、無料の品物に合わせて組む:
 *   頭: 題は検索語（Google Sheets MCP）と差、品物の名は題の下。右に受け取りの箱（無料・BOOTH・note）。スマホは下の帯。
 *   1 画面目の下: 会話の再生 → 証拠 → 誰向け → 比較 → 仕組み → しないこと → 雛形（定義と 2 表）→ 使い始めるまで
 *   → つまずき → 無料版でできないこと（有料 3 本の値段つきのカード・領収書）→ 受け取り方と設定のご依頼。
 *   値段を持たないので、設置込みの総額（KitPricing）は出さない。有料のキットの値段は projects.ts から組む。
 * 実物の MCP サーバーはブラウザでは動かないので、キットを見本のデータで動かして記録したやり取りを 1 手ずつ再生する（Replay）。
 * FORM: 方眼（DESIGN.md）。節の字と表は kit-parts.module.css、再生の中は mcp-server.module.css。
 * このページはサーバー部品のまま。再生（Replay）とコピー（CopyButton）だけが "use client"。
 */
import Link from "next/link";

import u from "@/components/site/ui.module.css";
import { localProject, projectPriceNow } from "@/i18n/catalog";
import { hrefFor, localePath, type Lang } from "@/i18n/routes";
import { money } from "@/i18n/ui";
import { goHref } from "@/lib/go";
import { KIT_SET, kitSetListTotal, projects } from "@/lib/projects";

import { KitAudience, KitCompare, KitProof, KitReceipt, KitSteps } from "../kit-parts";
import p from "../kit-parts.module.css";
import { ProjectShell, Rich, ShopEmbed, ShopLinks, projectMetadata } from "../shell";
import { copy } from "./copy";
import { CopyButton } from "./CopyButton";
import { Diagram } from "./Diagram";
import m from "./mcp-server.module.css";
import { Replay } from "./Replay";

/** キットを MCP_DEMO=1 で起こし、stdio で tools/list と tools/call を記録したもの */
const RECORDING_SRC = "/demos/mcp-server/exchanges.json";

/** BOOTH・note の鍵（links.json） */
const LINK = "mcp-server";

const DOWNLOAD: Record<Lang, string> = { ja: "受け取り", en: "Download", fr: "Téléchargement" };

/**
 * 「定義」と 2 表の雛形。キットの samples/sheet-app/*.csv から、LINE と住所などを外して短くしたもの。
 * 見出しはキットが日本語のまま読むので、英仏の紙でも日本語のまま出す。コピーはタブ区切り（スプレッドシートに貼ると列に分かれる）
 */
const TEMPLATE: { sheet: string; rows: string[][] }[] = [
  {
    sheet: "定義",
    rows: [
      ["テーブル", "列", "型", "必須", "選択肢", "一覧", "検索", "既定値", "説明"],
      ["顧客", "会社名", "文字", "TRUE", "", "", "", "", "法人名。個人は氏名"],
      ["顧客", "担当者", "文字", "", "", "", "", "", "先方のご担当者の姓"],
      ["顧客", "状況", "選択", "", "見込み, 取引中, 休眠", "", "", "見込み", ""],
      ["顧客", "メール", "メール", "", "", "FALSE", "", "", ""],
      ["顧客", "電話", "電話", "", "", "", "", "", ""],
      ["顧客", "最終連絡日", "日付", "", "", "", "", "今日", ""],
      ["顧客", "メモ", "長文", "", "", "FALSE", "", "", ""],
      ["対応履歴", "顧客", "参照:顧客", "TRUE", "", "", "", "", ""],
      ["対応履歴", "日付", "日付", "TRUE", "", "", "", "今日", ""],
      ["対応履歴", "種別", "選択", "TRUE", "電話, 訪問, メール, 打ち合わせ, その他", "", "", "電話", ""],
      ["対応履歴", "内容", "長文", "TRUE", "", "", "", "", ""],
      ["対応履歴", "次回対応日", "日付", "", "", "", "", "", ""],
    ],
  },
  {
    sheet: "顧客",
    rows: [["ID", "会社名", "担当者", "状況", "メール", "電話", "最終連絡日", "メモ", "作成日時", "更新日時", "更新者"]],
  },
  {
    sheet: "対応履歴",
    rows: [["ID", "顧客", "日付", "種別", "内容", "次回対応日", "作成日時", "更新日時", "更新者"]],
  },
];

/** 手順書（README.ja.md の 5・6 章）と同じ字。copy.ts の snippets と同じ順 */
const SNIPPETS = [
  `{ "mcpServers": { "sheets": { "command": "/usr/local/bin/node", "args": ["/Users/you/mcp-server-kit/dist/stdio.js"] } } }`,
  "GOOGLE_SERVICE_ACCOUNT_FILE=service-account.json\nSHEET_APP_SPREADSHEET=https://docs.google.com/spreadsheets/d/xxxxxxxx/edit",
  "npm run check",
];

const tsv = (rows: string[][]) => rows.map((r) => r.join("\t")).join("\n");

export const metadataFor = (lang: Lang) => projectMetadata(lang, "mcp-server", copy[lang].meta, false);

function FreeOffer({ lang }: { lang: Lang }) {
  const t = copy[lang].offer;
  const from = localePath(lang, "/projects/mcp-server");
  return (
    <div className={p.offer}>
      <p className={p.price}>
        <span className={p.yen}>{t.free}</span>
        <span className={p.tax}>{t.freeNote}</span>
      </p>
      <div className={p.buttons}>
        <a href={goHref(LINK, "booth", from)} rel="nofollow" className={u.btn}>
          {t.get}
        </a>
        <a href={goHref(LINK, "note", from)} rel="nofollow" className={u.btnGhost}>
          {t.read}
        </a>
      </div>
      <ul className={p.more}>
        <li>
          <a href="#paid" className={u.linkLine}>
            {t.toPaid}
          </a>
        </li>
        <li>
          <a href="#template" className={u.linkLine}>
            {t.toTemplate}
          </a>
        </li>
      </ul>
      <p className={p.small}>{t.license}</p>
    </div>
  );
}

function FreeBar({ lang }: { lang: Lang }) {
  const t = copy[lang].offer;
  const from = localePath(lang, "/projects/mcp-server");
  return (
    <div className={p.bar} role="region" aria-label={DOWNLOAD[lang]}>
      <p className={p.barPrice}>{t.free}</p>
      <a href={goHref(LINK, "booth", from)} rel="nofollow" className={u.btn}>
        {t.barGet}
      </a>
      <a href={goHref(LINK, "note", from)} rel="nofollow" className={u.btnGhost}>
        {t.barRead}
      </a>
    </div>
  );
}

/** 無料版でできないことを受け持つ有料のキット（予約ページ・業務アプリ・3 本セット）。値段は projects.ts から */
function PaidKits({ lang }: { lang: Lang }) {
  const t = copy[lang].paid;
  const kit = (slug: string) => {
    const project = projects.find((x) => x.slug === slug);
    if (!project) throw new Error(`レジストリに ${slug} が無い`);
    return { name: localProject(lang, project).title, price: money(lang, projectPriceNow(slug).price), note: "", href: hrefFor(lang, `/projects/${slug}`) };
  };
  const cards = [
    kit("booking"),
    kit("sheet-app"),
    { name: t.setName, price: money(lang, KIT_SET.price), note: t.setTotal(money(lang, kitSetListTotal())), href: `${hrefFor(lang, "/kits")}#automation` },
  ];
  return (
    <section className={p.section} aria-labelledby="paid">
      <h2 id="paid" className={p.h2}>
        {t.heading}
      </h2>
      <p className={p.body}>{t.intro}</p>
      <ul className={m.cards}>
        {cards.map((c, i) => (
          <li key={c.name} className={p.cell}>
            <h3 className={p.h3}>{c.name}</h3>
            <p className={m.cardPrice}>
              {c.price}
              <span className={p.tax}>{t.tax}</span>
            </p>
            {c.note && <p className={p.small}>{c.note}</p>}
            <p className={p.body}>{t.adds[i]}</p>
            <Link href={c.href} className={u.linkLine}>
              {t.see}
            </Link>
          </li>
        ))}
      </ul>
      <KitReceipt lang={lang} />
    </section>
  );
}

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const code = m.inlineCode;
  return (
    <ProjectShell
      lang={lang}
      slug="mcp-server"
      title={t.title}
      name={t.name}
      latin="MCP Server"
      lede={t.lede}
      aside={<FreeOffer lang={lang} />}
      bar={<FreeBar lang={lang} />}
    >
      <section className={m.replaySection} aria-labelledby="replay-heading">
        <h2 id="replay-heading" className={p.h3}>
          {t.replayHeading}
        </h2>
        <p className={p.small}>{t.replay}</p>
        <Replay src={RECORDING_SRC} />
      </section>

      <KitProof lang={lang} items={t.proof} />
      <KitAudience lang={lang} copy={t.audience} />
      <KitCompare lang={lang} slug="mcp-server" name={t.name} copy={t.compare} />

      <section className={p.section} aria-labelledby="how-heading">
        <h2 id="how-heading" className={p.h2}>
          {t.howHeading}
        </h2>
        <Diagram />
        {t.how.map((text) => (
          <p key={text} className={p.body}>
            <Rich text={text} codeClass={code} />
          </p>
        ))}
      </section>

      <section className={p.section} aria-labelledby="not-heading">
        <h2 id="not-heading" className={p.h2}>
          {t.notHeading}
        </h2>
        <ul className={p.list}>
          {t.not.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className={p.section} aria-labelledby="template">
        <h2 id="template" className={p.h2}>
          {t.template.heading}
        </h2>
        <p className={p.body}>{t.template.intro}</p>
        <ol className={p.steps}>
          {t.template.steps.map((line) => (
            <li key={line}>
              <Rich text={line} codeClass={code} />
            </li>
          ))}
        </ol>
        {TEMPLATE.map((sheet, i) => (
          <figure key={sheet.sheet} className={m.snippet}>
            <figcaption className={m.snippetHead}>
              <span>{lang === "ja" ? `「${sheet.sheet}」${t.template.sheets[i]}` : `${sheet.sheet} ${t.template.sheets[i]}`}</span>
              <CopyButton text={tsv(sheet.rows)} label={t.template.copy} done={t.template.copied} />
            </figcaption>
            <div className={m.sheetWrap} tabIndex={0} role="region" aria-label={`${sheet.sheet}（${t.template.scroll}）`}>
              <table className={m.sheet}>
                <tbody>
                  {sheet.rows.map((row, r) => (
                    <tr key={r}>
                      {row.map((value, c) => (r === 0 ? <th key={c}>{value}</th> : <td key={c}>{value}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </figure>
        ))}
        <p className={p.small}>{t.template.note}</p>
      </section>

      <section className={p.section} aria-labelledby="setup-heading">
        <h2 id="setup-heading" className={p.h2}>
          {t.setupHeading}
        </h2>
        <ol className={p.steps}>
          {t.steps.map((step) => (
            <li key={step.title}>
              <strong className={m.stepTitle}>{step.title}</strong>
              <Rich text={step.text} codeClass={code} />
            </li>
          ))}
        </ol>
        <table className={p.table}>
          <caption className={m.caption}>{t.connect.caption}</caption>
          <thead>
            <tr>
              {t.connect.cols.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.connect.rows.map(([client, how]) => (
              <tr key={client}>
                <th scope="row" data-label={t.connect.cols[0]}>
                  {client}
                </th>
                <td data-label={t.connect.cols[1]}>{how}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {SNIPPETS.map((text, i) => (
          <figure key={text} className={m.snippet}>
            <figcaption className={m.snippetHead}>
              <span>{t.snippets[i]}</span>
              <CopyButton text={text} label={t.template.copy} done={t.template.copied} />
            </figcaption>
            <pre className={m.code} tabIndex={0}>
              {text}
            </pre>
          </figure>
        ))}
      </section>

      <KitSteps lang={lang} groups={t.trouble} />
      <PaidKits lang={lang} />

      <section className={p.section} aria-labelledby="buy-heading">
        <h2 id="buy-heading" className={p.h2}>
          {t.buyHeading}
        </h2>
        <p className={p.body}>
          {t.buy}
          <ShopLinks lang={lang} slug="mcp-server" linkKey={LINK} />
        </p>
        <ShopEmbed linkKey={LINK} />
        <p className={p.body}>
          {t.service}{" "}
          <Link href={hrefFor(lang, "/contact")} className={u.linkLine}>
            {t.contact}
          </Link>
        </p>
      </section>
    </ProjectShell>
  );
}
