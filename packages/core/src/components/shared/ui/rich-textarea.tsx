"use client"

import * as React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import { cn } from "@/lib/utils"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Sparkles,
  Loader2,
  Strikethrough,
  Heading1,
  Heading2,
  Code,
  Undo2,
  Redo2,
  Highlighter,
  Baseline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  IndentDecrease,
  IndentIncrease,
  Eraser
} from "lucide-react"
import { Toggle } from "@/components/shared/ui/toggle"
import { Separator } from "@/components/shared/ui/separator"
import { Button } from "@/components/shared/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shared/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/shared/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/shared/ui/dropdown-menu"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"

import Highlight from "@tiptap/extension-highlight"
import Color from "@tiptap/extension-color"
import { TextStyle } from "@tiptap/extension-text-style"
import TextAlign from "@tiptap/extension-text-align"
import { Indent } from "./editor-extensions/indent"

import { useAIStore } from "@/store/use-ai-store"
import { rewriteTextWithAI } from "@/actions/ai"
import { toast } from "sonner"

interface RichTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
  source?: {
    section?: string
    fieldName?: string
    context?: string
  }
}

const RichTextarea = ({
  value,
  onChange,
  placeholder,
  className,
  minHeight = "120px",
  source
}: RichTextareaProps) => {
  const [showAI, setShowAI] = React.useState(false)
  const [tone, setTone] = React.useState("professional")
  const [customPrompt, setCustomPrompt] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState("")
  
  // Link Dialog State
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false)
  const [linkUrl, setLinkUrl] = React.useState("")

  const aiStore = useAIStore()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Indent,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert focus:outline-none max-w-none px-3 py-2 text-sm",
          "min-h-[inherit] w-full break-words overflow-x-hidden",
          "[&_ol]:list-decimal [&_ul]:list-disc [&_ol]:ml-4 [&_ul]:ml-4 [&_li]:my-0.5",
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2",
          "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1",
          "[&_strong]:font-bold [&_em]:italic [&_s]:line-through",
          "[&_code]:font-mono [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const openLinkDialog = React.useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href || ""
    setLinkUrl(previousUrl)
    setIsLinkDialogOpen(true)
  }, [editor])

  const handleSaveLink = () => {
    if (linkUrl === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
    }
    setIsLinkDialogOpen(false)
  }

  const handleRemoveLink = () => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run()
    setIsLinkDialogOpen(false)
  }

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  const handleInlineRewrite = async () => {
    const textContent = editor.getHTML()
    if (!editor.getText().trim()) {
      toast.error("Please write some text to rewrite first.")
      return
    }

    setLoading(true)
    try {
      const response = await rewriteTextWithAI(textContent, tone, {
        provider: aiStore.provider,
        model: aiStore.model,
        baseUrl: aiStore.baseUrl,
        apiKey: aiStore.apiKey
      }, source, customPrompt.trim() || undefined)

      if (response.success && response.text) {
        setResult(response.text)
        toast.success("Suggestions generated!")
      } else {
        toast.error(response.error || "Failed to rewrite.")
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to rewrite.")
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    // result is already TipTap-compatible HTML from the server action
    editor.commands.setContent(result)
    onChange(result)
    setShowAI(false)
    setResult("")
    setCustomPrompt("")
    toast.success("Applied rewrite successfully!")
  }

  return (
    <div className={cn(
      "flex flex-col rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
      className
    )}>
      {/* Toolbar */}
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center gap-0.5 p-1 border-b bg-muted/20 flex-wrap overflow-x-auto">
          {/* Formats */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()} className="h-8 w-8 px-0">
                <Bold className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle size="sm" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()} className="h-8 w-8 px-0">
                <Italic className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle size="sm" pressed={editor.isActive("underline")} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} className="h-8 w-8 px-0">
                <UnderlineIcon className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle size="sm" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()} className="h-8 w-8 px-0">
                <Strikethrough className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Strikethrough</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-4" />

          {/* Colors */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                    <Baseline className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Text Color</TooltipContent>
            </Tooltip>
            <DropdownMenuContent className="w-40 flex flex-col gap-2 p-2">
              <DropdownMenuLabel className="text-xs p-0 pb-1 font-semibold">Presets</DropdownMenuLabel>
              <div className="flex flex-wrap gap-1">
                {["#000000", "#475569", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"].map(color => (
                   <button key={color} type="button" onClick={() => editor.chain().focus().setColor(color).run()} className="w-6 h-6 rounded-md border shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                ))}
              </div>
              <DropdownMenuSeparator />
              <div className="flex items-center gap-2">
                 <Label className="text-xs font-semibold">Custom</Label>
                 <Input type="color" className="w-8 h-8 p-0 border-0 cursor-pointer" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />
                 <Button type="button" variant="ghost" size="icon" className="h-6 w-6 ml-auto hover:bg-destructive/10 hover:text-destructive" onClick={() => editor.chain().focus().unsetColor().run()}><Eraser className="w-3 h-3" /></Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                    <Highlighter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Highlight Color</TooltipContent>
            </Tooltip>
            <DropdownMenuContent className="w-40 flex flex-col gap-2 p-2">
              <DropdownMenuLabel className="text-xs p-0 pb-1 font-semibold">Presets</DropdownMenuLabel>
              <div className="flex flex-wrap gap-1">
                {["#fef08a", "#fbcfe8", "#bfdbfe", "#bbf7d0", "#fed7aa", "#e9d5ff", "#e2e8f0"].map(color => (
                   <button key={color} type="button" onClick={() => editor.chain().focus().setHighlight({ color }).run()} className="w-6 h-6 rounded-md border shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                ))}
              </div>
              <DropdownMenuSeparator />
              <div className="flex items-center gap-2">
                 <Label className="text-xs font-semibold">Custom</Label>
                 <Input type="color" className="w-8 h-8 p-0 border-0 cursor-pointer" onChange={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()} />
                 <Button type="button" variant="ghost" size="icon" className="h-6 w-6 ml-auto hover:bg-destructive/10 hover:text-destructive" onClick={() => editor.chain().focus().unsetHighlight().run()}><Eraser className="w-3 h-3" /></Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="mx-1 h-4" />

          {/* Alignments */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle size="sm" pressed={editor.isActive({ textAlign: 'left' })} onPressedChange={() => editor.chain().focus().setTextAlign('left').run()} className="h-8 w-8 px-0">
                <AlignLeft className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Align Left</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle size="sm" pressed={editor.isActive({ textAlign: 'center' })} onPressedChange={() => editor.chain().focus().setTextAlign('center').run()} className="h-8 w-8 px-0">
                <AlignCenter className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Align Center</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle size="sm" pressed={editor.isActive({ textAlign: 'right' })} onPressedChange={() => editor.chain().focus().setTextAlign('right').run()} className="h-8 w-8 px-0">
                <AlignRight className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Align Right</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle size="sm" pressed={editor.isActive({ textAlign: 'justify' })} onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()} className="h-8 w-8 px-0">
                <AlignJustify className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Justify</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-4" />

          {/* Headings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle size="sm" pressed={editor.isActive("heading", { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="h-8 w-8 px-0">
                <Heading1 className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle size="sm" pressed={editor.isActive("heading", { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="h-8 w-8 px-0">
                <Heading2 className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-4" />

          {/* Lists */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle size="sm" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} className="h-8 w-8 px-0">
                <List className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle size="sm" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} className="h-8 w-8 px-0">
                <ListOrdered className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-4" />

          {/* Indents */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().outdent().run()}>
                <IndentDecrease className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Decrease Indent</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().indent().run()}>
                <IndentIncrease className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Increase Indent</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-4" />

          {/* Insertions */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle size="sm" pressed={editor.isActive("link")} onPressedChange={openLinkDialog} className="h-8 w-8 px-0">
                <LinkIcon className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Link</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle size="sm" pressed={editor.isActive("code")} onPressedChange={() => editor.chain().focus().toggleCode().run()} className="h-8 w-8 px-0">
                <Code className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Code</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-4" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => { editor.chain().focus().clearNodes().unsetAllMarks().run() }}>
                <Eraser className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear Formatting</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <div style={{ minHeight }}>
        <EditorContent editor={editor} className="min-h-[inherit]" />
      </div>

      {/* AI Rewrite Action Bar */}
      <div className="flex flex-col border-t border-border/40 bg-muted/10 p-2 gap-2 text-xs rounded-b-md">
        {!showAI ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] px-2.5 text-muted-foreground hover:text-primary gap-1 font-medium transition-all"
              onClick={() => setShowAI(true)}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              Rewrite with AI
            </Button>
          </div>
        ) : (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Tone row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Tone:</span>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="h-7 text-[11px] rounded-md border border-border/80 bg-background px-2 font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground"
                >
                  <option value="professional">Professional</option>
                  <option value="ats-optimized">ATS Optimized</option>
                  <option value="action-oriented">Action Oriented</option>
                  <option value="concise">Concise &amp; Punchy</option>
                  <option value="technical">Highly Technical</option>
                </select>
              </div>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px] px-2 rounded-md hover:bg-muted text-muted-foreground"
                  onClick={() => {
                    setShowAI(false)
                    setResult("")
                    setCustomPrompt("")
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-7 text-[11px] px-3 rounded-md bg-foreground text-background hover:bg-foreground/90 font-semibold gap-1"
                  onClick={handleInlineRewrite}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Rewriting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      Rewrite
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Custom prompt field */}
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="What to change? e.g. make it more concise, add metrics, focus on leadership..."
              rows={2}
              className="w-full text-[11px] rounded-md border border-border/60 bg-background px-2.5 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground/60"
            />

            {result && (
              <div className="space-y-2 p-2.5 bg-primary/5 dark:bg-primary/10 border border-primary/15 rounded-lg text-xs animate-in fade-in-50 duration-200">
                <div
                  className="rich-text font-medium text-foreground leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: result }}
                />
                <div className="flex justify-end gap-1.5 pt-1 border-t border-primary/10">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleInlineRewrite()}
                  >
                    Retry
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-6 text-[10px] px-2.5 bg-primary text-primary-foreground hover:bg-primary/95 font-semibold"
                    onClick={handleApply}
                  >
                    Apply Rewrite
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription className="sr-only">Enter the URL for the link</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url" className="text-xs">URL</Label>
              <Input 
                id="link-url" 
                value={linkUrl} 
                onChange={(e) => setLinkUrl(e.target.value)} 
                placeholder="https://example.com" 
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSaveLink()
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="ghost" size="sm" onClick={handleRemoveLink} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs">
              Remove Link
            </Button>
            <div className="space-x-2">
               <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsLinkDialogOpen(false)}>Cancel</Button>
               <Button type="button" size="sm" className="h-8 text-xs px-4" onClick={handleSaveLink}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { RichTextarea }
