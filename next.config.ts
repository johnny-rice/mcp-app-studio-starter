import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "esbuild",
    "vite",
    "@tailwindcss/postcss",
    "@tailwindcss/node",
    "@tailwindcss/oxide",
    "lightningcss",
  ],
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    const vitePort = Number(process.env.WORKBENCH_VITE_PORT ?? "3173") || 3173;
    const destinationPrefix = `http://127.0.0.1:${vitePort}`;

    return [
      {
        source: "/__workbench_hmr/:path*",
        destination: `${destinationPrefix}/__workbench_hmr/:path*`,
      },
    ];
  },
};

export default nextConfig;
