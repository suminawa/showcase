import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AI 案内窓口の Route Handler は設定と索引を実行時に読むので、Vercel の束に入れる
  outputFileTracingIncludes: {
    "/*": ["./concierge/concierge.config.json", "./concierge/data/**/*", "./concierge/content/**/*"],
  },
  serverExternalPackages: ["@anthropic-ai/sdk"],
  async redirects() {
    return [{ source: "/30days", destination: "/projects/30days", permanent: false }];
  },
};

export default nextConfig;
