import { z } from "zod"

const baseItemSchema = z.object({
  id: z.string(),
})

const linkableEntrySchema = baseItemSchema.extend({
  website: z.string().optional(),
  websiteLabel: z.string().optional(),
  showLinkInTitle: z.boolean().optional(),
})

export const resumeDataSchema = z.object({
  id: z.string(),
  schemaVersion: z.number().optional(),
  title: z.string(),
  basics: z.object({
    name: z.string(),
    headline: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    website: z.string(),
    picture: z.object({
      url: z.string(),
      size: z.number(),
      aspectRatio: z.number(),
      borderRadius: z.number(),
      borderWidth: z.number(),
      borderColor: z.string(),
      rotation: z.number(),
      shadow: z.number(),
      grayscale: z.boolean(),
      visible: z.boolean().optional(),
    }),
  }),
  sections: z.object({
    summary: z.object({ content: z.string() }),
    profiles: z.array(
      baseItemSchema.extend({
        network: z.string(),
        username: z.string(),
        url: z.string(),
        icon: z.string(),
      })
    ),
    experience: z.array(
      linkableEntrySchema.extend({
        company: z.string(),
        position: z.string(),
        location: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        isCurrent: z.boolean(),
        roles: z.array(
          baseItemSchema.extend({
            title: z.string(),
            startDate: z.string(),
            endDate: z.string(),
            isCurrent: z.boolean(),
            description: z.string().optional(),
          })
        ),
        description: z.string(),
      })
    ),
    education: z.array(
      linkableEntrySchema.extend({
        school: z.string(),
        areaOfStudy: z.string(),
        degree: z.string(),
        grade: z.string(),
        location: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        isCurrent: z.boolean(),
        description: z.string(),
      })
    ),
    projects: z.array(
      linkableEntrySchema.extend({
        name: z.string(),
        description: z.string(),
        url: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        isCurrent: z.boolean(),
      })
    ),
    skills: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        level: z.number(),
        keywords: z.array(z.string()).optional(),
      })
    ),
    languages: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        level: z.number(),
      })
    ),
    interests: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    ),
    awards: z.array(
      linkableEntrySchema.extend({
        title: z.string(),
        awarder: z.string(),
        date: z.string(),
        url: z.string(),
        description: z.string(),
      })
    ),
    certifications: z.array(
      linkableEntrySchema.extend({
        name: z.string(),
        issuer: z.string(),
        date: z.string(),
        url: z.string(),
        description: z.string(),
      })
    ),
    publications: z.array(
      linkableEntrySchema.extend({
        name: z.string(),
        publisher: z.string(),
        date: z.string(),
        url: z.string(),
        description: z.string(),
      })
    ),
    volunteer: z.array(
      linkableEntrySchema.extend({
        organization: z.string(),
        position: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        isCurrent: z.boolean(),
        description: z.string(),
      })
    ),
    references: z.array(
      linkableEntrySchema.extend({
        name: z.string(),
        position: z.string(),
        phone: z.string(),
        email: z.string(),
        description: z.string(),
      })
    ),
  }),
  metadata: z.object({
    template: z.string(),
    layout: z.object({
      main: z.array(z.string()),
      sidebar: z.array(z.string()),
    }),
    typography: z.object({
      fontFamily: z.string(),
      fontSize: z.number(),
      lineHeight: z.number(),
      color: z.string(),
      nameSize: z.number().optional(),
      headlineSize: z.number().optional(),
      sectionTitleSize: z.number().optional(),
    }),
    design: z.object({
      primaryColor: z.string(),
      spacing: z.number(),
      borderRadius: z.number(),
    }),
    page: z.object({
      format: z.string(),
      width: z.number(),
      height: z.number(),
      padding: z.number(),
    }),
    language: z.string().optional(),
    css: z.string(),
    skillsMode: z.enum(["category", "simple"]).optional(),
    tags: z.array(z.string()).optional(),
  }),
  paginationCache: z.array(z.any()).optional(),
})
