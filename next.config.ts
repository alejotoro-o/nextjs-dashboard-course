import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Partial Prerendering (PPR) requires nextjs canary and it's an experimental feature
  // npm install next@canary
  // experimental: {
  //   ppr: 'incremental'
  // }
};

export default nextConfig;
