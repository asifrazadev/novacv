// src/lib/pdf/generatePdf.ts
import { getPage, releasePage } from "./pagePool"

interface PdfJobData {
  url: string
  cookies: any[]
  pdfOptions: Record<string, unknown>
}

export async function generatePdf(data: PdfJobData): Promise<Buffer> {
  const t0 = Date.now()
  const page = await getPage()
  console.log('[PDF Export Profile] page acquired:', Date.now() - t0, 'ms')

  try {
    const { url, cookies, pdfOptions } = data

    if (cookies && cookies.length > 0) {
      // Clear cookies from previous page runs to avoid session leakage
      try {
        const currentCookies = await page.context().cookies()
        if (currentCookies.length > 0) {
          await page.context().clearCookies()
        }
      } catch (e) {
        console.warn('[Playwright Pool] error clearing page cookies:', e)
      }
      await page.context().addCookies(cookies)
    }

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    })
    console.log('[PDF Export Profile] page loaded (domcontentloaded):', Date.now() - t0, 'ms')

    // Wait for the signal set by React after layout is ready
    await page.waitForFunction(
      () => document.body.getAttribute("data-wf-loaded") === "true",
      { timeout: 8000 }
    )
    console.log('[PDF Export Profile] wf-loaded:', Date.now() - t0, 'ms')

    // Ensure fonts are fully rendered before printing
    await page.evaluate(() => document.fonts.ready)
    console.log('[PDF Export Profile] fonts loaded/ready:', Date.now() - t0, 'ms')

    const pdfBuffer = await page.pdf({
      ...pdfOptions,
      tagged: false,
      printBackground: true,
    })
    console.log('[PDF Export Profile] pdf generated:', Date.now() - t0, 'ms')

    return Buffer.from(pdfBuffer)
  } finally {
    await releasePage(page)
  }
}
