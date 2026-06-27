"use client"

import * as React from "react"
import { ResumeData, defaultResumeData } from "@/types/resume"
import { deepMerge } from "@/lib/deep-merge"
import { v4 as uuidv4 } from "uuid"
import { useAutoSave } from "@/hooks/useAutoSave"

export interface ResumeDataContextType {
  data: ResumeData
  setData: React.Dispatch<React.SetStateAction<ResumeData>>
  updateBasics: (field: string, value: unknown) => void
  updatePicture: (field: string, value: unknown) => void
  addSectionItem: (sectionKey: keyof ResumeData["sections"], defaultItem: Record<string, unknown>) => void
  updateSectionItem: (sectionKey: keyof ResumeData["sections"], id: string, field: string, value: unknown) => void
  deleteSectionItem: (sectionKey: keyof ResumeData["sections"], id: string) => void
  reorderSectionItems: (sectionKey: keyof ResumeData["sections"], startIndex: number, endIndex: number) => void
  updateMetadata: (field: keyof ResumeData["metadata"], value: unknown) => void
  setTemplate: (templateId: string, defaultLayout: Record<string, unknown>) => void
}

export interface BuilderUIContextType {
  zoom: number
  setZoom: React.Dispatch<React.SetStateAction<number>>
  activeSection: string
  setActiveSection: (section: string) => void
  mobileView: "editor" | "preview" | "ai"
  setMobileView: (view: "editor" | "preview" | "ai") => void
  showAiPanel: boolean
  setShowAiPanel: React.Dispatch<React.SetStateAction<boolean>>
  tourOpen: boolean
  setTourOpen: React.Dispatch<React.SetStateAction<boolean>>
  activeAiTab: "ats" | "rewrite" | "suggest" | "coverletter" | "scan"
  setActiveAiTab: React.Dispatch<React.SetStateAction<"ats" | "rewrite" | "suggest" | "coverletter" | "scan">>
}

export interface BuilderMetaContextType {
  title: string
  setTitle: React.Dispatch<React.SetStateAction<string>>
  isSaving: boolean
  resumeId: string
  resumePreviewRef: React.RefObject<HTMLDivElement | null>
}

export interface BuilderContextType extends ResumeDataContextType, BuilderUIContextType, BuilderMetaContextType { }

export const ResumeDataContext = React.createContext<ResumeDataContextType | undefined>(undefined)
export const BuilderUIContext = React.createContext<BuilderUIContextType | undefined>(undefined)
export const BuilderMetaContext = React.createContext<BuilderMetaContextType | undefined>(undefined)
export const BuilderContext = React.createContext<BuilderContextType | undefined>(undefined)

export function BuilderProvider({
  children,
  initialData,
  initialTitle,
  resumeId
}: {
  children: React.ReactNode
  initialData: ResumeData
  initialTitle: string
  resumeId: string
}) {
  const [data, setData] = React.useState<ResumeData>(() => {
    return deepMerge(defaultResumeData, initialData)
  })
  const [zoom, setZoom] = React.useState(100)
  const [activeSection, setActiveSection] = React.useState("")
  const [title, setTitle] = React.useState(initialTitle || "Untitled Resume")
  const [isSaving, setIsSaving] = React.useState(false)
  const resumePreviewRef = React.useRef<HTMLDivElement>(null)

  const [mobileView, setMobileView] = React.useState<"editor" | "preview" | "ai">("editor")
  const [showAiPanel, setShowAiPanel] = React.useState(true)
  const [tourOpen, setTourOpen] = React.useState(false)
  const [activeAiTab, setActiveAiTab] = React.useState<"ats" | "rewrite" | "suggest" | "coverletter" | "scan">("ats")

  // Set initial zoom and default active section on mobile — runs once on mount only.
  // Deliberately not re-running on resize so user zoom adjustments are preserved.
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setZoom(45)
      setActiveSection(prev => prev || "basics")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save logic via custom hook
  useAutoSave(resumeId, data, title, setIsSaving)

  const handleSetActiveSection = React.useCallback((section: string) => {
    setActiveSection(prev => {
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        return section || prev || "basics"
      }
      return prev === section ? "" : section
    })
  }, [])

  // Handlers (stable references via useCallback)
  const updateBasics = React.useCallback((field: string, value: unknown): void => {
    setData(prev => ({
      ...prev,
      basics: { ...prev.basics, [field]: value }
    }))
  }, [])

  const updatePicture = React.useCallback((field: string, value: unknown): void => {
    setData(prev => ({
      ...prev,
      basics: {
        ...prev.basics,
        picture: { ...prev.basics.picture, [field]: value }
      }
    }))
  }, [])

  const addSectionItem = React.useCallback((sectionKey: keyof ResumeData["sections"], defaultItem: Record<string, unknown>): void => {
    setData(prev => {
      const section = prev.sections[sectionKey]
      if (Array.isArray(section)) {
        return {
          ...prev,
          sections: {
            ...prev.sections,
            [sectionKey]: [...section, { ...defaultItem, id: uuidv4() } as never]
          }
        }
      }
      return prev
    })
  }, [])

  const updateSectionItem = React.useCallback((sectionKey: keyof ResumeData["sections"], id: string, field: string, value: unknown): void => {
    setData(prev => {
      if (sectionKey === ("customSections" as any)) {
        return {
          ...prev,
          sections: {
            ...prev.sections,
            customSections: value as any
          }
        }
      }

      const section = prev.sections[sectionKey]
      if (Array.isArray(section)) {
        return {
          ...prev,
          sections: {
            ...prev.sections,
            [sectionKey]: section.map(item => {
              const itemObj = item as Record<string, unknown>
              return itemObj.id === id ? { ...itemObj, [field]: value } : itemObj
            })
          }
        }
      } else if (sectionKey === "summary") {
        return {
          ...prev,
          sections: {
            ...prev.sections,
            summary: { ...prev.sections.summary, [field]: value }
          }
        }
      }
      return prev
    })
  }, [])

  const deleteSectionItem = React.useCallback((sectionKey: keyof ResumeData["sections"], id: string): void => {
    setData(prev => {
      const section = prev.sections[sectionKey]
      if (Array.isArray(section)) {
        return {
          ...prev,
          sections: {
            ...prev.sections,
            [sectionKey]: section.filter(item => {
              const itemObj = item as Record<string, unknown>
              return itemObj.id !== id
            })
          }
        }
      }
      return prev
    })
  }, [])

  const reorderSectionItems = React.useCallback((sectionKey: keyof ResumeData["sections"], startIndex: number, endIndex: number): void => {
    setData(prev => {
      const section = prev.sections[sectionKey]
      if (Array.isArray(section)) {
        const result = [...section]
        const [removed] = result.splice(startIndex, 1)
        result.splice(endIndex, 0, removed)
        return {
          ...prev,
          sections: {
            ...prev.sections,
            [sectionKey]: result as never
          }
        }
      }
      return prev
    })
  }, [])

  const updateMetadata = React.useCallback((field: keyof ResumeData["metadata"], value: unknown): void => {
    setData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }))
  }, [])

  const setTemplate = React.useCallback((templateId: string, defaultLayout: Record<string, unknown>): void => {
    setData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        template: templateId,
        layout: defaultLayout as never
      }
    }))
  }, [])

  const dataContextValue = React.useMemo(() => ({
    data, setData, updateBasics, updatePicture, addSectionItem, updateSectionItem, deleteSectionItem, reorderSectionItems, updateMetadata, setTemplate
  }), [data, setData, updateBasics, updatePicture, addSectionItem, updateSectionItem, deleteSectionItem, reorderSectionItems, updateMetadata, setTemplate])

  const uiContextValue = React.useMemo(() => ({
    zoom, setZoom,
    activeSection,
    setActiveSection: handleSetActiveSection,
    mobileView, setMobileView,
    showAiPanel, setShowAiPanel,
    tourOpen, setTourOpen,
    activeAiTab, setActiveAiTab
  }), [zoom, setZoom, activeSection, handleSetActiveSection, mobileView, setMobileView, showAiPanel, setShowAiPanel, tourOpen, setTourOpen, activeAiTab, setActiveAiTab])
  const metaContextValue = React.useMemo(() => ({
    title, setTitle, isSaving, resumeId, resumePreviewRef
  }), [title, setTitle, isSaving, resumeId, resumePreviewRef])

  const combinedContextValue = React.useMemo(() => ({
    ...dataContextValue,
    ...uiContextValue,
    ...metaContextValue
  }), [dataContextValue, uiContextValue, metaContextValue])

  return (
    <ResumeDataContext.Provider value={dataContextValue}>
      <BuilderUIContext.Provider value={uiContextValue}>
        <BuilderMetaContext.Provider value={metaContextValue}>
          <BuilderContext.Provider value={combinedContextValue}>
            {children}
          </BuilderContext.Provider>
        </BuilderMetaContext.Provider>
      </BuilderUIContext.Provider>
    </ResumeDataContext.Provider>
  )
}

export function useBuilderData(): ResumeDataContextType {
  const context = React.useContext(ResumeDataContext)
  if (context === undefined) {
    throw new Error("useBuilderData must be used within a BuilderProvider")
  }
  return context
}

export function useBuilderUI(): BuilderUIContextType {
  const context = React.useContext(BuilderUIContext)
  if (context === undefined) {
    throw new Error("useBuilderUI must be used within a BuilderProvider")
  }
  return context
}

export function useBuilderMeta(): BuilderMetaContextType {
  const context = React.useContext(BuilderMetaContext)
  if (context === undefined) {
    throw new Error("useBuilderMeta must be used within a BuilderProvider")
  }
  return context
}

export function useBuilder(): BuilderContextType {
  const context = React.useContext(BuilderContext)
  if (context === undefined) {
    throw new Error("useBuilder must be used within a BuilderProvider")
  }
  return context
}
