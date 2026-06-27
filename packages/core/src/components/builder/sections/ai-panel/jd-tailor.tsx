"use client"

import * as React from "react"
import { Loader2, Sparkles, Check, Plus } from "lucide-react"
import { useBuilder } from "@/components/builder/builder-context"
import { useAIStore } from "@/store/use-ai-store"
import { Button } from "@/components/shared/ui/button"
import { Textarea } from "@/components/shared/ui/textarea"
import { Label } from "@/components/shared/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { convertMarkdownToHtml } from "./utils"
import { tailorResumeWithAI } from "@/actions/ai"


export interface JDTailorProps {
  getRenderedText: () => string;
  jobDescription: string;
  setJobDescription: (jd: string) => void;
}

export function JDTailor({ getRenderedText, jobDescription, setJobDescription }: JDTailorProps) {
  const { data, updateSectionItem, addSectionItem } = useBuilder()
  const aiStore = useAIStore()
  
  const [isTailoring, setIsTailoring] = React.useState(false)
  const [tailorResult, setTailorResult] = React.useState<{
    tailoredSummary: string;
    recommendedSkills: string[];
    experienceSuggestions: { id: string; company: string; position: string; bulletSuggestions: string[] }[];
  } | null>(null)

  const [appliedSkills, setAppliedSkills] = React.useState<Record<string, boolean>>({})
  const [appliedSummary, setAppliedSummary] = React.useState(false)
  const [appliedExperience, setAppliedExperience] = React.useState<Record<string, boolean>>({})

  const renderedText = React.useMemo(() => getRenderedText().toLowerCase(), [getRenderedText])

  const jdSkillsMatch = React.useMemo(() => {
    if (!jobDescription.trim()) return null;

    const commonKeywords = [
      "react", "next.js", "nextjs", "vue", "angular", "node.js", "nodejs", "javascript", "typescript",
      "python", "java", "c++", "c#", "go", "golang", "rust", "ruby", "php", "sql", "nosql", "mongodb",
      "postgresql", "postgres", "mysql", "redis", "docker", "kubernetes", "aws", "gcp", "azure",
      "ci/cd", "git", "tailwind", "css", "html", "graphql", "rest api", "agile", "scrum", "jira",
      "figma", "machine learning", "ai", "data science", "devops", "cloud", "security", "linux",
      "testing", "jest", "cypress", "redux", "webpack", "vite", "prisma", "sequelize", "django",
      "flask", "spring boot", "kotlin", "swift", "flutter", "react native", "restful", "microservices"
    ];

    const lowercaseJD = jobDescription.toLowerCase();
    const matchedJDSkills = commonKeywords.filter(kw => lowercaseJD.includes(kw));

    if (matchedJDSkills.length === 0) return null;

    const foundResumeSkills = matchedJDSkills.filter(kw => renderedText.includes(kw));

    const percentage = Math.round((foundResumeSkills.length / matchedJDSkills.length) * 100);

    return {
      foundCount: foundResumeSkills.length,
      totalCount: matchedJDSkills.length,
      percentage,
      missingSkills: matchedJDSkills.filter(kw => !foundResumeSkills.includes(kw))
    };
  }, [jobDescription, getRenderedText]);

  

  // --- AI Tailoring ---
  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a target job description.")
      return
    }
    setIsTailoring(true)
    setTailorResult(null)
    setAppliedSkills({})
    setAppliedSummary(false)
    setAppliedExperience({})

    const textContext = getRenderedText()
    const response = await tailorResumeWithAI(
      textContext,
      data,
      jobDescription,
      {
        provider: aiStore.provider,
        model: aiStore.model,
        baseUrl: aiStore.baseUrl,
        apiKey: aiStore.apiKey
      }
    )

    if (response.success && response.result) {
      setTailorResult(response.result)
      toast.success("AI tailoring recommendations generated!")
    } else {
      toast.error(response.error || "Failed to tailor resume.")
    }
    setIsTailoring(false)
  }

  const handleApplySummary = () => {
    if (!tailorResult) return
    const formattedSummary = convertMarkdownToHtml(tailorResult.tailoredSummary)
    updateSectionItem("summary", "", "content", formattedSummary)
    setAppliedSummary(true)
    toast.success("Tailored summary applied to resume!")
  }

  const isSkillAlreadyPresent = (skillName: string): boolean => {
    if (!skillName) return false

    const parts = skillName.split(/[\/&]|\band\b/i).map(p => p.trim()).filter(Boolean)

    const checkSinglePart = (part: string): boolean => {
      const normalizedSkill = part.toLowerCase()

      const existsInSkills = data.sections.skills?.some(s => {
        if (s.name.toLowerCase() === normalizedSkill) return true
        return s.keywords?.some(k => {
          const normalizedK = k.trim().toLowerCase()
          if (normalizedK === normalizedSkill) return true
          if (normalizedK === "react" && normalizedSkill === "react.js") return true
          if (normalizedK === "react.js" && normalizedSkill === "react") return true
          if (normalizedK === "node" && normalizedSkill === "node.js") return true
          if (normalizedK === "node.js" && normalizedSkill === "node") return true
          if (normalizedK === "git" && normalizedSkill === "git version control") return true
          if (normalizedK === "git version control" && normalizedSkill === "git") return true
          return false
        })
      })
      if (existsInSkills) return true

      const existsInLanguages = data.sections.languages?.some(l =>
        l.name.toLowerCase() === normalizedSkill
      )
      if (existsInLanguages) return true

      const escapedSkill = normalizedSkill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i')
      if (regex.test(renderedText)) return true

      return false
    }

    return parts.every(p => checkSinglePart(p))
  }

  const findMostRelevantCategory = (skillName: string): string | null => {
    const normalizedSkill = skillName.toLowerCase();

    const categoryKeywords: Record<string, string[]> = {
      frontend: ["react", "next", "redux", "tailwind", "bootstrap", "shadcn", "html", "css", "js", "javascript", "vue", "angular", "sass", "less", "webpack", "vite", "ui", "ux", "frontend"],
      backend: ["node", "express", "django", "flask", "springboot", "spring", "laravel", "nest", "graphql", "rest", "api", "backend", "middleware", "auth", "jwt", "oauth"],
      database: ["mongo", "mysql", "postgres", "supabase", "redis", "sql", "sqlite", "mariadb", "cassandra", "db", "database"],
      tools: ["git", "docker", "kubernetes", "ci/cd", "postman", "vercel", "aws", "gcp", "azure", "firebase", "cloudinary", "figma", "notion", "jira", "github", "gitlab", "cloud", "devops"],
      languages: ["typescript", "javascript", "c++", "java", "php", "python", "go", "rust", "ruby", "c#", "kotlin", "swift", "programming"]
    };

    let bestCategoryKey: string | null = null;
    for (const [key, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => normalizedSkill.includes(kw))) {
        bestCategoryKey = key;
        break;
      }
    }

    if (bestCategoryKey) {
      const categoryNameMap: Record<string, string[]> = {
        frontend: ["frontend", "front-end", "client"],
        backend: ["backend", "back-end", "server"],
        database: ["database", "databases", "db", "sql", "nosql"],
        tools: ["tools", "cloud", "devops", "utilities", "platforms"],
        languages: ["languages", "programming", "coding"]
      };

      const targetNames = categoryNameMap[bestCategoryKey];
      const matchedCategory = data.sections.skills.find(s =>
        targetNames.some(tn => s.name.toLowerCase().includes(tn))
      );
      if (matchedCategory) return matchedCategory.id;
    }

    const directMatch = data.sections.skills.find(s =>
      s.name.toLowerCase().includes(normalizedSkill) || normalizedSkill.includes(s.name.toLowerCase())
    );
    if (directMatch) return directMatch.id;

    if (data.sections.skills.length > 0) {
      return data.sections.skills[0].id;
    }

    return null;
  }

  const handleAddSkill = (skill: string) => {
    if (isSkillAlreadyPresent(skill)) {
      toast.error(`"${skill}" is already in your skills list.`)
      return
    }

    const skillsMode = data.metadata.skillsMode ?? "category"

    if (skillsMode === "simple") {
      addSectionItem("skills", { name: skill })
    } else {
      const targetCategoryId = findMostRelevantCategory(skill)
      if (targetCategoryId) {
        const targetCategory = data.sections.skills.find(s => s.id === targetCategoryId)
        if (targetCategory) {
          const currentKeywords = targetCategory.keywords || []
          updateSectionItem("skills", targetCategory.id, "keywords", [...currentKeywords, skill])
        }
      } else {
        addSectionItem("skills", { name: "Skills", keywords: [skill] })
      }
    }

    setAppliedSkills(prev => ({ ...prev, [skill]: true }))
    toast.success(`"${skill}" added to skills!`)
  }

  const handleApplyExperience = (id: string, text: string) => {
    const formattedText = convertMarkdownToHtml(text)
    updateSectionItem("experience", id, "description", formattedText)
    setAppliedExperience(prev => ({ ...prev, [id]: true }))
    toast.success("Tailored description applied to role!")
  }

  

  return (
    <div className="p-4 rounded-xl border border-border/40 bg-muted/5 backdrop-blur-xs space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">JD Tailor</span>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
          Target Job Description
        </Label>
        <Textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here to tailor your resume and check keyword gaps…"
          className="min-h-[120px] text-xs resize-none bg-muted/20 border-border/40 focus:border-primary/40"
        />
      </div>

      {jdSkillsMatch && (
        <div className="p-3 rounded-lg border border-border/30 bg-muted/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground/80">Keyword Match</span>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-bold",
              jdSkillsMatch.percentage > 70 ? "bg-success/10 text-success"
                : jdSkillsMatch.percentage > 40 ? "bg-warning/10 text-warning"
                : "bg-destructive/10 text-destructive"
            )}>
              {jdSkillsMatch.foundCount}/{jdSkillsMatch.totalCount} ({jdSkillsMatch.percentage}%)
            </span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500",
                jdSkillsMatch.percentage > 70 ? "bg-success" : jdSkillsMatch.percentage > 40 ? "bg-warning" : "bg-destructive"
              )}
              style={{ width: `${jdSkillsMatch.percentage}%` }}
            />
          </div>
          {jdSkillsMatch.missingSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {jdSkillsMatch.missingSkills.slice(0, 8).map(skill => (
                <span key={skill} className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                  {skill}
                </span>
              ))}
              {jdSkillsMatch.missingSkills.length > 8 && (
                <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">+{jdSkillsMatch.missingSkills.length - 8} more</span>
              )}
            </div>
          )}
        </div>
      )}

      <Button
        onClick={handleTailor}
        disabled={isTailoring || !jobDescription.trim()}
        className="w-full h-9 text-xs font-semibold gap-2"
        size="sm"
      >
        {isTailoring
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Tailoring…</>
          : <><Sparkles className="w-3.5 h-3.5" />{tailorResult ? "Re-tailor" : "Tailor with AI"}</>
        }
      </Button>

      {tailorResult && (
        <div className="space-y-4">
          {/* Tailored Summary */}
          {tailorResult.tailoredSummary && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Tailored Summary</p>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-xs text-foreground/80 leading-relaxed">
                {tailorResult.tailoredSummary}
              </div>
              <Button
                size="sm"
                variant={appliedSummary ? "outline" : "default"}
                className="w-full h-8 text-xs gap-2"
                onClick={handleApplySummary}
                disabled={appliedSummary}
              >
                {appliedSummary ? <><Check className="w-3 h-3" />Applied</> : "Apply to Resume"}
              </Button>
            </div>
          )}

          {/* Recommended Skills */}
          {tailorResult.recommendedSkills?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Recommended Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {tailorResult.recommendedSkills.map((skill) => {
                  const already = isSkillAlreadyPresent(skill)
                  const applied = appliedSkills[skill]
                  return (
                    <button
                      key={skill}
                      onClick={() => !already && !applied && handleAddSkill(skill)}
                      disabled={already || applied}
                      className={cn(
                        "text-[10px] px-2 py-1 rounded-md border font-medium transition-colors",
                        already || applied
                          ? "bg-success/10 text-success border-success/20 cursor-default"
                          : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-pointer"
                      )}
                    >
                      {already || applied ? <Check className="w-2.5 h-2.5 inline mr-1" /> : <Plus className="w-2.5 h-2.5 inline mr-1" />}
                      {skill}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Experience Suggestions */}
          {tailorResult.experienceSuggestions?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Experience Rewrites</p>
              {tailorResult.experienceSuggestions.map((exp) => (
                <div key={exp.id} className="p-3 rounded-lg bg-muted/10 border border-border/30 space-y-2">
                  <p className="text-xs font-semibold text-foreground/80">{exp.position} @ {exp.company}</p>
                  {exp.bulletSuggestions.map((bullet, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-foreground/70">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      <span className="leading-snug">{bullet}</span>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant={appliedExperience[exp.id] ? "outline" : "default"}
                    className="w-full h-7 text-xs gap-1.5 mt-1"
                    onClick={() => handleApplyExperience(exp.id, exp.bulletSuggestions.join("\n"))}
                    disabled={!!appliedExperience[exp.id]}
                  >
                    {appliedExperience[exp.id] ? <><Check className="w-3 h-3" />Applied</> : "Apply Suggestions"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
