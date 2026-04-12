import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/demo-produit",
        destination: "/demo-produit/index.html",
      },
      {
        source: "/demo-produit/",
        destination: "/demo-produit/index.html",
      },
    ];
  },
};

export default nextConfig;
