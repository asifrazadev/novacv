import type { NextAuthConfig } from "next-auth"

// Edge-compatible config — no DB imports, no pg, no bcrypt.
// Used by middleware (Edge Runtime). Full auth.ts spreads this and adds the adapter.
export const authConfig = {
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }: { token: any; user?: any }) {
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }: { session: any; token: any }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
} satisfies NextAuthConfig
