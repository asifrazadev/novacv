"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useAIStore, AIProvider } from "@/store/use-ai-store"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shared/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/shared/ui/card"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { Button } from "@/components/shared/ui/button"
import { Badge } from "@/components/shared/ui/badge"
import { Separator } from "@/components/shared/ui/separator"
import { PasswordInput } from "@/components/shared/ui/password-input"
import { SubmitButton } from "@/components/shared/buttons/submit-button"
import { AppearanceForm } from "@/components/dashboard/appearance-form"
import { toast } from "sonner"
import { 
  User as UserIcon, Mail, Briefcase, FileText, CheckCircle2, XCircle, 
  ShieldAlert, Settings, ShieldCheck, Sparkles, GitBranch, Lock 
} from "lucide-react"
import { updateEmail, updateProfileMetadata, resetPassword } from "@/actions/auth"

interface ProfileTabsClientProps {
  user: any
  googleEnabled?: boolean
  githubEnabled?: boolean
}

export function ProfileTabsClient({ user, googleEnabled = true, githubEnabled = true }: ProfileTabsClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const activeTab = searchParams.get("tab") || "profile"

  const handleTabChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", val)
    router.replace(`${pathname}?${params.toString()}`)
  }

  // Personal Details state defaults
  const fullName = user?.user_metadata?.full_name || ""
  const title = user?.user_metadata?.professional_title || ""
  const bio = user?.user_metadata?.bio || ""
  const email = user?.email || ""
  const isEmailVerified = !!user?.email_confirmed_at
  const username = email.split('@')[0] || ""

  // Socials list
  const providers = user?.identities?.map((id: any) => id.provider) || []
  const isGoogleConnected = providers.includes('google')
  const isGithubConnected = providers.includes('github')

  // AI Store hooks
  const store = useAIStore()
  const [aiProvider, setAiProvider] = React.useState<AIProvider>("openai")
  const [aiModel, setAiModel] = React.useState("")
  const [aiBaseUrl, setAiBaseUrl] = React.useState("")
  const [aiApiKey, setAiApiKey] = React.useState("")
  const [aiMounted, setAiMounted] = React.useState(false)

  React.useEffect(() => {
    setAiProvider(store.provider)
    setAiModel(store.model)
    setAiBaseUrl(store.baseUrl)
    setAiApiKey(store.apiKey)
    setAiMounted(true)
  }, [store])

  const handleSaveAI = () => {
    store.setProvider(aiProvider)
    store.setModel(aiModel)
    store.setBaseUrl(aiBaseUrl)
    store.setApiKey(aiApiKey)
    toast.success("AI API configuration securely saved to local storage!")
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
      <TabsList className="flex flex-wrap justify-start gap-1 h-auto bg-transparent p-0 border-b border-border/40 w-full rounded-none">
        <TabsTrigger 
          value="profile" 
          className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-semibold gap-1.5 transition-all text-xs sm:text-sm cursor-pointer"
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile Info</span>
        </TabsTrigger>
        <TabsTrigger 
          value="preferences" 
          className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-semibold gap-1.5 transition-all text-xs sm:text-sm cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>Preferences</span>
        </TabsTrigger>
        <TabsTrigger 
          value="security" 
          className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-semibold gap-1.5 transition-all text-xs sm:text-sm cursor-pointer"
        >
          <Lock className="w-4 h-4" />
          <span>Security</span>
        </TabsTrigger>
        <TabsTrigger 
          value="ai" 
          className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-semibold gap-1.5 transition-all text-xs sm:text-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Integration</span>
        </TabsTrigger>
        {/* Social Logins Tab */}
        {(googleEnabled || githubEnabled) && (
          <TabsTrigger 
            value="social" 
            className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-semibold gap-1.5 transition-all text-xs sm:text-sm cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Social Logins</span>
          </TabsTrigger>
        )}
      </TabsList>

      {/* Tab 1: Profile Info */}
      <TabsContent value="profile" className="space-y-6 max-w-2xl outline-none">
        <Card className="border-border/55 bg-card/40 backdrop-blur-xs">
          <CardHeader className="py-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Personal Details</CardTitle>
            </div>
            <CardDescription>Update your photo and profile details here.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={updateProfileMetadata} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input 
                    id="full_name" 
                    name="full_name" 
                    defaultValue={fullName} 
                    placeholder="Your name" 
                    className="bg-muted/10 border-border/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">@</span>
                    <Input id="username" defaultValue={username} className="pl-7 bg-muted/30" disabled />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Professional Title
                </Label>
                <Input 
                  id="title" 
                  name="title" 
                  defaultValue={title}
                  placeholder="e.g. Senior Software Engineer" 
                  className="bg-muted/10 border-border/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Bio
                </Label>
                <textarea
                  id="bio"
                  name="bio"
                  defaultValue={bio}
                  placeholder="Briefly describe your professional background and goals..."
                  className="flex min-h-[140px] w-full rounded-md border border-border/40 bg-muted/10 px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:border-primary/50"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-border/40">
                <Button type="submit" className="bg-primary hover:bg-primary-dark cursor-pointer font-semibold h-9 text-xs">
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/55 bg-card/40 backdrop-blur-xs">
          <CardHeader className="py-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Email Address</CardTitle>
            </div>
            <CardDescription>Changing your email will require confirmation on both addresses.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={updateEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    name="email" 
                    defaultValue={email} 
                    className="pr-24 bg-muted/10 border-border/40" 
                  />
                  <div className="absolute right-2 top-1.5">
                    {isEmailVerified ? (
                      <Badge variant="secondary" className="bg-success/10 text-success border-none gap-1 py-0.5 select-none">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-warning/10 text-warning border-none gap-1 py-0.5 select-none">
                        <XCircle className="w-3 h-3" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/40">
                <Button type="submit" variant="secondary" className="h-9 text-xs font-semibold cursor-pointer">
                  Update Email
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab 2: Preferences */}
      <TabsContent value="preferences" className="space-y-6 max-w-2xl outline-none">
        <AppearanceForm />
      </TabsContent>

      {/* Tab 3: Security */}
      <TabsContent value="security" className="space-y-6 max-w-2xl outline-none">
        <Card className="border-border/55 bg-card/40 backdrop-blur-xs">
          <CardHeader className="py-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Change Password</CardTitle>
            </div>
            <CardDescription>
              {providers.length > 0 && !user?.email_confirmed_at
                ? "Set a password to enable email-based login alongside your social account."
                : "Update your password regularly to keep your account secure."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={resetPassword} className="space-y-4">
              <input type="hidden" name="redirectTo" value="/dashboard/profile?tab=security" />

              <div className="grid gap-4">
                {providers.includes('email') && (
                  <div className="space-y-2">
                    <Label htmlFor="old_password">Current Password</Label>
                    <PasswordInput
                      id="old_password"
                      name="old_password"
                      placeholder="••••••••"
                      required
                      className="bg-muted/10 border-border/40"
                    />
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <PasswordInput
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      required
                      className="bg-muted/10 border-border/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <PasswordInput
                      id="confirm_password"
                      name="confirm_password"
                      placeholder="••••••••"
                      required
                      className="bg-muted/10 border-border/40"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/40">
                <SubmitButton loadingText="Updating..." className="bg-primary hover:bg-primary-dark h-9 text-xs font-semibold cursor-pointer">
                  Update Password
                </SubmitButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab 4: AI Integration */}
      <TabsContent value="ai" className="space-y-6 max-w-2xl outline-none">
        <div className="bg-warning/10 p-4 rounded-xl border border-warning/20 flex gap-3 text-sm text-warning leading-relaxed">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p>
            <strong>Privacy Notice:</strong> Your API keys are strictly saved in your browser's local storage and are <strong>never</strong> transmitted to our database. All LLM requests are proxied securely or made directly from your client.
          </p>
        </div>

        {aiMounted && (
          <Card className="border-border/55 bg-card/40 backdrop-blur-xs">
            <CardHeader className="py-4 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">API Configuration</CardTitle>
              </div>
              <CardDescription>These details are required for the AI to function properly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col justify-end">
                  <Label htmlFor="provider" className="mb-1">Provider</Label>
                  <Select
                    value={aiProvider}
                    onValueChange={(v) => {
                      const p = v as AIProvider
                      setAiProvider(p)
                      if (p === 'openai' && !aiModel) setAiModel('gpt-4o')
                      if (p === 'anthropic' && !aiModel) setAiModel('claude-3-opus-20240229')
                      if (p === 'openrouter' && !aiModel) setAiModel('google/gemini-2.5-flash')
                    }}
                  >
                    <SelectTrigger id="provider" className="h-9 border-border/40 bg-muted/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                      <SelectItem value="openrouter">OpenRouter</SelectItem>
                      <SelectItem value="custom">Custom / Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model ID</Label>
                  <Input 
                    id="model" 
                    value={aiModel} 
                    onChange={(e) => setAiModel(e.target.value)} 
                    placeholder="gpt-4o, claude-3-opus..." 
                    className="bg-muted/10 border-border/40 h-9 text-xs"
                  />
                </div>
              </div>

              <Separator className="border-border/40" />

              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Input 
                  id="baseUrl" 
                  value={aiBaseUrl} 
                  onChange={(e) => setAiBaseUrl(e.target.value)} 
                  placeholder="e.g. https://api.openai.com/v1" 
                  className="bg-muted/10 border-border/40 h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">Useful for custom endpoints, proxies, or local models (Ollama).</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key <span className="text-muted-foreground font-normal">(Optional if set in .env)</span></Label>
                <Input 
                  id="apiKey" 
                  type="password" 
                  value={aiApiKey} 
                  onChange={(e) => setAiApiKey(e.target.value)} 
                  placeholder="sk-..." 
                  className="bg-muted/10 border-border/40 h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">If left blank, the application will fallback to your secure backend <code>.env</code> file keys automatically.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 bg-muted/10 items-center rounded-b-xl py-4">
              <Button 
                variant="ghost" 
                className="h-9 text-xs font-semibold cursor-pointer"
                onClick={() => {
                  store.reset()
                  toast.info("Keys purged from local storage.")
                }}
              >
                Clear Keys
              </Button>
              <Button onClick={handleSaveAI} className="h-9 text-xs font-bold cursor-pointer">Save Keys</Button>
            </CardFooter>
          </Card>
        )}
      </TabsContent>

      {/* Tab 5: Connected Socials */}
      {(googleEnabled || githubEnabled) && (
        <TabsContent value="social" className="space-y-6 max-w-2xl outline-none">
          <Card className="border-border/55 bg-card/40 backdrop-blur-xs">
            <CardHeader className="py-4 border-b border-border/40">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Connected Socials</CardTitle>
              </div>
              <CardDescription>Link social accounts so you can log in with one click.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col gap-3">
                {googleEnabled && (
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start h-12 ${isGoogleConnected ? 'bg-success/5 border-success/20' : 'border-border/40 hover:bg-muted/30'} cursor-pointer`} 
                    disabled={isGoogleConnected}
                  >
                    <Mail className={`mr-3 h-5 w-5 ${isGoogleConnected ? 'text-success' : 'text-primary'}`} />
                    {isGoogleConnected ? 'Connected with Google' : 'Connect Google Account'}
                    {isGoogleConnected && (
                      <span className="ml-auto text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full flex items-center gap-1 select-none">
                        <ShieldCheck className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </Button>
                )}

                {githubEnabled && (
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start h-12 ${isGithubConnected ? 'bg-success/5 border-success/20' : 'border-border/40 hover:bg-muted/30'} cursor-pointer`} 
                    disabled={isGithubConnected}
                  >
                    <GitBranch className={`mr-3 h-5 w-5 ${isGithubConnected ? 'text-success' : 'text-foreground'}`} />
                    {isGithubConnected ? 'Connected with GitHub' : 'Connect GitHub Account'}
                    {isGithubConnected && (
                      <span className="ml-auto text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full flex items-center gap-1 select-none">
                        <ShieldCheck className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  )
}
