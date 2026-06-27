import { ResumeData } from "@/types/resume"
import { getTemplate } from "@/templates/index"

// Helper to extract clean content of all sections and basics as structured JSON
export function extractResumeText(data: ResumeData): string {
  const { features } = getTemplate(data.metadata.template)
  const skillsMode = data.metadata.skillsMode ?? "category"

  const cleanData = {
    basics: {
      name: data.basics.name,
      headline: data.basics.headline,
      email: data.basics.email,
      phone: data.basics.phone,
      location: data.basics.location,
      website: data.basics.website,
    },
    sections: {
      summary: {
        content: (data.sections.summary?.content || "").replace(/<[^>]*>?/gm, '')
      },
      profiles: data.sections.profiles?.map(p => ({
        network: p.network,
        username: p.username,
        url: p.url
      })) || [],
      experience: data.sections.experience?.map(e => ({
        company: e.company,
        position: e.position,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        isCurrent: e.isCurrent,
        description: (e.description || "").replace(/<[^>]*>?/gm, ''),
        roles: e.roles?.map(r => ({
          title: r.title,
          startDate: r.startDate,
          endDate: r.endDate,
          isCurrent: r.isCurrent,
          description: (r.description || "").replace(/<[^>]*>?/gm, '')
        })) || []
      })) || [],
      education: data.sections.education?.map(edu => ({
        school: edu.school,
        degree: edu.degree,
        areaOfStudy: edu.areaOfStudy,
        grade: edu.grade,
        location: edu.location,
        startDate: edu.startDate,
        endDate: edu.endDate,
        description: (edu.description || "").replace(/<[^>]*>?/gm, '')
      })) || [],
      projects: data.sections.projects?.map(p => ({
        name: p.name,
        description: (p.description || "").replace(/<[^>]*>?/gm, ''),
        url: p.url,
        startDate: p.startDate,
        endDate: p.endDate
      })) || [],
      skills: data.sections.skills?.map(s =>
        skillsMode === "category"
          ? { name: s.name, keywords: s.keywords }
          : features.skillLevel ? { name: s.name, level: s.level } : { name: s.name }
      ) || [],
      languages: data.sections.languages?.map(l =>
        features.languageLevel ? { name: l.name, level: l.level } : { name: l.name }
      ) || [],
      interests: data.sections.interests?.map(i => ({
        name: i.name
      })) || [],
      awards: data.sections.awards?.map(a => ({
        title: a.title,
        awarder: a.awarder,
        date: a.date,
        description: (a.description || "").replace(/<[^>]*>?/gm, '')
      })) || [],
      certifications: data.sections.certifications?.map(c => ({
        name: c.name,
        issuer: c.issuer,
        date: c.date,
        description: (c.description || "").replace(/<[^>]*>?/gm, '')
      })) || [],
      publications: data.sections.publications?.map(p => ({
        name: p.name,
        publisher: p.publisher,
        date: p.date,
        description: (p.description || "").replace(/<[^>]*>?/gm, '')
      })) || [],
      volunteer: data.sections.volunteer?.map(v => ({
        organization: v.organization,
        position: v.position,
        startDate: v.startDate,
        endDate: v.endDate,
        description: (v.description || "").replace(/<[^>]*>?/gm, '')
      })) || [],
      references: data.sections.references?.map(r => ({
        name: r.name,
        position: r.position,
        description: (r.description || "").replace(/<[^>]*>?/gm, '')
      })) || []
    }
  }
  return JSON.stringify(cleanData, null, 2)
}

// Calculate precise word and character count metrics without JSON syntax
export function calculateCleanStats(data: ResumeData) {
  const texts: string[] = []

  if (data.basics.name) texts.push(data.basics.name)
  if (data.basics.headline) texts.push(data.basics.headline)
  if (data.basics.email) texts.push(data.basics.email)
  if (data.basics.phone) texts.push(data.basics.phone)
  if (data.basics.location) texts.push(data.basics.location)
  if (data.basics.website) texts.push(data.basics.website)

  if (data.sections.summary?.content) {
    texts.push(data.sections.summary.content.replace(/<[^>]*>?/gm, ''))
  }

  data.sections.experience?.forEach(e => {
    if (e.company) texts.push(e.company)
    if (e.position) texts.push(e.position)
    if (e.description) texts.push(e.description.replace(/<[^>]*>?/gm, ''))
    e.roles?.forEach(r => {
      if (r.title) texts.push(r.title)
      if (r.description) texts.push(r.description.replace(/<[^>]*>?/gm, ''))
    })
  })

  data.sections.education?.forEach(e => {
    if (e.school) texts.push(e.school)
    if (e.areaOfStudy) texts.push(e.areaOfStudy)
    if (e.degree) texts.push(e.degree)
    if (e.description) texts.push(e.description.replace(/<[^>]*>?/gm, ''))
  })

  data.sections.projects?.forEach(p => {
    if (p.name) texts.push(p.name)
    if (p.description) texts.push(p.description.replace(/<[^>]*>?/gm, ''))
  })

  data.sections.skills?.forEach(s => {
    if (s.name) texts.push(s.name)
  })

  data.sections.languages?.forEach(l => {
    if (l.name) texts.push(l.name)
  })

  data.sections.interests?.forEach(i => {
    if (i.name) texts.push(i.name)
  })

  data.sections.awards?.forEach(a => {
    if (a.title) texts.push(a.title)
    if (a.awarder) texts.push(a.awarder)
    if (a.description) texts.push(a.description.replace(/<[^>]*>?/gm, ''))
  })

  data.sections.certifications?.forEach(c => {
    if (c.name) texts.push(c.name)
    if (c.issuer) texts.push(c.issuer)
    if (c.description) texts.push(c.description.replace(/<[^>]*>?/gm, ''))
  })

  data.sections.publications?.forEach(p => {
    if (p.name) texts.push(p.name)
    if (p.publisher) texts.push(p.publisher)
    if (p.description) texts.push(p.description.replace(/<[^>]*>?/gm, ''))
  })

  data.sections.volunteer?.forEach(v => {
    if (v.organization) texts.push(v.organization)
    if (v.position) texts.push(v.position)
    if (v.description) texts.push(v.description.replace(/<[^>]*>?/gm, ''))
  })

  data.sections.references?.forEach(r => {
    if (r.name) texts.push(r.name)
    if (r.position) texts.push(r.position)
    if (r.description) texts.push(r.description.replace(/<[^>]*>?/gm, ''))
  })

  const combined = texts.join(" ")
  const charCount = combined.length
  const wordCount = combined.trim().split(/\s+/).filter(Boolean).length
  return { charCount, wordCount }
}

export const convertMarkdownToHtml = (text: string): string => {
  if (!text) return ""
  // Convert markdown bold/italic
  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")

  // If the text contains newlines, convert it into an HTML list
  if (html.includes("\n")) {
    const lines = html.split("\n").map(line => {
      const cleanLine = line.replace(/^[•\-\*\s]+/, "").trim()
      return cleanLine ? `<li>${cleanLine}</li>` : ""
    }).filter(Boolean)
    return `<ul>${lines.join("")}</ul>`
  }

  // If it's a single line and doesn't start/end with HTML tags, wrap in <p>
  if (!html.startsWith("<") && !html.endsWith(">")) {
    html = `<p>${html}</p>`
  }
  
  return html
}
