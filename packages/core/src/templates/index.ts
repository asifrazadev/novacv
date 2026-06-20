import { ModernTemplate } from "./modern"
import { JakeTemplate } from "./Jake"
import { ExecutiveTemplate } from "./executive"
import { AcademicTemplate } from "./academic"

export const templates = [
  {
    id: "modern",
    name: "Modern",
    component: ModernTemplate,
    thumbnail: "/thumbnails/modern.png",
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
    defaultLayout: {
      main: ["summary", "education", "experience", "projects", "skills", "awards", "certifications", "volunteer", "publications", "references", "languages", "interests", "profiles"],
      sidebar: []
    }
  }
]

export function getTemplate(id: string) {
  return templates.find(t => t.id === id) || templates[0]
}
