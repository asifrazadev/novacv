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
const mmToPx = (mm: number) => mm * 3.7795275591;


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
      className="fixed -left-[10000px] top-0 invisible pointer-events-none bg-white text-black overflow-hidden break-words"
      style={{
        width: `${mmToPx(widthMm)}px`,
        padding: `${mmToPx(paddingMm)}px`,
      }}
    >
      {SelectedTemplate && <SelectedTemplate data={data} />}
    </div>
  )
}
