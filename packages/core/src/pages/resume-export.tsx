import { getResumeById } from "@/actions/resumes"
import { sanitizeHtml } from "@/lib/sanitize"
import { notFound } from "next/navigation"
import { ExportContent } from "@/components/builder/export-content"
import { getFontVariable } from "@/lib/utils"
import { getPrintData } from "@/lib/pdf/printCache"

export default async function ExportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { id } = await params
  const { token } = await searchParams

  let data: any = null

  if (token) {
    data = getPrintData(token)
  }

  if (!data) {
    const resume = await getResumeById(id)
    if (!resume) {
      notFound()
    }
    data = resume.data
  }
  const { format, width: customWidth, height: customHeight } = data.metadata.page || {}
  const { template } = data.metadata

  const PAGE_SIZES: Record<string, { width: number; height: number }> = {
    a4: { width: 210, height: 297 },
    letter: { width: 215.9, height: 279.4 },
    legal: { width: 215.9, height: 355.6 },
    executive: { width: 184.15, height: 266.7 },
  }

  // Get dimensions in mm
  const standardSize = PAGE_SIZES[format.toLowerCase()]
  const widthMm = format === "custom" ? (customWidth || 210) : (standardSize?.width || 210)
  const heightMm = format === "custom" ? (customHeight || 297) : (standardSize?.height || 297)

  // Determine the CSS @page size value
  const pageSize = (format !== "custom" && standardSize) ? format.charAt(0).toUpperCase() + format.slice(1) : `${widthMm}mm ${heightMm}mm`
  
  // Get CSS font-family variable based on user selection
  const fontFamilyVar = getFontVariable(data.metadata.typography.fontFamily)
  const fontSlug = String(data.metadata.typography.fontFamily).toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`bg-white min-h-screen`} style={{ fontFamily: fontFamilyVar }}>
      {/* Preload only the active font to accelerate Chromium fonts.ready */}
      <link rel="preload" href={`/fonts/${fontSlug}-regular.woff2`} as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href={`/fonts/${fontSlug}-bold.woff2`} as="font" type="font/woff2" crossOrigin="anonymous" />


      <style dangerouslySetInnerHTML={{
        __html: `
        @font-face {
          font-family: 'Inter';
          src: url('/fonts/inter-regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: 'Inter';
          src: url('/fonts/inter-bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
        }
        @font-face {
          font-family: 'Roboto';
          src: url('/fonts/roboto-regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: 'Roboto';
          src: url('/fonts/roboto-bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
        }
        @font-face {
          font-family: 'Outfit';
          src: url('/fonts/outfit-regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: 'Outfit';
          src: url('/fonts/outfit-bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
        }
        @font-face {
          font-family: 'Playfair Display';
          src: url('/fonts/playfair-display-regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: 'Playfair Display';
          src: url('/fonts/playfair-display-bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
        }
        @font-face {
          font-family: 'Lora';
          src: url('/fonts/lora-regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: 'Lora';
          src: url('/fonts/lora-bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
        }
        @font-face {
          font-family: 'EB Garamond';
          src: url('/fonts/eb-garamond-regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: 'EB Garamond';
          src: url('/fonts/eb-garamond-bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
        }
        @font-face {
          font-family: 'JetBrains Mono';
          src: url('/fonts/jetbrains-mono-regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: 'JetBrains Mono';
          src: url('/fonts/jetbrains-mono-bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
        }

        :root, body {
          --font-inter: 'Inter', sans-serif;
          --font-roboto: 'Roboto', sans-serif;
          --font-outfit: 'Outfit', sans-serif;
          --font-playfair: 'Playfair Display', serif;
          --font-lora: 'Lora', serif;
          --font-eb-garamond: 'EB Garamond', serif;
          --font-jetbrains-mono: 'JetBrains Mono', monospace;
        }

        @page {
          size: ${pageSize};
          margin: 0;
        }
        body {
          background-color: white !important;
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact;
          font-family: ${fontFamilyVar}, sans-serif;
        }
        #resume-export-container {
          width: 100%;
          min-height: 0;
          margin: 0;
          padding: 0 !important;
        }
        .resume-page {
          width: 100%;
          height: ${heightMm}mm;
          overflow: hidden;
          position: relative;
          background: white;
        }
        .resume-page:not(:last-child) {
          break-after: page;
          page-break-after: always;
        }
        /* Prevent break inside individual section items */
        .section-item, [data-item-id] {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        /* Hide UI elements */
        .no-print {
          display: none !important;
        }
      `}} />

      {/* Inject custom CSS from metadata */}
      <style dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.metadata?.css || "") }} />

      <main id="resume-export">
        <ExportContent data={data} />
      </main>
    </div>
  )
}

