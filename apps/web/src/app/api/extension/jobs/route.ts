import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { jobApplications } from "@/lib/db/schema"
import { setCorsHeaders, corsOptions } from "@/lib/cors"

export async function OPTIONS(request: Request) {
  return corsOptions(request, "POST, OPTIONS")
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin")

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return setCorsHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), origin)
    }

    const payload = await request.json()

    if (!payload.company || !payload.position) {
      return setCorsHeaders(NextResponse.json({ error: "Company and position are required" }, { status: 400 }), origin)
    }

    const [data] = await db.insert(jobApplications).values({
      userId: session.user.id,
      company: String(payload.company).slice(0, 200),
      position: String(payload.position).slice(0, 200),
      status: ["wishlist", "applied", "oa", "interview", "offer", "rejected"].includes(payload.status)
        ? payload.status
        : "wishlist",
      url: String(payload.url || "").slice(0, 2000),
      salary: String(payload.salary || "").slice(0, 100),
      location: String(payload.location || "").slice(0, 200),
      notes: String(payload.notes || "").slice(0, 5000),
      appliedAt: new Date(),
    }).returning()

    return setCorsHeaders(NextResponse.json({ success: true, data }), origin)
  } catch (err: any) {
    console.warn("API route error:", err)
    return setCorsHeaders(NextResponse.json({ error: "server_error", message: err.message }, { status: 500 }), origin)
  }
}
