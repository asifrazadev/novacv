"use client"

import { useBuilder } from "@/components/builder/builder-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/shared/ui/accordion"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { Button } from "@/components/shared/ui/button"
import { Trash2, Link } from "lucide-react"
import { SocialIcon } from "@/components/shared/ui/social-icon"
import { cn } from "@/lib/utils"

const NETWORKS = [
  { name: "LinkedIn", iconKey: "linkedin", url: "https://linkedin.com", base: "https://linkedin.com/in/" },
  { name: "GitHub", iconKey: "github", url: "https://github.com", base: "https://github.com/" },
  { name: "Twitter", iconKey: "twitter", url: "https://twitter.com", base: "https://twitter.com/" },
  { name: "Instagram", iconKey: "instagram", url: "https://instagram.com", base: "https://instagram.com/" },
  { name: "YouTube", iconKey: "youtube", url: "https://youtube.com", base: "https://youtube.com/@" },
  { name: "Facebook", iconKey: "facebook", url: "https://facebook.com", base: "https://facebook.com/" },
  { name: "Dribbble", iconKey: "dribbble", url: "https://dribbble.com", base: "https://dribbble.com/" },
  { name: "Behance", iconKey: "behance", url: "https://behance.net", base: "https://behance.net/" },
  { name: "Medium", iconKey: "medium", url: "https://medium.com", base: "https://medium.com/@" },
  { name: "Dev.to", iconKey: "devto", url: "https://dev.to", base: "https://dev.to/" },
  { name: "Twitch", iconKey: "twitch", url: "https://twitch.tv", base: "https://twitch.tv/" },
  { name: "Discord", iconKey: "discord", url: "https://discord.com", base: "https://discord.com/users/" },
  { name: "LeetCode", iconKey: "leetcode", url: "https://leetcode.com", base: "https://leetcode.com/u/" },
  { name: "Stack Overflow", iconKey: "stackoverflow", url: "https://stackoverflow.com", base: "https://stackoverflow.com/users/" },
  { name: "Kaggle", iconKey: "kaggle", url: "https://kaggle.com", base: "https://kaggle.com/" },
]

export function ProfilesSection() {
  const { data, updateSectionItem, deleteSectionItem } = useBuilder()

  return (
    <Accordion type="single" collapsible className="w-full">
      {data.sections.profiles.map((item: any) => (
        <AccordionItem key={item.id} value={item.id} className="border-b-0 mb-2 border rounded-md px-3 bg-card/50">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-3 pr-4 truncate w-full text-left">
              <SocialIcon
                network={item.icon || undefined}
                url={item.icon ? undefined : (item.url || "https://social.com")}
                style={{ height: 24, width: 24 }}
              />
              <div className="flex flex-col truncate">
                <span className="font-medium text-sm truncate">{item.network || "New Link"}</span>
                <span className="text-[11px] text-muted-foreground truncate">{item.username || "username"}</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            {/* Icon picker grid */}
            <div className="space-y-2">
              <Label className="text-xs">Pick a network</Label>
              <div className="grid grid-cols-6 gap-1.5">
                {NETWORKS.map(n => {
                  const isActive = item.network === n.name
                  return (
                    <button
                      key={n.name}
                      title={n.name}
                      onClick={() => {
                        updateSectionItem("profiles", item.id, "network", n.name)
                        updateSectionItem("profiles", item.id, "icon", n.iconKey)
                        if (!item.url) {
                          updateSectionItem("profiles", item.id, "url", n.base)
                        }
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all",
                        isActive
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-transparent bg-muted/40 hover:bg-muted/80"
                      )}
                    >
                      <SocialIcon network={n.iconKey} style={{ height: 22, width: 22, pointerEvents: "none" }} />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* URL */}
            <div className="space-y-1.5">
              <Label className="text-xs">Profile URL</Label>
              <div className="relative">
                <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  className="pl-8"
                  value={item.url ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSectionItem("profiles", item.id, "url", e.target.value)}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>
            </div>

            {/* Username — display label shown on the resume */}
            <div className="space-y-1.5">
              <Label className="text-xs">Display Text</Label>
              <Input
                value={item.username ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSectionItem("profiles", item.id, "username", e.target.value)}
                placeholder="johndoe · shown on resume"
              />
            </div>

            <Button variant="ghost" size="sm" onClick={() => deleteSectionItem("profiles", item.id)} className="w-full text-destructive hover:bg-destructive/10 h-8 gap-2">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
