/*
 * AI 向けの案内（/llms.txt と /llms-full.txt）。紙と同じ目録（projects.ts・demos.ts・guides.ts）から組むので、
 * 品物や記事を足せばここにも載る。値段は定価（税込）だけを書く（発売記念の値は日付で変わるので書かない）。
 */
import { demoHref, demos } from "./demos";
import { guideHref, guides } from "./guides";
import { abs } from "./jsonld";
import {
  CONTACT_FAQ,
  CONTACT_PAGE,
  ELSEWHERE,
  INDEX_PAGES,
  PILLARS,
  PRICE_LADDER,
  PRICE_LADDER_NOTE,
  pillarKits,
  projectHref,
  projectsByCategory,
  type Project,
} from "./projects";
import { yen } from "./prices";
import { SITE_DESCRIPTION, SITE_NAME } from "./site";

function price(p: Project): string {
  const sale = p.sale;
  if (!sale) return "";
  if (sale.status === "free") return "（無料）";
  if (sale.status === "onsale" && sale.price != null) return `（定価 ${yen(sale.price)}・税込・買い切り）`;
  return "（発売前）";
}

const link = (title: string, path: string, note: string) => `- [${title}](${abs(path)}): ${note}`;

export function llmsText({ full = false }: { full?: boolean } = {}): string {
  const out = [`# ${SITE_NAME}`, "", `> ${SITE_DESCRIPTION}`, ""];
  out.push(
    "suminawa.dev は、業務自動化・AI活用・Web制作の三つの柱で、買い切りのキットとテンプレート、見本サイト、受託をご案内するサイトです。",
    INDEX_PAGES.kits.lede,
    "引用・参照のときは、https://suminawa.dev/ の各ページの URL をお示しください。",
    "",
    "## 主なページ",
    "",
    link(INDEX_PAGES.kits.title, "/kits", "柱ごとのキットとテンプレートの一覧"),
    link("悩みから読む", "/guides", "事務や受付の困りごとを 1 つずつ取り上げた記事"),
    link(INDEX_PAGES.sites.title, "/sites", INDEX_PAGES.sites.lede),
    link(INDEX_PAGES.works.title, "/works", INDEX_PAGES.works.lede),
    link("運営者について", "/about", "名義・経歴・取引の決まり・プライバシー方針"),
    link(CONTACT_PAGE.title, "/contact", CONTACT_PAGE.lede),
    "",
  );
  for (const pillar of PILLARS) {
    out.push(`## ${pillar.name}`, "", pillar.lede, "");
    for (const p of pillarKits(pillar)) out.push(link(p.title, projectHref(p), `${p.description}${price(p)}`));
    out.push("");
  }
  out.push("## 見本サイト", "");
  for (const d of demos) out.push(link(d.title, demoHref(d), d.description));
  out.push("", "## 作品と道具", "");
  for (const p of projectsByCategory("works")) out.push(link(p.title, projectHref(p), `${p.description}${price(p)}`));
  out.push("", "## 悩みから読む（記事）", "");
  for (const g of guides) {
    out.push(link(g.title, guideHref(g), g.lede));
    if (full) out.push(`  - 答え: ${g.answer}`);
  }
  out.push("", "## ご依頼と料金の目安", "");
  for (const row of PRICE_LADDER) out.push(`- ${row.how}: ${row.price}（${row.who}）`);
  out.push("", PRICE_LADDER_NOTE, "ご依頼・ご相談は hello@suminawa.dev へ。3 営業日以内に返信します。", "");
  if (full) {
    out.push("## よくあるご質問", "");
    for (const f of CONTACT_FAQ) out.push(`- ${f.q} ${f.a}`);
    out.push("");
  }
  out.push("## ほかの場所", "");
  for (const e of ELSEWHERE.filter((e) => e.name !== "LINE")) out.push(`- [${e.name}](${e.href})`);
  out.push("");
  return out.join("\n");
}
