"use client"

import { useBuilder } from "@/components/builder/builder-context"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { Switch } from "@/components/shared/ui/switch"
import { Button } from "@/components/shared/ui/button"
import { RichTextarea } from "@/components/shared/ui/rich-textarea"
import { Plus, Trash2, GripVertical, Link } from "lucide-react"
import { DateRange, ListSection } from "@/components/builder/sections/shared"
import { v4 as uuidv4 } from "uuid"

export function ExperienceEditor() {
  const { updateSectionItem } = useBuilder()

  return (
    <ListSection
      section="experience"
      renderForm={(item) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1.5 flex-1 min-w-[100px]">
              <Label className="text-xs">Company</Label>
              <Input placeholder="Google, Meta..." value={item.company ?? ""} onChange={(e) => updateSectionItem("experience", item.id, "company", e.target.value)} />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[130px]">
              <Label className="text-xs">Location</Label>
              <Input placeholder="New York, Remote..." value={item.location ?? ""} onChange={(e) => updateSectionItem("experience", item.id, "location", e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1.5 flex-1 min-w-[130px]">
              <Label className="text-xs">Position</Label>
              <Input placeholder="Software Engineer" value={item.position ?? ""} onChange={(e) => updateSectionItem("experience", item.id, "position", e.target.value)} />
            </div>
          </div>
          <DateRange section="experience" item={item} />
          <div className="space-y-1.5">
            <Label className="text-xs">Website</Label>
            <div className="relative">
              <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input className="pl-8 h-8 text-xs" placeholder="https://" value={item.website ?? ""} onChange={(e) => updateSectionItem("experience", item.id, "website", e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs cursor-pointer" htmlFor={`show-link-${item.id}`}>Show link in title</Label>
            <Switch
              id={`show-link-${item.id}`}
              checked={item.showLinkInTitle ?? false}
              onCheckedChange={(val: boolean) => updateSectionItem("experience", item.id, "showLinkInTitle", val)}
            />
          </div>

          {/* Role Progression */}
          <div className="space-y-2 pt-1 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold">Role Progression</p>
                <p className="text-[10px] text-muted-foreground">Add multiple roles to show career progression at the same company.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs shrink-0"
                onClick={() => {
                  const newRole = { id: uuidv4(), title: "", startDate: "", endDate: "", isCurrent: false, description: "" }
                  updateSectionItem("experience", item.id, "roles", [...(item.roles ?? []), newRole])
                }}
              >
                <Plus className="w-3 h-3" /> Add Role
              </Button>
            </div>
            {(item.roles ?? []).length > 0 && (
              <div className="space-y-3">
                {(item.roles ?? []).map((role: any) => (
                  <div key={role.id} className="flex flex-col gap-2 p-3 bg-muted/30 border border-border/40 rounded-xl">
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-2" />
                      <div className="flex-1 flex flex-wrap gap-2">
                        <div className="space-y-1 flex-1 min-w-[130px]">
                          <Label className="text-[10px] font-semibold text-muted-foreground">Title</Label>
                          <Input
                            className="h-7 text-xs"
                            placeholder="Role title"
                            value={role.title ?? ""}
                            onChange={(e) => {
                              const updated = (item.roles ?? []).map((r: any) => r.id === role.id ? { ...r, title: e.target.value } : r)
                              updateSectionItem("experience", item.id, "roles", updated)
                            }}
                          />
                        </div>
                        <div className="space-y-1 flex-1 min-w-[130px]">
                          <Label className="text-[10px] font-semibold text-muted-foreground">Duration</Label>
                          <div className="grid gap-1">
                            <div className="flex gap-1">
                              <Input
                                className="h-7 text-[10px] px-1.5"
                                placeholder="Start"
                                value={role.startDate ?? ""}
                                onChange={(e) => {
                                  const updated = (item.roles ?? []).map((r: any) => r.id === role.id ? { ...r, startDate: e.target.value } : r)
                                  updateSectionItem("experience", item.id, "roles", updated)
                                }}
                              />
                              <Input
                                className="h-7 text-[10px] px-1.5"
                                placeholder="End"
                                value={role.isCurrent ? "Present" : (role.endDate ?? "")}
                                disabled={role.isCurrent}
                                onChange={(e) => {
                                  const updated = (item.roles ?? []).map((r: any) => r.id === role.id ? { ...r, endDate: e.target.value } : r)
                                  updateSectionItem("experience", item.id, "roles", updated)
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Switch
                                checked={role.isCurrent ?? false}
                                onCheckedChange={(val: boolean) => {
                                  const updated = (item.roles ?? []).map((r: any) => r.id === role.id ? { ...r, isCurrent: val } : r)
                                  updateSectionItem("experience", item.id, "roles", updated)
                                }}
                                className="scale-[0.55] origin-left"
                              />
                              <span className="text-[9px] font-medium opacity-70">Present</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive shrink-0 mt-3"
                        onClick={() => {
                          const updated = (item.roles ?? []).filter((r: any) => r.id !== role.id)
                          updateSectionItem("experience", item.id, "roles", updated)
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="space-y-1.5 pl-5">
                      <Label className="text-[10px] font-semibold text-muted-foreground">Role Description</Label>
                      <RichTextarea
                        placeholder="Describe your responsibilities for this role..."
                        value={role.description ?? ""}
                        onChange={(val) => {
                          const updated = (item.roles ?? []).map((r: any) => r.id === role.id ? { ...r, description: val } : r)
                          updateSectionItem("experience", item.id, "roles", updated)
                        }}
                        minHeight="80px"
                        source={{ section: "experience", fieldName: "description" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          {(!item.roles || item.roles.length === 0) && (
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <RichTextarea
                placeholder="Describe your responsibilities and achievements..."
                value={item.description ?? ""}
                onChange={(val) => updateSectionItem("experience", item.id, "description", val)}
                minHeight="120px"
                source={{ section: "experience", fieldName: "description" }}
              />
            </div>
          )}
        </div>
      )}
    />
  )
}
