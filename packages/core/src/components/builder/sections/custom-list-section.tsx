"use client"

import * as React from "react"
import { useBuilder } from "@/components/builder/builder-context"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { Button } from "@/components/shared/ui/button"
import { RichTextarea } from "@/components/shared/ui/rich-textarea"
import { Trash2, Link, AlertTriangle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/shared/ui/accordion"
import { v4 as uuidv4 } from "uuid"

export function CustomListSection() {
  const { data, updateSectionItem, updateMetadata, activeSection, setActiveSection } = useBuilder()

  const customSections = (data.sections as any).customSections ?? []
  const currentSection = customSections.find((c: any) => c.id === activeSection)

  if (!currentSection) {
    return (
      <div className="text-center py-8 text-muted-foreground italic text-xs">
        Section not found.
      </div>
    )
  }

  const items = currentSection.items ?? []

  const handleRenameSection = (newName: string) => {
    const updated = customSections.map((c: any) =>
      c.id === activeSection ? { ...c, name: newName } : c
    )
    updateSectionItem("customSections" as any, "", "", updated)
  }

  const handleAddItem = () => {
    const newItem = {
      id: uuidv4(),
      title: "",
      subtitle: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      url: "",
      description: "",
    }
    const updated = customSections.map((c: any) =>
      c.id === activeSection ? { ...c, items: [...(c.items ?? []), newItem] } : c
    )
    updateSectionItem("customSections" as any, "", "", updated)
  }

  const handleDeleteItem = (itemId: string) => {
    const updated = customSections.map((c: any) =>
      c.id === activeSection
        ? { ...c, items: (c.items ?? []).filter((i: any) => i.id !== itemId) }
        : c
    )
    updateSectionItem("customSections" as any, "", "", updated)
  }

  const handleUpdateItem = (itemId: string, field: string, value: any) => {
    const updated = customSections.map((c: any) =>
      c.id === activeSection
        ? {
            ...c,
            items: (c.items ?? []).map((i: any) => (i.id === itemId ? { ...i, [field]: value } : i)),
          }
        : c
    )
    updateSectionItem("customSections" as any, "", "", updated)
  }

  const handleDeleteSection = () => {
    const updated = customSections.filter((c: any) => c.id !== activeSection)
    updateSectionItem("customSections" as any, "", "", updated)

    const rawLayout = (data.metadata as any).layout
    if (rawLayout) {
      const main = (rawLayout.main ?? []).filter((id: string) => id !== activeSection)
      const sidebar = (rawLayout.sidebar ?? []).filter((id: string) => id !== activeSection)
      updateMetadata("layout", { ...rawLayout, main, sidebar })
    }

    setActiveSection("basics")
  }

  return (
    <div className="space-y-6">
      {/* Section Name Rename */}
      <div className="space-y-1.5">
        <Label className="text-xs">Section Name</Label>
        <Input
          value={currentSection.name ?? ""}
          onChange={(e) => handleRenameSection(e.target.value)}
          placeholder="e.g. Hackathons"
          className="h-9 font-semibold"
        />
      </div>

      <div className="flex items-center justify-between border-t border-border/40 pt-4">
        <Label className="text-xs font-bold uppercase text-muted-foreground/80">Section Entries</Label>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 px-3" onClick={handleAddItem}>
          Add Entry
        </Button>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {items.map((item: any) => (
          <AccordionItem key={item.id} value={item.id} className="border-b-0 mb-2 border rounded-md px-3 bg-card/50">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex flex-col items-start pr-4 truncate w-full text-left min-w-0">
                <span className="font-medium text-sm truncate w-full block">{item.title || "Untitled Entry"}</span>
                <span className="text-[11px] text-muted-foreground truncate w-full block">{item.subtitle || ""}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground/70">Title</Label>
                  <Input
                    placeholder="e.g. Winner or Patent Owner"
                    value={item.title ?? ""}
                    onChange={(e) => handleUpdateItem(item.id, "title", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground/70">Subtitle / Org</Label>
                  <Input
                    placeholder="e.g. MIT Hackathon"
                    value={item.subtitle ?? ""}
                    onChange={(e) => handleUpdateItem(item.id, "subtitle", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground/70">Location</Label>
                  <Input
                    placeholder="e.g. Boston, MA"
                    value={item.location ?? ""}
                    onChange={(e) => handleUpdateItem(item.id, "location", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground/70">URL</Label>
                  <div className="relative">
                    <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="https://"
                      value={item.url ?? ""}
                      onChange={(e) => handleUpdateItem(item.id, "url", e.target.value)}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Date inputs */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground/70">Start Date</Label>
                  <Input
                    placeholder="Jan 2024"
                    value={item.startDate ?? ""}
                    onChange={(e) => handleUpdateItem(item.id, "startDate", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground/70">End Date</Label>
                  <Input
                    placeholder="Present"
                    value={item.isCurrent ? "Present" : (item.endDate ?? "")}
                    onChange={(e) => handleUpdateItem(item.id, "endDate", e.target.value)}
                    disabled={item.isCurrent}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`present-custom-${item.id}`}
                  checked={item.isCurrent ?? false}
                  onChange={(e) => handleUpdateItem(item.id, "isCurrent", e.target.checked)}
                  className="rounded border-border/60 text-primary focus:ring-primary h-4 w-4 bg-background"
                />
                <Label htmlFor={`present-custom-${item.id}`} className="text-xs cursor-pointer select-none">
                  I currently study/work/participate here
                </Label>
              </div>

              <div className="space-y-1.5 border-t border-border/40 pt-3">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground/70">Description</Label>
                <RichTextarea
                  placeholder="Describe your role and accomplishments..."
                  value={item.description ?? ""}
                  onChange={(val) => handleUpdateItem(item.id, "description", val)}
                  minHeight="120px"
                  source={{ section: activeSection, fieldName: "description" }}
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteItem(item.id)}
                className="w-full text-destructive hover:bg-destructive/10 h-8 gap-2 mt-4"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Entry
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="border-t border-border/40 pt-6 mt-6">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteSection}
          className="w-full h-9 rounded-md font-semibold gap-1.5 shadow-sm shadow-destructive/10"
        >
          <AlertTriangle className="w-4 h-4" />
          Delete This Custom Section
        </Button>
      </div>
    </div>
  )
}
