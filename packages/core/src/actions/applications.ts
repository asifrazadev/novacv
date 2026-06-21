"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getApplications() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Unauthorized" }
    }
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    // Auto-cleanup: delete applications that haven't been updated in over a month
    await supabase
      .from("job_applications")
      .delete()
      .eq("user_id", user.id)
      .lt("updated_at", oneMonthAgo.toISOString())

    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .order("updated_at", { ascending: false })

    if (error) {
      console.warn("Supabase query error:", error)
      return { error: "database_error", message: error.message, code: error.code }
    }
    return { data }
  } catch (err: any) {
    console.warn("Server action error:", err)
    return { error: "server_error", message: err.message }
  }
}

export async function createApplication(payload: any) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Unauthorized" }
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
        applied_at: payload.applied_at || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.warn("Supabase insert error:", error)
      return { error: "database_error", message: error.message, code: error.code }
    }
    revalidatePath("/dashboard/tracker")
    return { data }
  } catch (err: any) {
    return { error: "server_error", message: err.message }
  }
}

export async function updateApplicationStatus(id: string, status: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Unauthorized" }
    }
    const { data, error } = await supabase
      .from("job_applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      return { error: "database_error", message: error.message, code: error.code }
    }
    revalidatePath("/dashboard/tracker")
    return { data }
  } catch (err: any) {
    return { error: "server_error", message: err.message }
  }
}

export async function updateApplication(id: string, payload: any) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Unauthorized" }
    }
    const { data, error } = await supabase
      .from("job_applications")
      .update({
        company: payload.company,
        position: payload.position,
        status: payload.status,
        url: payload.url,
        salary: payload.salary,
        location: payload.location,
        notes: payload.notes,
        applied_at: payload.applied_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      return { error: "database_error", message: error.message, code: error.code }
    }
    revalidatePath("/dashboard/tracker")
    return { data }
  } catch (err: any) {
    return { error: "server_error", message: err.message }
  }
}

export async function deleteApplication(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Unauthorized" }
    }
    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      return { error: "database_error", message: error.message, code: error.code }
    }
    revalidatePath("/dashboard/tracker")
    return { success: true }
  } catch (err: any) {
    return { error: "server_error", message: err.message }
  }
}
