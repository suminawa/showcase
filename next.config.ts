import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      // Shorts の画面と声で伝える短い道（押せないので打ち込む。着いた数は ?ref=yts で数える。2026-10-17 監査）
      { source: "/yoyaku", destination: "/projects/booking?ref=yts", permanent: false },
      { source: "/kigen", destination: "/projects/deadline?ref=yts", permanent: false },
      { source: "/uketsuke", destination: "/projects/form?ref=yts", permanent: false },
      { source: "/madoguchi", destination: "/projects/ai-concierge?ref=yts", permanent: false },
      { source: "/daicho", destination: "/projects/sheet-app?ref=yts", permanent: false },
    ];
  },
};

export default nextConfig;
