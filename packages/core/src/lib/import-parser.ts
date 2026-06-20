import { ResumeData, defaultResumeData } from "@/types/resume"
import { v4 as uuidv4 } from "uuid"
import { deepMerge } from "@/lib/deep-merge"
import { sanitizeUrl, isValidUrl } from "@/lib/url-validator"
import { sanitizeHtml } from "@/lib/sanitize"
import { getErrorMessage } from "@/lib/error-handler"

interface JsonResumeProfile {
  network?: string
  username?: string
  url?: string
}

interface JsonResumeWork {
  name?: string
  company?: string
  position?: string
  location?: string
  url?: string
  website?: string
  startDate?: string
  endDate?: string
  summary?: string
  highlights?: string[]
}

interface JsonResumeEducation {
  institution?: string
  area?: string
  studyType?: string
  score?: string
  startDate?: string
  endDate?: string
  url?: string
  courses?: string[]
}

interface JsonResumeSkill {
  name?: string
  keywords?: string[]
}

interface JsonResumeLanguage {
  language?: string
  fluency?: string
}

interface JsonResumeProject {
  name?: string
  description?: string
  highlights?: string[]
  url?: string
  startDate?: string
  endDate?: string
}

interface JsonResumeLocation {
  city?: string
  region?: string
  countryCode?: string
}

interface JsonResumeBasics {
  name?: string
  label?: string
  email?: string
  phone?: string
  url?: string
  summary?: string
  image?: string
  location?: JsonResumeLocation
  profiles?: JsonResumeProfile[]
}

interface JsonResumeData {
  id?: string
  basics?: JsonResumeBasics
  sections?: unknown
  metadata?: unknown
  work?: JsonResumeWork[]
  education?: JsonResumeEducation[]
  skills?: JsonResumeSkill[]
  languages?: JsonResumeLanguage[]
  projects?: JsonResumeProject[]
}

export function parseImportedResume(jsonString: string, currentMetadata?: ResumeData["metadata"]): ResumeData | null {
  try {
    if (!jsonString || typeof jsonString !== 'string' || !jsonString.trim()) {
      throw new Error("Invalid input: JSON string is empty")
    }

    let rawData: unknown
    try {
      rawData = JSON.parse(jsonString)
    } catch (parseError) {
      throw new Error(
        `Invalid JSON format: ${getErrorMessage(parseError)}`
      )
    }

    if (!rawData || typeof rawData !== "object") {
      throw new Error("Invalid resume data structure: expected an object")
    }

    const data = rawData as any

    // Check if it's already a NovaCV native export (it contains our top-level keys)
    if (data.id !== undefined && data.basics && data.sections && data.metadata) {
      // It's a NovaCV Backup, merge with defaults
      const result = parseNovaCV(data)
      // Preserve the user's current template/design if provided
      if (currentMetadata) result.metadata = { ...result.metadata, ...currentMetadata }
      return result
    }

    // Try parsing as JSON Resume standard
    if (data.basics) {
      return parseJsonResume(data, currentMetadata)
    }

    throw new Error("Unrecognized JSON format. Must be a NovaCV export or standard JSON Resume schema.")
  } catch (error) {
    console.error("Failed to parse resume JSON:", getErrorMessage(error))
    return null
  }
}

function parseNovaCV(rawData: JsonResumeData): ResumeData {
  // Deep merge with default to fill in any missing fields
  return deepMerge(defaultResumeData, rawData)
}

function parseJsonResume(rawData: any, currentMetadata?: ResumeData["metadata"]): ResumeData {
  // Clone defaults
  const data: ResumeData = JSON.parse(JSON.stringify(defaultResumeData))

  // Preserve the user's current template/design — do NOT reset to the default template
  if (currentMetadata) {
    data.metadata = { ...data.metadata, ...currentMetadata }
  }

  if (rawData.basics) {
    const basics = rawData.basics
    data.basics.name = basics.name || ""

    let headlineStr = basics.label || basics.headline || ""
    if (headlineStr) {
      headlineStr = headlineStr
        .replace(/^(headline\s*[→:]\s*|title\s*[→:]\s*|professional headline\s*[→:]\s*)/i, "")
        .trim()
      data.basics.headline = headlineStr
    }

    data.basics.email = basics.email || ""
    data.basics.phone = basics.phone || ""

    // Fallback between website and url
    const websiteUrl = basics.url || basics.website || ""
    if (websiteUrl) {
      const sanitized = sanitizeUrl(websiteUrl)
      data.basics.website = sanitized || ""
    }

    // Support location as string or object
    let locStr = ""
    if (typeof basics.location === "string") {
      locStr = basics.location
    } else if (basics.location && typeof basics.location === "object") {
      const loc = [basics.location.city, basics.location.region, basics.location.countryCode]
        .filter(Boolean)
      locStr = loc.join(", ")
    }
    if (locStr) {
      locStr = locStr
        .replace(/^(location\s*\(.*?\)\s*[→:]\s*|location\s*[→:]\s*)/i, "")
        .trim()
      data.basics.location = locStr
    }

    if (basics.image) {
      const imageUrl = sanitizeUrl(basics.image)
      if (imageUrl) {
        data.basics.picture.url = imageUrl
      }
    }

    // Support summary at the root or under basics
    const summaryVal = rawData.summary || basics.summary
    if (summaryVal && typeof summaryVal === "string") {
      const sanitized = sanitizeHtml(summaryVal)
      data.sections.summary.content = `<p>${sanitized}</p>`
    }

    if (Array.isArray(basics.profiles)) {
      data.sections.profiles = basics.profiles
        .map((p: any) => {
          const url = p.url ? sanitizeUrl(p.url) : ""
          return {
            id: uuidv4(),
            network: p.network || "",
            username: p.username || "",
            url: url || "",
            icon: ""
          }
        })
        .filter((p: any) => p.url || p.username) // Only keep if at least has URL or username
    }
  } else if (rawData.summary && typeof rawData.summary === "string") {
    // Fallback if basics is missing but summary is at root
    const sanitized = sanitizeHtml(rawData.summary)
    data.sections.summary.content = `<p>${sanitized}</p>`
  }

  // Support experience (alternative name) or work (standard name)
  const workList = rawData.work || rawData.experience
  if (Array.isArray(workList)) {
    data.sections.experience = workList
      .map((w: any) => {
        const website = w.url || w.website || ""
        const sanitizedWebsite = website ? (sanitizeUrl(website) || "") : ""
        const summary = w.summary ? sanitizeHtml(w.summary) : ""
        const highlights = Array.isArray(w.highlights)
          ? w.highlights.map((h: any) => `<li>${sanitizeHtml(String(h))}</li>`)
          : []
        const highlightsHtml = highlights.length > 0 ? `<ul>${highlights.join("")}</ul>` : ""

        return {
          id: uuidv4(),
          company: w.company || w.name || "",
          position: w.position || "",
          location: w.location || "",
          startDate: w.startDate || "",
          endDate: w.endDate || "",
          isCurrent: !w.endDate || String(w.endDate).toLowerCase() === "present",
          website: sanitizedWebsite,
          websiteLabel: "",
          showLinkInTitle: !!sanitizedWebsite,
          roles: [],
          description: [summary ? `<p>${summary}</p>` : "", highlightsHtml]
            .filter(Boolean)
            .join("")
        }
      })
  }

  if (Array.isArray(rawData.education)) {
    data.sections.education = rawData.education
      .map((e: any) => {
        const website = e.url ? sanitizeUrl(e.url) : ""
        const courses = Array.isArray(e.courses)
          ? `<ul>${e.courses.map((c: any) => `<li>${sanitizeHtml(String(c))}</li>`).join("")}</ul>`
          : ""

        return {
          id: uuidv4(),
          school: e.school || e.institution || "",
          areaOfStudy: e.areaOfStudy || e.area || "",
          degree: e.degree || e.studyType || "",
          grade: e.score || e.grade || "",
          location: e.location || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          isCurrent: !e.endDate || String(e.endDate).toLowerCase() === "present",
          website: website || "",
          websiteLabel: "",
          showLinkInTitle: !!website,
          description: courses
        }
      })
  }

  // Support skills as standard array or key-value object of categories
  if (Array.isArray(rawData.skills)) {
    data.sections.skills = rawData.skills
      .map((s: any) => ({
        id: uuidv4(),
        name: s.name || "",
        level: 100,
        keywords: Array.isArray(s.keywords) ? s.keywords : (s.keywords ? [s.keywords] : [])
      }))
      .filter((s: any) => s.name) // Only keep skills with names
  } else if (rawData.skills && typeof rawData.skills === "object") {
    data.sections.skills = Object.entries(rawData.skills)
      .map(([categoryName, keywords]) => ({
        id: uuidv4(),
        name: categoryName,
        level: 100,
        keywords: Array.isArray(keywords) ? keywords.map(String) : []
      }))
      .filter((s: any) => s.name)
  }

  if (Array.isArray(rawData.languages)) {
    data.sections.languages = rawData.languages
      .map((l: any) => ({
        id: uuidv4(),
        name: l.name || l.language || "",
        level: 100,
        fluency: l.fluency || ""
      }))
      .filter((l: any) => l.name) // Only keep languages with names
  }

  if (Array.isArray(rawData.projects)) {
    data.sections.projects = rawData.projects
      .map((p: any) => {
        const url = p.url ? sanitizeUrl(p.url) : ""
        const description = p.description ? sanitizeHtml(p.description) : ""
        const highlights = Array.isArray(p.highlights)
          ? p.highlights.map((h: any) => `<li>${sanitizeHtml(String(h))}</li>`)
          : []
        const highlightsHtml = highlights.length > 0 ? `<ul>${highlights.join("")}</ul>` : ""
        const techStr = Array.isArray(p.technologies)
          ? `<p>Technologies: ${p.technologies.join(", ")}</p>`
          : ""

        return {
          id: uuidv4(),
          name: p.name || "",
          description: [description ? `<p>${description}</p>` : "", highlightsHtml, techStr]
            .filter(Boolean)
            .join(""),
          url: url || "",
          websiteLabel: "",
          startDate: p.startDate || "",
          endDate: p.endDate || "",
          isCurrent: !p.endDate || String(p.endDate).toLowerCase() === "present",
          showLinkInTitle: !!url
        }
      })
      .filter((p: any) => p.name) // Only keep projects with names
  }

  if (Array.isArray(rawData.certifications)) {
    data.sections.certifications = rawData.certifications
      .map((c: any) => ({
        id: uuidv4(),
        name: c.name || "",
        issuer: c.issuer || "",
        date: c.date || "",
        url: c.url ? (sanitizeUrl(c.url) || "") : "",
        websiteLabel: "",
        showLinkInTitle: !!c.url,
        description: c.description ? sanitizeHtml(String(c.description)) : ""
      }))
      .filter((c: any) => c.name)
  }

  if (Array.isArray(rawData.volunteer)) {
    data.sections.volunteer = rawData.volunteer
      .map((v: any) => {
        const website = v.url || v.website || ""
        const sanitizedWebsite = website ? (sanitizeUrl(website) || "") : ""
        const summary = v.summary ? sanitizeHtml(v.summary) : ""
        const highlights = Array.isArray(v.highlights)
          ? v.highlights.map((h: any) => `<li>${sanitizeHtml(String(h))}</li>`)
          : []
        const highlightsHtml = highlights.length > 0 ? `<ul>${highlights.join("")}</ul>` : ""

        return {
          id: uuidv4(),
          organization: v.organization || "",
          position: v.position || "",
          startDate: v.startDate || "",
          endDate: v.endDate || "",
          isCurrent: !v.endDate || String(v.endDate).toLowerCase() === "present",
          website: sanitizedWebsite,
          websiteLabel: "",
          showLinkInTitle: !!sanitizedWebsite,
          description: [summary ? `<p>${summary}</p>` : "", highlightsHtml]
            .filter(Boolean)
            .join("")
        }
      })
      .filter((v: any) => v.organization)
  }

  if (Array.isArray(rawData.publications)) {
    data.sections.publications = rawData.publications
      .map((pb: any) => {
        const url = pb.url ? sanitizeUrl(pb.url) : ""
        return {
          id: uuidv4(),
          name: pb.name || "",
          publisher: pb.publisher || "",
          date: pb.date || "",
          url: url || "",
          websiteLabel: "",
          showLinkInTitle: !!url,
          description: pb.description ? sanitizeHtml(String(pb.description)) : ""
        }
      })
      .filter((pb: any) => pb.name)
  }

  if (Array.isArray(rawData.awards)) {
    data.sections.awards = rawData.awards
      .map((a: any) => {
        const url = a.url ? sanitizeUrl(a.url) : ""
        return {
          id: uuidv4(),
          title: a.title || "",
          awarder: a.awarder || "",
          date: a.date || "",
          url: url || "",
          websiteLabel: "",
          showLinkInTitle: !!url,
          description: a.description ? sanitizeHtml(String(a.description)) : ""
        }
      })
      .filter((a: any) => a.title)
  }

  if (Array.isArray(rawData.interests)) {
    data.sections.interests = rawData.interests
      .map((i: any) => ({
        id: uuidv4(),
        name: typeof i === "string" ? i : (i.name || "")
      }))
      .filter((i: any) => {
        if (!i.name) return false
        // Exclude items that look like location info incorrectly classified as interests
        const isLocationInterests = /location\s*\(|current city|country/i.test(i.name)
        return !isLocationInterests
      })
  }

  if (Array.isArray(rawData.references)) {
    data.sections.references = rawData.references
      .map((r: any) => {
        const url = r.url || r.website || ""
        const sanitizedUrl = url ? (sanitizeUrl(url) || "") : ""
        return {
          id: uuidv4(),
          name: r.name || "",
          position: r.position || "",
          phone: r.phone || "",
          email: r.email || "",
          website: sanitizedUrl,
          websiteLabel: "",
          showLinkInTitle: !!sanitizedUrl,
          description: r.description ? sanitizeHtml(String(r.description)) : ""
        }
      })
      .filter((r: any) => r.name)
  }

  // Set the title
  data.title = `${data.basics.name || "Imported"} Resume`

  return data
}
