import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Claude Code の worktree（別セッションの作業ツリー）は lint 対象外
    ".claude/**",
    // public/ 配下はキットの demo バンドルをそのまま置く場所（ai-concierge.js、
    // demos/*/app.js）。ビルド成果物の写しであって自前のソースではないので対象外
    "public/**/*.js",
    // SaaS スターター キットからの写し（scripts/sync-saas-starter.mjs が作る）。
    // 自前のソースではなく、直すのはキットの側なので対象外。
    // 型は tsc --noEmit がこちらでも見ている
    "src/app/projects/saas-starter/kit/**",
  ]),
]);

export default eslintConfig;
