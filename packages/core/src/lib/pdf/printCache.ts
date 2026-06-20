// src/lib/pdf/printCache.ts
import { randomUUID } from "crypto"
import { ResumeData } from "@/types/resume"

const printCache = new Map<string, { data: ResumeData; expires: number }>()

export function cachePrintData(data: ResumeData): string {
  const token = randomUUID()
  printCache.set(token, { data, expires: Date.now() + 60_000 })
  return token
}

export function getPrintData(token: string): ResumeData | null {
  const entry = printCache.get(token)
  if (!entry || Date.now() > entry.expires) return null
  printCache.delete(token)
  return entry.data
}
