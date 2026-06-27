import { getPage, releasePage } from "./pagePool"

interface PdfJobData {
  url: string
  pdfOptions: Record<string, unknown>
}

export async function generatePdf(data: PdfJobData): Promise<Buffer> {
  const page = await getPage()

  try {
    const { url, pdfOptions } = data

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    })

    await page.waitForFunction(
      () => document.body.getAttribute("data-wf-loaded") === "true" || (window as any).__EXPORT_ERROR__ === true,
      undefined,
      { timeout: 30000 }
    )

    const isError = await page.evaluate(() => (window as any).__EXPORT_ERROR__ === true)
    if (isError) {
      throw new Error("Client-side export error occurred during layout calculation.")
    }

    await page.evaluate(() => document.fonts.ready)

    const pdfBuffer = await page.pdf({
      ...pdfOptions,
      tagged: false,
      printBackground: true,
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await releasePage(page)
  }
}
