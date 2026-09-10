import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/30days", destination: "/projects/30days", permanent: false }];
  },
};

export default nextConfig;
