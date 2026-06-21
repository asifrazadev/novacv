import { chromium as pwChromium, Browser } from "playwright-core"
import chromium from "@sparticuz/chromium"

export type BrowserType = Browser

const globalForPlaywright = process as unknown as {
  globalBrowser: BrowserType | undefined
  launchPromise: Promise<BrowserType> | undefined
}

export async function getBrowser(): Promise<BrowserType> {
  const cachedBrowser = globalForPlaywright.globalBrowser

  if (cachedBrowser) {
    if (cachedBrowser.isConnected()) {
      return cachedBrowser
    }
    globalForPlaywright.globalBrowser = undefined
  }

  if (globalForPlaywright.launchPromise) {
    return globalForPlaywright.launchPromise
  }

  const isCloud = !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.VERCEL || !!process.env.RENDER
  const isLocal = !isCloud || process.platform === "win32" || process.platform === "darwin"

  let execPath = ""
  if (isLocal) {
    if (process.platform === "win32") {
      execPath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    } else if (process.platform === "darwin") {
      execPath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    } else {
      execPath = "/usr/bin/google-chrome"
    }
  } else {
    execPath = await (chromium as unknown as { executablePath: () => Promise<string> }).executablePath()
  }

  const args = [
    ...(Array.isArray((chromium as unknown as Record<string, unknown>).args)
      ? (chromium as unknown as Record<string, unknown>).args as string[]
      : []),
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-sync',
    '--disable-translate',
    '--hide-scrollbars',
    '--mute-audio',
    '--no-first-run',
    '--safebrowsing-disable-auto-update',
    '--ignore-certificate-errors',
    '--ignore-certificate-errors-spki-list',
  ]

  globalForPlaywright.launchPromise = pwChromium.launch({
    args,
    executablePath: execPath,
    headless: true,
  }).then((b: BrowserType) => {
    globalForPlaywright.globalBrowser = b
    globalForPlaywright.launchPromise = undefined

    b.on("disconnected", () => {
      globalForPlaywright.globalBrowser = undefined
    })

    return b
  }).catch((err: Error) => {
    globalForPlaywright.launchPromise = undefined
    throw err
  })

  return globalForPlaywright.launchPromise
}

