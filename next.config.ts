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
  // note のアイキャッチなど、別の場所（editor.note.com）のブラウザから fetch で取る画。公開の画なので誰が読んでもよい
  async headers() {
    return [{ source: "/og/note/:path*", headers: [{ key: "Access-Control-Allow-Origin", value: "*" }] }];
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
