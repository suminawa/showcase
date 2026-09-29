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
