import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

export async function POST(request: Request) {
  const origin = request.headers.get("origin")

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return setCorsHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), origin)
    }

    const payload = await request.json()

    if (!payload.company || !payload.position) {
      return setCorsHeaders(NextResponse.json({ error: "Company and position are required" }, { status: 400 }), origin)
    }

    const { data, error } = await supabase
      .from("job_applications")
      .insert({
        user_id: user.id,
        company: payload.company,
        position: payload.position,
        status: payload.status || "wishlist",
        url: payload.url || "",
        salary: payload.salary || "",
        location: payload.location || "",
        notes: payload.notes || "",
        applied_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.warn("Supabase insert error from extension:", error)
      return setCorsHeaders(NextResponse.json({ error: "database_error", message: error.message }, { status: 500 }), origin)
    }

    return setCorsHeaders(NextResponse.json({ success: true, data }), origin)
  } catch (err: any) {
    console.warn("API route error:", err)
    return setCorsHeaders(NextResponse.json({ error: "server_error", message: err.message }, { status: 500 }), origin)
  }
}
