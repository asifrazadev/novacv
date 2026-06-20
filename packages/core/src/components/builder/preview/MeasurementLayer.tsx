"use client"

import * as React from "react"
import { ResumeData } from "@/types/resume"

interface MeasurementLayerProps {
  measureRef: React.Ref<HTMLDivElement>
  widthMm: number
  paddingMm: number
  SelectedTemplate: React.ComponentType<{ data: ResumeData }> | null
  data: ResumeData
}

export function MeasurementLayer({
  measureRef,
  widthMm,
  paddingMm,
  SelectedTemplate,
  data,
}: MeasurementLayerProps) {
  return (
    <div
      ref={measureRef}
      className="fixed -left-[10000px] top-0 pointer-events-none bg-white text-black overflow-hidden"
      style={{
        width: `${widthMm}mm`,
        padding: `${paddingMm}mm`,
      }}
    >
      {SelectedTemplate && <SelectedTemplate data={data} />}
    </div>
  )
}
