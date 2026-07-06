import { getResumeById } from "@/actions/resumes"
import { sanitizeHtml } from "@/lib/sanitize"
import { notFound } from "next/navigation"
import { ExportContent } from "@/components/builder/export-content"
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
  let authorized = false

  if (token) {
    const crypto = require("crypto")
    const secret = process.env.NEXTAUTH_SECRET || "fallback_secret"
    const expectedToken = crypto.createHmac("sha256", secret).update(id).digest("hex")
    
    if (token === expectedToken) {
      authorized = true
    }
  }

  if (authorized) {
    const { db } = await import("@/lib/db")
    const { resumes } = await import("@/lib/db/schema")
    const { eq } = await import("drizzle-orm")
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id)).limit(1)
    if (!resume) notFound()
    data = resume.data
  } else {
    const resume = await getResumeById(id)
    if (!resume) {
      notFound()
    }
    data = resume.data
  }
  const { format, width: customWidth, height: customHeight } = data.metadata.page || {}

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
  
  const fontFamily: string = data.metadata.typography.fontFamily || "Inter"
  const fontSlug = fontFamily.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="bg-white min-h-screen print:min-h-0" style={{ fontFamily }}>
      {/* Preload only the active font to accelerate Chromium fonts.ready */}
      <link rel="preload" href={`/fonts/${fontSlug}-regular.woff2`} as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href={`/fonts/${fontSlug}-bold.woff2`} as="font" type="font/woff2" crossOrigin="anonymous" />


      <style dangerouslySetInnerHTML={{
        __html: `
        @font-face {
          font-family: '${data.metadata.typography.fontFamily}';
          src: url('/fonts/${fontSlug}-regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: block;
        }
        @font-face {
          font-family: '${data.metadata.typography.fontFamily}';
          src: url('/fonts/${fontSlug}-bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: block;
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
          font-family: '${fontFamily}', sans-serif;
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
        [data-item-id] {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        /* Hide UI elements during print */
        @media print {
          .no-print {
            display: none !important;
          }
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

