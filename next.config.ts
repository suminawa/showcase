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
    return [{ source: "/30days", destination: "/projects/30days", permanent: false }];
  },
};

export default nextConfig;
