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
  Loader2
} from "lucide-react"
import { Toggle } from "@/components/shared/ui/toggle"
import { Separator } from "@/components/shared/ui/separator"
import { Button } from "@/components/shared/ui/button"
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
          "min-h-[inherit] w-full break-words overflow-x-hidden"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const setLink = React.useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)

    if (url === null) {
      return
    }

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

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
      <div className="flex items-center gap-0.5 p-1 border-b bg-muted/20">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 px-0"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 px-0"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          className="h-8 w-8 px-0"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8 px-0"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 w-8 px-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <Toggle
          size="sm"
          pressed={editor.isActive("link")}
          onPressedChange={setLink}
          className="h-8 w-8 px-0"
        >
          <LinkIcon className="h-4 w-4" />
        </Toggle>
      </div>

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
    </div>
  )
}

export { RichTextarea }
