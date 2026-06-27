"use client"

import { Button } from "@/components/shared/ui/button"
import { GitHubIcon, GoogleIcon } from "./icons"
import { signInWithProvider } from "@/actions/auth"

interface SocialLoginProps {
  googleEnabled?: boolean
  githubEnabled?: boolean
}

export function SocialLogin({ googleEnabled = true, githubEnabled = true }: SocialLoginProps) {
  if (!googleEnabled && !githubEnabled) {
    return null
  }

  return (
    <form action={signInWithProvider} className="space-y-2">
      {googleEnabled && (
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
      )}
      {githubEnabled && (
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
      )}
    </form>
  )
}
