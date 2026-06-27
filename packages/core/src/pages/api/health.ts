import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { resumes } from "@/lib/db/schema"

export async function GET() {
  const start = Date.now()
  let databaseStatus = "unknown"

  try {
    await db.select({ id: resumes.id }).from(resumes).limit(1)
    databaseStatus = "healthy"
  } catch (error) {
    console.error("Health check database error:", error)
    databaseStatus = "unhealthy"
  }

  const duration = Date.now() - start

  return NextResponse.json({
    status: databaseStatus === "healthy" ? "UP" : "DEGRADED",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: Math.floor(process.uptime()),
    latency: `${duration}ms`,
    services: {
      database: { status: databaseStatus, latency: `${duration}ms` },
      api: { status: "healthy" },
    },
  }, {
    status: databaseStatus === "healthy" ? 200 : 503,
  })
}
