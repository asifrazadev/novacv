import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getErrorMessage } from "@/lib/error-handler"
import { generatePdf } from "@/lib/pdf/generatePdf"
import { cachePrintData } from "@/lib/pdf/printCache"

// Increase timeout for serverless environments
export const maxDuration = 60

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const { id } = params

  // 1. Verify Authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // 2. Setup Host URL
  let host = request.nextUrl.origin

  // Force http for localhost if we detect https being incorrectly reported
  // or if we want to avoid SSL issues in dev
  if (host.startsWith("https://localhost") || host.startsWith("https://127.0.0.1")) {
    host = host.replace("https://", "http://")
  }

  // 3. Get Resume Metadata for Format
  const { data: resume } = await supabase
    .from("resumes")
    .select("data")
    .eq("id", id)
    .single()

  if (!resume) {
    return new NextResponse("Resume not found", { status: 404 })
  }

  const { format, width, height } = resume.data.metadata.page || { format: "a4" }

  // Cache the resume data to bypass database queries on the print route
  const token = cachePrintData(resume.data)
  const exportUrl = `${host}/resumes/${id}/export?token=${token}`

  try {
    // 4. Set Authentication Cookie for the headless browser
    const rawCookies = request.cookies.getAll()
    const cookies = rawCookies.map(c => ({
      name: c.name,
      value: c.value,
      domain: request.nextUrl.hostname || "",
      path: "/",
      secure: request.nextUrl.protocol === "https:",
      sameSite: "Lax" as const
    }))

    // 5. Generate PDF with dynamic format
    const pdfOptions: Record<string, unknown> = {
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      waitForFonts: true,
      tagged: false,
    }

    if (format === "custom" && width && height) {
      pdfOptions.width = `${width}mm`
      pdfOptions.height = `${height}mm`
    } else {
      pdfOptions.format = String(format).charAt(0).toUpperCase() + String(format).slice(1)
    }

    // 6. Use the global browser cache to generate the PDF
    const pdfBuffer = await generatePdf({
      url: exportUrl,
      cookies,
      pdfOptions,
    })

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return new NextResponse(JSON.stringify({ error: "Failed to generate PDF" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    }

    // 7. Return the PDF blob
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
      headers: { "Content-Type": "application/json" }
    })
  }
}

