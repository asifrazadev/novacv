"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { signIn, signOut, auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { users, verificationTokens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { verify as totpVerify, generateSecret as totpGenerateSecret } from "otplib"
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
      const cause = error.cause?.err?.message
      if (cause === "unverified_email") {
        const email = formData.get("email") as string
        if (email) await resendVerificationEmail(email).catch(console.error)
        redirect(`/login?message=${encodeURIComponent("Please verify your email address to log in. We just sent you a new verification link.")}`)
      }
      if (cause === "totp_required") {
        redirect(`/login?step=totp`)
      }
      if (cause === "invalid_totp") {
        redirect(`/login?step=totp&message=${encodeURIComponent("Invalid authenticator code. Please try again.")}`)
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
  const smtpConfigured = !!process.env.SMTP_HOST

  await db.insert(users).values({
    email,
    name: fullName || null,
    passwordHash,
    // No SMTP configured (e.g. staging/preview) — skip verification since the
    // link could never be delivered anyway.
    emailVerified: smtpConfigured ? null : new Date(),
  })

  if (smtpConfigured) {
    try {
      const token = await generateVerificationToken(email)
      const baseUrl = getBaseUrl()
      await sendVerificationEmail(email, `${baseUrl}/auth/verify?token=${token}`)
    } catch (err) {
      console.error("Failed to send verification email:", err)
    }
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

export async function sendMagicLink(formData: FormData) {
  const email = formData.get("email") as string
  if (!email) redirect("/login?message=Email+is+required")
  await signIn("nodemailer", { email, redirectTo: "/dashboard" })
}

// ── TOTP (authenticator app) ─────────────────────────────────────────────────

export async function checkCredentialsForTOTP(email: string, password: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
  const user = result[0]
  if (!user?.passwordHash) return { error: "invalid_credentials" as const }
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return { error: "invalid_credentials" as const }
  if (!user.emailVerified) {
    await resendVerificationEmail(email).catch(console.error)
    return { error: "unverified_email" as const }
  }
  if (user.totpEnabled) return { totpRequired: true as const }
  await signIn("credentials", { email, password, redirectTo: "/dashboard" })
}

export async function loginWithTOTP(email: string, password: string, totpCode: string) {
  try {
    await signIn("credentials", { email, password, totpCode, redirectTo: "/dashboard" })
  } catch (error) {
    if (error instanceof AuthError) {
      const cause = (error as any).cause?.err?.message
      if (cause === "invalid_totp") return { error: "Invalid authenticator code." }
      return { error: "Sign in failed." }
    }
    throw error
  }
}

export async function generateTOTPSetup() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  const secret = totpGenerateSecret()
  const label = encodeURIComponent(session.user.email ?? session.user.id)
  const otpauthUrl = `otpauth://totp/${label}?secret=${secret}&issuer=NovaCV`
  return { secret, otpauthUrl }
}

export async function verifyAndEnableTOTP(secret: string, code: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  const { valid: ok } = await totpVerify({ token: code.trim(), secret })
  if (!ok) return { error: "Invalid code — check your authenticator app and try again." }
  await db.update(users).set({ totpSecret: secret, totpEnabled: true }).where(eq(users.id, session.user.id))
  return { success: true as const }
}

export async function disableTOTP(code: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  const [user] = await db.select({ totpSecret: users.totpSecret }).from(users).where(eq(users.id, session.user.id)).limit(1)
  if (!user?.totpSecret) return { error: "TOTP is not enabled" }
  const { valid: ok } = await totpVerify({ token: code.trim(), secret: user.totpSecret })
  if (!ok) return { error: "Invalid code." }
  await db.update(users).set({ totpSecret: null, totpEnabled: false }).where(eq(users.id, session.user.id))
  return { success: true as const }
}

// ── Account deletion ─────────────────────────────────────────────────────────

export async function deleteAccount(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const confirmation = formData.get("confirmation") as string
  if (confirmation !== "delete my account") {
    redirect("/dashboard/security?message=Type the confirmation phrase exactly as shown")
  }
  await db.delete(users).where(eq(users.id, session.user.id))
  await signOut({ redirectTo: "/" })
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
