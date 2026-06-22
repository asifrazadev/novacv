"use client"

import * as React from "react"
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Code2,
  Languages,
  Award,
  Layout,
  Type,
  Palette,
  Plus,
  Globe,
  FolderKanban,
  Heart,
  BadgeCheck,
  BookOpen,
  HandHeart,
  Quote,
  Settings,
  Search,
  BarChart,
  Target,
  FileCode,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import { useBuilder } from "@/components/builder/builder-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shared/ui/tooltip"

export const sections = [
  { id: "basics", icon: User, label: "Basics" },
  { id: "summary", icon: FileText, label: "Summary" },
  { id: "profiles", icon: Globe, label: "Profiles" },
  { id: "experience", icon: Briefcase, label: "Experience" },
  { id: "education", icon: GraduationCap, label: "Education" },
  { id: "projects", icon: FolderKanban, label: "Projects" },
  { id: "skills", icon: Code2, label: "Skills" },
  { id: "languages", icon: Languages, label: "Languages" },
  { id: "interests", icon: Heart, label: "Interests" },
  { id: "awards", icon: Award, label: "Awards" },
  { id: "certifications", icon: BadgeCheck, label: "Certifications" },
  { id: "publications", icon: BookOpen, label: "Publications" },
  { id: "volunteer", icon: HandHeart, label: "Volunteer" },
  { id: "references", icon: Quote, label: "References" },
  { id: "layout", icon: Layout, label: "Layout" },
]

export const design = [
  { id: "templates", icon: Layout, label: "Templates" },
  { id: "typography", icon: Type, label: "Typography" },
  { id: "theme", icon: Palette, label: "Theme" },
  { id: "page", icon: Settings, label: "Page Settings" },
  { id: "css", icon: FileCode, label: "Custom CSS" },
]

export function SidebarRail() {
  const { data, activeSection, setActiveSection } = useBuilder()
  const customSections = (data?.sections as any)?.customSections ?? []

  return (
    <TooltipProvider delayDuration={0}>
      <div id="tour-builder-sidebar" className={`${activeSection === "" ? "w-40" : "w-15"} ${activeSection === "" ? "items-start pl-2" : "items-center"} overflow-x-hidden border-r border-border/40 bg-muted/10 backdrop-blur-md flex flex-col relative z-40 py-4 gap-4 h-full overflow-y-auto scrollbar-hide shrink-0 z-10`}>
        <div className="flex flex-col gap-2">
          {sections.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 ${activeSection === "" ? "w-full p-2 items-center justify-start" : "w-9"} transition-all duration-200  rounded-md ${activeSection === item.id
                    ? "bg-primary/10 text-primary capitalize  font-semibold shadow-sm ring-1 ring-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon className="!h-5 !w-5" />
                  {activeSection === "" && <p>{item.label}</p>}
                </Button>
              </TooltipTrigger>
              {activeSection !== "" && <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>}
            </Tooltip>
          ))}

          {customSections.map((item: any) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 ${activeSection === "" ? "w-full p-2 items-center justify-start" : "w-9"} transition-all duration-200 rounded-md ${activeSection === item.id
                    ? "bg-primary/10 text-primary font-semibold shadow-sm ring-1 ring-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Sparkles className="!h-5 !w-5 text-primary" />
                  {activeSection === "" && <p>{item.name || "Custom Section"}</p>}
                </Button>
              </TooltipTrigger>
              {activeSection !== "" && <TooltipContent side="right">
                <p>{item.name || "Custom Section"}</p>
              </TooltipContent>}
            </Tooltip>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t border-border/40 pt-4">
          {design.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 ${activeSection === "" ? "w-full p-2 items-center justify-start" : "w-9"} transition-all duration-200 rounded-md ${activeSection === item.id
                    ? "bg-primary/10 text-primary font-semibold shadow-sm ring-1 ring-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon className="!h-5 !w-5" />
                  {activeSection === "" && <p>{item.label}</p>}
                </Button>
              </TooltipTrigger>
              {activeSection !== "" && <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>}
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
