import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // CSS を道ごとに要るぶんだけに近づける（既定の合わせ方だと、トップに作品ページや見本の CSS と
    // 料紙の書体の @font-face まで載り、描画を止める CSS が 270KB を超えていた。2026-10-17 に Lighthouse で実測）
    cssChunking: "graph",
  },
  // AI 案内窓口・AI 書類読み取りの Route Handler は設定や帳票の型を実行時に読むので、Vercel の束に入れる
  outputFileTracingIncludes: {
    "/*": [
      "./concierge/concierge.config.json",
      "./concierge/data/**/*",
      "./concierge/content/**/*",
      "./reader/**/*",
    ],
  },
  serverExternalPackages: ["@anthropic-ai/sdk", "@suminawa/doc-reader"],
  // note のアイキャッチや BOOTH の 1 枚目など、別の場所（editor.note.com・manage.booth.pm）のブラウザから fetch で取る画。公開の画なので誰が読んでもよい
  async headers() {
    return [{ source: "/og/:path*", headers: [{ key: "Access-Control-Allow-Origin", value: "*" }] }];
  },
  async redirects() {
    return [
      { source: "/30days", destination: "/projects/30days", permanent: false },
      // 一覧は /kits にある。/projects だけを開いた人を一覧へ送る
      { source: "/projects", destination: "/kits", permanent: false },
      // 見本サイトの一覧は /sites にある。/demos だけを開いた人（LP パックの説明文の URL）を一覧へ送る
      { source: "/demos", destination: "/sites", permanent: false },
    ];
  },
};

export default nextConfig;
