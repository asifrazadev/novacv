"use client"

import * as React from "react"
import {
  Target,
  Loader2,
  Sparkles,
  Check,
  Copy,
  Zap,
  Plus,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Link2,
  Briefcase,
  GraduationCap,
  FolderKanban,
  Code2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  HandHeart,
  Languages,
  Heart,
  Quote,
  BadgeCheck
} from "lucide-react"
import { useBuilder } from "@/components/builder/builder-context"
import { useAIStore } from "@/store/use-ai-store"
import { Button } from "@/components/shared/ui/button"
import { Textarea } from "@/components/shared/ui/textarea"
import { Label } from "@/components/shared/ui/label"
import { analyzeResumeWithAI, tailorResumeWithAI } from "@/actions/ai"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { convertMarkdownToHtml } from "./utils"
import { defaultItems } from "@/components/builder/sections/shared"

interface AtsScoringProps {
  getRenderedText: () => string
  wordCount: number
  charCount: number
}

export function AtsScoring({ getRenderedText, wordCount, charCount }: AtsScoringProps) {
  const { data, updateSectionItem, addSectionItem, setActiveSection, setMobileView } = useBuilder()
  const aiStore = useAIStore()

  // Completeness Checklist State
  const [isCompletenessExpanded, setIsCompletenessExpanded] = React.useState(true)

  // ATS Scoring & Tailoring State
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [atsResult, setAtsResult] = React.useState<{ score: number; summary: string; suggestions: string[] } | null>(null)
  const [jobDescription, setJobDescription] = React.useState("")
  const [isTailoring, setIsTailoring] = React.useState(false)
  const [tailorResult, setTailorResult] = React.useState<{
    tailoredSummary: string;
    recommendedSkills: string[];
    experienceSuggestions: { id: string; company: string; position: string; bulletSuggestions: string[] }[];
  } | null>(null)

  const [appliedSkills, setAppliedSkills] = React.useState<Record<string, boolean>>({})
  const [appliedSummary, setAppliedSummary] = React.useState(false)
  const [appliedExperience, setAppliedExperience] = React.useState<Record<string, boolean>>({})

  // --- Resume Completeness Checks ---
  const checksByCategory = React.useMemo(() => {
    const emailValid = !!data.basics?.email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.basics.email.trim());
    const phonePresent = !!data.basics?.phone?.trim();
    const locationPresent = !!data.basics?.location?.trim();

    const summaryWords = data.sections.summary?.content?.replace(/<[^>]*>/g, "").trim().split(/\s+/).filter(Boolean).length || 0;

    const actionVerbs = ["built", "developed", "designed", "implemented", "optimized", "led", "created", "improved"];
    const hasActionVerbs = (data.sections.experience || []).some(exp => {
      const text = (exp.description || "").toLowerCase();
      return actionVerbs.some(verb => text.includes(verb));
    });

    const hasRecentRole = (data.sections.experience || []).some(exp => {
      if (exp.isCurrent) return true;
      const dateStr = exp.endDate || exp.startDate || "";
      const yearMatch = dateStr.match(/\b(202[3-6])\b/);
      return !!yearMatch;
    });

    const totalSkills = data.sections.skills?.reduce((acc, s) => acc + (s.keywords?.length || 0), 0) || 0;

    // Layout order validation helper
    const rawLayout = (data.metadata as any).layout;
    const mainItems = rawLayout?.main || [];
    const sidebarItems = rawLayout?.sidebar || [];
    const currentLayoutOrder = [...mainItems, ...sidebarItems];
    const targetOrder = [
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
    ];
    // Filter targetOrder to only include sections that actually exist in the current layout
    const presentInLayout = targetOrder.filter(sec => currentLayoutOrder.includes(sec));
    const sortedPresentByLayout = [...presentInLayout].sort(
      (a, b) => currentLayoutOrder.indexOf(a) - currentLayoutOrder.indexOf(b)
    );

    const isSectionAtRightPlace = (sec: string) => {
      if (!currentLayoutOrder.includes(sec)) return false;
      const targetIdx = presentInLayout.indexOf(sec);
      const currentIdx = sortedPresentByLayout.indexOf(sec);
      return targetIdx === currentIdx;
    };

    const emailCheck = {
      id: "email",
      label: "Contact Email Format",
      description: "Ensure email address is in standard format (e.g. name@domain.com).",
      present: emailValid,
      icon: Mail,
      action: () => { setActiveSection("basics"); setMobileView("editor"); },
      buttonText: "Fix Email"
    };
    const phoneCheck = {
      id: "phone",
      label: "Contact Phone",
      description: "Essential for recruiter outreach.",
      present: phonePresent,
      icon: Phone,
      action: () => { setActiveSection("basics"); setMobileView("editor"); },
      buttonText: "Fix Phone"
    };
    const locationCheck = {
      id: "location",
      label: "Location Info",
      description: "Specify city and state/country.",
      present: locationPresent,
      icon: MapPin,
      action: () => { setActiveSection("basics"); setMobileView("editor"); },
      buttonText: "Fix Location"
    };

    const summaryCheck = {
      id: "summary_len",
      label: "Summary Length (30+ words)",
      description: `Should answer: Who are you? Specialization? Tech stack? Impact? (currently ${summaryWords} words, aim for 30+).`,
      present: summaryWords >= 30,
      icon: FileText,
      action: () => { setActiveSection("summary"); setMobileView("editor"); },
      buttonText: "Fix Summary"
    };

    // 11 target sections checks with layout validation
    const skillsCountCheck = {
      id: "skills_count",
      label: "Skills Section",
      description: totalSkills < 5
        ? `List at least 5 skills (currently ${totalSkills}).`
        : `Skills section is in the wrong place in layout.`,
      present: totalSkills >= 5 && isSectionAtRightPlace("skills"),
      icon: Code2,
      action: () => {
        if (totalSkills < 5) {
          setActiveSection("skills");
          setMobileView("editor");
          if ((data.sections.skills || []).length === 0) {
            addSectionItem("skills", defaultItems.skills);
          }
        } else {
          setActiveSection("layout");
          setMobileView("editor");
        }
      },
      buttonText: totalSkills < 5 ? "Add Skills" : "Go to Layout"
    };

    const expExistsCheck = {
      id: "exp_exists",
      label: "Work Experience Section",
      description: (data.sections.experience || []).length === 0
        ? "Detail your job history."
        : "Experience section is in the wrong place in layout.",
      present: (data.sections.experience || []).length > 0 && isSectionAtRightPlace("experience"),
      icon: Briefcase,
      action: () => {
        if ((data.sections.experience || []).length === 0) {
          setActiveSection("experience");
          setMobileView("editor");
          addSectionItem("experience", defaultItems.experience);
        } else {
          setActiveSection("layout");
          setMobileView("editor");
        }
      },
      buttonText: (data.sections.experience || []).length === 0 ? "Add Experience" : "Go to Layout"
    };

    const projectLinksCheck = {
      id: "project_links",
      label: "Projects Section",
      description: (data.sections.projects || []).length === 0
        ? "Add projects to showcase your work."
        : !(data.sections.projects || []).every(p => p.url?.trim())
          ? "Ensure all projects have clickable links."
          : "Projects section is in the wrong place in layout.",
      present: (data.sections.projects || []).length > 0 &&
        (data.sections.projects || []).every(p => p.url?.trim()) &&
        isSectionAtRightPlace("projects"),
      icon: FolderKanban,
      action: () => {
        if ((data.sections.projects || []).length === 0) {
          setActiveSection("projects");
          setMobileView("editor");
          addSectionItem("projects", defaultItems.projects);
        } else if (!(data.sections.projects || []).every(p => p.url?.trim())) {
          setActiveSection("projects");
          setMobileView("editor");
        } else {
          setActiveSection("layout");
          setMobileView("editor");
        }
      },
      buttonText: (data.sections.projects || []).length === 0
        ? "Add Projects"
        : !(data.sections.projects || []).every(p => p.url?.trim())
          ? "Fix Links"
          : "Go to Layout"
    };

    const eduCompleteCheck = {
      id: "edu_complete",
      label: "Education Section",
      description: !(data.sections.education || []).some(edu => edu.school?.trim() && edu.degree?.trim())
        ? "Ensure institution and degree type are filled."
        : "Education section is in the wrong place in layout.",
      present: (data.sections.education || []).length > 0 &&
        (data.sections.education || []).some(edu => edu.school?.trim() && edu.degree?.trim()) &&
        isSectionAtRightPlace("education"),
      icon: GraduationCap,
      action: () => {
        if (!(data.sections.education || []).some(edu => edu.school?.trim() && edu.degree?.trim())) {
          setActiveSection("education");
          setMobileView("editor");
          if ((data.sections.education || []).length === 0) {
            addSectionItem("education", defaultItems.education);
          }
        } else {
          setActiveSection("layout");
          setMobileView("editor");
        }
      },
      buttonText: !(data.sections.education || []).some(edu => edu.school?.trim() && edu.degree?.trim())
        ? "Fix Education"
        : "Go to Layout"
    };

    const certsCheck = {
      id: "certs_sec",
      label: "Certifications Section",
      description: (data.sections.certifications || []).length === 0
        ? "List professional certifications or courses."
        : "Certifications section is in the wrong place in layout.",
      present: (data.sections.certifications || []).length > 0 && isSectionAtRightPlace("certifications"),
      icon: BadgeCheck,
      action: () => {
        if ((data.sections.certifications || []).length === 0) {
          setActiveSection("certifications");
          setMobileView("editor");
          addSectionItem("certifications", defaultItems.certifications);
        } else {
          setActiveSection("layout");
          setMobileView("editor");
        }
      },
      buttonText: (data.sections.certifications || []).length === 0 ? "Add Certs" : "Go to Layout"
    };


    const languagesCheck = {
      id: "languages_sec",
      label: "Languages Section",
      description: (data.sections.languages || []).length === 0
        ? "Add spoken or written languages."
        : "Languages section is in the wrong place in layout.",
      present: (data.sections.languages || []).length > 0 && isSectionAtRightPlace("languages"),
      icon: Languages,
      action: () => {
        if ((data.sections.languages || []).length === 0) {
          setActiveSection("languages");
          setMobileView("editor");
          addSectionItem("languages", defaultItems.languages);
        } else {
          setActiveSection("layout");
          setMobileView("editor");
        }
      },
      buttonText: (data.sections.languages || []).length === 0 ? "Add Languages" : "Go to Layout"
    };


    // Experience details checks
    const expBulletsCheck = {
      id: "exp_bullets",
      label: "Experience Descriptions",
      description: "Ensure your work entries are described.",
      present: (data.sections.experience || []).length > 0 && data.sections.experience.some(exp => exp.description?.replace(/<[^>]*>/g, "").trim().length > 0),
      icon: Briefcase,
      action: () => { setActiveSection("experience"); setMobileView("editor"); },
      buttonText: "Fix Experience"
    };
    const expDatesCheck = {
      id: "exp_dates",
      label: "Experience Dates",
      description: "Verify all roles have start dates.",
      present: (data.sections.experience || []).length > 0 && data.sections.experience.every(exp => exp.startDate?.trim()),
      icon: Briefcase,
      action: () => { setActiveSection("experience"); setMobileView("editor"); },
      buttonText: "Fix Dates"
    };
    const expMetricsCheck = {
      id: "exp_metrics",
      label: "Measurable Impact / Metrics",
      description: "Add metrics (numbers, %, scaling) to strengthen achievements.",
      present: (data.sections.experience || []).length > 0 && data.sections.experience.some(exp => /\d+/.test(exp.description || "")),
      icon: Briefcase,
      action: () => { setActiveSection("experience"); setMobileView("editor"); },
      buttonText: "Add Metrics"
    };
    const expVerbsCheck = {
      id: "exp_verbs",
      label: "Action Verbs",
      description: "Use action-oriented verbs (built, developed, optimized, etc.).",
      present: (data.sections.experience || []).length > 0 && hasActionVerbs,
      icon: Briefcase,
      action: () => { setActiveSection("experience"); setMobileView("editor"); },
      buttonText: "Fix Verbs"
    };
    const expRecentCheck = {
      id: "exp_recent",
      label: "Latest Role Recency",
      description: "Ensure latest experience is recent (within 2-3 years) or active.",
      present: (data.sections.experience || []).length > 0 && hasRecentRole,
      icon: Briefcase,
      action: () => { setActiveSection("experience"); setMobileView("editor"); },
      buttonText: "Fix Experience"
    };

    const linkedinCheck = {
      id: "linkedin",
      label: "LinkedIn Profile Link",
      description: "Recruiters expect a LinkedIn profile link.",
      present: data.sections.profiles?.some(p => p.network?.toLowerCase() === "linkedin" && p.url?.trim()),
      icon: Link2,
      action: () => {
        setActiveSection("profiles");
        setMobileView("editor");
        if ((data.sections.profiles || []).length === 0) {
          addSectionItem("profiles", defaultItems.profiles);
        }
      },
      buttonText: "Add LinkedIn"
    };
    const githubCheck = {
      id: "github",
      label: "GitHub Profile Link",
      description: "Highly recommended for technical resumes.",
      present: data.sections.profiles?.some(p => p.network?.toLowerCase() === "github" && p.url?.trim()),
      icon: Link2,
      action: () => {
        setActiveSection("profiles");
        setMobileView("editor");
        if ((data.sections.profiles || []).length === 0) {
          addSectionItem("profiles", defaultItems.profiles);
        }
      },
      buttonText: "Add GitHub"
    };

    const lenCheck = {
      id: "resume_len",
      label: "Resume Length (250-1200 words)",
      description: `Current word count: ${wordCount}. Aim for 250 to 800 words.`,
      present: wordCount >= 250 && wordCount <= 1200,
      icon: FileText,
      action: () => { setActiveSection("basics"); setMobileView("editor"); },
      buttonText: "Edit Resume"
    };
    const webFormatCheck = {
      id: "web_format",
      label: "Website Link Format",
      description: "Ensure website URL format is valid.",
      present: !data.basics.website?.trim() || /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(data.basics.website.trim()),
      icon: Globe,
      action: () => { setActiveSection("basics"); setMobileView("editor"); },
      buttonText: "Fix Website"
    };

    return {
      contact: {
        label: "Contact Info (10%)",
        checks: [emailCheck, phoneCheck, locationCheck],
        weight: 10
      },
      summary: {
        label: "Summary (10%)",
        checks: [summaryCheck],
        weight: 10
      },
      experience_exists: {
        label: "Experience Presence (15%)",
        checks: [expExistsCheck],
        weight: 15
      },
      experience_quality: {
        label: "Experience Quality (15%)",
        checks: [expBulletsCheck, expDatesCheck, expMetricsCheck, expVerbsCheck, expRecentCheck],
        weight: 15
      },
      skills: {
        label: "Skills (10%)",
        checks: [skillsCountCheck],
        weight: 10
      },
      education: {
        label: "Education (10%)",
        checks: [eduCompleteCheck],
        weight: 10
      },
      projects: {
        label: "Projects (10%)",
        checks: [projectLinksCheck],
        weight: 10
      },
      profiles: {
        label: "Profiles (5%)",
        checks: [linkedinCheck, githubCheck],
        weight: 5
      },
      additional_sections: {
        label: "Additional Sections (10%)",
        checks: [certsCheck, languagesCheck],
        weight: 10
      },
      ats_readiness: {
        label: "ATS Readiness (5%)",
        checks: [lenCheck, webFormatCheck],
        weight: 5
      }
    };
  }, [data, setActiveSection, setMobileView, addSectionItem, wordCount]);

  const { completenessPercentage, allChecksList, missingChecksList } = React.useMemo(() => {
    let weightedScore = 0;
    let totalActiveWeight = 0;
    const allChecks: any[] = [];

    Object.entries(checksByCategory).forEach(([key, cat]: [string, any]) => {
      const totalChecks = cat.checks.length;
      if (totalChecks === 0) return;
      const completedChecks = cat.checks.filter((c: any) => c.present).length;
      const catScore = completedChecks / totalChecks;
      weightedScore += catScore * cat.weight;
      totalActiveWeight += cat.weight;
      allChecks.push(...cat.checks);
    });

    const finalScore = totalActiveWeight > 0 ? Math.round((weightedScore / totalActiveWeight) * 100) : 0;
    const missing = allChecks.filter(c => !c.present);

    return {
      completenessPercentage: finalScore,
      allChecksList: allChecks,
      missingChecksList: missing
    };
  }, [checksByCategory]);

  const completedCount = allChecksList.length - missingChecksList.length

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

    const cleanResumeText = getRenderedText().toLowerCase();
    const foundResumeSkills = matchedJDSkills.filter(kw => cleanResumeText.includes(kw));

    const percentage = Math.round((foundResumeSkills.length / matchedJDSkills.length) * 100);

    return {
      foundCount: foundResumeSkills.length,
      totalCount: matchedJDSkills.length,
      percentage,
      missingSkills: matchedJDSkills.filter(kw => !foundResumeSkills.includes(kw))
    };
  }, [jobDescription, getRenderedText]);

  // --- ATS Scoring ---
  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    const textContext = getRenderedText()
    const response = await analyzeResumeWithAI(
      textContext,
      {
        provider: aiStore.provider,
        model: aiStore.model,
        baseUrl: aiStore.baseUrl,
        apiKey: aiStore.apiKey
      },
      jobDescription.trim() || undefined
    )

    if (response.success && response.result) {
      setAtsResult(response.result)
      toast.success("ATS analysis complete!")
    } else {
      toast.error(response.error || "Failed to analyze resume.")
    }
    setIsAnalyzing(false)
  }

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

      const cleanResumeText = getRenderedText().toLowerCase()
      const escapedSkill = normalizedSkill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i')
      if (regex.test(cleanResumeText)) return true

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

  const scoreColor = !atsResult ? "text-primary" : atsResult.score > 80 ? "text-success" : atsResult.score > 60 ? "text-warning" : "text-destructive"
  const scoreBg = !atsResult ? "bg-primary/5 border-primary/20" : atsResult.score > 80 ? "bg-success/10 border-success/20" : atsResult.score > 60 ? "bg-warning/10 border-warning/20" : "bg-destructive/10 border-destructive/20"

  return (
    <div className="space-y-5 mt-4 animate-in fade-in duration-300">
      {/* Resume Statistics (Words & Characters) */}
      <div className="grid grid-cols-2 gap-3 mb-1">
        <div className="p-3 border border-border/40 rounded-xl bg-muted/10 backdrop-blur-xs flex flex-col justify-center">
          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Resume Words</div>
          <div className="text-lg font-black text-foreground">{wordCount}</div>
        </div>
        <div className="p-3 border border-border/40 rounded-xl bg-muted/10 backdrop-blur-xs flex flex-col justify-center">
          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Characters</div>
          <div className="text-lg font-black text-foreground">{charCount}</div>
        </div>
      </div>

      {/* Resume Completeness Checklist */}
      <div className="p-4 rounded-xl border border-border/40 bg-muted/5 backdrop-blur-xs space-y-4">
        {/* Category 1: Resume Completeness */}
        <div className="space-y-3">
          <button
            onClick={() => setIsCompletenessExpanded(!isCompletenessExpanded)}
            className="w-full flex items-center justify-between font-semibold text-sm text-foreground bg-transparent border-none p-0 cursor-pointer focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Resume Completeness</span>
              <span className="text-xs font-normal text-muted-foreground">({completedCount}/{allChecksList.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-bold",
                completenessPercentage === 100
                  ? "bg-success/10 text-success"
                  : completenessPercentage > 60
                    ? "bg-warning/10 text-warning"
                    : "bg-destructive/10 text-destructive"
              )}>
                {completenessPercentage}%
              </span>
              {isCompletenessExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </button>

          {/* Progress Bar */}
          <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                completenessPercentage === 100
                  ? "bg-success"
                  : completenessPercentage > 60
                    ? "bg-warning"
                    : "bg-destructive"
              )}
              style={{ width: `${completenessPercentage}%` }}
            />
          </div>
        </div>

        {/* Category 2: JD Match Ready (Only if JD exists) */}
        {jdSkillsMatch && (
          <div className="space-y-3 pt-3 border-t border-border/20 animate-in fade-in duration-300">
            <div className="flex items-center justify-between font-semibold text-sm text-foreground">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span>JD Match Ready</span>
                <span className="text-xs font-normal text-muted-foreground">({jdSkillsMatch.foundCount}/{jdSkillsMatch.totalCount} skills found)</span>
              </div>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-bold",
                jdSkillsMatch.percentage > 70
                  ? "bg-success/10 text-success"
                  : jdSkillsMatch.percentage > 40
                    ? "bg-warning/10 text-warning"
                    : "bg-destructive/10 text-destructive"
              )}>
                {jdSkillsMatch.percentage}%
              </span>
            </div>

            {/* JD Match Progress Bar */}
            <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  jdSkillsMatch.percentage > 70
                    ? "bg-success"
                    : jdSkillsMatch.percentage > 40
                      ? "bg-warning"
                      : "bg-destructive"
                )}
                style={{ width: `${jdSkillsMatch.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Expandable Missing Checks list */}
        {isCompletenessExpanded && (
          <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* JD Match Missing Skills Tips */}
            {jdSkillsMatch && jdSkillsMatch.missingSkills.length > 0 && (
              <div className="p-3 border border-primary/10 bg-primary/5 rounded-lg space-y-2">
                <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>Missing JD Keywords / Skills</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Adding these keywords to your resume will improve compatibility with this job description:
                </p>
                <div className="flex flex-wrap gap-1">
                  {jdSkillsMatch.missingSkills.slice(0, 10).map((skill, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddSkill(skill)}
                      className="text-[9px] font-semibold bg-background hover:bg-primary/10 hover:text-primary transition-all border border-border/80 px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-2 h-2" />
                      {skill}
                    </button>
                  ))}
                  {jdSkillsMatch.missingSkills.length > 10 && (
                    <span className="text-[9px] text-muted-foreground px-1.5 py-0.5">
                      +{jdSkillsMatch.missingSkills.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {missingChecksList.length === 0 ? (
              <div className="p-3 border border-success/10 bg-success/5 rounded-lg flex items-center gap-2.5 text-xs text-success font-medium">
                <Check className="w-4 h-4 text-success shrink-0" />
                <span>Your resume is 100% complete! Standard sections and quality checks all pass.</span>
              </div>
            ) : (
              <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                {missingChecksList.map((check) => {
                  const Icon = check.icon
                  return (
                    <div
                      key={check.id}
                      className="p-2.5 border border-border/40 bg-background/50 rounded-lg flex items-center justify-between gap-3 text-xs animate-in slide-in-from-left duration-200"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-md bg-muted/40 text-muted-foreground shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-foreground truncate">{check.label}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{check.description}</div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={check.action}
                        className="h-7 px-2.5 text-[10px] font-bold border-primary/20 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-colors shrink-0"
                      >
                        {check.buttonText}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Job Description Paste Field */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5" htmlFor="job-description">
          Target Job Description
        </Label>
        <Textarea
          id="job-description"
          placeholder="Paste target job description to score compatibility or tailor resume content..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="min-h-[100px] text-xs resize-y border-border/60 rounded-lg focus-visible:ring-primary/20 bg-background/50"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          size="sm"
          variant="outline"
          className="h-9 gap-1.5 shadow-sm text-xs font-semibold"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Target className="w-3.5 h-3.5 text-primary" />}
          {jobDescription.trim() ? "Score against JD" : "General ATS Score"}
        </Button>
        <Button
          size="sm"
          className="h-9 gap-1.5 shadow-sm text-xs bg-primary text-primary-foreground hover:bg-primary/95 font-semibold"
          onClick={handleTailor}
          disabled={isTailoring || !jobDescription.trim()}
        >
          {isTailoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Tailor Resume
        </Button>
      </div>

      {/* ATS Score Display */}
      {atsResult && (
        <div className={`p-5 rounded-xl border ${scoreBg} transition-colors relative overflow-hidden animate-in fade-in duration-300`}>
          <div className="absolute inset-0 bg-radial-gradient(circle_at_top,_var(--tw-gradient-stops)) from-primary/5 to-transparent pointer-events-none -z-10" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className={`w-5 h-5 ${scoreColor}`} />
              <h3 className="font-bold text-sm text-foreground">
                {jobDescription.trim() ? "JD Compatibility Score" : "General ATS Evaluation"}
              </h3>
            </div>
          </div>

          <div className={`text-4xl font-black mb-2 ${scoreColor} tracking-tight`}>
            {atsResult.score}%
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            {atsResult.summary}
          </p>

          {atsResult.suggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/20 space-y-2.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">ATS Gap Suggestions</h4>
              {atsResult.suggestions.map((t, idx) => (
                <div key={idx} className="p-2.5 bg-background/50 border border-border/20 rounded-lg text-xs leading-relaxed flex items-start gap-2 animate-in slide-in-from-left duration-200">
                  <Zap className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                  <span className="text-foreground/90">{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tailoring Recommendations Display */}
      {tailorResult && (
        <div className="space-y-4 pt-4 border-t border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-400">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <h3 className="font-bold text-sm text-foreground">AI Tailoring Suggestions</h3>
          </div>

          {/* Tailored Summary */}
          {tailorResult.tailoredSummary && (
            <div className="p-4 border border-border/40 bg-primary/5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tailored Summary</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2.5 font-medium border-primary/20 hover:bg-primary/10 hover:text-primary transition-all gap-1"
                  onClick={handleApplySummary}
                  disabled={appliedSummary}
                >
                  {appliedSummary ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  {appliedSummary ? "Applied" : "Apply to Resume"}
                </Button>
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed italic">
                "{tailorResult.tailoredSummary}"
              </p>
            </div>
          )}

          {/* Recommended Skills */}
          {tailorResult.recommendedSkills && tailorResult.recommendedSkills.length > 0 && (
            <div className="p-4 border border-border/40 bg-muted/10 rounded-xl space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Keywords / Skills to Add</span>
              <div className="flex flex-wrap gap-1.5">
                {tailorResult.recommendedSkills.map((skill, index) => {
                  const applied = appliedSkills[skill] || isSkillAlreadyPresent(skill)
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-7 text-xs rounded-full px-3 gap-1 transition-all",
                        applied
                          ? "bg-success/10 border-success/20 text-success"
                          : "border-border/60 hover:bg-muted/50 hover:text-foreground"
                      )}
                      onClick={() => handleAddSkill(skill)}
                      disabled={applied}
                    >
                      {applied ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      {skill}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Experience Suggestions */}
          {tailorResult.experienceSuggestions && tailorResult.experienceSuggestions.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Tailored Role Descriptions</span>
              <div className="space-y-3">
                {tailorResult.experienceSuggestions.map((exp) => {
                  const applied = appliedExperience[exp.id]
                  const combinedText = exp.bulletSuggestions.join("\n")
                  return (
                    <div key={exp.id} className="p-4 border border-border/40 bg-muted/20 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-bold text-xs text-foreground truncate">{exp.position}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{exp.company}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2.5 font-medium border-border/80 gap-1 shrink-0"
                          onClick={() => handleApplyExperience(exp.id, combinedText)}
                          disabled={applied}
                        >
                          {applied ? <Check className="w-3 h-3 text-success" /> : <Check className="w-3 h-3" />}
                          {applied ? "Applied" : "Apply to Role"}
                        </Button>
                      </div>
                      <ul className="list-disc list-inside space-y-1.5 text-xs text-foreground/80 pl-1 leading-relaxed">
                        {exp.bulletSuggestions.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
