import type { NextConfig } from 'next';

const config: NextConfig = {
  // Standalone project — just one route: /lp/[templateId]
  output: 'standalone',
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default config;
