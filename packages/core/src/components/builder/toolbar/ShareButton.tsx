"use client"

import * as React from "react"
import { useBuilder } from "@/components/builder/builder-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shared/ui/dialog"
import { Button } from "@/components/shared/ui/button"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { Switch } from "@/components/shared/ui/switch"
import { Share2, Copy, Check, Globe } from "lucide-react"
import { toggleResumePublicStatus } from "@/actions/resumes"
import { toast } from "sonner"

interface ShareButtonProps {
  trigger?: React.ReactNode
}

export function ShareButton({ trigger }: ShareButtonProps) {
  const { resumeId } = useBuilder()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isPublic, setIsPublic] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [hasCopied, setHasCopied] = React.useState(false)

  // Determine the URL
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const shareUrl = `${baseUrl}/p/${resumeId}`

  const handleToggle = async (checked: boolean) => {
    setIsPending(true)
    setIsPublic(checked)
    try {
      const result = await toggleResumePublicStatus(resumeId, checked)
      if (result.error) {
        toast.error("Failed to update status")
        setIsPublic(!checked) // Revert
      } else {
        toast.success(checked ? "Resume is now public" : "Resume is now private")
      }
    } catch (e) {
      toast.error("An error occurred")
      setIsPublic(!checked) // Revert
    } finally {
      setIsPending(false)
    }
  }

  const handleCopy = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
    toast.success("Link copied to clipboard")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="outline" size="sm" className="gap-1.5 h-8">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Resume</DialogTitle>
          <DialogDescription>
            Anyone with the link can view your resume. It will not be indexed by search engines.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 border rounded-md p-4 bg-muted/30">
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Public Link
            </h4>
            <p className="text-xs text-muted-foreground">
              Turn on to securely share your resume online.
            </p>
          </div>
          <Switch 
            checked={isPublic} 
            onCheckedChange={handleToggle} 
            disabled={isPending}
          />
        </div>

        {isPublic && (
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue={shareUrl}
                readOnly
                className="text-muted-foreground"
              />
            </div>
            <Button size="sm" className="px-3" onClick={handleCopy}>
              <span className="sr-only">Copy</span>
              {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
