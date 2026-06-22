"use client"

import { useBuilder } from "@/components/builder/builder-context"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { Switch } from "@/components/shared/ui/switch"
import { RichTextarea } from "@/components/shared/ui/rich-textarea"
import { Link } from "lucide-react"
import { DateRange, ListSection } from "@/components/builder/sections/shared"

export function ProjectsSection() {
  const { updateSectionItem } = useBuilder()

  return (
    <ListSection
      section="projects"
      renderForm={(item) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1.5 flex-1 min-w-[130px]">
              <Label className="text-xs">Name</Label>
              <Input placeholder="My Awesome Project" value={item.name ?? ""} onChange={(e) => updateSectionItem("projects", item.id, "name", e.target.value)} />
            </div>
          </div>
          <DateRange section="projects" item={item} />
          <div className="space-y-1.5">
            <Label className="text-xs">Website</Label>
            <div className="relative">
              <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input className="pl-8" placeholder="https://" value={item.url ?? ""} onChange={(e) => updateSectionItem("projects", item.id, "url", e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs cursor-pointer" htmlFor={`proj-link-${item.id}`}>Show link in title</Label>
            <Switch
              id={`proj-link-${item.id}`}
              checked={item.showLinkInTitle ?? false}
              onCheckedChange={(val: boolean) => updateSectionItem("projects", item.id, "showLinkInTitle", val)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <RichTextarea
              placeholder="Describe what you built, your role, technologies used..."
              value={item.description ?? ""}
              onChange={(val) => updateSectionItem("projects", item.id, "description", val)}
              minHeight="120px"
              source={{ section: "projects", fieldName: "description" }}
            />
          </div>
        </div>
      )}
    />
  )
}
