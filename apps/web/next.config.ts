import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@novacv/core"],
  allowedDevOrigins: ['192.168.0.102'],
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
  outputFileTracingIncludes: {
    '/api/**/*': [
      './node_modules/playwright-core/browsers.json',
      '../../node_modules/playwright-core/browsers.json',
      './node_modules/@sparticuz/chromium/bin/**',
      '../../node_modules/@sparticuz/chromium/bin/**',
    ],
    '/api/extension/download': [
      '../../apps/extension/**',
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "@radix-ui/react-icons",
    ],
  },
};

export default nextConfig;