"use client"

import * as React from "react"
import QRCode from "qrcode"
import { ShieldCheck, ShieldOff, Smartphone, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/shared/ui/dialog"
import {
  generateTOTPSetup, verifyAndEnableTOTP, disableTOTP, deleteAccount
} from "@/actions/auth"
import { toast } from "sonner"

export default function SecurityPage() {
  // TOTP state
  const [totpEnabled, setTotpEnabled] = React.useState(false)
  const [setupOpen, setSetupOpen] = React.useState(false)
  const [disableOpen, setDisableOpen] = React.useState(false)
  const [setupSecret, setSetupSecret] = React.useState("")
  const [setupQr, setSetupQr] = React.useState("")
  const [setupCode, setSetupCode] = React.useState("")
  const [disableCode, setDisableCode] = React.useState("")
  const [pending, setPending] = React.useState(false)

  // Account deletion state
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleteConfirm, setDeleteConfirm] = React.useState("")

  // Start TOTP setup — generate secret + QR
  const handleStartSetup = async () => {
    setPending(true)
    const result = await generateTOTPSetup()
    setPending(false)
    if (!result || "error" in result) {
      toast.error("Failed to generate setup. Please try again.")
      return
    }
    const qrDataUrl = await QRCode.toDataURL(result.otpauthUrl, { width: 200, margin: 1 })
    setSetupSecret(result.secret)
    setSetupQr(qrDataUrl)
    setSetupCode("")
    setSetupOpen(true)
  }

  const handleEnableTOTP = async () => {
    if (setupCode.length !== 6) return
    setPending(true)
    const result = await verifyAndEnableTOTP(setupSecret, setupCode)
    setPending(false)
    if (!result || "error" in result) {
      toast.error(result?.error ?? "Verification failed.")
      return
    }
    toast.success("Two-factor authentication enabled.")
    setTotpEnabled(true)
    setSetupOpen(false)
  }

  const handleDisableTOTP = async () => {
    if (!disableCode.trim()) return
    setPending(true)
    const result = await disableTOTP(disableCode)
    setPending(false)
    if (!result || "error" in result) {
      toast.error(result?.error ?? "Verification failed.")
      return
    }
    toast.success("Two-factor authentication disabled.")
    setTotpEnabled(false)
    setDisableOpen(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground text-sm">Manage your account security settings.</p>
      </div>

      {/* ── TOTP ─────────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Authenticator App (2FA)</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security. After enabling, you will need a 6-digit code
            from your authenticator app every time you sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totpEnabled ? (
            <div className="flex items-center justify-between p-3 rounded-lg border border-success/30 bg-success/5">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span className="font-medium text-success">Enabled</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setDisableCode(""); setDisableOpen(true) }}
                className="h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <ShieldOff className="w-3.5 h-3.5 mr-1.5" />
                Disable
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldOff className="w-4 h-4" />
                <span>Not enabled</span>
              </div>
              <Button size="sm" onClick={handleStartSetup} disabled={pending} className="h-8 text-xs">
                Set up 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Account deletion ─────────────────────────────────────────────────── */}
      <Card className="border-destructive/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-destructive" />
            <CardTitle className="text-base text-destructive">Delete Account</CardTitle>
          </div>
          <CardDescription>
            Permanently delete your account and all data: resumes, job applications, and settings.
            This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setDeleteConfirm(""); setDeleteOpen(true) }}
            className="h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete my account
          </Button>
        </CardContent>
      </Card>

      {/* ── TOTP setup dialog ────────────────────────────────────────────────── */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up two-factor authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.),
              then enter the 6-digit code to confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {setupQr && (
              <div className="flex justify-center">
                <div className="border rounded-xl p-3 bg-white inline-block">
                  <img src={setupQr} alt="TOTP QR code" width={180} height={180} />
                </div>
              </div>
            )}

            <div className="space-y-1 text-center">
              <p className="text-xs text-muted-foreground">Can&apos;t scan? Enter this code manually:</p>
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded select-all break-all">
                {setupSecret}
              </code>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="setup-code" className="text-xs text-muted-foreground">
                Verification code
              </Label>
              <Input
                id="setup-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                autoComplete="one-time-code"
                value={setupCode}
                onChange={e => setSetupCode(e.target.value.replace(/\D/g, ""))}
                className="text-center tracking-[0.4em] font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupOpen(false)} disabled={pending}>Cancel</Button>
            <Button onClick={handleEnableTOTP} disabled={pending || setupCode.length !== 6}>
              {pending ? "Verifying..." : "Enable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Disable TOTP dialog ──────────────────────────────────────────────── */}
      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Disable two-factor authentication</DialogTitle>
            <DialogDescription>
              Enter the current 6-digit code from your authenticator app to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="disable-code" className="text-xs text-muted-foreground">Authenticator code</Label>
            <Input
              id="disable-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              autoFocus
              value={disableCode}
              onChange={e => setDisableCode(e.target.value.replace(/\D/g, ""))}
              className="text-center tracking-[0.4em] font-mono"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableOpen(false)} disabled={pending}>Cancel</Button>
            <Button variant="destructive" onClick={handleDisableTOTP} disabled={pending || disableCode.length !== 6}>
              {pending ? "Verifying..." : "Disable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete account dialog ────────────────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" /> Delete account
            </DialogTitle>
            <DialogDescription>
              This permanently deletes your account, all resumes, and job applications. There is no
              recovery. Type <strong>delete my account</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <form action={deleteAccount} className="space-y-4">
            <Input
              name="confirmation"
              type="text"
              placeholder="delete my account"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              className="border-destructive/40"
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={deleteConfirm !== "delete my account"}
              >
                Delete permanently
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
