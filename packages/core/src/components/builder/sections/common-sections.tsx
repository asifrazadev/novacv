"use client"

import { useBuilder } from "@/components/builder/builder-context"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { Switch } from "@/components/shared/ui/switch"
import { RichTextarea } from "@/components/shared/ui/rich-textarea"
import { Link } from "lucide-react"
import { DateRange, ListSection } from "@/components/builder/sections/shared"

/* ── Awards ── */
export function AwardsSection() {
  const { updateSectionItem } = useBuilder()

  return (
    <ListSection
      section="awards"
      renderForm={(item) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input placeholder="Employee of the Month" value={item.title ?? ""} onChange={(e) => updateSectionItem("awards", item.id, "title", e.target.value)} />
            </div>
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Awarder</Label>
              <Input placeholder="Google" value={item.awarder ?? ""} onChange={(e) => updateSectionItem("awards", item.id, "awarder", e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input placeholder="Jan 2024" value={item.date ?? ""} onChange={(e) => updateSectionItem("awards", item.id, "date", e.target.value)} />
            </div>
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Website URL</Label>
              <div className="relative">
                <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input className="pl-8" placeholder="https://" value={item.url ?? ""} onChange={(e) => updateSectionItem("awards", item.id, "url", e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs cursor-pointer" htmlFor={`award-link-${item.id}`}>Show link in title</Label>
            <Switch id={`award-link-${item.id}`} checked={item.showLinkInTitle ?? false} onCheckedChange={(val: boolean) => updateSectionItem("awards", item.id, "showLinkInTitle", val)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <RichTextarea placeholder="Describe the award and its significance..." value={item.description ?? ""} onChange={(val) => updateSectionItem("awards", item.id, "description", val)} minHeight="100px" source={{ section: "awards", fieldName: "description" }} />
          </div>
        </div>
      )}
    />
  )
}

/* ── Certifications ── */
export function CertificationsSection() {
  const { updateSectionItem } = useBuilder()

  return (
    <ListSection
      section="certifications"
      renderForm={(item) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input placeholder="AWS Solutions Architect" value={item.name ?? ""} onChange={(e) => updateSectionItem("certifications", item.id, "name", e.target.value)} />
            </div>
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Issuer</Label>
              <Input placeholder="Amazon Web Services" value={item.issuer ?? ""} onChange={(e) => updateSectionItem("certifications", item.id, "issuer", e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input placeholder="Jan 2024" value={item.date ?? ""} onChange={(e) => updateSectionItem("certifications", item.id, "date", e.target.value)} />
            </div>
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Website URL</Label>
              <div className="relative">
                <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input className="pl-8" placeholder="https://" value={item.url ?? ""} onChange={(e) => updateSectionItem("certifications", item.id, "url", e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs cursor-pointer" htmlFor={`cert-link-${item.id}`}>Show link in title</Label>
            <Switch id={`cert-link-${item.id}`} checked={item.showLinkInTitle ?? false} onCheckedChange={(val: boolean) => updateSectionItem("certifications", item.id, "showLinkInTitle", val)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <RichTextarea placeholder="Describe the certification and its significance..." value={item.description ?? ""} onChange={(val) => updateSectionItem("certifications", item.id, "description", val)} minHeight="100px" source={{ section: "certifications", fieldName: "description" }} />
          </div>
        </div>
      )}
    />
  )
}

/* ── Volunteer ── */
export function VolunteerSection() {
  const { updateSectionItem } = useBuilder()

  return (
    <ListSection
      section="volunteer"
      renderForm={(item) => (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[130px] space-y-1.5"><Label className="text-xs">Organization</Label><Input value={item.organization ?? ""} onChange={(e) => updateSectionItem("volunteer", item.id, "organization", e.target.value)} /></div>
            <div className="flex-1 min-w-[130px] space-y-1.5"><Label className="text-xs">Position</Label><Input value={item.position ?? ""} onChange={(e) => updateSectionItem("volunteer", item.id, "position", e.target.value)} /></div>
          </div>
          <DateRange section="volunteer" item={item} />
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <RichTextarea placeholder="Describe your volunteer work..." value={item.description ?? ""} onChange={(val) => updateSectionItem("volunteer", item.id, "description", val)} minHeight="100px" source={{ section: "volunteer", fieldName: "description" }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Website</Label>
            <div className="relative">
              <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input className="pl-8 h-8 text-xs" placeholder="https://" value={item.website ?? ""} onChange={(e) => updateSectionItem("volunteer", item.id, "website", e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs cursor-pointer" htmlFor={`vol-link-${item.id}`}>Show link in title</Label>
            <Switch id={`vol-link-${item.id}`} checked={item.showLinkInTitle ?? false} onCheckedChange={(val: boolean) => updateSectionItem("volunteer", item.id, "showLinkInTitle", val)} />
          </div>
        </div>
      )}
    />
  )
}

/* ── Publications ── */
export function PublicationsSection() {
  const { updateSectionItem } = useBuilder()

  return (
    <ListSection
      section="publications"
      renderForm={(item) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input placeholder="Mastering Next.js" value={item.name ?? ""} onChange={(e) => updateSectionItem("publications", item.id, "name", e.target.value)} />
            </div>
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Publisher</Label>
              <Input placeholder="O'Reilly" value={item.publisher ?? ""} onChange={(e) => updateSectionItem("publications", item.id, "publisher", e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input placeholder="Jan 2024" value={item.date ?? ""} onChange={(e) => updateSectionItem("publications", item.id, "date", e.target.value)} />
            </div>
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Website URL</Label>
              <div className="relative">
                <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input className="pl-8" placeholder="https://" value={item.url ?? ""} onChange={(e) => updateSectionItem("publications", item.id, "url", e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs cursor-pointer" htmlFor={`pub-link-${item.id}`}>Show link in title</Label>
            <Switch id={`pub-link-${item.id}`} checked={item.showLinkInTitle ?? false} onCheckedChange={(val: boolean) => updateSectionItem("publications", item.id, "showLinkInTitle", val)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <RichTextarea placeholder="Describe your publication..." value={item.description ?? ""} onChange={(val) => updateSectionItem("publications", item.id, "description", val)} minHeight="100px" source={{ section: "publications", fieldName: "description" }} />
          </div>
        </div>
      )}
    />
  )
}

/* ── References ── */
export function ReferencesSection() {
  const { updateSectionItem } = useBuilder()

  return (
    <ListSection
      section="references"
      renderForm={(item) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input placeholder="John Doe" value={item.name ?? ""} onChange={(e) => updateSectionItem("references", item.id, "name", e.target.value)} />
            </div>
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Position</Label>
              <Input placeholder="Senior Manager" value={item.position ?? ""} onChange={(e) => updateSectionItem("references", item.id, "position", e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input placeholder="+1..." value={item.phone ?? ""} onChange={(e) => updateSectionItem("references", item.id, "phone", e.target.value)} />
            </div>
            <div className="flex-1 min-w-[130px] space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input placeholder="john@company.com" value={item.email ?? ""} onChange={(e) => updateSectionItem("references", item.id, "email", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Website URL</Label>
            <div className="relative">
              <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input className="pl-8" placeholder="https://" value={item.website ?? ""} onChange={(e) => updateSectionItem("references", item.id, "website", e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs cursor-pointer" htmlFor={`ref-link-${item.id}`}>Show link in title</Label>
            <Switch id={`ref-link-${item.id}`} checked={item.showLinkInTitle ?? false} onCheckedChange={(val: boolean) => updateSectionItem("references", item.id, "showLinkInTitle", val)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <RichTextarea placeholder="A brief note about your reference..." value={item.description ?? ""} onChange={(val) => updateSectionItem("references", item.id, "description", val)} minHeight="100px" source={{ section: "references", fieldName: "description" }} />
          </div>
        </div>
      )}
    />
  )
}
