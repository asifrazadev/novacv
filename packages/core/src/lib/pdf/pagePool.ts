// src/lib/pdf/pagePool.ts
import { Page } from "playwright-core"
import { getBrowser } from "./browser"

type PageType = Page

const globalForPlaywright = process as unknown as {
  pagePool: PageType[] | undefined
  isPoolWarmed: boolean | undefined
  warmPromise: Promise<void> | undefined
}

if (!globalForPlaywright.pagePool) {
  globalForPlaywright.pagePool = []
}

export async function applyPageSettings(page: PageType): Promise<void> {
  // Configure request interception once at creation
  await page.route("**/*", (route) => {
    const request = route.request()
    const reqUrl = request.url()
    const resourceType = request.resourceType()
    if (
      ["media", "image", "websocket", "eventsource"].includes(resourceType) ||
      reqUrl.includes("fonts.googleapis.com") ||
      reqUrl.includes("fonts.gstatic.com") ||
      reqUrl.includes("supabase.co") ||
      reqUrl.includes("posthog") ||
      reqUrl.includes("google-analytics") ||
      reqUrl.includes("googletagmanager") ||
      reqUrl.includes("clarity")
    ) {
      route.abort()
    } else {
      route.continue()
    }
  })
}

export async function getPage(): Promise<PageType> {
  // Wait for pre-warming to complete if it is currently executing
  if (globalForPlaywright.warmPromise) {
    console.log('[Playwright Pool] Awaiting active pool pre-warming...')
    await globalForPlaywright.warmPromise
  }

  const pool = globalForPlaywright.pagePool || []
  while (pool.length > 0) {
    const page = pool.pop()!
    try {
      const browser = page.context().browser()
      if (browser && browser.isConnected()) {
        await page.evaluate(() => 1) // basic ping to ensure tab is responsive
        console.log('[Playwright Pool] REUSING page from pool')
        return page
      }
      console.log('[Playwright Pool] pooled page has a dead browser, closing')
      try {
        await page.close()
      } catch { }
    } catch {
      console.log('[Playwright Pool] failed to reuse page, closing')
      try {
        await page.close()
      } catch { }
    }
  }

  const browser = await getBrowser()
  console.log('[Playwright Pool] CREATING new page')
  const page = await browser.newPage()
  await applyPageSettings(page)

  return page
}

export async function releasePage(page: PageType) {
  try {
    if (!page.isClosed()) {
      await page.goto('about:blank')
      globalForPlaywright.pagePool?.push(page)
      console.log('[Playwright Pool] page released back to pool')
      return
    }
  } catch (err) {
    console.log('[Playwright Pool] failed to release page, closing', err)
  }
  try {
    await page.close()
  } catch { }
}

async function warmPool() {
  const isBuildTime =
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NEXT_PHASE === 'phase-export' ||
    process.env.IS_BUILD === 'true'

  if (isBuildTime) {
    console.log('[Playwright Pool] Skipping pre-warm during build')
    return
  }

  if (globalForPlaywright.isPoolWarmed) {
    console.log('[Playwright Pool] Pool already pre-warmed, skipping')
    return
  }

  globalForPlaywright.isPoolWarmed = true

  globalForPlaywright.warmPromise = (async () => {
    try {
      const browser = await getBrowser()
      console.log('[Playwright Pool] Pre-warming: launching new pages')
      for (let i = 0; i < 3; i++) {
        const page = await browser.newPage()
        await applyPageSettings(page)
        globalForPlaywright.pagePool?.push(page)
      }
      console.log('[Playwright Pool] Pool pre-warmed')
    } catch (err) {
      console.error('[Playwright Pool] Pool pre-warm failed:', err)
      globalForPlaywright.isPoolWarmed = undefined
    } finally {
      globalForPlaywright.warmPromise = undefined
    }
  })()
}

// Trigger pool pre-warming at server startup
warmPool()


