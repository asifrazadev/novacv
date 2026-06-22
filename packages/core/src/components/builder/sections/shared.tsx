"use client"

import * as React from "react"
import { useBuilder } from "@/components/builder/builder-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/shared/ui/accordion"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { Switch } from "@/components/shared/ui/switch"
import { Button } from "@/components/shared/ui/button"
import { Trash2, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

/* ── Default items for each section ── */
export const defaultItems: Record<string, any> = {
  experience: { company: "", position: "", location: "", startDate: "", endDate: "", isCurrent: false, website: "", websiteLabel: "", showLinkInTitle: false, roles: [], description: "" },
  education: { school: "", areaOfStudy: "", degree: "", grade: "", location: "", startDate: "", endDate: "", isCurrent: false, website: "", websiteLabel: "", showLinkInTitle: false, description: "" },
  projects: { name: "", description: "", url: "", websiteLabel: "", startDate: "", endDate: "", isCurrent: false, showLinkInTitle: false },
  profiles: { network: "", username: "", url: "", icon: "" },
  awards: { title: "", awarder: "", date: "", url: "", websiteLabel: "", showLinkInTitle: false, description: "" },
  certifications: { name: "", issuer: "", date: "", url: "", websiteLabel: "", showLinkInTitle: false, description: "" },
  publications: { name: "", publisher: "", date: "", url: "", websiteLabel: "", showLinkInTitle: false, description: "" },
  volunteer: { organization: "", position: "", startDate: "", endDate: "", isCurrent: false, website: "", websiteLabel: "", showLinkInTitle: false, description: "" },
  references: { name: "", position: "", phone: "", email: "", website: "", websiteLabel: "", showLinkInTitle: false, description: "" },
  skills: { name: "", level: 100 },
  languages: { name: "", level: 100 },
  interests: { name: "" },
}

/* ── Date Range ── */
export function DateRange({ section, item }: { section: string; item: any }) {
  const { updateSectionItem } = useBuilder()

  return (
    <div className="space-y-3 pt-2 border-t mt-2">
      <div className="grid grid-cols-2 gap-3 pb-1">
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground/70">Start Date</Label>
          <Input placeholder="Jan 2024" value={item.startDate ?? ""} onChange={(e) => updateSectionItem(section as any, item.id, "startDate", e.target.value)} className="h-8 text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground/70">End Date</Label>
          <Input
            placeholder="Present"
            value={item.isCurrent ? "Present" : (item.endDate ?? "")}
            onChange={(e) => updateSectionItem(section as any, item.id, "endDate", e.target.value)}
            disabled={item.isCurrent}
            className="h-8 text-xs"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id={`present-${item.id}`}
          checked={item.isCurrent ?? false}
          onCheckedChange={(val: boolean) => updateSectionItem(section as any, item.id, "isCurrent", val)}
          className="scale-75 origin-left"
        />
        <Label htmlFor={`present-${item.id}`} className="text-xs cursor-pointer">I currently study/work here</Label>
      </div>
    </div>
  )
}

/* ── Sortable Accordion Item Wrapper ── */
function SortableAccordionItem({
  item,
  section,
  renderForm,
}: {
  item: any
  section: string
  renderForm: (item: any) => React.ReactNode
}) {
  const { deleteSectionItem } = useBuilder()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  }

  return (
    <AccordionItem
      ref={setNodeRef}
      style={style}
      value={item.id}
      className={cn(
        "border-b-0 mb-2 border w-full rounded-md px-3 bg-card/50 overflow-hidden relative transition-all",
        isDragging && "opacity-50 ring-2 ring-primary border-primary bg-primary/5 shadow-lg"
      )}
    >
      <div className="flex items-center w-full">
        {/* Grab Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2.5 -ml-1.5 hover:bg-muted rounded transition-colors touch-none shrink-0"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
        </div>

        <AccordionTrigger className="hover:no-underline w-90 py-3 overflow-hidden flex select-none pr-4">
          <div className="flex flex-col items-start pr-4 truncate w-full text-left min-w-0 max-w-full">
            <span className="font-medium text-sm truncate w-full block">
              {item.company || item.school || item.name || item.title || item.organization || "Untitled"}
            </span>
            <span className="text-[11px] text-muted-foreground truncate w-full block">
              {item.position || item.degree || item.date || item.issuer || item.publisher || ""}
            </span>
          </div>
        </AccordionTrigger>
      </div>

      <AccordionContent className="space-y-4 pb-4 pl-7">
        {renderForm(item)}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteSectionItem(section as any, item.id)}
          className="w-full text-destructive hover:bg-destructive/10 h-8 gap-2 mt-4"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Entry
        </Button>
      </AccordionContent>
    </AccordionItem>
  )
}

/* ── ListSection — shared accordion wrapper for all list-type sections ── */
export function ListSection({
  section,
  renderForm,
}: {
  section: string
  renderForm: (item: any) => React.ReactNode
}) {
  const { data, reorderSectionItems } = useBuilder()
  const items = (data.sections[section as keyof typeof data.sections] as any[]) || []

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderSectionItems(section as any, oldIndex, newIndex)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <Accordion type="single" collapsible className="!w-full">
          {items.map((item) => (
            <SortableAccordionItem
              key={item.id}
              item={item}
              section={section}
              renderForm={renderForm}
            />
          ))}
        </Accordion>
      </SortableContext>
    </DndContext>
  )
}
