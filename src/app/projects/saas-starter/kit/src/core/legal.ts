// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
/**
 * 法務の 3 枚（特定商取引法に基づく表記・利用規約・プライバシーポリシー）を、
 * 素のテキストから画面に写せる形に読み替えます。
 *
 * 文面は legal/*.txt にあります。書き方は 5 つだけです。
 *
 *   ## 見出し            … 見出し（h2）
 *   - 箇条書き           … 続けて書くと 1 つのまとまりになります（ul）
 *   用語: 本文           … 続けて書くと 1 つの表のようになります（dl）
 *   # 覚え書き           … この土台をお使いになる方あての覚え書き。画面には出しません
 *   そのほかの行         … 段落（p）
 *
 * 差し込みは {{serviceName}} の形で、legal.config.ts の値に置き換えます。
 * 空のままの項目は「（未記入）」と出して、書き忘れに気づけるようにします。
 *
 * **HTML を組み立てません。** 画面はこの並びを <h2> <p> <ul> <dl> に写すだけなので、
 * 文面に何が書かれていても、画面の組み立てが崩れることはありません。
 */
import type { LegalConfig } from "../../legal.config";
import type { Lang } from "./i18n";

export type { LegalConfig };

export type LegalDoc = "tokushoho" | "terms" | "privacy";

export const LEGAL_DOCS: readonly LegalDoc[] = ["tokushoho", "terms", "privacy"] as const;

export const LEGAL_KEYS: readonly (keyof LegalConfig)[] = [
  "serviceName",
  "sellerName",
  "representative",
  "address",
  "phone",
  "contactHours",
  "email",
  "priceNote",
  "extraCharges",
  "paymentMethods",
  "paymentTiming",
  "deliveryTiming",
  "refundPolicy",
  "privacyContact",
  "governingLaw",
  "updatedOn",
] as const;

export type LegalBlock =
  | { kind: "h2"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "dl"; rows: { term: string; text: string }[] };

/** まだお書きでない項目の、画面に出す文字です */
const BLANK_JA = "（未記入）";

/** 「用語: 本文」の行。用語に「:」と句読点は入れません（段落と読み違えないためです） */
const DL_ROW = /^([^:：。、！？]{1,30}): (.+)$/;

const PLACEHOLDER = /\{\{([a-zA-Z]+)\}\}/g;

/** legal/ のファイルの名前です */
export function legalFileName(doc: LegalDoc, lang: Lang): string {
  return `${doc}.${lang}.txt`;
}

/** まだお書きでない（空白だけの）項目です */
export function missingLegalKeys(config: LegalConfig): (keyof LegalConfig)[] {
  return LEGAL_KEYS.filter((key) => config[key].trim() === "");
}

function fill(source: string, config: LegalConfig, blank: string): string {
  return source.replace(PLACEHOLDER, (_whole, name: string) => {
    if (!(LEGAL_KEYS as readonly string[]).includes(name)) {
      // 黙って空にすると、文の一部が抜けたまま公開されてしまいます
      throw new Error(`legal: 知らない差し込みです: {{${name}}}`);
    }
    const value = config[name as keyof LegalConfig];
    return value.trim() === "" ? blank : value;
  });
}

/**
 * 文面を、画面に写せる並びにします。
 * 知らない差し込みがあれば、例外でお知らせします（黙って空にしません）。
 */
export function parseLegal(
  source: string,
  config: LegalConfig,
  options: { blank?: string } = {},
): LegalBlock[] {
  const filled = fill(source, config, options.blank ?? BLANK_JA);

  const blocks: LegalBlock[] = [];
  let items: string[] | null = null;
  let rows: { term: string; text: string }[] | null = null;

  const closeList = (): void => {
    if (items !== null) blocks.push({ kind: "ul", items });
    items = null;
  };
  const closeRows = (): void => {
    if (rows !== null) blocks.push({ kind: "dl", rows });
    rows = null;
  };
  const close = (): void => {
    closeList();
    closeRows();
  };

  for (const raw of filled.split("\n")) {
    const line = raw.trim();

    // 空の行と、買い手あての覚え書きは、まとまりの切れ目です
    if (line === "" || (line.startsWith("#") && !line.startsWith("## "))) {
      close();
      continue;
    }

    if (line.startsWith("## ")) {
      close();
      blocks.push({ kind: "h2", text: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith("- ")) {
      closeRows();
      items ??= [];
      items.push(line.slice(2).trim());
      continue;
    }

    const row = DL_ROW.exec(line);
    if (row !== null) {
      closeList();
      rows ??= [];
      rows.push({ term: row[1].trim(), text: row[2].trim() });
      continue;
    }

    close();
    blocks.push({ kind: "p", text: line });
  }

  close();
  return blocks;
}
