"use server"

import { db } from "@/lib/db"
import { resumes } from "@/lib/db/schema"
import { eq, and, desc, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { ResumeData } from "@/types/resume"
import { getEffectiveUserId } from "@/lib/get-user-id"

export async function createResume(formData: FormData) {
  const userId = await getEffectiveUserId()
  if (!userId) throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const tagsStr = formData.get("tags") as string
  let tags: string[] = []
  if (tagsStr) {
    try {
      const parsed = JSON.parse(tagsStr)
      tags = Array.isArray(parsed) ? parsed : []
    } catch {
      tags = []
    }
  }

  const [resume] = await db.insert(resumes).values({
    userId,
    title: title || "Untitled Resume",
    data: {
      basics: {
        name: "",
        email: "",
        phone: "",
        location: "",
        label: "",
        website: "",
      },
      sections: {
        summary: { content: "" },
        experience: [],
        education: [],
        skills: [],
        languages: [],
        awards: [],
      },
      metadata: { tags },
    },
  }).returning()

  revalidatePath("/dashboard")
  redirect(`/dashboard/resumes/${resume.id}`)
}

export async function duplicateResume(id: string) {
  const userId = await getEffectiveUserId()
  if (!userId) throw new Error("Unauthorized")

  const [original] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
    .limit(1)

  if (!original) return { error: "Resume not found" }

  const [copy] = await db.insert(resumes).values({
    userId,
    title: `${original.title} (Copy)`,
    data: original.data as ResumeData,
    isPublic: false,
  }).returning()

  revalidatePath("/dashboard")
  return { success: true, id: copy.id }
}

export async function updateResume(id: string, resumeData: ResumeData, title?: string) {
  const userId = await getEffectiveUserId()
  if (!userId) return { error: "Unauthorized" }

  await db
    .update(resumes)
    .set({
      data: resumeData,
      ...(title && { title }),
      updatedAt: new Date(),
    })
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))

  return { success: true }
}

export async function deleteResume(id: string) {
  try {
    const userId = await getEffectiveUserId()
    if (!userId) return { error: "Unauthorized" }
    await db.delete(resumes).where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
    revalidatePath("/dashboard")
    return { success: true as const }
  } catch (err: any) {
    return { error: err.message || "Failed to delete resume" }
  }
}

export async function getResumes() {
  const userId = await getEffectiveUserId()
  if (!userId) return []

  return db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.updatedAt))
}

export async function getResumeById(id: string) {
  const userId = await getEffectiveUserId()
  if (!userId) throw new Error("Unauthorized")

  const [resume] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
    .limit(1)

  return resume ?? null
}

export async function toggleResumePublicStatus(id: string, isPublic: boolean) {
  try {
    const userId = await getEffectiveUserId()
    if (!userId) return { error: "Unauthorized" }
    await db.update(resumes).set({ isPublic, updatedAt: new Date() })
      .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
    revalidatePath(`/dashboard/resumes/${id}`)
    revalidatePath(`/p/${id}`)
    return { success: true as const }
  } catch (err: any) {
    return { error: err.message || "Failed to update resume" }
  }
}

export async function getPublicResumeById(id: string) {
  const [resume] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.isPublic, true)))
    .limit(1)

  if (resume) {
    db.update(resumes)
      .set({ viewCount: sql`${resumes.viewCount} + 1`, lastViewedAt: new Date() })
      .where(eq(resumes.id, id))
      .catch(() => {})
  }

  return resume ?? null
}

export async function getResumePublicStats(id: string) {
  const userId = await getEffectiveUserId()
  if (!userId) return null

  const [row] = await db
    .select({ viewCount: resumes.viewCount, lastViewedAt: resumes.lastViewedAt, isPublic: resumes.isPublic })
    .from(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
    .limit(1)

  return row ?? null
}

export async function incrementDownloadCount(id: string) {
  const userId = await getEffectiveUserId()
  if (!userId) return
  db.update(resumes)
    .set({ downloadCount: sql`${resumes.downloadCount} + 1` })
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
    .catch(() => {})
}

export async function getDashboardStats() {
  const userId = await getEffectiveUserId()
  if (!userId) return { resumeCount: 0, totalDownloads: 0, totalViews: 0 }

  const rows = await db
    .select({ viewCount: resumes.viewCount, downloadCount: resumes.downloadCount })
    .from(resumes)
    .where(eq(resumes.userId, userId))

  return {
    resumeCount: rows.length,
    totalDownloads: rows.reduce((s, r) => s + (r.downloadCount ?? 0), 0),
    totalViews: rows.reduce((s, r) => s + (r.viewCount ?? 0), 0),
  }
}

export async function importResumeAndCreate(title: string, resumeData: ResumeData) {
  try {
    const userId = await getEffectiveUserId()
    if (!userId) return { error: "Unauthorized" }

    const [resume] = await db.insert(resumes).values({
      userId,
      title: title || "Imported Resume",
      data: resumeData,
    }).returning()

    revalidatePath("/dashboard")
    return { success: true as const, id: resume.id }
  } catch (err: any) {
    return { error: err.message || "Failed to import resume" }
  }
}
