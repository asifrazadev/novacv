"use client"

import * as React from "react"
import { RefreshCw, ShieldCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog"
import { Button } from "@/components/shared/ui/button"

interface LinkedInSyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LinkedInSyncDialog({ open, onOpenChange }: LinkedInSyncDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] border-border/50 shadow-2xl">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center mb-4 overflow-hidden">
            <img 
              src="/svg/linkedin.svg" 
              alt="LinkedIn" 
              className="w-6 h-6 object-contain"
            />
          </div>
          <DialogTitle className="text-2xl font-bold">Sync with LinkedIn</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-1">
            Connect your LinkedIn account to import your work experience, education, and skills.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6 border-y border-border/50 my-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Secure Connection</p>
              <p className="text-[13px] text-muted-foreground">We only request read-access to your profile data. Your password is never shared.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Automatic Sync</p>
              <p className="text-[13px] text-muted-foreground">Changes to your LinkedIn profile will be reflected in your NovaCV dashboard.</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Maybe later</Button>
          <Button className="bg-[#0077b5] hover:bg-[#006399] text-white px-8 shadow-lg shadow-sky-600/20 gap-2 font-semibold">
            <img 
              src="/svg/linkedin.svg" 
              alt="" 
              className="w-4 h-4 brightness-0 invert" 
            />
            Connect & Sync
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
