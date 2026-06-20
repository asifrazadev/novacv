"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createResume(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Ensure profile exists (workaround for cases where trigger didn't run)
  await supabase.from("profiles").upsert({
    id: user.id,
    full_name: user.user_metadata?.full_name || "",
    avatar_url: user.user_metadata?.avatar_url || "",
    updated_at: new Date().toISOString(),
  })

  const title = formData.get("title") as string
  const tagsStr = formData.get("tags") as string
  const tags = tagsStr ? JSON.parse(tagsStr) : []

  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title: title || "Untitled Resume",
      data: {
        basics: {
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
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
          awards: []
        },
        metadata: {
          tags: tags
        }
      }
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating resume:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  redirect(`/dashboard/resumes/${data.id}`)
}

export async function duplicateResume(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: original, error: getError } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (getError || !original) {
    console.error("Error fetching original resume for duplication:", getError)
    return { error: getError?.message || "Resume not found" }
  }

  const { data: copy, error: insertError } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title: `${original.title} (Copy)`,
      data: original.data,
      is_public: false,
    })
    .select()
    .single()

  if (insertError) {
    console.error("Error inserting duplicated resume:", insertError)
    return { error: insertError.message }
  }

  revalidatePath("/dashboard")
  return { success: true, id: copy.id }
}

export async function updateResume(id: string, resumeData: any, title?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("resumes")
    .update({
      data: resumeData,
      ...(title && { title }),
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error updating resume:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/resumes/${id}`)
  return { success: true }
}

export async function deleteResume(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function getResumes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching resumes:", error)
    return []
  }

  return data
}

export async function getResumeById(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching resume:", error)
    return null
  }

  return data
}

export async function toggleResumePublicStatus(id: string, isPublic: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("resumes")
    .update({
      is_public: isPublic,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error updating resume public status:", error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/resumes/${id}`)
  revalidatePath(`/p/${id}`)
  return { success: true }
}

export async function getPublicResumeById(id: string) {
  const supabase = await createClient()

  // NOTE: Intentionally not requesting user auth here.
  // We rely on Supabase Row Level Security (RLS) to enforce that only
  // resumes with is_public = true (or owned by the current user) can be selected.
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching public resume:", error)
    return null
  }

  return data
}

export async function importResumeAndCreate(title: string, resumeData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title: title || "Imported Resume",
      data: resumeData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error("Error importing resume:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true, id: data.id }
}
