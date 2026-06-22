"use client"

import * as React from "react"
import { useBuilder } from "@/components/builder/builder-context"
import { ScrollArea } from "@/components/shared/ui/scroll-area"
import { Button } from "@/components/shared/ui/button"
import { Plus } from "lucide-react"
import { defaultItems } from "@/components/builder/sections/shared"
import { toast } from "sonner"

/* Section Components */
import { BasicsEditor } from "@/components/builder/editor/BasicsEditor"
import { SummarySection } from "@/components/builder/sections/summary-section"
import { ProfilesSection } from "@/components/builder/sections/profiles-section"
import { ExperienceEditor } from "@/components/builder/editor/ExperienceEditor"
import { EducationEditor } from "@/components/builder/editor/EducationEditor"
import { ProjectsSection } from "@/components/builder/sections/projects-section"
import { AwardsSection, CertificationsSection, VolunteerSection, PublicationsSection, ReferencesSection } from "@/components/builder/sections/common-sections"
import { SkillsEditor } from "@/components/builder/editor/SkillsEditor"
import { TypographySection, ThemeSection, TemplatesSection, CssSection, PageSection } from "@/components/builder/sections/design-sections"
import { LayoutSection } from "@/components/builder/sections/layout-section"
import { CustomListSection } from "@/components/builder/sections/custom-list-section"
import { cn } from "@/lib/utils"

/* Map of section ids → components */
const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  basics: BasicsEditor,
  summary: SummarySection,
  profiles: ProfilesSection,
  experience: ExperienceEditor,
  education: EducationEditor,
  projects: ProjectsSection,
  awards: AwardsSection,
  certifications: CertificationsSection,
  volunteer: VolunteerSection,
  publications: PublicationsSection,
  references: ReferencesSection,
  skills: SkillsEditor,
  languages: SkillsEditor,
  interests: SkillsEditor,
  typography: TypographySection,
  theme: ThemeSection,
  templates: TemplatesSection,
  layout: LayoutSection,
  css: CssSection,
  page: PageSection,
}

/* Sections that support the "Add" button */
const ADDABLE_SECTIONS = ["experience", "education", "projects", "profiles", "awards", "certifications", "publications", "volunteer", "references", "skills", "languages", "interests"]

export function SidebarPanel() {
  const { data, activeSection, setActiveSection, addSectionItem } = useBuilder()
  const [isWizardMode, setIsWizardMode] = React.useState(false)

  const [sidebarWidth, setSidebarWidth] = React.useState(360)
  const [isResizing, setIsResizing] = React.useState(false)

  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const stopResizing = React.useCallback(() => {
    setIsResizing(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  const resize = React.useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX - 48
      if (newWidth >= 330 && newWidth <= 600) setSidebarWidth(newWidth)
    }
  }, [isResizing])

  React.useEffect(() => {
    window.addEventListener("mousemove", resize)
    window.addEventListener("mouseup", stopResizing)
    return () => {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResizing)
    }
  }, [resize, stopResizing])

  const [isMounted, setIsMounted] = React.useState(false)
  React.useEffect(() => { setIsMounted(true) }, [])

  // Calculate dynamic steps
  const customSectionIds = React.useMemo(() => {
    return (data?.sections as any)?.customSections?.map((c: any) => c.id) || []
  }, [data])

  const steps = React.useMemo(() => {
    return [
      "basics",
      "summary",
      "profiles",
      "experience",
      "education",
      "projects",
      "skills",
      "languages",
      "interests",
      "awards",
      "certifications",
      "publications",
      "volunteer",
      "references",
      ...customSectionIds,
      "layout",
      "templates",
      "typography",
      "theme",
      "page"
    ]
  }, [customSectionIds])

  const currentIndex = steps.indexOf(activeSection)

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setActiveSection(steps[currentIndex + 1])
    } else {
      toast.success("Guided Setup complete! Feel free to export your resume.")
      setIsWizardMode(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveSection(steps[currentIndex - 1])
    }
  }

  let SectionComponent = SECTION_COMPONENTS[activeSection]
  if (!SectionComponent && activeSection.startsWith("custom_")) {
    SectionComponent = CustomListSection
  }

  return (
    <div
      className="border-r border-border/40 bg-background/60 backdrop-blur-xl flex flex-col h-full shrink-0 relative group/sidebar overflow-hidden w-full lg:w-auto"
      style={{ width: isMounted && window.innerWidth >= 1024 ? `${sidebarWidth - 50}px` : undefined }}
    >
      {/* Wizard Progress Line */}
      {isWizardMode && currentIndex >= 0 && (
        <div
          className="absolute top-0 left-0 h-[3px] bg-primary transition-all duration-300 z-50"
          style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
        />
      )}

      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/30 transition-colors z-50 hidden lg:block"
        onMouseDown={startResizing}
      />

      <div className="px-3 py-2.5 border-b border-border/40 bg-muted/20 backdrop-blur-md flex items-center gap-2 min-h-[57px] overflow-hidden">
        <div className="flex flex-col min-w-0 flex-1">
          <h2 className="text-xs font-bold tracking-wider uppercase text-foreground/75 truncate">
            {(() => {
              if (activeSection.startsWith("custom_")) {
                const custom = (data.sections as any).customSections?.find((c: any) => c.id === activeSection)
                return custom?.name || "Custom Section"
              }
              return activeSection.replace(/([A-Z])/g, ' $1')
            })()}
          </h2>
          {isWizardMode && currentIndex >= 0 && (
            <span className="text-[10px] text-muted-foreground font-semibold">
              Step {currentIndex + 1} of {steps.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsWizardMode(!isWizardMode)}
            className={cn(
              "h-7 text-[10px] font-bold px-2 hidden lg:flex rounded-md transition-all gap-1 items-center",
              isWizardMode ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Plus className={cn("w-3 h-3 transition-transform", isWizardMode && "rotate-45")} />
            <span>{isWizardMode ? "Exit Wizard" : "Guided Flow"}</span>
          </Button>

          {ADDABLE_SECTIONS.includes(activeSection) && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs rounded-md border-border/80 px-2.5 hover:bg-muted/50 transition-colors shadow-xs"
              onClick={() => addSectionItem(activeSection as any, defaultItems[activeSection])}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 max-w-full w-full overflow-x-hidden">
        <div className={cn("p-4 space-y-6 w-full min-w-0", isWizardMode ? "pb-24" : "pb-20")}>
          {SectionComponent ? <SectionComponent /> : null}
        </div>
      </ScrollArea>

      {/* Sticky Wizard Footer */}
      {isWizardMode && currentIndex >= 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-background/95 border-t border-border/40 flex items-center justify-between z-20 shadow-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className="h-8 text-xs font-semibold"
          >
            Back
          </Button>
          <span className="text-[10px] text-muted-foreground font-bold tracking-tight">
            {(steps[currentIndex] || "").toUpperCase()}
          </span>
          <Button
            size="sm"
            onClick={handleNext}
            className="h-8 text-xs font-semibold px-4"
          >
            {currentIndex === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      )}
    </div>
  )
}
