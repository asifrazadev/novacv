import type { NextConfig } from "next";
import path from "path";
import fs from "fs";
import { loadEnvConfig } from "@next/env";

// In local dev the env file lives at the monorepo root, not inside apps/web.
// On Vercel / CI, env vars are injected by the platform so the file won't exist
// and this is intentionally skipped.
const rootEnvDir = path.resolve(process.cwd(), "../../");
if (fs.existsSync(path.join(rootEnvDir, ".env.local"))) {
  loadEnvConfig(rootEnvDir);
}

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@novacv/core"],

  serverExternalPackages: ["@sparticuz/chromium", "playwright-core", "pg", "bcryptjs"],
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