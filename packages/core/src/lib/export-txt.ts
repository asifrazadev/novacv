import { ResumeData } from "@/types/resume"

// Helper to strip HTML tags and decode HTML entities
function cleanHtml(html: string): string[] {
  if (!html) return []
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<p>/gi, "")
    .replace(/<li>/gi, "• ")
    .replace(/<div>/gi, "")

  text = text.replace(/<[^>]+>/g, "")

  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export function exportResumeToTxt(data: ResumeData, filename: string): boolean {
  try {
    const { basics, sections, metadata } = data
    let txt = ""

    // 1. Header Section
    txt += `${(basics.name || "Your Name").toUpperCase()}\n`
    if (basics.headline) {
      txt += `${basics.headline}\n`
    }
    const contactParts = [
      basics.email,
      basics.phone,
      basics.location,
      basics.website,
    ].filter(Boolean)
    if (contactParts.length > 0) {
      txt += `${contactParts.join("  |  ")}\n`
    }
    txt += `======================================================================\n\n`

    // Helper to format Date Range
    const formatDateRange = (item: any) => {
      if (item.startDate) {
        const end = item.isCurrent ? "Present" : item.endDate || ""
        return `${item.startDate}${end ? ` – ${end}` : ""}`
      }
      return item.date || ""
    }

    // Helper to write section header
    const addSectionHeader = (title: string) => {
      txt += `${title.toUpperCase()}\n`
      txt += `----------------------------------------------------------------------\n`
    }

    // Helper to write description list items
    const addDescription = (htmlDesc: string) => {
      const lines = cleanHtml(htmlDesc)
      lines.forEach((line) => {
        if (line.startsWith("•")) {
          txt += `  ${line}\n`
        } else {
          txt += `  • ${line}\n`
        }
      })
    }

    // 2. Summary
    if (sections.summary?.content && cleanHtml(sections.summary.content).length > 0) {
      addSectionHeader("Professional Summary")
      const lines = cleanHtml(sections.summary.content)
      lines.forEach((l) => {
        txt += `${l}\n`
      })
      txt += "\n"
    }

    // 3. Experience
    if (sections.experience && sections.experience.length > 0) {
      addSectionHeader("Work Experience")
      sections.experience.forEach((exp) => {
        txt += `${exp.company || ""}`
        if (exp.location) txt += ` (${exp.location})`
        txt += `\t\t${formatDateRange(exp)}\n`

        if (exp.position) {
          txt += `${exp.position}\n`
        }

        if (exp.roles && exp.roles.length > 0) {
          exp.roles.forEach((role: any) => {
            txt += `  - ${role.title}\t\t${formatDateRange(role)}\n`
            if (role.description) {
              addDescription(role.description)
            }
          })
        } else if (exp.description) {
          addDescription(exp.description)
        }
        txt += "\n"
      })
    }

    // 4. Education
    if (sections.education && sections.education.length > 0) {
      addSectionHeader("Education")
      sections.education.forEach((edu) => {
        txt += `${edu.school || ""}`
        if (edu.location) txt += ` (${edu.location})`
        txt += `\t\t${formatDateRange(edu)}\n`

        const degreeDetails = [edu.degree, edu.areaOfStudy].filter(Boolean).join(", ")
        if (degreeDetails) {
          txt += `${degreeDetails}`
          if (edu.grade) txt += ` (GPA: ${edu.grade})`
          txt += "\n"
        }
        if (edu.description) {
          addDescription(edu.description)
        }
        txt += "\n"
      })
    }

    // 5. Projects
    if (sections.projects && sections.projects.length > 0) {
      addSectionHeader("Projects")
      sections.projects.forEach((proj) => {
        txt += `${proj.name || ""}`
        if (proj.url) txt += ` (${proj.url})`
        txt += `\t\t${formatDateRange(proj)}\n`
        if (proj.description) {
          addDescription(proj.description)
        }
        txt += "\n"
      })
    }

    // 6. Skills
    if (sections.skills && sections.skills.length > 0) {
      addSectionHeader("Skills")
      const skillsMode = (metadata as any).skillsMode ?? "category"

      if (skillsMode === "simple") {
        txt += sections.skills.map((s) => s.name).join(", ") + "\n"
      } else {
        sections.skills.forEach((s) => {
          const keywordsStr = Array.isArray(s.keywords) ? s.keywords.join(", ") : s.keywords
          txt += `${s.name}: ${keywordsStr || ""}\n`
        })
      }
      txt += "\n"
    }

    // 7. Certifications
    if (sections.certifications && sections.certifications.length > 0) {
      addSectionHeader("Certifications")
      sections.certifications.forEach((cert) => {
        txt += `${cert.name || ""}`
        if (cert.issuer) txt += ` - ${cert.issuer}`
        txt += `\t\t${cert.date || ""}\n`
        if (cert.description) {
          addDescription(cert.description)
        }
        txt += "\n"
      })
    }

    // 8. Custom Sections
    const customSections = (sections as any).customSections ?? []
    customSections.forEach((c: any) => {
      const items = c.items ?? []
      if (items.length === 0) return

      addSectionHeader(c.name || "Custom Section")
      items.forEach((item: any) => {
        txt += `${item.title || ""}`
        if (item.location) txt += ` (${item.location})`
        txt += `\t\t${formatDateRange(item)}\n`

        if (item.subtitle || item.url) {
          txt += `  ${item.subtitle || ""}`
          if (item.url) txt += ` (${item.url})`
          txt += "\n"
        }
        if (item.description) {
          addDescription(item.description)
        }
        txt += "\n"
      })
    })

    // Additional Sections
    const genericSectionsList = [
      { id: "languages", label: "Languages" },
      { id: "interests", label: "Interests" },
      { id: "awards", label: "Awards & Recognition" },
      { id: "volunteer", label: "Volunteer Work" },
      { id: "publications", label: "Publications" },
      { id: "references", label: "References" },
    ]

    genericSectionsList.forEach((sec) => {
      const list = sections[sec.id as keyof typeof sections] as any[]
      if (list && list.length > 0) {
        addSectionHeader(sec.label)
        list.forEach((item) => {
          if (sec.id === "languages") {
            txt += `${item.name || ""}${item.level ? ` - Level: ${item.level}%` : ""}\n`
          } else if (sec.id === "interests") {
            txt += `- ${item.name || ""}\n`
          } else if (sec.id === "awards") {
            txt += `${item.title || ""}${item.awarder ? ` (${item.awarder})` : ""}\t\t${item.date || ""}\n`
          } else if (sec.id === "volunteer") {
            txt += `${item.organization || ""}\t\t${formatDateRange(item)}\n`
            if (item.position) txt += `  Role: ${item.position}\n`
            if (item.description) addDescription(item.description)
          } else if (sec.id === "publications") {
            txt += `${item.name || ""}${item.publisher ? ` - ${item.publisher}` : ""}\t\t${item.date || ""}\n`
          } else if (sec.id === "references") {
            txt += `${item.name || ""}${item.position ? ` (${item.position})` : ""}\n`
            if (item.email || item.phone) {
              txt += `  Contact: ${[item.email, item.phone].filter(Boolean).join(" | ")}\n`
            }
          }
        })
        txt += "\n"
      }
    })

    // File generation
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error("Error generating plain text resume:", error)
    return false
  }
}
