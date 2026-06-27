// src/lib/pdf/printCache.ts
import { randomUUID } from "crypto"
import { ResumeData } from "@/types/resume"

const globalForPrintCache = globalThis as unknown as {
  printCache: Map<string, { data: ResumeData; expires: number }>
}

const printCache = globalForPrintCache.printCache || new Map<string, { data: ResumeData; expires: number }>()

if (process.env.NODE_ENV !== "production") {
  globalForPrintCache.printCache = printCache
}

export function cachePrintData(data: ResumeData): string {
  const token = randomUUID()
  printCache.set(token, { data, expires: Date.now() + 60_000 })

  // Cleanup expired tokens to prevent memory leak
  for (const [key, value] of printCache.entries()) {
    if (Date.now() > value.expires) {
      printCache.delete(key)
    }
  }

  return token
}

export function getPrintData(token: string): ResumeData | null {
  const entry = printCache.get(token)
  if (!entry || Date.now() > entry.expires) {
    if (entry) printCache.delete(token)
    return null
  }
  // Do not delete immediately. Next.js RSC and Fast Refresh may request the page multiple times.
  return entry.data
}
