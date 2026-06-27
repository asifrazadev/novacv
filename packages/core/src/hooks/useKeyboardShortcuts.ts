"use client"

import { useEffect } from "react"
import { toast } from "sonner"

interface Options {
  onToggleAiPanel: () => void
  onCloseSection: () => void
  onNextSection: () => void
  onPrevSection: () => void
  onExportPDF: () => void
}

/**
 * Global keyboard shortcuts for the resume builder.
 *
 * Cmd/Ctrl+S      — confirm auto-save (save already runs continuously)
 * Cmd/Ctrl+P      — export as PDF
 * Cmd/Ctrl+/      — toggle AI panel
 * Alt+ArrowDown   — go to next section
 * Alt+ArrowUp     — go to previous section
 * Escape          — close active editor section (when not in a text field)
 */
export function useKeyboardShortcuts({
  onToggleAiPanel,
  onCloseSection,
  onNextSection,
  onPrevSection,
  onExportPDF,
}: Options) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      // Cmd/Ctrl+S — save feedback (auto-save is always running)
      if (mod && e.key === "s") {
        e.preventDefault()
        toast.success("Auto-saved", { duration: 1500 })
        return
      }

      // Cmd/Ctrl+P — export PDF (override browser print)
      if (mod && e.key === "p") {
        e.preventDefault()
        toast.promise(Promise.resolve(onExportPDF()), {
          loading: "Generating PDF…",
          success: "PDF exported",
          error: "Export failed",
        })
        return
      }

      // Cmd/Ctrl+/ — toggle AI panel
      if (mod && e.key === "/") {
        e.preventDefault()
        onToggleAiPanel()
        return
      }

      // Alt+ArrowDown — next section
      if (e.altKey && e.key === "ArrowDown") {
        e.preventDefault()
        onNextSection()
        return
      }

      // Alt+ArrowUp — previous section
      if (e.altKey && e.key === "ArrowUp") {
        e.preventDefault()
        onPrevSection()
        return
      }

      // Escape — close active section (only when not typing in a field)
      if (e.key === "Escape") {
        const active = document.activeElement
        const inInput =
          active instanceof HTMLInputElement ||
          active instanceof HTMLTextAreaElement ||
          (active instanceof HTMLElement && active.isContentEditable)
        if (!inInput) {
          onCloseSection()
        }
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onToggleAiPanel, onCloseSection, onNextSection, onPrevSection, onExportPDF])
}
