import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const start = Date.now()
  let databaseStatus = "unknown"
  
  try {
    const supabase = await createClient()
    // Simple query to check connectivity
    const { error } = await supabase.from("resumes").select("id").limit(1)
    
    if (error) {
      console.error("Health check database query error:", error)
      databaseStatus = "unhealthy"
    } else {
      databaseStatus = "healthy"
    }
  } catch (error) {
    console.error("Health check connection error:", error)
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
      database: {
        status: databaseStatus,
        latency: `${duration}ms`
      },
      api: {
        status: "healthy"
      }
    }
  }, {
    status: databaseStatus === "healthy" ? 200 : 503
  })
}
