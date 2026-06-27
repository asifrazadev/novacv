"use client"

import * as React from "react"
import {
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
  Languages,
  BadgeCheck
} from "lucide-react"
import { useBuilder } from "@/components/builder/builder-context"
import { Button } from "@/components/shared/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { defaultItems } from "@/components/builder/sections/shared"


export interface CompletenessCheckerProps {
  wordCount: number;
}

export function CompletenessChecker({ wordCount }: CompletenessCheckerProps) {
  const { data, updateMetadata, updateSectionItem, addSectionItem, setActiveSection, setMobileView } = useBuilder()
  const [isCompletenessExpanded, setIsCompletenessExpanded] = React.useState(true)

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
      "experience",
      "skills",
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
      const targetIdx = targetOrder.indexOf(sec);
      const currentIdx = currentLayoutOrder.indexOf(sec);
      if (targetIdx === -1) return true;
      // Check relative order against adjacent targetOrder sections
      const before = targetOrder.slice(0, targetIdx).filter(s => currentLayoutOrder.includes(s));
      const after = targetOrder.slice(targetIdx + 1).filter(s => currentLayoutOrder.includes(s));
      return (
        before.every(s => currentLayoutOrder.indexOf(s) < currentIdx) &&
        after.every(s => currentLayoutOrder.indexOf(s) > currentIdx)
      );
    };

    const fixSectionOrder = () => {
      const targetItemsInLayout = currentLayoutOrder.filter(item => targetOrder.includes(item));
      const sortedTargetItems = [...targetItemsInLayout].sort((a, b) => targetOrder.indexOf(a) - targetOrder.indexOf(b));
      
      const newLayoutOrder = currentLayoutOrder.map(item => {
        if (targetOrder.includes(item)) {
          return sortedTargetItems.shift()!;
        }
        return item;
      });

      const newMain = newLayoutOrder.slice(0, mainItems.length);
      const newSidebar = newLayoutOrder.slice(mainItems.length);

      updateMetadata("layout", {
        ...rawLayout,
        main: newMain,
        sidebar: newSidebar
      });
      toast.success("Section layout automatically fixed!");
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
          fixSectionOrder();
        }
      },
      buttonText: totalSkills < 5 ? "Add Skills" : "Fix Layout"
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
          fixSectionOrder();
        }
      },
      buttonText: (data.sections.experience || []).length === 0 ? "Add Experience" : "Fix Layout"
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
          fixSectionOrder();
        }
      },
      buttonText: (data.sections.projects || []).length === 0
        ? "Add Projects"
        : !(data.sections.projects || []).every(p => p.url?.trim())
          ? "Fix Links"
          : "Fix Layout"
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
          fixSectionOrder();
        }
      },
      buttonText: !(data.sections.education || []).some(edu => edu.school?.trim() && edu.degree?.trim())
        ? "Fix Education"
        : "Fix Layout"
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
          fixSectionOrder();
        }
      },
      buttonText: (data.sections.certifications || []).length === 0 ? "Add Certs" : "Fix Layout"
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
          fixSectionOrder();
        }
      },
      buttonText: (data.sections.languages || []).length === 0 ? "Add Languages" : "Fix Layout"
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
      label: "Resume Length (200-1200 words)",
      description: `Current word count: ${wordCount}. Aim for 250 to 800 words.`,
      present: wordCount >= 200 && wordCount <= 1200,
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
        checks: summaryWords > 0 ? [summaryCheck] : [],
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

  

  return (
    <div className="p-4 rounded-xl border border-border/40 bg-muted/5 backdrop-blur-xs space-y-4">
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

        <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 rounded-full",
              completenessPercentage === 100 ? "bg-success" : completenessPercentage > 60 ? "bg-warning" : "bg-destructive"
            )}
            style={{ width: `${completenessPercentage}%` }}
          />
        </div>

        {isCompletenessExpanded && (
          <div className="space-y-1.5 pt-1">
            {missingChecksList.length === 0 ? (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-success/5 border border-success/10 text-xs text-success font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                All checks passed!
              </div>
            ) : (
              missingChecksList.map((check) => {
                const Icon = check.icon
                return (
                  <div
                    key={check.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg text-xs bg-muted/20 border border-border/30"
                  >
                    <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium leading-tight text-foreground/80">{check.label}</p>
                      <p className="text-muted-foreground mt-0.5 leading-snug">{check.description}</p>
                    </div>
                    {check.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-[10px] shrink-0"
                        onClick={check.action}
                      >
                        {check.buttonText}
                      </Button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}