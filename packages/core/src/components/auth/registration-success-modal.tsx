"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Mail, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog"
import { Button } from "@/components/shared/ui/button"

interface RegistrationSuccessModalProps {
  status?: string
}

export function RegistrationSuccessModal({ status }: RegistrationSuccessModalProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (status === "success") {
      setOpen(true)
    }
  }, [status])

  const handleClose = () => {
    setOpen(false)
    router.push("/login")
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md border-none bg-background/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden p-0">
        <div className="relative p-8 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

          <DialogHeader className="flex flex-col items-center justify-center space-y-4 pt-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-primary/10 p-4 rounded-full border border-primary/20">
                <CheckCircle2 className="h-12 w-12 text-primary animate-in zoom-in duration-500" />
              </div>
            </div>
            
            <div className="space-y-2 text-center">
              <DialogTitle className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                Welcome Aboard!
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground font-medium">
                Your account has been successfully created.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="mt-8 p-6 bg-muted/30 border border-border/50 rounded-2xl flex items-start gap-4 transition-all hover:bg-muted/40 group">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">Verify your email</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We&apos;ve sent a verification link to your email. Please click the link to confirm your account and start building your resume.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-8 flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleClose} 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-lg shadow-primary/20 group"
            >
              Go to Login
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
