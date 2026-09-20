/*
 * SaaS スターター キットの「純粋な部分」を、見本ページの中に写す。
 *
 *   node scripts/sync-saas-starter.mjs <キットのパッケージのパス>
 *
 * 写し先は src/app/projects/saas-starter/kit/ で、キットの中の並び（src/・messages/・
 * plans.config.ts・legal.config.ts）をそのまま保つ。並びを保つのは、ファイルの中の
 * 相対 import を 1 行も書き換えずに済ませるため ── キットが育っても、この写しは
 * 走らせ直すだけで追いつく。
 *
 * 写すのは、Next.js にも Supabase にも Stripe にも触らない 4 つの層だけ:
 *   src/core/ src/ports/ src/adapters/fake/ src/server/flows/
 *   と、flows が読む src/server/ の純粋な 3 枚（context・ratelimit・urls）
 * server-only・next/*・process.env に触るものは写さない。見本の側で代わりを書く。
 *
 * 中身を書き換えるのは 2 か所だけ（どちらも、ブラウザに無いものを避けるため）:
 *   1. src/core/invitations.ts の node:crypto → ./crypto-shim
 *      （shim は見本の側で持つ。この台本は消さずに残す）
 *   2. src/adapters/fake/billing.ts の Buffer.byteLength(...) → TextEncoder で数える形
 * どちらも、探して見つからなければ止まる。黙って通すと、見本が動かなくなるため。
 *
 * 法務の 1 枚（特定商取引法に基づく表記）の素のテキストは、ブラウザから読めないので
 * kit/legal-text.ts という 1 枚の TypeScript に焼き直す。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEST = path.join(ROOT, "src", "app", "projects", "saas-starter", "kit");

/** 写したファイルの頭に足す 1 行（.ts と .tsx にだけ足す。JSON には足せない） */
const NOTICE = [
  "// このファイルは、SaaS スターター キットからの写しです。",
  "// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。",
  "",
].join("\n");

/** まるごと写すフォルダ。キットのパッケージの中の位置 → 写し先の位置（同じ並び） */
const DIRECTORIES = [
  "src/core",
  "src/ports",
  "src/adapters/fake",
  "src/server/flows",
];

/** 1 枚ずつ写すファイル */
const FILES = [
  "src/server/context.ts",
  "src/server/ratelimit.ts",
  "src/server/urls.ts",
  "plans.config.ts",
  "legal.config.ts",
  "messages/ja.json",
  "messages/en.json",
];

/** 法務の素のテキスト。kit/legal-text.ts に焼き直す */
const LEGAL_TEXTS = [
  { key: "tokushoho.ja", from: "legal/tokushoho.ja.txt" },
  { key: "tokushoho.en", from: "legal/tokushoho.en.txt" },
];

/** 写しではなく、見本の側が持っているもの。掃除のときに消さない */
const KEEP = new Set(["src/core/crypto-shim.ts", "COPY-NOTICE.md"]);

/*
 * app/ の下で、Next.js が「道すじ」として読んでしまう名前。
 * 写し先は app/projects/saas-starter/kit/ なので、この名前のファイルを 1 枚でも置くと、
 * そこが公開の URL になってしまう（route.ts なら API の受け口として組み立てに入る）。
 * キットにその名前が増えたら、黙って通さずにここで止める。
 */
const RESERVED = new Set([
  "layout",
  "page",
  "loading",
  "not-found",
  "error",
  "global-error",
  "route",
  "template",
  "default",
]);

/**
 * 中身の書き換え。写し先の位置ごとに、置き換える前と後を並べる。
 * 前が 1 つも見つからなければ止める（キットの側が変わったことに、その場で気づくため）。
 */
const REWRITES = {
  "src/core/invitations.ts": [
    {
      from: 'import { createHash, randomBytes } from "node:crypto";',
      to: 'import { createHash, randomBytes } from "./crypto-shim";',
      why: "ブラウザには node:crypto がないため",
    },
  ],
  "src/adapters/fake/billing.ts": [
    {
      from: 'Buffer.byteLength(input.payload, "utf8")',
      to: "new TextEncoder().encode(input.payload).length",
      why: "ブラウザには Buffer がないため",
    },
  ],
};

function fail(message) {
  console.error(`sync-saas-starter: ${message}`);
  process.exit(1);
}

/** フォルダの下のファイルを、キットの中の位置で並べて返す */
function walk(base, prefix) {
  const found = [];
  for (const name of readdirSync(path.join(base, prefix)).sort()) {
    const here = `${prefix}/${name}`;
    if (statSync(path.join(base, here)).isDirectory()) found.push(...walk(base, here));
    else found.push(here);
  }
  return found;
}

/** 写し先に残っている、前の写しを片づける（KEEP のものは残す） */
function clean(dir, prefix = "") {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const here = prefix === "" ? name : `${prefix}/${name}`;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      clean(full, here);
      if (readdirSync(full).length === 0) rmSync(full, { recursive: true });
      continue;
    }
    if (!KEEP.has(here)) rmSync(full);
  }
}

function write(relative, text) {
  const full = path.join(DEST, relative);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, text, "utf8");
}

/** 1 枚写す。.ts には断りの 1 行を足し、決めておいた書き換えをかける */
function copyOne(source, relative) {
  const from = path.join(source, relative);
  if (!existsSync(from)) fail(`キットに ${relative} がありません`);

  const stem = path.basename(relative).replace(/\.(ts|tsx|js|jsx)$/, "");
  if (RESERVED.has(stem)) {
    fail(
      `${relative} は、Next.js が道すじとして読む名前です（${stem}）。` +
        "そのまま写すと、見本のページの下に公開の URL ができてしまいます。" +
        "写さないか、名前を変えて写すかを決めてから、もう一度お試しください。",
    );
  }

  let text = readFileSync(from, "utf8");

  for (const rule of REWRITES[relative] ?? []) {
    if (!text.includes(rule.from)) {
      fail(`${relative} に「${rule.from}」が見つかりません（${rule.why}の書き換えができません）`);
    }
    text = text.split(rule.from).join(rule.to);
  }

  if (relative.endsWith(".ts") || relative.endsWith(".tsx")) text = NOTICE + text;

  write(relative, text);
  return relative;
}

/** 法務の素のテキストを、1 枚の TypeScript に焼き直す */
function bakeLegalText(source) {
  const entries = LEGAL_TEXTS.map(({ key, from }) => {
    const full = path.join(source, from);
    if (!existsSync(full)) fail(`キットに ${from} がありません`);
    return `  ${JSON.stringify(key)}: ${JSON.stringify(readFileSync(full, "utf8"))},`;
  });

  write(
    "legal-text.ts",
    [
      NOTICE.trimEnd(),
      "",
      "/**",
      " * 法務の文面（素のテキスト）です。キットの legal/*.txt を、そのまま文字列にしたものです。",
      " * キットの側はファイルから読みますが、ブラウザの中だけで動く見本は読みに行けないので、",
      " * 写すときに 1 枚の TypeScript へ焼き直しています。",
      " */",
      "export const LEGAL_TEXT: Readonly<Record<string, string>> = {",
      ...entries,
      "};",
      "",
    ].join("\n"),
  );
  return "legal-text.ts";
}

const source = process.argv[2];
if (source === undefined || source === "") {
  fail("キットのパッケージのパスを渡してください（例: node scripts/sync-saas-starter.mjs ../saas-starter）");
}
const from = path.resolve(source);
if (!existsSync(path.join(from, "plans.config.ts"))) {
  fail(`${source} は SaaS スターター キットのパッケージではないようです（plans.config.ts がありません）`);
}

clean(DEST);

const copied = [];
for (const directory of DIRECTORIES) {
  for (const relative of walk(from, directory)) copied.push(copyOne(from, relative));
}
for (const relative of FILES) copied.push(copyOne(from, relative));
copied.push(bakeLegalText(from));

write(
  "COPY-NOTICE.md",
  [
    "# この下はすべて写しです",
    "",
    "SaaS スターター キットの「Next.js にも Supabase にも Stripe にも触らない部分」を、",
    "そのままの並びで写しています。直すときはキットの側を直してから、",
    "`scripts/sync-saas-starter.mjs` を走らせてください。",
    "",
    "JSON には断りの行を足せないので、この 1 枚で代わりにお伝えします。",
    "",
    "`src/core/crypto-shim.ts` だけは写しではなく、見本の側で書いたものです",
    "（キットが `node:crypto` で行うことを、ブラウザの中で同じ値になるように書いてあります）。",
    "",
  ].join("\n"),
);

console.log(`写しました: ${copied.length} 枚 → ${path.relative(ROOT, DEST)}`);
