"use server"

// Force HMR reload - timing instrumented
import { generateObject, generateText } from "ai"
import { z } from "zod"
import { getAIModel } from "@/lib/ai-provider"
import { getAIConfig } from "@/lib/ai-helper"
import { getErrorMessage } from "@/lib/error-handler"
import { AIProvider } from "@/store/use-ai-store"
import { ResumeData } from "@/types/resume"
import { jsonrepair } from "jsonrepair"
import { performance } from "perf_hooks"

interface ClientConfig {
  provider: AIProvider
  model: string
  baseUrl: string
  apiKey: string
}

interface AnalysisResult {
  success: boolean
  result?: {
    score: number
    summary: string
    suggestions: string[]
  }
  error?: string
}

interface ExtractionResult {
  success: boolean
  json?: Record<string, unknown>
  error?: string
}

interface RewriteResult {
  success: boolean
  text?: string
  error?: string
}

interface SuggestResult {
  success: boolean
  result?: {
    suggestions: string[]
    keywords: string[]
  }
  error?: string
}

interface TailorResult {
  success: boolean
  result?: {
    tailoredSummary: string
    recommendedSkills: string[]
    experienceSuggestions: Array<{
      id: string
      company: string
      position: string
      bulletSuggestions: string[]
    }>
  }
  error?: string
}

// --- Fallback Robust JSON Generator ---

const ATS_RESULT_TEMPLATE = `{
  "score": 85,
  "summary": "Brief summary of resume ATS findings.",
  "suggestions": [
    "3 Suggestion (optional, can be empty list if no improvements needed)"
  ]
}`;

const RESUME_DATA_TEMPLATE = `{
  "basics": {
    "name": "Full Name",
    "label": "Professional Title (optional)",
    "email": "email@example.com (optional)",
    "phone": "+1-123-456-7890 (optional)",
    "url": "https://website.com (optional)",
    "summary": "Summary text (optional)",
    "location": {
      "city": "City (optional)",
      "region": "State/Region (optional)",
      "countryCode": "Country Code (optional)"
    },
    "profiles": [
      {
        "network": "GitHub",
        "username": "username",
        "url": "profile-url"
      }
    ]
  },
  "work": [
    {
      "name": "Company Name",
      "position": "Job Title",
      "url": "Company website (optional)",
      "startDate": "Start Date (optional)",
      "endDate": "End Date/Present (optional)",
      "summary": "Role description (optional)",
      "highlights": ["Responsibility/Achievement 1", "Responsibility/Achievement 2"]
    }
  ],
  "education": [
    {
      "institution": "School/University Name",
      "area": "Field of Study (optional)",
      "studyType": "Degree Type (optional)",
      "startDate": "Start Date (optional)",
      "endDate": "End Date (optional)",
      "courses": ["Course 1", "Course 2"]
    }
  ],
  "skills": [
    {
      "name": "Skill Category",
      "keywords": ["Skill 1", "Skill 2"]
    }
  ],
  "languages": [
    {
      "language": "Language",
      "fluency": "Fluency Level (optional)"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description (optional)",
      "highlights": ["Highlight 1", "Highlight 2"],
      "url": "Project URL (optional)"
    }
  ],
  "volunteer": [
    {
      "organization": "Organization Name",
      "position": "Volunteer Title",
      "url": "Website (optional)",
      "startDate": "Start Date (optional)",
      "endDate": "End Date (optional)",
      "summary": "Description (optional)",
      "highlights": ["Highlight 1"]
    }
  ],
  "publications": [
    {
      "name": "Publication Title",
      "publisher": "Publisher (optional)",
      "date": "Date (optional)",
      "url": "Website (optional)",
      "description": "Abstract/Summary (optional)"
    }
  ],
  "awards": [
    {
      "title": "Award Title",
      "awarder": "Awarder (optional)",
      "date": "Date (optional)",
      "url": "Website (optional)",
      "description": "Details (optional)"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuer (optional)",
      "date": "Date (optional)",
      "url": "Website (optional)",
      "description": "Details (optional)"
    }
  ],
  "interests": [
    {
      "name": "Interest Name"
    }
  ],
  "references": [
    {
      "name": "Reference Name",
      "position": "Reference Title (optional)",
      "phone": "Phone (optional)",
      "email": "Email (optional)",
      "url": "Website (optional)",
      "description": "Reference statement (optional)"
    }
  ]
}`;

const SUGGEST_RESULT_TEMPLATE = `{
  "suggestions": [
    "Bullet point suggestion 1",
    "Bullet point suggestion 2",
    "Bullet point suggestion 3",
    "Bullet point suggestion 4"
  ],
  "keywords": [
    "Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4", "Keyword 5", "Keyword 6"
  ]
}`;

const TAILOR_RESULT_TEMPLATE = `{
  "tailoredSummary": "A tailored professional summary.",
  "recommendedSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8"],
  "experienceSuggestions": [
    {
      "id": "item-id",
      "company": "Company Name",
      "position": "Job Title",
      "bulletSuggestions": ["Adapted bullet point 1", "Adapted bullet point 2"]
    }
  ]
}`;

const OPENROUTER_FALLBACK_MODELS = [
  "openai/gpt-oss-120b:free",
  "meta-llama/llama-3-8b-instruct:free",
  "liquid/lfm-2.5-1.2b-thinking:free"
];

/**
 * Returns true if a string looks like AI commentary rather than a real field value.
 * Models sometimes write prose like "no URL provided", "placeholder", "(interpreted as...)" etc.
 */
function isCommentaryString(value: string): boolean {
  if (!value) return false
  const patterns = [
    /no url provided/i,
    /no \w+ provided/i,
    /placeholder/i,
    /interpreted as/i,
    /i (have |)(kept|placed|used|added|left)/i,
    /based on (the |)(provided|given|available) text/i,
    /\([^)]{30,}\)/, // unusually long parenthetical (>30 chars) is likely commentary
  ]
  return patterns.some((p) => p.test(value))
}

/** Returns the value if it looks like a valid URL or bare domain, otherwise undefined. */
function cleanUrlField(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined
  const v = value.trim()
  if (isCommentaryString(v)) return undefined
  // Grab only the first whitespace-delimited token (URLs have no spaces)
  const urlPart = v.split(/\s/)[0]
  return urlPart || undefined
}

/** Returns the value if it looks like a valid email, otherwise undefined. */
function cleanEmailField(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined
  const v = value.trim()
  if (isCommentaryString(v)) return undefined
  if (!v.includes("@") || v.includes(" ")) return undefined
  return v
}

/** Returns the value if it looks like a real phone number (must contain digits), otherwise undefined. */
function cleanPhoneField(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined
  const v = value.trim()
  if (isCommentaryString(v)) return undefined
  if (!/\d/.test(v)) return undefined
  return v
}

/**
 * Normalize raw AI-extracted JSON to match the Zod schema before parsing.
 * Models often return:
 *   - skills as string[] instead of {name, keywords}[]
 *   - volunteer[].name instead of volunteer[].organization
 *   - languages as mixed string[] (programming + spoken languages)
 */
function preprocessExtraction(raw: Record<string, unknown>): Record<string, unknown> {
  const out = { ...raw }

  // Normalize skills: string[] → one consolidated {name, keywords}[] group
  if (Array.isArray(out.skills)) {
    const first = out.skills[0]
    if (typeof first === "string") {
      // Flat list of skill strings — group them all into a single "Skills" category
      out.skills = [{ name: "Skills", keywords: out.skills as string[] }]
    }
  }

  // Normalize volunteer: "name" → "organization"
  if (Array.isArray(out.volunteer)) {
    out.volunteer = (out.volunteer as Record<string, unknown>[]).map((v) => {
      if (v.organization) return v
      if (v.name) {
        const { name, ...rest } = v
        return { organization: name, ...rest }
      }
      return v
    })
  }

  // Normalize languages: string[] → {language, fluency?}[]
  // Also detect and split out programming languages that got mixed in
  if (Array.isArray(out.languages)) {
    const first = out.languages[0]
    if (typeof first === "string") {
      const PROGRAMMING_LANGS = new Set([
        "typescript", "javascript", "python", "java", "c++", "c#", "c", "rust",
        "go", "kotlin", "swift", "php", "ruby", "scala", "r", "matlab",
        "dart", "elixir", "haskell", "lua", "perl"
      ])
      const spokenLangs: string[] = []
      const progLangs: string[] = []

      for (const l of out.languages as string[]) {
        const lower = l.toLowerCase().replace(/\s*\(.*?\)/, "").trim()
        if (PROGRAMMING_LANGS.has(lower)) {
          progLangs.push(l)
        } else {
          spokenLangs.push(l)
        }
      }

      // Map spoken languages to {language, fluency} objects
      out.languages = spokenLangs.map((l) => {
        const match = l.match(/^(.+?)\s*\((.+?)\)$/)
        if (match) return { language: match[1].trim(), fluency: match[2].trim() }
        return { language: l, fluency: "" }
      })

      // If there are programming languages, inject them into skills
      if (progLangs.length > 0) {
        const existingSkills = Array.isArray(out.skills) ? (out.skills as Record<string, unknown>[]) : []
        out.skills = [
          ...existingSkills,
          { name: "Languages", keywords: progLangs.map((l) => l.replace(/\s*\(.*?\)/, "").trim()) }
        ]
      }
    }
  }

  // Sanitize basics contact fields
  if (out.basics && typeof out.basics === "object") {
    const b = out.basics as Record<string, unknown>
    const cleaned: Record<string, unknown> = { ...b }
    if (b.url !== undefined) cleaned.url = cleanUrlField(b.url)
    if (b.website !== undefined) cleaned.website = cleanUrlField(b.website)
    if (b.email !== undefined) cleaned.email = cleanEmailField(b.email)
    if (b.phone !== undefined) cleaned.phone = cleanPhoneField(b.phone)
    // label may come in as "summary" if model misrouted the headline
    if (!b.label && b.headline) cleaned.label = b.headline
    out.basics = cleaned
  }

  return out
}

async function generateObjectWithFallback<T>({
  model,
  schema,
  schemaPromptName,
  schemaTemplate,
  system,
  prompt,
  config,
}: {
  model: any
  schema: z.ZodType<T>
  schemaPromptName: string
  schemaTemplate: string
  system?: string
  prompt: string
  config?: {
    provider: AIProvider
    model: string
    apiKey: string
    baseUrl: string
  }
}): Promise<T> {
  // ── Step 1: Try structured generateObject (fastest, most reliable) ──
  try {
    const { object, usage } = await generateObject({
      model,
      schema,
      system,
      prompt,
      maxTokens: 4000,
    })

    return object
  } catch (error) {


    // The model often produces valid JSON wrapped in ```json``` fences.
    // The Vercel AI SDK can't parse it, but we can extract it directly from the error.
    const errorText: string | undefined = (error as any)?.text
    if (errorText) {
      try {
        let cleanText = errorText.trim()
        const fenceMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
        if (fenceMatch) {
          cleanText = fenceMatch[1]
        }
        // jsonrepair also handles truncated/partial JSON gracefully
        const repairedJson = jsonrepair(cleanText)
        const parsed = JSON.parse(repairedJson)
        const result = schema.parse(preprocessExtraction(parsed))
        return result
      } catch {
        // fall through to generateText
      }
    }
  }

  // ── Step 2: generateText fallback on primary model ──
  try {
    const fallbackPrompt = `${prompt}

CRITICAL OUTPUT FORMAT:
- Output ONLY the raw JSON object. No markdown, no code blocks, no backticks.
- No explanatory text before or after the JSON.
- No comments inside the JSON values.
- Every field value must be the actual extracted data — never a description of the data.
- URLs: only real URLs (http/https) or bare domain names. If no URL exists, omit the field.
- Do not write sentences as field values. Only write the actual data.

Expected JSON structure:
${schemaTemplate}`

    const { text, usage } = await generateText({ model, system, prompt: fallbackPrompt })


    let cleanText = text.trim()
    const fenceMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (fenceMatch) {
      cleanText = fenceMatch[1]
    }

    const repairedJson = jsonrepair(cleanText)
    const parsed = JSON.parse(repairedJson)
    return schema.parse(preprocessExtraction(parsed))
  } catch {
    // generateText fallback failed
  }

  // ── Step 3: Auto-healing backup models (OpenRouter only) ──
  if (config) {
    const resolvedConfig = config
    if (resolvedConfig.provider === "openrouter") {
      for (const fallbackModelName of OPENROUTER_FALLBACK_MODELS) {
        if (fallbackModelName === resolvedConfig.model) continue

        const backupModel = getAIModel({ ...resolvedConfig, model: fallbackModelName })

        // 3a: structured generateObject on backup
        try {
          const { object, usage } = await generateObject({
            model: backupModel,
            schema,
            system,
            prompt,
            maxTokens: 4000,
          })

          return object
        } catch {
          // backup generateObject failed, try generateText
        }

        // 3b: generateText on backup
        try {
          const backupPrompt = `${prompt}

CRITICAL OUTPUT FORMAT:
- Output ONLY raw JSON. No markdown, no code blocks, no backticks.
- No comments inside JSON values. Every value must be the actual data.

Expected JSON structure:
${schemaTemplate}`

          const { text, usage } = await generateText({ model: backupModel, system, prompt: backupPrompt })


          let cleanText = text.trim()
          const fenceMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
          if (fenceMatch) {
            cleanText = fenceMatch[1]
          }

          const repairedJson = jsonrepair(cleanText)
          const parsed = JSON.parse(repairedJson)
          return schema.parse(preprocessExtraction(parsed))
        } catch {
          // backup generateText also failed, try next model
        }
      }
    }
  }

  throw new Error(`[ai-actions] All fallbacks exhausted for ${schemaPromptName}`)
}

// --- ATS Analysis ---

const atsResultSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  suggestions: z.array(z.string()).max(3),
})

export async function analyzeResumeWithAI(
  resumeText: string,
  clientConfig: ClientConfig,
  jobDescription?: string
): Promise<AnalysisResult> {
  try {
    const resolvedConfig = getAIConfig(clientConfig)
    const model = getAIModel(resolvedConfig)

    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

    const prompt = jobDescription
      ? `You are an ATS resume expert. Evaluate this resume against the job description below.

Today's date: ${today}

STRICT RULES — violating any of these makes your response invalid:

1. Never invent skills, technologies, or accomplishments the user does not have.
   When a JD keyword is missing from the resume, frame it conditionally:
   "If you have experience with X, adding it to your Skills section would improve keyword match."
   Never use placeholder brackets like [number], [company], or X in rewrite suggestions.
2. Never suggest punctuation-only changes (adding/removing periods on bullets, fixing capitalization of common words). These have zero ATS impact.
3. Never suggest renaming section headers. Template headers are fixed in the system.
4. Never suggest merging the programming Languages skill category with the spoken Languages section. They are different data types in different fields.
5. Never suggest synonym rewrites where the meaning and context are identical (e.g. "Built" to "Developed", "Created" to "Produced"). Only suggest rewrites when the current wording is genuinely vague or misleading.
6. Never flag overlapping date ranges as inconsistent if the roles are clearly parallel (university + internship, full-time job + volunteer). Never flag "(Expected)" on a graduation date as a formatting error.
7. Never flag a volunteer entry as a duplicate just because it shares an organization name with a work experience entry. Volunteer and paid roles at the same organization are normal.
8. Never suggest removing keyword repetition between the Skills section and experience/certification bullets. In-context repetition is a deliberate ATS strategy.
9. Never suggest adding something that already exists anywhere on the resume. Read every section before writing a suggestion.
10. Never suggest adding a GPA unless one already appears somewhere on the resume.
11. Never suggest reordering sections. Section layout is template-controlled.
12. Never flag missing contact fields (phone, email, location, website) if any contact information is present in the basics section.
13. Never add seniority labels (Junior, Senior, Mid-level) to the headline or summary unless the user already uses one.
14. Never suggest converting bullets to paragraphs or paragraphs to bullets. Formatting style is a user choice.
15. Never suggest soft skills (communication, teamwork, leadership) for the Skills section on a technical resume.
16. Never suggest adding a cover letter, references section, or "references available" line.
17. Never suggest layout or spacing changes. Spacing is template-controlled.
18. Never suggest splitting or merging sections (e.g. separating Projects into Personal and Professional). Section structure is fixed.
19. Never suggest anything about the professional summary section — do not flag it as missing, short, weak, or needing improvement. If the VERIFIED RESUME FACTS header says "summary: PRESENT", treat it as fully adequate no matter how short. If it says "ABSENT", still do not suggest it — summary is optional.
20. Only suggest adding a missing section (e.g. Projects, Certifications) if that section type is entirely absent from the resume AND it is a standard, high-impact section for the target role.
21. For JD matching: only flag a keyword as missing if it appears in the JD requirements or responsibilities AND is absent from the entire resume including bullets, skills, and certifications. Do not flag keywords that appear only in the "Nice to Have" section of a JD as hard gaps.
22. A suggestion is only valid if it addresses one of these four things:
    - A keyword required by the JD that is genuinely absent from the resume
    - A bullet point that is vague where a specific technical detail would add real clarity
    - A standard section that is completely missing
    - An incomplete required field (e.g. education with no degree name, experience with no dates)
    Anything outside these four categories is not a valid suggestion.
23. Never flag any past year or date as an error, outdated, or something to update. Dates like 2023, 2024, 2025 on a resume are historical facts — end dates of jobs, graduation years, project completion dates. They are correct by definition. Only flag a date if it contains an obvious typo (e.g. "20025").
24. Never flag a summary as "missing" or "absent" if any text exists in the summary section. The summary may appear in a different position in the rendered text. Only suggest adding a summary if the summary section is completely empty with zero words.
25. Never flag missing end dates on projects. Project end dates are always optional — a project without an end date is ongoing or the user intentionally left it blank. This is never a resume error.
26. Never suggest "updating", "refreshing", or "adding recent" dates to any section. Date accuracy is the user's responsibility, not an ATS concern.
Evaluate: keyword match against the JD, missing skills the JD requires, bullet point strength, and ATS parsing risks.

Return ONLY this JSON, no extra text:
{
  "score": <number 0-100>,
  "summary": "<one sentence describing the resume's fit for this specific role>",
  "suggestions": [
    "<0 to 3 high-impact suggestions. If the resume is already excellent and has no major gaps, return an empty list []>"
  ]
}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}`
      : `You are an ATS resume expert. Evaluate this resume carefully.

Today's date: ${today}

STRICT RULES — violating any of these makes your response invalid:

1. Never invent skills, technologies, or accomplishments the user does not have.
   Only frame gaps conditionally: "If you have experience with X, adding it would strengthen the resume."
   Never use placeholder brackets like [number], [company], or X in suggestions.
2. Never suggest punctuation-only changes (adding/removing periods on bullets, fixing capitalization of common words). These have zero ATS impact.
3. Never suggest renaming section headers. Template headers are fixed in the system.
4. Never suggest merging the programming Languages skill category with the spoken Languages section. They are different data types in different fields.
5. Never suggest synonym rewrites where the meaning and context are identical (e.g. "Built" to "Developed", "Created" to "Produced"). Only suggest rewrites when the current wording is genuinely vague or misleading.
6. Never flag overlapping date ranges as inconsistent if the roles are clearly parallel (university + internship, full-time job + volunteer). Never flag "(Expected)" on a graduation date as a formatting error.
7. Never flag a volunteer entry as a duplicate just because it shares an organization name with a work experience entry. Volunteer and paid roles at the same organization are normal.
8. Never suggest removing keyword repetition between the Skills section and experience/certification bullets. In-context repetition is a deliberate ATS strategy.
9. Never suggest adding something that already exists anywhere on the resume. Read every section before writing a suggestion.
10. Never suggest adding a GPA unless one already appears somewhere on the resume.
11. Never suggest reordering sections. Section layout is template-controlled.
12. Never flag missing contact fields (phone, email, location, website) if any contact information is present in the basics section.
13. Never add seniority labels (Junior, Senior, Mid-level) to the headline or summary unless the user already uses one.
14. Never suggest converting bullets to paragraphs or paragraphs to bullets. Formatting style is a user choice.
15. Never suggest soft skills (communication, teamwork, leadership) for the Skills section on a technical resume.
16. Never suggest adding a cover letter, references section, or "references available" line.
17. Never suggest layout or spacing changes. Spacing is template-controlled.
18. Never suggest splitting or merging sections (e.g. separating Projects into Personal and Professional). Section structure is fixed.
19. Never suggest anything about the professional summary section — do not flag it as missing, short, weak, or needing improvement. If the VERIFIED RESUME FACTS header says "summary: PRESENT", treat it as fully adequate no matter how short. If it says "ABSENT", still do not suggest it — summary is optional.
20. Only suggest adding a missing section (e.g. Projects, Certifications) if that section type is entirely absent from the resume AND it is a standard, high-impact section for the target role.
21. Never flag any past year or date as an error, outdated, or something to update. Dates like 2022, 2023, 2024, 2025 on a resume are historical facts — end dates of jobs, graduation years, project dates. They are correct by definition. Only flag a date if it contains an obvious typo (e.g. "20025").
22. Never mention the professional summary in any suggestion. The VERIFIED RESUME FACTS header at the top of the resume tells you whether one exists. Do not override it, question it, or suggest improving it.
23. Never flag missing end dates on projects. Project end dates are always optional — a project without an end date is ongoing or intentionally left blank. This is never a resume error.
24. Never suggest "updating", "refreshing", or "making dates more recent". Date accuracy is the user's responsibility.
25. A suggestion is only valid if it addresses one of these three things:
    - A bullet point that is vague where a specific technical detail would add real clarity
    - A standard section that is completely missing (zero content, not just short)
    - An incomplete required field (e.g. education with no degree name, experience with no company name)
    Anything outside these three categories is not a valid suggestion.
Return ONLY this JSON, no extra text:
{
  "score": <number 0-100>,
  "summary": "<one sentence describing the resume's overall ATS strength>",
  "suggestions": [
    "<0 to 3 high-impact suggestions. If the resume is already excellent and has no major gaps, return an empty list []>"
  ]
}

RESUME:
${resumeText}`

    const object = await generateObjectWithFallback({
      model,
      schema: atsResultSchema,
      schemaPromptName: "ATSResult",
      schemaTemplate: ATS_RESULT_TEMPLATE,
      system: "You are a pragmatic, expert ATS resume reviewer and Senior Technical Recruiter. Follow the user's instructions and prompt constraints strictly. Focus only on high-impact, realistic resume improvements. Never make trivial suggestions or ignore the strict rules.",
      prompt,
      config: resolvedConfig,
    })
    return { success: true, result: object }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error(`[AI] analyzeResumeWithAI failed:`, message)
    return { success: false, error: message }
  }
}

// --- Resume Extraction ---

const resumeDataSchema = z.object({
  basics: z.object({
    name: z.string().optional().default(""),
    label: z.string().optional(),
    headline: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    url: z.string().optional(),
    website: z.string().optional(),
    summary: z.string().optional(),
    location: z.union([
      z.string(),
      z.object({
        city: z.string().optional(),
        region: z.string().optional(),
        countryCode: z.string().optional(),
      })
    ]).optional(),
    profiles: z.array(z.object({
      network: z.string().optional().default(""),
      username: z.string().optional().default(""),
      url: z.string().optional().default(""),
    })).optional(),
  }).optional().default({ name: "" }),
  work: z.array(z.object({
    name: z.string().optional().default(""),
    position: z.string().optional().default(""),
    url: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    summary: z.string().optional(),
    highlights: z.array(z.string()).optional(),
  })).optional(),
  education: z.array(z.object({
    institution: z.string().optional().default(""),
    area: z.string().optional(),
    studyType: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    courses: z.array(z.string()).optional(),
  })).optional(),
  skills: z.array(z.object({
    name: z.string().optional().default(""),
    keywords: z.array(z.string()).optional(),
  })).optional(),
  languages: z.array(z.object({
    language: z.string().optional().default(""),
    fluency: z.string().optional(),
  })).optional(),
  projects: z.array(z.object({
    name: z.string().optional().default(""),
    description: z.string().optional(),
    highlights: z.array(z.string()).optional(),
    url: z.string().optional(),
  })).optional(),
  volunteer: z.array(z.object({
    organization: z.string().optional().default(""),
    position: z.string().optional().default(""),
    url: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    summary: z.string().optional(),
    highlights: z.array(z.string()).optional(),
  })).optional(),
  publications: z.array(z.object({
    name: z.string().optional().default(""),
    publisher: z.string().optional().default(""),
    date: z.string().optional(),
    url: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  awards: z.array(z.object({
    title: z.string().optional().default(""),
    awarder: z.string().optional().default(""),
    date: z.string().optional(),
    url: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string().optional().default(""),
    issuer: z.string().optional().default(""),
    date: z.string().optional(),
    url: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  interests: z.array(z.object({
    name: z.string().optional().default(""),
  })).optional(),
  references: z.array(z.object({
    name: z.string().optional().default(""),
    position: z.string().optional().default(""),
    phone: z.string().optional(),
    email: z.string().optional(),
    url: z.string().optional(),
    description: z.string().optional(),
  })).optional()
})

const SIMPLE_EXTRACTION_PROMPT = `Extract resume to JSON:
{"basics":{"name":"","headline":"","email":"","phone":"","website":"","summary":"","location":"","profiles":[{"network":"","username":"","url":""}]},"work":[{"name":"","position":"","startDate":"","endDate":"","summary":"","highlights":[]}],"education":[{"institution":"","studyType":"","area":"","startDate":"","endDate":"","courses":[]}],"projects":[{"name":"","description":"","highlights":[],"url":""}],"skills":[{"name":"","keywords":[]}],"certifications":[{"name":"","issuer":"","date":"","url":""}],"awards":[{"title":"","awarder":"","date":""}],"languages":[{"language":"","fluency":""}],"volunteer":[{"organization":"","position":"","startDate":"","endDate":"","summary":""}],"publications":[{"name":"","publisher":"","date":""}],"interests":[{"name":""}],"references":[{"name":"","position":"","email":"","phone":""}]}
Rules: Use "" for missing text, [] for missing arrays. Keep dates exactly as written. Group skills by category.
Resume:
`

/** Strips markdown fences and extracts the first complete JSON object. */
function extractJSON(raw: string): unknown {
  // Remove markdown code fences
  let stripped = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim()

  // Find the outermost { } block
  const start = stripped.indexOf("{")
  const end = stripped.lastIndexOf("}")

  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in model response")
  }

  const jsonStr = stripped.slice(start, end + 1)

  // jsonrepair handles truncated JSON, trailing commas, unquoted keys, etc.
  const repaired = jsonrepair(jsonStr)
  return JSON.parse(repaired)
}

export async function extractResumeDataWithAI(
  rawText: string,
  clientConfig: ClientConfig
): Promise<ExtractionResult> {
  try {
    const resolvedConfig = getAIConfig(clientConfig)

    // ── OCR fixes for spaced headings (e.g. S K I L L S → SKILLS) ──
    // Use [ \t]* (not \s*) so newlines between spaced letters are NOT consumed.
    const sectionFixes: [RegExp, string][] = [
      [/E[ \t]*D[ \t]*U[ \t]*C[ \t]*A[ \t]*T[ \t]*I[ \t]*O[ \t]*N/gi, "EDUCATION"],
      [/E[ \t]*X[ \t]*P[ \t]*E[ \t]*R[ \t]*I[ \t]*E[ \t]*N[ \t]*C[ \t]*E/gi, "EXPERIENCE"],
      [/P[ \t]*R[ \t]*O[ \t]*J[ \t]*E[ \t]*C[ \t]*T[ \t]*S/gi, "PROJECTS"],
      [/S[ \t]*K[ \t]*I[ \t]*L[ \t]*L[ \t]*S/gi, "SKILLS"],
      [/L[ \t]*A[ \t]*N[ \t]*G[ \t]*U[ \t]*A[ \t]*G[ \t]*E[ \t]*S/gi, "LANGUAGES"],
      [/C[ \t]*E[ \t]*R[ \t]*T[ \t]*I[ \t]*F[ \t]*I[ \t]*C[ \t]*A[ \t]*T[ \t]*I[ \t]*O[ \t]*N[ \t]*S/gi, "CERTIFICATIONS"],
      [/R[ \t]*E[ \t]*F[ \t]*E[ \t]*R[ \t]*E[ \t]*N[ \t]*C[ \t]*E[ \t]*S/gi, "REFERENCES"],
      [/A[ \t]*W[ \t]*A[ \t]*R[ \t]*D[ \t]*S/gi, "AWARDS"],
      [/P[ \t]*U[ \t]*B[ \t]*L[ \t]*I[ \t]*C[ \t]*A[ \t]*T[ \t]*I[ \t]*O[ \t]*N[ \t]*S/gi, "PUBLICATIONS"],
      [/V[ \t]*O[ \t]*L[ \t]*U[ \t]*N[ \t]*T[ \t]*E[ \t]*E[ \t]*R/gi, "VOLUNTEER"],
      [/I[ \t]*N[ \t]*T[ \t]*E[ \t]*R[ \t]*E[ \t]*S[ \t]*T[ \t]*S/gi, "INTERESTS"],
    ]

    let normalizedText = rawText
    for (const [pattern, replacement] of sectionFixes) {
      normalizedText = normalizedText.replace(pattern, replacement)
    }

    normalizedText = normalizedText
      .replace(/\s*@\s*/g, "@")
      .replace(/[📞✉🔗]/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()

    // ── Phase 1: flat fetch with simple JSON prompt (temperature=0) ──
    const endpoint = resolvedConfig.baseUrl.replace(/\/$/, "") + "/chat/completions"

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resolvedConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: resolvedConfig.model,
        temperature: 0,
        max_tokens: 4000,

        messages: [
          {
            role: "system",
            content: "You are a resume data extraction engine. Output only valid JSON.",
          },
          {
            role: "user",
            content: SIMPLE_EXTRACTION_PROMPT + normalizedText,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText)
      throw new Error(`Model request failed: ${response.status} — ${errText}`)
    }

    const completion = await response.json()


    // OpenRouter/free models sometimes return HTTP 200 with an error body
    if (completion.error) {
      const errMsg: string = completion.error?.message ?? JSON.stringify(completion.error)
      if (
        errMsg.includes("model output must contain") ||
        errMsg.includes("cannot both be empty") ||
        errMsg.includes("rate limit") ||
        errMsg.includes("overloaded")
      ) {
        throw new Error(
          "The AI model returned an empty response — it may be rate-limited or overloaded. " +
          "Please try again in a moment, or switch to a different model in Settings."
        )
      }
      throw new Error(`Model error: ${errMsg}`)
    }

    const raw: string = completion.choices?.[0]?.message?.content ?? ""

    if (!raw.trim()) {
      throw new Error(
        "The AI model returned an empty response — it may be rate-limited or overloaded. " +
        "Please try again in a moment, or switch to a different model in Settings."
      )
    }


    // ── Phase 2: extract and repair JSON ──
    let json: unknown
    try {
      json = JSON.parse(raw.trim())
    } catch {
      json = extractJSON(raw)
    }

    // ── Phase 3: normalize type mismatches, then safeParse ──
    const normalized = preprocessExtraction(json as Record<string, unknown>)
    const parsed = resumeDataSchema.safeParse(normalized)

    if (!parsed.success) {
      // safeParse failure means the data is structurally unusable
      throw new Error("Extracted data failed schema validation: " + parsed.error.issues[0]?.message)
    }

    const object = parsed.data

    // Sanitize work URLs — strip non-URL values like "Remote" or location strings
    if (Array.isArray(object.work)) {
      for (const entry of object.work) {
        if (entry.url && !entry.url.match(/^https?:\/\//i) && !entry.url.match(/^[a-z0-9-]+\.[a-z]{2,}/i)) {
          delete entry.url
        }
      }
    }

    // Reject completely empty extractions
    if (
      !object.basics?.name &&
      !object.basics?.email &&
      !object.work?.length &&
      !object.education?.length &&
      !object.skills?.length
    ) {
      throw new Error("AI extraction returned no usable data")
    }

    return { success: true, json: object }

  } catch (error) {
    const raw = getErrorMessage(error)

    let message = raw
    if (
      raw.includes("model output must contain") ||
      raw.includes("cannot both be empty") ||
      raw.includes("All fallbacks exhausted")
    ) {
      message =
        "The AI model returned an empty response — it may be rate-limited or overloaded. " +
        "Please try again in a moment, or switch to a different model in Settings."
    } else if (raw.includes("insufficient_quota") || raw.includes("credit")) {
      message = "Your AI provider is out of credits. Please check your API key balance or switch providers in Settings."
    }

    console.error(`[AI] extractResumeDataWithAI failed:`, raw)
    return { success: false, error: message }
  }
}



// --- AI Rewrite ---

interface RewriteSource {
  section?: string
  fieldName?: string
  context?: string
}

export async function rewriteTextWithAI(
  text: string,
  tone: string,
  clientConfig: ClientConfig,
  source?: RewriteSource,
  customPrompt?: string
): Promise<RewriteResult> {
  try {
    const resolvedConfig = getAIConfig(clientConfig)
    const model = getAIModel(resolvedConfig)

    // Extract plain text from potential HTML content (TipTap format)
    const plainText = text
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\s+/g, " ")
      .trim()

    if (!plainText) {
      return { success: false, error: "No text content to rewrite" }
    }

    const sourceContext = source
      ? `SOURCE: ${source.section?.toUpperCase() || "CONTENT"} - ${source.fieldName || "text"}${source.context ? ` (${source.context})` : ""}`
      : "SOURCE: Resume content from TipTap editor"

    const isHeadline = source?.section === "basics" && source?.fieldName === "headline"

    const contextInstruction = isHeadline
      ? "- This is a professional headline. Keep it concise (5-10 words). Make it impactful and keyword-rich. Return as a single plain-text line — NO HTML tags."
      : source?.section === "basics" && source?.fieldName === "summary"
        ? "- This is a professional summary. Keep it 2-3 sentences. Highlight unique value proposition and top skills."
        : source?.section === "experience"
          ? "- This is a job experience description. Use strong action verbs. Include metrics and impact where possible. Format as an HTML unordered list <ul><li>…</li></ul> with one bullet per achievement."
          : source?.section === "education"
            ? "- This is an education description. Highlight relevant coursework, honors, or achievements. Format as an HTML unordered list <ul><li>…</li></ul>."
            : source?.section === "projects"
              ? "- This is a project description. Explain what you built, why it matters, and what technologies you used. Format as an HTML unordered list <ul><li>…</li></ul>."
              : source?.section === "skills"
                ? "- This is a skill entry. Make it clear, concise, and ATS-friendly. Return as a plain sentence — NO bullet list."
                : "- Improve the content for resume impact and ATS compatibility. Use an HTML unordered list <ul><li>…</li></ul> when the content has multiple points."

    const customInstruction = customPrompt?.trim()
      ? `\nUSER INSTRUCTION — apply this change specifically:\n${customPrompt.trim()}\n`
      : ""

    const htmlRules = isHeadline
      ? "Return only plain text — no HTML tags whatsoever."
      : `Return ONLY valid HTML using these tags: <p>, <ul>, <li>, <strong>, <em>.
Do NOT include <html>, <head>, <body>, <div>, or any other tags.
Do NOT include markdown syntax (no ** or * or -).
Do NOT wrap in a code block.
Do NOT add any explanation — output raw HTML only.`

    const { text: resultText } = await generateText({
      model,
      system: `You are a professional resume editor and TipTap HTML content specialist.
Your role is to rewrite resume text to be high-impact, professional, and optimized for ATS systems.
You produce TipTap-compatible HTML output that renders correctly in a rich-text editor.

${htmlRules}`,
      prompt: `Rewrite the following resume content.

${sourceContext}
${customInstruction}
ORIGINAL TEXT:
${plainText}

TONE/STYLE: ${tone}

CONTEXT-SPECIFIC INSTRUCTIONS:
${contextInstruction}
- Maintain the original intent and factual information
- Improve clarity, professionalism, and ATS compatibility
- Use strong action verbs and quantifiable results where appropriate

REWRITTEN CONTENT:`,
    })

    // Sanitize: strip any accidental markdown or code-block wrappers
    let cleaned = resultText.trim()
    if (cleaned.startsWith("```")) {
      const match = cleaned.match(/```(?:html)?\s*([\s\S]*?)\s*```/)
      if (match) cleaned = match[1].trim()
    }

    return { success: true, text: cleaned }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error(`[AI] rewriteTextWithAI failed:`, message)
    return { success: false, error: message }
  }
}

// --- AI Content Suggestions ---

const suggestResultSchema = z.object({
  suggestions: z.array(z.string()).length(4),
  keywords: z.array(z.string()).length(6),
})

export async function suggestContentWithAI(
  section: string,
  jobTitle: string,
  clientConfig: ClientConfig
): Promise<SuggestResult> {
  try {
    const resolvedConfig = getAIConfig(clientConfig)
    const model = getAIModel(resolvedConfig)
    const object = await generateObjectWithFallback({
      model,
      schema: suggestResultSchema,
      schemaPromptName: "SuggestResult",
      schemaTemplate: SUGGEST_RESULT_TEMPLATE,
      system: "You are an expert resume consultant. Generate resume recommendations.",
      prompt: `Generate 4 specific, high-impact bullet points/descriptions and 6 key skills/keywords for a resume's "${section}" section, optimized for the job title: "${jobTitle}".`,
      config: resolvedConfig,
    })
    return { success: true, result: object }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error(`[AI] suggestContentWithAI failed:`, message)
    return { success: false, error: message }
  }
}

// --- Cover Letter Generation ---

interface CoverLetterResult {
  success: boolean
  text?: string
  error?: string
}

export async function generateCoverLetterWithAI(
  resumeText: string,
  jobDescription: string,
  clientConfig: ClientConfig
): Promise<CoverLetterResult> {
  try {
    const resolvedConfig = getAIConfig(clientConfig)
    const model = getAIModel(resolvedConfig)

    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

    const { text } = await generateText({
      model,
      system: `You are an expert career coach and professional cover letter writer.
Write concise, compelling cover letters that are personalized to the job and resume.
Output plain text only — no markdown, no HTML, no headers like "Cover Letter:". Just the letter body.
Today's date: ${today}`,
      prompt: `Write a professional cover letter for this candidate applying to the job below.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Guidelines:
- 3 paragraphs: hook + why you're a fit + call to action
- Weave in 2-3 specific achievements from the resume
- Mirror 3-4 keywords from the job description naturally
- Warm but professional tone
- No generic filler phrases like "I am writing to express my interest"
- Do NOT include address headers, date, or signature block — just the letter body paragraphs`,
    })

    return { success: true, text: text.trim() }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error(`[AI] generateCoverLetterWithAI failed:`, message)
    return { success: false, error: message }
  }
}

// --- 6-Second Recruiter Scan ---

interface ScanResult {
  success: boolean
  result?: {
    firstSeen: string
    strengths: string[]
    concerns: string[]
    verdict: string
  }
  error?: string
}

const scanResultSchema = z.object({
  firstSeen: z.string().describe("What catches the recruiter's eye in the first 2 seconds"),
  strengths: z.array(z.string()).min(1).max(4).describe("2-4 things that immediately stand out positively"),
  concerns: z.array(z.string()).min(0).max(4).describe("0-4 things that are confusing, missing, or weak at first glance"),
  verdict: z.string().describe("The recruiter's gut-check verdict in one sentence: does this resume make the shortlist cut?"),
})

const SCAN_RESULT_TEMPLATE = `{
  "firstSeen": "What the recruiter notices first",
  "strengths": ["Strength 1", "Strength 2"],
  "concerns": ["Concern 1"],
  "verdict": "One-sentence recruiter gut-check verdict"
}`

export async function sixSecondScanWithAI(
  resumeText: string,
  clientConfig: ClientConfig
): Promise<ScanResult> {
  try {
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    const resolvedConfig = getAIConfig(clientConfig)
    const model = getAIModel(resolvedConfig)

    const object = await generateObjectWithFallback({
      model,
      schema: scanResultSchema,
      schemaPromptName: "ScanResult",
      schemaTemplate: SCAN_RESULT_TEMPLATE,
      system: `You are a senior technical recruiter at a top tech company. You review hundreds of resumes a day.
You are brutally honest. You speak like a recruiter thinking out loud, not a career coach giving generic advice.
Be specific — name actual sections, words, or gaps you see.
Today's date: ${today}

HARD RULES — violating these makes your scan invalid:
1. Never list a past date (2022, 2023, 2024, 2025) as a concern. A job that ended in 2025 is recent — the candidate started looking in 2026. Dates on a resume are historical facts, not errors.
2. If VERIFIED RESUME FACTS says "summary: PRESENT", never list "no summary" or "missing summary" as a concern.
3. Never flag missing end dates on projects as a red flag. Ongoing or intentionally blank project dates are normal.
4. Never suggest that the candidate needs to update their dates or refresh their timeline.
5. The VERIFIED RESUME FACTS block at the top of the resume is ground truth. Do not contradict it.`,
      prompt: `You have 6 seconds to scan this resume. Respond as if you are thinking out loud during that scan.

What do you notice first? What stands out? What immediately raises a red flag or is missing?
Be specific. Name actual content you see or don't see. Think fast.

RESUME:
${resumeText}`,
      config: resolvedConfig,
    })

    return { success: true, result: object }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error(`[AI] sixSecondScanWithAI failed:`, message)
    return { success: false, error: message }
  }
}

// --- AI Resume Tailoring ---

const tailorResultSchema = z.object({
  tailoredSummary: z.string().describe("A professional summary tailored for the job description. Do NOT use markdown formatting like **bold** or *italic*; instead, use HTML tags like <strong> for bolding, <em> for italics, and wrap paragraphs in <p>...</p> tags."),
  recommendedSkills: z.array(z.string()).describe("A list of 6-8 skills from the job description that should be added or highlighted"),
  experienceSuggestions: z.array(z.object({
    id: z.string().describe("The ID of the experience item"),
    company: z.string(),
    position: z.string(),
    bulletSuggestions: z.array(z.string()).describe("Adapted description bullets matching the job description. Do NOT use markdown formatting.")
  })).describe("Tailoring recommendations for experience entries")
})

export async function tailorResumeWithAI(
  resumeText: string,
  resumeData: ResumeData,
  jobDescription: string,
  clientConfig: ClientConfig
): Promise<TailorResult> {
  try {
    const resolvedConfig = getAIConfig(clientConfig)
    const model = getAIModel(resolvedConfig)

    // Format experience list with IDs for matching
    const experience = resumeData.sections.experience || []

    const experienceList = experience.map((exp) => ({
      id: exp.id,
      company: exp.company || "",
      position: exp.position || "",
      description: (exp.description || "").replace(/<[^>]*>?/gm, '')
    }))

    const prompt = `You are a professional resume writer. Tailor this resume to perfectly match the target Job Description.
    Focus on incorporating keywords, matching skill requirements, and framing experience to align with the job description.

    JOB DESCRIPTION:
    ${jobDescription}

    CURRENT RESUME:
    ${resumeText}

    EXPERIENCE ENTRIES FOR REWRITING:
    ${JSON.stringify(experienceList, null, 2)}

    Return:
    1. A tailored professional summary. Use HTML formatting: wrap the summary in <p>...</p> tags and use <strong>...</strong> for bolding key terms. Do NOT use markdown syntax (such as **bold** or *italic*).
    2. A list of 6-8 keywords/skills from the Job Description to highlight that are NOT already listed in the Skills section of the resume. Check the resume's skills list carefully and do not recommend skills that are already present.
    3. Tailored description bullets for each experience entry (return complete descriptions or bullets matching the entry ID). Do NOT use markdown syntax (such as **bold** or *italic*); keep them as plain strings without markdown markers.`

    const object = await generateObjectWithFallback({
      model,
      schema: tailorResultSchema,
      schemaPromptName: "TailorResult",
      schemaTemplate: TAILOR_RESULT_TEMPLATE,
      system: "You are a master career coach and resume editor. Tailor the content precisely.",
      prompt,
      config: resolvedConfig,
    })

    return { success: true, result: object }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error(`[AI] tailorResumeWithAI failed:`, message)
    return { success: false, error: message }
  }
}
