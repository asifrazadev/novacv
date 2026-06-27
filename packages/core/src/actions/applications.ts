"use server"

import { db } from "@/lib/db"
import { jobApplications } from "@/lib/db/schema"
import { eq, and, lt, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getEffectiveUserId } from "@/lib/get-user-id"

const applicationWriteSchema = z.object({
  company: z.string().min(1).max(200),
  position: z.string().min(1).max(200),
  status: z.enum(["wishlist", "applied", "oa", "interview", "offer", "rejected"]).default("wishlist"),
  url: z.string().max(2000).optional().default(""),
  salary: z.string().max(100).optional().default(""),
  location: z.string().max(200).optional().default(""),
  notes: z.string().max(5000).optional().default(""),
  applied_at: z.string().datetime().optional(),
})

export async function getApplications() {
  try {
    const userId = await getEffectiveUserId()
    if (!userId) return { error: "Unauthorized" }

    const data = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId))
      .orderBy(desc(jobApplications.updatedAt))

    return { data }
  } catch (err: any) {
    return { error: "server_error", message: err.message }
  }
}

export async function cleanupOldApplications() {
  try {
    const userId = await getEffectiveUserId()
    if (!userId) return { error: "Unauthorized" }

    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    await db
      .delete(jobApplications)
      .where(and(
        eq(jobApplications.userId, userId),
        lt(jobApplications.updatedAt, oneMonthAgo),
      ))

    return { success: true }
  } catch (err: any) {
    return { error: "server_error", message: err.message }
  }
}

export async function createApplication(payload: unknown) {
  try {
    const userId = await getEffectiveUserId()
    if (!userId) return { error: "Unauthorized" }

    const parsed = applicationWriteSchema.safeParse(payload)
    if (!parsed.success) {
      return { error: "validation_error", message: parsed.error.issues[0]?.message }
    }
    const v = parsed.data

    const [data] = await db.insert(jobApplications).values({
      userId,
      company: v.company,
      position: v.position,
      status: v.status,
      url: v.url,
      salary: v.salary,
      location: v.location,
      notes: v.notes,
      appliedAt: v.applied_at ? new Date(v.applied_at) : new Date(),
    }).returning()

    revalidatePath("/dashboard/tracker")
    return { data }
  } catch (err: any) {
    return { error: "server_error", message: err.message }
  }
}

export async function updateApplicationStatus(id: string, status: string) {
  try {
    const userId = await getEffectiveUserId()
    if (!userId) return { error: "Unauthorized" }

    const statusParsed = z.enum(["wishlist", "applied", "oa", "interview", "offer", "rejected"]).safeParse(status)
    if (!statusParsed.success) return { error: "validation_error", message: "Invalid status value" }

    const [data] = await db
      .update(jobApplications)
      .set({ status: statusParsed.data, updatedAt: new Date() })
      .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)))
      .returning()

    revalidatePath("/dashboard/tracker")
    return { data }
  } catch (err: any) {
    return { error: "server_error", message: err.message }
  }
}

export async function updateApplication(id: string, payload: unknown) {
  try {
    const userId = await getEffectiveUserId()
    if (!userId) return { error: "Unauthorized" }

    const parsed = applicationWriteSchema.safeParse(payload)
    if (!parsed.success) {
      return { error: "validation_error", message: parsed.error.issues[0]?.message }
    }
    const v = parsed.data

    const [data] = await db
      .update(jobApplications)
      .set({
        company: v.company,
        position: v.position,
        status: v.status,
        url: v.url,
        salary: v.salary,
        location: v.location,
        notes: v.notes,
        appliedAt: v.applied_at ? new Date(v.applied_at) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)))
      .returning()

    revalidatePath("/dashboard/tracker")
    return { data }
  } catch (err: any) {
    return { error: "server_error", message: err.message }
  }
}

export async function deleteApplication(id: string) {
  try {
    const userId = await getEffectiveUserId()
    if (!userId) return { error: "Unauthorized" }

    await db
      .delete(jobApplications)
      .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)))

    revalidatePath("/dashboard/tracker")
    return { success: true }
  } catch (err: any) {
    return { error: "server_error", message: err.message }
  }
}
