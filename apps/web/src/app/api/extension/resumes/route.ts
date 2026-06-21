import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function setCorsHeaders(response: NextResponse, origin: string | null) {
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
  } else {
    response.headers.set("Access-Control-Allow-Origin", "*")
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return response
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin")
  return setCorsHeaders(new NextResponse(null, { status: 204 }), origin)
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin")

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return setCorsHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), origin)
    }

    const { data, error } = await supabase
      .from("resumes")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      return setCorsHeaders(NextResponse.json({ error: "database_error", message: error.message }, { status: 500 }), origin)
    }

    return setCorsHeaders(NextResponse.json({ success: true, resumes: data }), origin)
  } catch (err: any) {
    return setCorsHeaders(NextResponse.json({ error: "server_error", message: err.message }, { status: 500 }), origin)
  }
}
