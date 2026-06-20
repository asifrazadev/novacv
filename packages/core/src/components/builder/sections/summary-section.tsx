"use client"

import { useBuilder } from "@/components/builder/builder-context"
import { Label } from "@/components/shared/ui/label"
import { RichTextarea } from "@/components/shared/ui/rich-textarea"

export function SummarySection() {
  const { data, updateSectionItem } = useBuilder()

  return (
    <div className="space-y-4">
      <Label>Professional Summary</Label>
      <RichTextarea
        value={data.sections.summary?.content ?? ""}
        onChange={(val) => updateSectionItem("summary", "", "content", val)}
        minHeight="300px"
        source={{ section: "summary", fieldName: "content" }}
      />
    </div>
  )
}
