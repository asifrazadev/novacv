export interface ResumeBasics {
  name: string
  headline: string
  email: string
  phone: string
  location: string
  website: string
  picture: {
    url: string
    size: number
    aspectRatio: number
    borderRadius: number
    borderWidth: number
    borderColor: string
    rotation: number
    shadow: number
    grayscale: boolean
    visible?: boolean
  }
}

export interface Profile {
  id: string
  network: string
  username: string
  url: string
  icon: string
}

export interface ExperienceRole {
  id: string
  title: string
  startDate: string
  endDate: string
  isCurrent: boolean
  description?: string
}

export interface Experience {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  isCurrent: boolean
  website: string
  websiteLabel: string
  showLinkInTitle: boolean
  roles: ExperienceRole[]
  description: string
}

export interface Education {
  id: string
  school: string
  areaOfStudy: string
  degree: string
  grade: string
  location: string
  startDate: string
  endDate: string
  isCurrent: boolean
  website: string
  websiteLabel: string
  showLinkInTitle: boolean
  description: string
}

export interface Project {
  id: string
  name: string
  description: string
  url: string
  website?: string
  websiteLabel: string
  startDate: string
  endDate: string
  isCurrent: boolean
  showLinkInTitle: boolean
}

export interface Award {
  id: string
  title: string
  awarder: string
  date: string
  url: string
  website?: string
  websiteLabel: string
  showLinkInTitle: boolean
  description: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  url: string
  website?: string
  websiteLabel: string
  showLinkInTitle: boolean
  description: string
}

export interface Publication {
  id: string
  name: string
  publisher: string
  date: string
  url: string
  website?: string
  websiteLabel: string
  showLinkInTitle: boolean
  description: string
}

export interface Volunteer {
  id: string
  organization: string
  position: string
  startDate: string
  endDate: string
  isCurrent: boolean
  website: string
  websiteLabel: string
  showLinkInTitle: boolean
  description: string
}

export interface Reference {
  id: string
  name: string
  position: string
  phone: string
  email: string
  website: string
  websiteLabel: string
  showLinkInTitle: boolean
  description: string
}

export interface PaginationCacheEntry {
  main: Array<{ id: string; itemIds?: string[]; bulletIds?: string[] }>
  sidebar: Array<{ id: string; itemIds?: string[]; bulletIds?: string[] }>
  showHeader: boolean
  showFooter: boolean
}

export interface ResumeData {
  id: string
  title: string
  basics: ResumeBasics
  sections: {
    summary: { content: string }
    profiles: Profile[]
    experience: Experience[]
    education: Education[]
    projects: Project[]
    skills: { id: string; name: string; level: number; keywords?: string[] }[]
    languages: { id: string; name: string; level: number }[]
    interests: { id: string; name: string }[]
    awards: Award[]
    certifications: Certification[]
    publications: Publication[]
    volunteer: Volunteer[]
    references: Reference[]
  }
  metadata: {
    template: string
    layout: {
      main: string[]
      sidebar: string[]
    }
    typography: {
      fontFamily: string
      fontSize: number
      lineHeight: number
      color: string
      nameSize?: number
      headlineSize?: number
      sectionTitleSize?: number
    }
    design: {
      primaryColor: string
      spacing: number
      borderRadius: number
    }
    page: {
      format: string
      width: number
      height: number
      padding: number
    }
    language?: string
    css: string
    /** "category" = name + keywords grouped, "simple" = flat tag list */
    skillsMode?: "category" | "simple"
    paginationCache?: PaginationCacheEntry[]
  }
}

export const defaultResumeData: ResumeData = {
  id: "",
  title: "Untitled Resume",
  basics: {
    name: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    picture: {
      url: "",
      size: 64,
      aspectRatio: 1,
      borderRadius: 0,
      rotation: 0,
      borderWidth: 0,
      borderColor: "#000000",
      grayscale: false,
      shadow: 0,
      visible: true,
    },
  },
  sections: {
    summary: { content: "" },
    experience: [],
    education: [],
    projects: [],
    profiles: [],
    skills: [],
    languages: [],
    interests: [],
    awards: [],
    certifications: [],
    publications: [],
    volunteer: [],
    references: [],
  },
  metadata: {
    template: "modern",
    layout: {
      main: ["summary", "experience", "education", "projects", "volunteer"],
      sidebar: ["skills", "languages", "interests", "awards", "certifications", "publications", "references"]
    },
    typography: {
      fontFamily: "Inter",
      fontSize: 8.5,
      lineHeight: 1.3,
      color: "#000000",
      nameSize: 26,
      headlineSize: 10,
      sectionTitleSize: 9,
    },
    design: {
      primaryColor: "#2563eb",
      spacing: 1,
      borderRadius: 4,
    },
    page: {
      format: "a4",
      width: 210,
      height: 297,
      padding: 12,
    },
    language: "en",
    css: "",
  },
}
