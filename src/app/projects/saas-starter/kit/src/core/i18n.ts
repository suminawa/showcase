// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
export type Lang = "ja" | "en";

export const LANGS: readonly Lang[] = ["ja", "en"] as const;

export function isLang(value: unknown): value is Lang {
  return value === "ja" || value === "en";
}

export type Messages = Readonly<Record<string, string>>;

/** param → cookie → profile → Accept-Language の順に見て、最初に読めた言語を使う */
export function pickLang(input: {
  param?: string | null;
  cookie?: string | null;
  profile?: string | null;
  header?: string | null;
}): Lang {
  for (const candidate of [input.param, input.cookie, input.profile]) {
    if (isLang(candidate)) return candidate;
  }
  const head = (input.header ?? "").slice(0, 2).toLowerCase();
  if (isLang(head)) return head;
  return "ja";
}

/** {name} を vars の値に差し替える。差し込んだ値の中の {…} はもう一度差し込まない */
export function t(
  messages: Messages,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const template = messages[key];
  if (template === undefined) return key;
  if (vars === undefined) return template;
  return template.replace(/\{([a-zA-Z]+)\}/g, (whole, name: string) => {
    const found = vars[name];
    return found === undefined ? whole : String(found);
  });
}

function group3(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+$)/g, ",");
}

export function formatYen(amount: number, _lang: Lang): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}¥${group3(Math.abs(Math.round(amount)))}`;
}

const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** ja は「2026年10月6日」、en は「6 October 2026」。読めない値は空文字 */
export function formatDate(iso: string, lang: Lang): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  const year = at.getUTCFullYear();
  const month = at.getUTCMonth();
  const day = at.getUTCDate();
  return lang === "ja"
    ? `${year}年${month + 1}月${day}日`
    : `${day} ${EN_MONTHS[month]} ${year}`;
}
