"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, X, Info, Layout } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog"
import { Button } from "@/components/shared/ui/button"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { Badge } from "@/components/shared/ui/badge"

import { createResume } from "@/actions/resumes"

interface CreateResumeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateResumeDialog({ open, onOpenChange }: CreateResumeDialogProps) {
  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [keyword, setKeyword] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])
  const [isPending, setIsPending] = React.useState(false)

  // Auto-generate slug from name
  React.useEffect(() => {
    setSlug(name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, ""))
  }, [name])

  const addTag = () => {
    const trimmed = keyword.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setKeyword("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    }
  }

  const handleAction = async (formData: FormData) => {
    setIsPending(true)
    try {
      // Add tags to formData
      formData.append("tags", JSON.stringify(tags))
      await createResume(formData)
      onOpenChange(false)
      // Reset form
      setName("")
      setTags([])
    } catch (error) {
      console.error("Failed to create resume:", error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border/50 shadow-2xl">
        <form action={handleAction}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create a new resume</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Start building your resume by giving it a name.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">Name</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Software Engineer Position"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                  required
                />
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 dark:bg-primary/10 text-primary border border-primary/20">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>
                    <span className="font-bold">Tip:</span> You can name the resume referring to the position you are applying for.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-semibold">Resume URL Identifier</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="h-11 font-mono text-xs"
                  readOnly
                />
                <div className="text-[12px] text-muted-foreground flex items-center gap-1.5 ml-1">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  This is a URL-friendly name for your resume.
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Tags / Keywords</Label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[36px] p-2 rounded-md border border-input bg-background/50">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1.5 pl-2.5 pr-1.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-none"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-xs text-muted-foreground/60 self-center ml-1">No tags added...</span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    placeholder="Add a keyword..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1 h-9 w-9 text-muted-foreground hover:text-primary"
                    onClick={addTag}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-[12px] text-muted-foreground flex items-center gap-1.5 ml-1">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  Press <Badge variant="outline" className="text-[10px] px-1 h-4 py-0 font-normal">Enter</Badge> or <Badge variant="outline" className="text-[10px] px-1 h-4 py-0 font-normal">Comma</Badge> to add or save the current keyword.
                </div>
                <p className="text-[12px] text-muted-foreground mt-1 ml-1 opacity-80">
                  Tags can be used to categorize your resume by keywords.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary hover:bg-primary-dark text-primary-foreground px-8 shadow-lg shadow-primary/20 border-none"
            >
              {isPending ? "Creating..." : "Create Resume"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}