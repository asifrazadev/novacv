"use client"

import * as React from "react"
import { Menu, X, Share2, Download, Import, Layout, Eye, PenLine, Sparkles } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/shared/ui/sheet"
import { Button } from "@/components/shared/ui/button"
import { useBuilder } from "@/components/builder/builder-context"
import { sections, design } from "@/components/builder/sidebar-rail"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/shared/ui/scroll-area"
import { Separator } from "@/components/shared/ui/separator"
import { ImportDialog } from "@/components/builder/import-dialog"
import { ShareButton } from "@/components/builder/toolbar/ShareButton"

import { FileText, FileJson, Cloud } from "lucide-react"
import { usePrintExport } from "@/hooks/usePrintExport"

export function MobileBuilderNav() {
  const {
    activeSection,
    setActiveSection,
    mobileView,
    setMobileView,
    data,
    title,
    resumeId
  } = useBuilder()
  const [open, setOpen] = React.useState(false)
  const { isExporting, handleExportPDF: triggerPdf, handleExportDocx: triggerDocx, handleExportTxt: triggerTxt, handleExportBackup: triggerBackup } = usePrintExport(resumeId, title, data)

  const handleSectionClick = (id: string) => {
    setActiveSection(id)
    setMobileView("editor") // Switch to editor when a section is picked
    setOpen(false)
  }

  const handleExportPDF = async () => {
    const success = await triggerPdf()
    if (success) {
      setOpen(false)
    }
  }

  const handleExportDocx = async () => {
    const success = await triggerDocx()
    if (success) {
      setOpen(false)
    }
  }

  const handleExportTxt = async () => {
    const success = await triggerTxt()
    if (success) {
      setOpen(false)
    }
  }

  const handleExportBackup = (extension: ".json" | ".novacv") => {
    const success = triggerBackup(extension)
    if (success) {
      setOpen(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b text-left">
          <SheetTitle className="text-lg font-bold">NovaCV Menu</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* View Switching */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Editor View</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={mobileView === "editor" ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 h-9 text-xs px-1"
                  onClick={() => { setMobileView("editor"); setOpen(false); }}
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button
                  variant={mobileView === "preview" ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 h-9 text-xs px-1"
                  onClick={() => { setMobileView("preview"); setOpen(false); }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </Button>
                <Button
                  variant={mobileView === "ai" ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 h-9 text-xs px-1"
                  onClick={() => { setMobileView("ai"); setOpen(false); }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Studio
                </Button>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <ImportDialog
                  trigger={
                    <Button variant="outline" size="sm" className="gap-2 h-9 text-xs">
                      <Import className="w-4 h-4" />
                      Import
                    </Button>
                  }
                />
                <ShareButton
                  trigger={
                    <Button variant="outline" size="sm" className="gap-2 h-9 text-xs">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Exports */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Exports</h4>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 h-9 text-xs"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                >
                  <FileText className="w-4 h-4 text-rose-500" />
                  {isExporting ? "Generating PDF..." : "Export as PDF"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 h-9 text-xs"
                  onClick={handleExportDocx}
                >
                  <FileText className="w-4 h-4 text-primary" />
                  Export as Word (.docx)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 h-9 text-xs"
                  onClick={handleExportTxt}
                >
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Export as Plain Text
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 h-9 text-xs"
                  onClick={() => handleExportBackup(".novacv")}
                >
                  <FileJson className="w-4 h-4 text-blue-500" />
                  Export .novacv Backup
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 h-9 text-xs"
                  onClick={() => handleExportBackup(".json")}
                >
                  <FileJson className="w-4 h-4 text-success" />
                  Export .json Backup
                </Button>
              </div>
            </div>

            <Separator />

            {/* Resume Sections */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Resume Sections</h4>
              <div className="grid grid-cols-2 gap-2">
                {sections.map((item: any) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start gap-2 h-9 px-2 text-xs transition-all duration-250 rounded-md",
                      activeSection === item.id
                        ? "bg-primary/10 text-primary font-semibold shadow-xs ring-1 ring-primary/15"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    )}
                    onClick={() => handleSectionClick(item.id)}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span className="truncate">{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>


            {/* Design */}
            <div className="space-y-3 pb-8">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Design & Settings</h4>
              <div className="grid grid-cols-2 gap-2">
                {design.map((item: any) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start gap-2 h-9 px-2 text-xs transition-all duration-250 rounded-md",
                      activeSection === item.id
                        ? "bg-primary/10 text-primary font-semibold shadow-xs ring-1 ring-primary/15"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    )}
                    onClick={() => handleSectionClick(item.id)}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span className="truncate">{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
