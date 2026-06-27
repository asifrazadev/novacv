"use client"

import * as React from "react"
import QRCode from "qrcode"
import { useBuilder } from "@/components/builder/builder-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shared/ui/dialog"
import { Button } from "@/components/shared/ui/button"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { Switch } from "@/components/shared/ui/switch"
import { Share2, Copy, Check, Globe, Eye, Clock } from "lucide-react"
import { toggleResumePublicStatus, getResumePublicStats } from "@/actions/resumes"
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
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null)
  const [stats, setStats] = React.useState<{ viewCount: number; lastViewedAt: Date | null } | null>(null)

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const shareUrl = `${baseUrl}/p/${resumeId}`

  React.useEffect(() => {
    if (!isOpen) return
    getResumePublicStats(resumeId).then(s => {
      if (s) {
        setIsPublic(s.isPublic)
        setStats({ viewCount: s.viewCount, lastViewedAt: s.lastViewedAt ? new Date(s.lastViewedAt) : null })
      }
    })
  }, [isOpen, resumeId])

  React.useEffect(() => {
    if (isPublic && shareUrl) {
      QRCode.toDataURL(shareUrl, { width: 160, margin: 1, color: { dark: "#000000", light: "#ffffff" } })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(null))
    } else {
      setQrDataUrl(null)
    }
  }, [isPublic, shareUrl])

  const handleToggle = async (checked: boolean) => {
    setIsPending(true)
    setIsPublic(checked)
    try {
      const result = await toggleResumePublicStatus(resumeId, checked)
      if (result.error) {
        toast.error("Failed to update status")
        setIsPublic(!checked)
      } else {
        toast.success(checked ? "Resume is now public" : "Resume is now private")
      }
    } catch {
      toast.error("An error occurred")
      setIsPublic(!checked)
    } finally {
      setIsPending(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
    toast.success("Link copied to clipboard")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
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
          <Switch checked={isPublic} onCheckedChange={handleToggle} disabled={isPending} />
        </div>

        {isPublic && (
          <>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">Link</Label>
                <Input id="link" defaultValue={shareUrl} readOnly className="text-muted-foreground text-xs" />
              </div>
              <Button size="sm" className="px-3" onClick={handleCopy}>
                <span className="sr-only">Copy</span>
                {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex gap-4 items-start">
              {qrDataUrl && (
                <div className="shrink-0 border rounded-lg p-2 bg-white">
                  <img src={qrDataUrl} alt="QR code" width={120} height={120} />
                </div>
              )}
              <div className="flex flex-col gap-3 flex-1 justify-center">
                {stats && (
                  <>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Eye className="w-3.5 h-3.5" />
                      <span><strong className="text-foreground">{stats.viewCount}</strong> view{stats.viewCount !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {stats.lastViewedAt
                          ? `Last viewed ${stats.lastViewedAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
                          : "Not yet viewed"}
                      </span>
                    </div>
                  </>
                )}
                <p className="text-[10px] text-muted-foreground/60">Scan QR to open on mobile</p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
