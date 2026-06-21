import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateObject } from "ai"
import { z } from "zod"
import { getAIConfig } from "@/lib/ai-helper"
import { getAIModel } from "@/lib/ai-provider"

function setCorsHeaders(response: NextResponse, origin: string | null) {
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
  } else {
    response.headers.set("Access-Control-Allow-Origin", "*")
  }
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return response
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin")
  return setCorsHeaders(new NextResponse(null, { status: 204 }), origin)
}

const autofillSchema = z.object({
  mappings: z.array(z.object({
    fieldId: z.string(),
    value: z.union([z.string(), z.boolean()])
  }))
})

export async function POST(request: Request) {
  const origin = request.headers.get("origin")

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return setCorsHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), origin)
    }

    const { resumeId, fields } = await request.json()

    if (!resumeId || !fields || !Array.isArray(fields)) {
      return setCorsHeaders(NextResponse.json({ error: "resumeId and fields array are required" }, { status: 400 }), origin)
    }

    // Get user preferences to determine the AI provider and model
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single()

    const aiProvider = prefs?.ai_provider || "openai"
    const apiKeyColumn = `${aiProvider}_api_key`
    const apiKey = prefs ? prefs[apiKeyColumn] : process.env.OPENAI_API_KEY

    const config = getAIConfig({
      provider: aiProvider,
      model: prefs?.ai_model || "gpt-4o-mini",
      apiKey: apiKey,
      baseUrl: prefs?.ai_base_url || "",
    })
    
    const model = getAIModel(config)

    // Fetch the resume
    const { data: resume, error } = await supabase
      .from("resumes")
      .select("content")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single()

    if (error || !resume) {
      return setCorsHeaders(NextResponse.json({ error: "Resume not found" }, { status: 404 }), origin)
    }

    const resumeContent = JSON.stringify(resume.content)

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
