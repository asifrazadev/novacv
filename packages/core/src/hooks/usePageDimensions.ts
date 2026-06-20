import * as React from "react"
import { ResumeData } from "@/types/resume"
import { PAGE_SIZES, MM_TO_PX } from "@/constants/pageSizes"

export function usePageDimensions(pageMetadata?: ResumeData["metadata"]["page"]) {
  return React.useMemo(() => {
    const { format = "a4", width: customWidth, height: customHeight, padding: paddingMm = 20 } = pageMetadata || {}

    const standardSize = PAGE_SIZES[format.toLowerCase()]
    const widthMm = format === "custom" ? (customWidth || 210) : (standardSize?.width || 210)
    const heightMm = format === "custom" ? (customHeight || 297) : (standardSize?.height || 297)

    const widthPx = widthMm * MM_TO_PX
    const heightPx = heightMm * MM_TO_PX
    const paddingPx = paddingMm * MM_TO_PX
    const availableHeightPx = heightPx - (paddingPx * 2)

    return {
      format,
      widthMm,
      heightMm,
      paddingMm,
      widthPx,
      heightPx,
      paddingPx,
      availableHeightPx,
    }
  }, [pageMetadata])
}
