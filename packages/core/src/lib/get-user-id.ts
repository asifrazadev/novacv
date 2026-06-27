import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { AUTH_ENABLED } from "@/lib/flags"

export const GUEST_USER_ID = "local-user"

async function ensureGuestUser() {
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, GUEST_USER_ID)).limit(1)
  if (existing.length === 0) {
    await db.insert(users).values({
      id: GUEST_USER_ID,
      email: "local@localhost",
      name: "Local User",
    }).onConflictDoNothing()
  }
  return GUEST_USER_ID
}

export async function getEffectiveUserId(): Promise<string | null> {
  if (!AUTH_ENABLED) return ensureGuestUser()
  const session = await auth()
  return session?.user?.id ?? null
}
