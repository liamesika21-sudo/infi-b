import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/guide", destination: "/mentora-student-guide.html" },
    ];
  },
};

export default nextConfig;
