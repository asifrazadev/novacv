"use client"

import { useBuilder } from "@/components/builder/builder-context"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { Switch } from "@/components/shared/ui/switch"
import { RichTextarea } from "@/components/shared/ui/rich-textarea"
import { Link } from "lucide-react"
import { DateRange, ListSection } from "@/components/builder/sections/shared"

export function EducationEditor() {
  const { updateSectionItem } = useBuilder()

  return (
    <ListSection
      section="education"
      renderForm={(item) => (
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap max-w-full gap-3">
            <div className="space-y-1.5 flex-1 min-w-[130px]">
              <Label className="text-xs">School</Label>
              <Input placeholder="MIT, Harvard..." value={item.school ?? ""} onChange={(e) => updateSectionItem("education", item.id, "school", e.target.value)} />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[130px]">
              <Label className="text-xs">Area of Study</Label>
              <Input placeholder="Computer Science" value={item.areaOfStudy ?? ""} onChange={(e) => updateSectionItem("education", item.id, "areaOfStudy", e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1.5 flex-1 min-w-[130px]">
              <Label className="text-xs">Degree</Label>
              <Input placeholder="Bachelor's, Master's..." value={item.degree ?? ""} onChange={(e) => updateSectionItem("education", item.id, "degree", e.target.value)} />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[130px]">
              <Label className="text-xs">Grade</Label>
              <Input placeholder="3.9 GPA, First Class..." value={item.grade ?? ""} onChange={(e) => updateSectionItem("education", item.id, "grade", e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1.5 flex-1 min-w-[130px]">
              <Label className="text-xs">Location</Label>
              <Input placeholder="Boston, MA" value={item.location ?? ""} onChange={(e) => updateSectionItem("education", item.id, "location", e.target.value)} />
            </div>
          </div>
          <DateRange section="education" item={item} />
          <div className="space-y-1.5">
            <Label className="text-xs">Website</Label>
            <div className="relative">
              <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input className="pl-8 h-8 text-xs" placeholder="https://" value={item.website ?? ""} onChange={(e) => updateSectionItem("education", item.id, "website", e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs cursor-pointer" htmlFor={`edu-link-${item.id}`}>Show link in title</Label>
            <Switch
              id={`edu-link-${item.id}`}
              checked={item.showLinkInTitle ?? false}
              onCheckedChange={(val: boolean) => updateSectionItem("education", item.id, "showLinkInTitle", val)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <RichTextarea
              placeholder="Relevant coursework, achievements, thesis..."
              value={item.description ?? ""}
              onChange={(val) => updateSectionItem("education", item.id, "description", val)}
              minHeight="100px"
              source={{ section: "education", fieldName: "description" }}
            />
          </div>
        </div>
      )}
    />
  )
}
