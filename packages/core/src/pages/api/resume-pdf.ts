import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { resumes } from "@/lib/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { getErrorMessage } from "@/lib/error-handler"
import { generatePdf } from "@/lib/pdf/generatePdf"
import { cachePrintData } from "@/lib/pdf/printCache"
import { getEffectiveUserId } from "@/lib/get-user-id"

export const maxDuration = 60

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const { id } = params

  const userId = await getEffectiveUserId()
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  let host = request.nextUrl.origin
  if (host.startsWith("https://localhost") || host.startsWith("https://127.0.0.1")) {
    host = host.replace("https://", "http://")
  }

  const [resume] = await db
    .select({ data: resumes.data })
    .from(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
    .limit(1)

  if (!resume) {
    return new NextResponse("Resume not found", { status: 404 })
  }

  const resumeData = resume.data as any
  const { format, width, height } = resumeData?.metadata?.page || { format: "a4" }

  const crypto = require("crypto")
  const secret = process.env.NEXTAUTH_SECRET || "fallback_secret"
  const token = crypto.createHmac("sha256", secret).update(id).digest("hex")
  const exportUrl = `${host}/resumes/${id}/export?token=${token}`

  try {
    const pdfOptions: Record<string, unknown> = {
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      tagged: false,
    }

    if (format === "custom" && width && height) {
      pdfOptions.width = `${width}mm`
      pdfOptions.height = `${height}mm`
    } else {
      pdfOptions.format = String(format).charAt(0).toUpperCase() + String(format).slice(1)
    }

    const pdfBuffer = await generatePdf({ url: exportUrl, pdfOptions })

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return new NextResponse(JSON.stringify({ error: "Failed to generate PDF" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    db.update(resumes)
      .set({ downloadCount: sql`${resumes.downloadCount} + 1` })
      .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
      .catch(() => {})

    return new Response(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume-${id}.pdf"`,
      },
    })
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("[api/pdf] Error:", message)
    return new NextResponse(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
