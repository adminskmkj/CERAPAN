import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/log-masuk",
        destination: "/cerapan/baharu",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;