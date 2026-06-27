// src/constants/pageSizes.ts

export const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
  legal: { width: 215.9, height: 355.6 },
  executive: { width: 184.15, height: 266.7 },
}

// 96 DPI conversion factor: 1mm = 3.7795275591px
export const MM_TO_PX = 3.7795275591
