import type { Metadata } from "next";
import { fontInter, fontVariables } from "@/lib/fonts";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme/theme-provider";
import { Toaster } from "@/components/shared/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "NovaCV",
  description: "Build your resume free",
};

import { TooltipProvider } from "@/components/shared/ui/tooltip";
import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""
  const isExport = pathname.endsWith("/export")

  if (isExport) {
    return (
      <html lang="en">
        <body className="bg-white">
          {children}
        </body>
      </html>
    )
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontInter.variable} ${fontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
