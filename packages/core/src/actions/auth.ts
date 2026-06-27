"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { signIn, signOut, auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { users, verificationTokens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import crypto from "crypto"
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mail"

export async function login(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.cause?.err?.message === "unverified_email") {
        const email = formData.get("email") as string
        if (email) {
          await resendVerificationEmail(email).catch(console.error)
        }
        redirect(`/login?message=${encodeURIComponent("Please verify your email address to log in. We just sent you a new verification link.")}`)
      }
      redirect(`/login?message=${encodeURIComponent("Invalid email or password")}`)
    }
    throw error
  }
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("full_name") as string

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) {
    redirect("/register?message=An account with this email already exists")
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await db.insert(users).values({
    email,
    name: fullName || null,
    passwordHash,
  })

  try {
    const token = await generateVerificationToken(email)
    const baseUrl = getBaseUrl()
    await sendVerificationEmail(email, `${baseUrl}/auth/verify?token=${token}`)
  } catch (err) {
    console.error("Failed to send verification email:", err)
  }

  redirect("/register?status=success")
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

export async function generateVerificationToken(email: string) {
  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email))

  await db.insert(verificationTokens).values({
    identifier: email,
    token,
    expires,
  })

  return token
}

export async function resendVerificationEmail(email: string) {
  const token = await generateVerificationToken(email)
  const baseUrl = getBaseUrl()
  await sendVerificationEmail(email, `${baseUrl}/auth/verify?token=${token}`)
}

export async function verifyEmailToken(token: string) {
  const [dbToken] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1)

  if (!dbToken) return { error: "Invalid token" }
  if (new Date() > dbToken.expires) return { error: "Token expired" }

  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.email, dbToken.identifier))

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.token, token))

  return { success: true }
}

export async function logout() {
  await signOut({ redirectTo: "/login" })
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string

  const result = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)

  // Always redirect with the same message to avoid user enumeration
  if (result.length > 0) {
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await db.insert(verificationTokens).values({
      identifier: email,
      token,
      expires,
    }).onConflictDoUpdate({
      target: [verificationTokens.identifier, verificationTokens.token],
      set: { expires },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

    try {
      await sendPasswordResetEmail(email, resetLink)
    } catch (err) {
      console.error("[password-reset] Failed to send email:", err)
      // Still log the link so dev can test without SMTP configured
      console.info(`[password-reset] ${resetLink}`)
    }
  }

  redirect("/forgot-password?message=If that email exists, a reset link has been sent")
}

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirm_password") as string
  const token = formData.get("token") as string
  const email = formData.get("email") as string

  if (password !== confirmPassword) {
    redirect(`/reset-password?token=${token}&email=${encodeURIComponent(email)}&message=Passwords do not match`)
  }

  const result = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.identifier, email))
    .limit(1)

  const record = result.find((r) => r.token === token)

  if (!record || record.expires < new Date()) {
    redirect("/forgot-password?message=Reset link is invalid or expired. Please request a new one.")
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.email, email))
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email))

  redirect("/login?message=Password updated successfully. Please sign in.")
}

export async function updateEmail(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const email = formData.get("email") as string

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) {
    redirect("/dashboard/profile?message=That email is already in use")
  }

  await db.update(users).set({ email, updatedAt: new Date() }).where(eq(users.id, session.user.id))

  revalidatePath("/dashboard/profile")
  redirect("/dashboard/profile?message=Email updated successfully")
}

export async function signInWithProvider(formData: FormData) {
  const provider = formData.get("provider") as string
  await signIn(provider, { redirectTo: "/dashboard" })
}

export async function updateProfileMetadata(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const name = formData.get("full_name") as string
  const professionalTitle = formData.get("title") as string
  const bio = formData.get("bio") as string

  await db.update(users).set({
    name: name || null,
    professionalTitle: professionalTitle || null,
    bio: bio || null,
    updatedAt: new Date(),
  }).where(eq(users.id, session.user.id))

  revalidatePath("/dashboard/profile")
  redirect("/dashboard/profile?message=Profile updated successfully")
}
