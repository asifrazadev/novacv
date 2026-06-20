"use client"

import * as React from "react"
import { useBuilder } from "@/components/builder/builder-context"
import { Input } from "@/components/shared/ui/input"
import { Button } from "@/components/shared/ui/button"
import { Trash2, LayoutGrid, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Skills Suggestions Database ──────────────────────────────────────────────

const SKILL_SUGGESTIONS_DB: Record<string, string[]> = {
  react: ["TypeScript", "Redux", "Next.js", "Tailwind CSS", "JavaScript", "Node.js", "GraphQL", "Vite", "Zustand"],
  typescript: ["React", "Node.js", "Next.js", "GraphQL", "Express", "Zod", "Prisma"],
  python: ["Django", "Flask", "Pandas", "NumPy", "Machine Learning", "FastAPI", "PostgreSQL", "Data Science"],
  aws: ["S3", "Lambda", "EC2", "Docker", "Kubernetes", "Terraform", "CloudFormation", "DynamoDB"],
  docker: ["Kubernetes", "CI/CD", "Terraform", "AWS", "Linux", "GitHub Actions"],
  java: ["Spring Boot", "Hibernate", "SQL", "REST API", "Microservices", "Maven", "Docker"],
  javascript: ["React", "HTML5", "CSS3", "Node.js", "jQuery", "TypeScript", "ES6"],
  node: ["Express", "MongoDB", "PostgreSQL", "GraphQL", "REST API", "TypeScript", "Redis"],
  nextjs: ["Tailwind CSS", "TypeScript", "Vercel", "React", "Prisma", "Zustand"],
  sql: ["PostgreSQL", "MySQL", "Database Design", "NoSQL", "Redis", "MongoDB"],
  kubernetes: ["Docker", "Helm", "ArgoCD", "DevOps", "AWS", "CI/CD"],
  angular: ["TypeScript", "RxJS", "HTML5", "CSS3", "SASS", "Ngrx"],
  vue: ["Nuxt.js", "Vuex", "TypeScript", "Tailwind CSS", "JavaScript"],
  devops: ["Docker", "Kubernetes", "Jenkins", "Terraform", "Ansible", "CI/CD", "AWS"],
  git: ["GitHub", "GitLab", "CI/CD", "Linux", "Agile"],
  figma: ["UI/UX Design", "Product Design", "Prototyping", "Adobe XD", "CSS3"],
}

// ── Category Skills Item ─────────────────────────────────────────────────────

function SkillCategoryItem({ item, skillsMode }: { item: any; skillsMode: string }) {
  const { updateSectionItem, deleteSectionItem } = useBuilder()
  const [inputValue, setInputValue] = React.useState(() => {
    return Array.isArray(item.keywords) ? item.keywords.join(", ") : (item.keywords || "")
  })

  React.useEffect(() => {
    const externalValue = Array.isArray(item.keywords) ? item.keywords.join(", ") : (item.keywords || "")
    const normalizedInternal = inputValue.split(",").map((k: string) => k.trim()).filter(Boolean).join(", ")
    const normalizedExternal = externalValue.split(",").map((k: string) => k.trim()).filter(Boolean).join(", ")
    if (normalizedInternal !== normalizedExternal) {
      setInputValue(externalValue)
    }
  }, [item.keywords, inputValue])

  const handleKeywordsChange = (val: string) => {
    setInputValue(val)
    const keywords = val.split(",").map((k: string) => k.trim()).filter(Boolean)
    updateSectionItem("skills", item.id, "keywords", keywords)
  }

  const catName = (item.name || "").toLowerCase().trim()
  const currentKeywords = React.useMemo(() => {
    return (item.keywords || []).map((k: string) => k.toLowerCase().trim()).filter(Boolean)
  }, [item.keywords])

  const categorySuggestions = React.useMemo(() => {
    if (skillsMode !== "category") return []
    const suggestedSet = new Set<string>()
    const searchTerms = [catName, ...currentKeywords]
    searchTerms.forEach((term) => {
      if (!term) return
      Object.keys(SKILL_SUGGESTIONS_DB).forEach((key) => {
        if (term.includes(key) || key.includes(term)) {
          SKILL_SUGGESTIONS_DB[key].forEach((rec) => {
            if (!currentKeywords.includes(rec.toLowerCase().trim())) {
              suggestedSet.add(rec)
            }
          })
        }
      })
    })
    return Array.from(suggestedSet).slice(0, 6)
  }, [catName, currentKeywords, skillsMode])

  const handleAddSuggestion = (suggestion: string) => {
    const keywords = [...(item.keywords || [])]
    if (!keywords.map(k => k.toLowerCase().trim()).includes(suggestion.toLowerCase().trim())) {
      keywords.push(suggestion)
      handleKeywordsChange(keywords.join(", "))
    }
  }

  return (
    <div className="p-3 border rounded-md bg-card/50 space-y-2.5">
      <div className="flex gap-2">
        <Input
          value={item.name ?? ""}
          onChange={(e) => updateSectionItem("skills", item.id, "name", e.target.value)}
          placeholder={skillsMode === "category" ? "Category (e.g. Languages)" : "Skill name (e.g. React)"}
          className="h-8 shadow-none"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteSectionItem("skills", item.id)}
          className="h-8 w-8 text-destructive shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {skillsMode === "category" && (
        <div className="space-y-1.5">
          <Input
            placeholder="Skills (comma separated, e.g. React, TypeScript, Node.js)"
            value={inputValue}
            onChange={(e) => handleKeywordsChange(e.target.value)}
            className="h-7 text-[11px] bg-muted/30 border-dashed px-2"
          />
          {categorySuggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
              <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider shrink-0">Recs:</span>
              {categorySuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleAddSuggestion(s)}
                  className="text-[9px] font-semibold bg-primary/5 text-primary border border-primary/10 rounded px-1.5 py-0.5 hover:bg-primary/15 transition-colors cursor-pointer select-none"
                >
                  +{s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Skills Section ──────────────────────────────────────────────────────────

function SkillsSection() {
  const { data, updateMetadata, addSectionItem } = useBuilder()
  const skillsMode = data.metadata.skillsMode ?? "category"
  const items = data.sections.skills

  const existingSkills = React.useMemo(() => {
    return items.map((i: any) => (i.name || "").toLowerCase().trim()).filter(Boolean)
  }, [items])

  const simpleSuggestions = React.useMemo(() => {
    if (skillsMode !== "simple") return []
    const suggestedSet = new Set<string>()
    existingSkills.forEach((skill) => {
      Object.keys(SKILL_SUGGESTIONS_DB).forEach((key) => {
        if (skill.includes(key) || key.includes(skill)) {
          SKILL_SUGGESTIONS_DB[key].forEach((rec) => {
            if (!existingSkills.includes(rec.toLowerCase().trim())) {
              suggestedSet.add(rec)
            }
          })
        }
      })
    })
    return Array.from(suggestedSet).slice(0, 8)
  }, [existingSkills, skillsMode])

  const handleAddSimpleSuggestion = (name: string) => {
    addSectionItem("skills", { name, keywords: [] })
  }

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border/40">
        <button
          onClick={() => updateMetadata("skillsMode" as any, "simple")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-md text-xs font-semibold transition-all",
            skillsMode === "simple"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Tag className="w-3.5 h-3.5" />
          Simple Tags
        </button>
        <button
          onClick={() => updateMetadata("skillsMode" as any, "category")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-md text-xs font-semibold transition-all",
            skillsMode === "category"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Categories
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        {skillsMode === "simple"
          ? "Each entry is a skill tag displayed as a pill. Great for a clean, minimal look."
          : "Each entry is a category (e.g. Languages) with comma-separated skills listed beneath it."}
      </p>

      {/* Items */}
      {items.map((item) => (
        <SkillCategoryItem key={item.id} item={item} skillsMode={skillsMode} />
      ))}

      {/* Simple Suggestions Box */}
      {skillsMode === "simple" && simpleSuggestions.length > 0 && (
        <div className="p-3 border border-border/40 rounded-lg bg-primary/5 space-y-2 mt-4">
          <div className="text-[10px] font-bold text-primary uppercase tracking-wider">💡 Suggested Skills</div>
          <div className="flex flex-wrap gap-1.5">
            {simpleSuggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleAddSimpleSuggestion(s)}
                className="text-[10px] font-semibold bg-background hover:bg-muted text-foreground border border-border rounded-md px-2 py-0.5 transition-colors cursor-pointer select-none"
              >
                +{s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Languages + Interests ────────────────────────────────────────────────────

function OtherTagSection({ section }: { section: string }) {
  const { data, updateSectionItem, deleteSectionItem } = useBuilder()
  const items = data.sections[section as keyof typeof data.sections] as any[]

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="p-3 border rounded-md bg-card/50 space-y-3">
          <div className="flex gap-2">
            <Input
              value={item.name ?? ""}
              onChange={(e) => updateSectionItem(section as any, item.id, "name", e.target.value)}
              className="h-8 shadow-none"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteSectionItem(section as any, item.id)}
              className="h-8 w-8 text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {item.level !== undefined && section === "languages" && (() => {
            const steps = [
              { val: 20, label: "Beginner" },
              { val: 40, label: "Elementary" },
              { val: 60, label: "Intermediate" },
              { val: 80, label: "Upper-Intermediate" },
              { val: 100, label: "Advanced / Native" },
            ]
            return (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {steps.map((s) => {
                    const isSelected = item.level >= s.val
                    return (
                      <button
                        key={s.val}
                        onClick={() => updateSectionItem("languages", item.id, "level", s.val)}
                        className={cn(
                          "h-2 flex-1 rounded-full transition-all",
                          isSelected ? "bg-primary" : "bg-muted hover:bg-muted/80"
                        )}
                        title={s.label}
                      />
                    )
                  })}
                </div>
                <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground">
                  <span>{steps.find((s) => s.val === item.level)?.label || "Select Level"}</span>
                </div>
              </div>
            )
          })()}
        </div>
      ))}
    </div>
  )
}

// ── Unified Export ───────────────────────────────────────────────────────────

export function SkillsEditor() {
  const { activeSection } = useBuilder()

  if (!["skills", "languages", "interests"].includes(activeSection)) return null

  if (activeSection === "skills") return <SkillsSection />
  return <OtherTagSection section={activeSection} />
}
