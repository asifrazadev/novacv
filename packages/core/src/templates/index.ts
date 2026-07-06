import { ModernTemplate } from "./modern"
import { JakeTemplate } from "./Jake"
import { ExecutiveTemplate } from "./executive"
import { AcademicTemplate } from "./academic"
import { TypewriterTemplate } from "./typewriter"

export interface TemplateFeatures {
  /** Whether this template renders a visual skill level (bar, dots, %). If false, level is noise — omit from AI context. */
  skillLevel: boolean
  /** Whether this template renders a language proficiency label (Native/Fluent/dots). If true, level is meaningful for AI context. */
  languageLevel: boolean
}

export const templates = [
  {
    id: "modern",
    name: "Modern",
    component: ModernTemplate,
    thumbnail: "/thumbnails/modern.png",
    features: { skillLevel: false, languageLevel: true } satisfies TemplateFeatures,
    defaultLayout: {
      main: ["summary", "experience", "education", "projects", "volunteer", "publications", "references"],
      sidebar: ["skills", "languages", "interests", "awards", "certifications", "profiles"]
    }
  },
  {
    id: "jake",
    name: "Professional",
    component: JakeTemplate,
    thumbnail: "/thumbnails/jake.png",
    features: { skillLevel: false, languageLevel: true } satisfies TemplateFeatures,
    defaultLayout: {
      main: ["summary", "experience", "education", "projects", "volunteer", "publications", "references", "skills", "languages", "interests", "awards", "certifications", "profiles"],
      sidebar: []
    }
  },
  {
    id: "executive",
    name: "Executive",
    component: ExecutiveTemplate,
    thumbnail: "/thumbnails/executive.png",
    features: { skillLevel: false, languageLevel: true } satisfies TemplateFeatures,
    defaultLayout: {
      main: ["summary", "skills", "experience", "education", "projects", "volunteer", "publications", "references", "languages", "interests", "awards", "certifications", "profiles"],
      sidebar: []
    }
  },
  {
    id: "academic",
    name: "Academic",
    component: AcademicTemplate,
    thumbnail: "/thumbnails/academic.png",
    features: { skillLevel: false, languageLevel: true } satisfies TemplateFeatures,
    defaultLayout: {
      main: ["summary", "education", "experience", "projects", "skills", "awards", "certifications", "volunteer", "publications", "references", "languages", "interests", "profiles"],
      sidebar: []
    }
  }
  ,
  {
    id: "typewriter",
    name: "Typewriter",
    component: TypewriterTemplate,
    thumbnail: "/thumbnails/typewriter.png",
    features: { skillLevel: false, languageLevel: true } satisfies TemplateFeatures,
    defaultLayout: {
      main: ["summary", "experience","skills", "profiles", "education", "projects", "volunteer", "languages", "awards", "certifications", "publications", "references", "interests"],
      sidebar: []
    }
  }
]

export function getTemplate(id: string) {
  return templates.find(t => t.id === id) || templates[0]
}
