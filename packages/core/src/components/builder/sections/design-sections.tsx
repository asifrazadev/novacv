"use client"

import * as React from "react"
import { useBuilder } from "@/components/builder/builder-context"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { Textarea } from "@/components/shared/ui/textarea"
import { Button } from "@/components/shared/ui/button"
import { Slider } from "@/components/shared/ui/slider"
import { Check, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { templates } from "@/templates"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select"

/* ── Typography Section ── */
export function TypographySection() {
  const { data, updateMetadata } = useBuilder()

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Font Family</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {["Inter", "Roboto", "Outfit", "Playfair Display", "Lora", "EB Garamond", "Georgia", "JetBrains Mono"].map(f => (
            <Button key={f} variant={data.metadata.typography.fontFamily === f ? "default" : "outline"} className="justify-start text-[10px] px-2 h-9 truncate" onClick={() => updateMetadata("typography", { ...data.metadata.typography, fontFamily: f })}>{f}</Button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-medium"><Label>Size</Label><span>{data.metadata.typography.fontSize}pt</span></div>
        <Slider value={[data.metadata.typography.fontSize]} onValueChange={([v]) => updateMetadata("typography", { ...data.metadata.typography, fontSize: v })} min={8} max={18} step={0.5} />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-medium"><Label>Line Height</Label><span>{data.metadata.typography.lineHeight || 1.4}</span></div>
        <Slider value={[data.metadata.typography.lineHeight || 1.4]} onValueChange={([v]) => updateMetadata("typography", { ...data.metadata.typography, lineHeight: v })} min={1.0} max={2.5} step={0.1} />
      </div>
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between text-xs font-medium"><Label>Name Text Size</Label><span>{data.metadata.typography.nameSize ?? 24}pt</span></div>
        <Slider value={[data.metadata.typography.nameSize ?? 24]} onValueChange={([v]) => updateMetadata("typography", { ...data.metadata.typography, nameSize: v })} min={14} max={48} step={1} />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-medium"><Label>Headline Text Size</Label><span>{data.metadata.typography.headlineSize ?? 12}pt</span></div>
        <Slider value={[data.metadata.typography.headlineSize ?? 12]} onValueChange={([v]) => updateMetadata("typography", { ...data.metadata.typography, headlineSize: v })} min={8} max={24} step={0.5} />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-medium"><Label>Heading Text Size</Label><span>{data.metadata.typography.sectionTitleSize ?? 10}pt</span></div>
        <Slider value={[data.metadata.typography.sectionTitleSize ?? 10]} onValueChange={([v]) => updateMetadata("typography", { ...data.metadata.typography, sectionTitleSize: v })} min={8} max={20} step={0.5} />
      </div>
      <div className="space-y-3 pt-4 border-t">
        <Label>Body Text Color</Label>
        <div className="flex gap-2">
          <Input 
            type="color" 
            value={data.metadata.typography.color || "#000000"} 
            onChange={(e) => updateMetadata("typography", { ...data.metadata.typography, color: e.target.value })} 
            className="w-12 h-9 p-0.5 border-border/60 rounded" 
          />
          <Input 
            type="text" 
            value={data.metadata.typography.color || "#000000"} 
            onChange={(e) => updateMetadata("typography", { ...data.metadata.typography, color: e.target.value })} 
            className="h-9 text-xs" 
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  )
}

/* ── Theme Section ── */
export function ThemeSection() {
  const { data, updateMetadata } = useBuilder()

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Primary Theme Color</Label>
        <div className="grid grid-cols-5 gap-2">
          {["#2563eb", "#dc2626", "#16a34a", "#9333ea", "#000000"].map(c => (
            <button key={c} className={cn("w-full aspect-square rounded-full border-2", data.metadata.design.primaryColor === c ? "border-foreground" : "border-transparent")} style={{ backgroundColor: c }} onClick={() => updateMetadata("design", { ...data.metadata.design, primaryColor: c })} />
          ))}
        </div>
      </div>
      <div className="space-y-3 pt-2">
        <Label className="text-xs">Custom Accent Color</Label>
        <div className="flex gap-2">
          <Input 
            type="color" 
            value={data.metadata.design.primaryColor || "#2563eb"} 
            onChange={(e) => updateMetadata("design", { ...data.metadata.design, primaryColor: e.target.value })} 
            className="w-12 h-9 p-0.5 border-border/60 rounded" 
          />
          <Input 
            type="text" 
            value={data.metadata.design.primaryColor || "#2563eb"} 
            onChange={(e) => updateMetadata("design", { ...data.metadata.design, primaryColor: e.target.value })} 
            className="h-9 text-xs" 
            placeholder="#2563eb"
          />
        </div>
      </div>
      <div className="space-y-4 pt-4 border-t">
        <div className="flex justify-between text-xs font-medium"><Label>Corner Radius</Label><span>{data.metadata.design.borderRadius}px</span></div>
        <Slider value={[data.metadata.design.borderRadius]} onValueChange={([v]) => updateMetadata("design", { ...data.metadata.design, borderRadius: v })} max={20} />
      </div>
    </div>
  )
}

/* ── Templates Section ── */
export function TemplatesSection() {
  const { data, setTemplate } = useBuilder()
  const [templateSearch, setTemplateSearch] = React.useState("")

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(templateSearch.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search templates..." className="pl-9 h-10" value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)} /></div>
      <div className="grid gap-4">
        {filteredTemplates.map(t => (
          <button key={t.id} onClick={() => setTemplate(t.id, t.defaultLayout)} className={cn("flex flex-col p-4 rounded-xl border-2 transition-all text-left relative group", data.metadata.template === t.id ? "border-blue-600 bg-blue-50/50" : "border-transparent bg-muted/30 hover:bg-muted/50")}>
            <div className="aspect-[3/4] w-full rounded-lg bg-white border border-black/5 mb-3 overflow-hidden relative shadow-sm transition-transform group-hover:scale-[1.02]">
              {t.thumbnail ? (
                <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold opacity-30 uppercase bg-muted/30">
                  {t.name}
                </div>
              )}
            </div>
            <h3 className="text-sm font-bold">{t.name}</h3>
            {data.metadata.template === t.id && <div className="absolute top-6 right-6 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center shadow-lg z-10"><Check className="w-3 h-3 text-white" /></div>}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── CSS Section ── */
export function CssSection() {
  const { data, updateMetadata } = useBuilder()

  return (
    <div className="space-y-4">
      <Textarea
        value={data.metadata.css}
        onChange={(e) => updateMetadata("css", e.target.value)}
        placeholder=".modern-template { ... }"
        className="min-h-[500px] font-mono text-[11px] leading-relaxed bg-muted/10 shrink-0"
      />
    </div>
  )
}

/* ── Page Section ── */
export function PageSection() {
  const { data, updateMetadata } = useBuilder()

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-xs font-bold uppercase text-muted-foreground">Page Layout</Label>

        <div className="space-y-3">
          <Label>Paper Format</Label>
          <Select
            value={data.metadata.page?.format || "a4"}
            onValueChange={(val) => {
              const formats: Record<string, { w: number, h: number }> = {
                a4: { w: 210, h: 297 },
                letter: { w: 215.9, h: 279.4 },
                legal: { w: 215.9, h: 355.6 },
                executive: { w: 184.1, h: 266.7 },
              }
              if (val === "custom") {
                updateMetadata("page", { ...data.metadata.page, format: "custom" })
              } else {
                updateMetadata("page", {
                  ...data.metadata.page,
                  format: val,
                  width: formats[val].w,
                  height: formats[val].h
                })
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">A4 (210 x 297mm)</SelectItem>
              <SelectItem value="letter">Letter (8.5 x 11in)</SelectItem>
              <SelectItem value="legal">Legal (8.5 x 14in)</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
              <SelectItem value="custom">Custom Size</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 pt-2">
          <Label>Language</Label>
          <Select
            value={data.metadata.language || "en"}
            onValueChange={(val) => {
              updateMetadata("language", val)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English (US)</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="it">Italiano</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data.metadata.page?.format === "custom" && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Width (mm)</Label>
              <Input type="number" value={data.metadata.page?.width || 210} onChange={(e) => updateMetadata("page", { ...data.metadata.page, width: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Height (mm)</Label>
              <Input type="number" value={data.metadata.page?.height || 297} onChange={(e) => updateMetadata("page", { ...data.metadata.page, height: Number(e.target.value) })} />
            </div>
          </div>
        )}

        <div className="space-y-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <Label>Page Padding ({data.metadata.page?.padding || 20}mm)</Label>
          </div>
          <Slider value={[data.metadata.page?.padding || 20]} onValueChange={([val]) => updateMetadata("page", { ...data.metadata.page, padding: val })} min={0} max={50} step={1} />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Adjust the white space around your resume content. A standard padding is usually between 15mm and 25mm.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-orange-50 border border-orange-100 text-[10px] text-orange-800 leading-relaxed">
        <p><strong>Pro Tip:</strong> Most printers use A4 or Letter. Changing this might require re-adjusting your layout to fit the new dimensions.</p>
      </div>
    </div>
  )
}
