/*
 * GAS キット 3 本の「純粋な部分」を、見本ページの中に写す。
 *
 *   node scripts/sync-gas-kits.mjs [suminawa-products/packages のパス]
 *
 * 写すのは各キットの src/ のうち、Google Apps Script に触らないファイルだけ
 * （gas_*.js は写さない）。ファイルの中身は 1 字も書き換えず、頭に写しの断りを
 * 2 行足すだけにする ── 見本の通知・行・返信は、キットの実物の関数が作る。
 * キットが育っても、この台本を走らせ直すだけで追いつく。
 *
 * 写し先は src/app/projects/<見本の slug>/kit/。写しが元とずれていないかは
 * src/lib/gas-kits.test.ts が確かめる（元のパッケージが手元にあるときだけ）。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES = path.resolve(process.argv[2] ?? path.join(ROOT, "..", "..", "suminawa-products", "packages"));

/** 見本の slug → キットのパッケージ名 */
export const KITS = [
  { slug: "deadline", pkg: "deadline-alert-gas", name: "期限アラート GAS キット" },
  { slug: "form", pkg: "form-intake-gas", name: "フォーム受付 GAS キット" },
  { slug: "inbox-triage", pkg: "inbox-triage-gas", name: "AI 問い合わせ整理キット" },
];

function notice(name) {
  return [
    `// このファイルは「${name}」の src/ からの写しです（中身は書き換えていません）。`,
    "// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。",
    "",
  ].join("\n");
}

for (const kit of KITS) {
  const from = path.join(PACKAGES, kit.pkg, "src");
  if (!existsSync(from)) {
    console.error(`見つかりません: ${from}`);
    process.exit(1);
  }
  const dest = path.join(ROOT, "src", "app", "projects", kit.slug, "kit");
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  const files = readdirSync(from).filter((file) => file.endsWith(".js") && !file.startsWith("gas_"));
  for (const file of files) {
    writeFileSync(path.join(dest, file), notice(kit.name) + readFileSync(path.join(from, file), "utf8"));
  }
  const version = JSON.parse(readFileSync(path.join(PACKAGES, kit.pkg, "package.json"), "utf8")).version;
  writeFileSync(path.join(dest, "VERSION"), `${kit.pkg} ${version}\n`);
  console.log(`${kit.pkg} ${version} → ${path.relative(ROOT, dest)}（${files.length} 枚）`);
}
