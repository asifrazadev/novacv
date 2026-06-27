"use client"

import * as React from "react"
import { useBuilder } from "@/components/builder/builder-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/shared/ui/dialog"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { Switch } from "@/components/shared/ui/switch"
import { Button } from "@/components/shared/ui/button"
import { Trash2, GripVertical, Pencil } from "lucide-react"
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
  skills: { name: "", level: 0 },
  languages: { name: "", level: 0 },
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

/* ── Sortable List Item ── */
function SortableListItem({
  item,
  onEdit,
}: {
  item: any
  onEdit: () => void
}) {
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
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center border max-w-full rounded-md px-3 py-2.5 bg-card/50 overflow-hidden relative transition-all group hover:border-primary/50",
        isDragging && "opacity-50 ring-2 ring-primary border-primary bg-primary/5 shadow-lg"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 -ml-2 mr-1 hover:bg-muted rounded transition-colors touch-none shrink-0"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>

      <div
        className="flex flex-col items-start pr-2 truncate w-full text-left min-w-0 max-w-full cursor-pointer"
        onClick={onEdit}
      >
        <span className="font-semibold text-sm truncate w-full block">
          {item.company || item.school || item.name || item.title || item.organization || "Untitled"}
        </span>
        <span className="text-xs font-medium text-muted-foreground truncate w-full block mt-0.5">
          {item.position || item.degree || item.date || item.issuer || item.publisher || "Click to edit"}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        className="shrink-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 hover:bg-primary/20 text-primary"
      >
        <Pencil className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

/* ── ListSection — shared wrapper for all list-type sections ── */
export function ListSection({
  section,
  renderForm,
}: {
  section: string
  renderForm: (item: any) => React.ReactNode
}) {
  const { data, reorderSectionItems, deleteSectionItem } = useBuilder()
  const items = (data.sections[section as keyof typeof data.sections] as any[]) || []

  const [editingItemId, setEditingItemId] = React.useState<string | null>(null)
  const previousLengthRef = React.useRef(items.length)

  // Auto-open dialog when a new item is added
  React.useEffect(() => {
    if (items.length > previousLengthRef.current) {
      setEditingItemId(items[items.length - 1].id)
    }
    previousLengthRef.current = items.length
  }, [items.length, items])

  const activeItem = React.useMemo(() => items.find(i => i.id === editingItemId), [items, editingItemId])

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
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3  max-w-full">
            {items.map((item) => (
              <SortableListItem
                key={item.id}
                item={item}
                onEdit={() => setEditingItemId(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={!!editingItemId} onOpenChange={(open) => !open && setEditingItemId(null)}>
        <DialogContent className="max-w-3xl w-[95vw] h-[90dvh] sm:h-[85vh] flex flex-col p-0 overflow-hidden bg-background border-border/50 shadow-2xl">
          <DialogHeader className="p-4 border-b shrink-0 bg-muted/10">
            <DialogTitle className="capitalize font-bold tracking-tight">Edit {section.replace(/([A-Z])/g, ' $1').trim()}</DialogTitle>
            <DialogDescription className="sr-only">Make changes to your {section} entry.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeItem && renderForm(activeItem)}
          </div>

          <div className="p-4 border-t flex justify-between shrink-0 bg-muted/10">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (activeItem) deleteSectionItem(section as any, activeItem.id);
                setEditingItemId(null);
              }}
              className="gap-1.5 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
            <Button
              size="sm"
              className="px-6 font-semibold shadow-sm"
              onClick={() => setEditingItemId(null)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
