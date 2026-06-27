import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { resumes } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { setCorsHeaders, corsOptions } from "@/lib/cors"

export async function OPTIONS(request: Request) {
  return corsOptions(request, "GET, OPTIONS")
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin")

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return setCorsHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), origin)
    }

    const data = await db
      .select({ id: resumes.id, title: resumes.title, updatedAt: resumes.updatedAt })
      .from(resumes)
      .where(eq(resumes.userId, session.user.id))
      .orderBy(desc(resumes.updatedAt))

    return setCorsHeaders(NextResponse.json({ success: true, resumes: data }), origin)
  } catch (err: any) {
    return setCorsHeaders(NextResponse.json({ error: "server_error", message: err.message }, { status: 500 }), origin)
  }
}
