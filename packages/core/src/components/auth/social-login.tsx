"use client"

import { Button } from "@/components/shared/ui/button"
import { GitHubIcon, GoogleIcon } from "./icons"
import { signInWithProvider } from "@/actions/auth"

export function SocialLogin() {
  return (
    <form action={signInWithProvider} className="space-y-2">
      <Button
        type="submit"
        name="provider"
        value="google"
        variant="outline"
        className="w-full h-10 rounded-md border-border/80 text-sm font-normal justify-center gap-2"
      >
        <GoogleIcon />
        Continue with Google
      </Button>
      <Button
        type="submit"
        name="provider"
        value="github"
        variant="outline"
        className="w-full h-10 rounded-md border-border/80 text-sm font-normal justify-center gap-2"
      >
        <GitHubIcon />
        Continue with GitHub
      </Button>
    </form>
  )
}
