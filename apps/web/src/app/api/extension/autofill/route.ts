import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { resumes } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { generateObject } from "ai"
import { z } from "zod"
import { getAIConfig } from "@/lib/ai-helper"
import { getAIModel } from "@/lib/ai-provider"
import { setCorsHeaders, corsOptions } from "@/lib/cors"

export async function OPTIONS(request: Request) {
  return corsOptions(request, "POST, OPTIONS")
}

const autofillSchema = z.object({
  mappings: z.array(z.object({
    fieldId: z.string(),
    value: z.union([z.string(), z.boolean()]),
  })),
})

export async function POST(request: Request) {
  const origin = request.headers.get("origin")

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return setCorsHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), origin)
    }

    const { resumeId, fields } = await request.json()

    if (!resumeId || !fields || !Array.isArray(fields)) {
      return setCorsHeaders(NextResponse.json({ error: "resumeId and fields array are required" }, { status: 400 }), origin)
    }

    const config = getAIConfig({ provider: "openai", model: "", apiKey: "", baseUrl: "" })
    const model = getAIModel(config)

    const [resume] = await db
      .select({ data: resumes.data })
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, session.user.id)))
      .limit(1)

    if (!resume) {
      return setCorsHeaders(NextResponse.json({ error: "Resume not found" }, { status: 404 }), origin)
    }

    const resumeContent = JSON.stringify(resume.data)

    const prompt = `You are an intelligent auto-fill assistant for job applications.
Given the candidate's resume data in JSON format, and a list of form fields extracted from a job application page, map the correct values from the resume to the corresponding form fields.

Resume Data:
${resumeContent}

Form Fields:
${JSON.stringify(fields, null, 2)}

Return a JSON object with a "mappings" array. Each object in the array should have:
- fieldId: the exact string ID of the field from the Form Fields array.
- value: the value extracted from the resume that best fits this field. For checkboxes/radio buttons asking for Yes/No, use boolean true/false.

If you cannot find a suitable value for a field, omit it from the mappings array.`

    const { object } = await generateObject({
      model,
      schema: autofillSchema,
      prompt,
      system: "You are a helpful assistant that accurately extracts resume data to fill out job application forms.",
    })

    return setCorsHeaders(NextResponse.json({ success: true, mappings: object.mappings }), origin)
  } catch (err: any) {
    console.warn("Autofill error:", err)
    return setCorsHeaders(NextResponse.json({ error: "server_error", message: err.message }, { status: 500 }), origin)
  }
}
