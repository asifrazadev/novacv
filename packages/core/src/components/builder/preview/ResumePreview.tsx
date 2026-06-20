"use client"

import React, { useState, useLayoutEffect, useRef } from "react"
import { ResumeData } from "@/types/resume"
import { getTemplate } from "@/templates"
import { PageContent } from "@/templates/modern"
import { useDebounce } from "use-debounce"
import { BuilderContext } from "@/components/builder/builder-context"
import { getFontVariable } from "@/lib/utils"
import { usePageDimensions } from "@/hooks/usePageDimensions"
import { MeasurementLayer } from "./MeasurementLayer"
import { PageContainer } from "./PageContainer"

interface ResumePreviewProps {
  data: ResumeData
  zoom: number
}

export function ResumePreview({ data, zoom }: ResumePreviewProps) {
  const context = React.useContext(BuilderContext)
  const mobileView = context?.mobileView ?? "preview"
  const resumePreviewRef = context?.resumePreviewRef
  const [debouncedData] = useDebounce(data, 500)
  const templateDef = getTemplate(data.metadata?.template || "modern")
  const SelectedTemplate = templateDef.component
  const measureRef = useRef<HTMLDivElement>(null)
  const [pages, setPages] = useState<PageContent[]>([])
  const [renderCount, setRenderCount] = useState(0)

  const {
    widthMm,
    heightMm,
    paddingMm,
    widthPx,
    heightPx,
    paddingPx,
    availableHeightPx
  } = usePageDimensions(debouncedData.metadata.page)

  // Trigger a second measurement after initial mount to handle late render issues
  useLayoutEffect(() => {
    setRenderCount(prev => prev + 1)
  }, [])

  useLayoutEffect(() => {
    const calculate = () => {
      if (!measureRef.current) return

      const container = measureRef.current
      const availableHeight = availableHeightPx

      // 1. Get layout information
      const currentTemplate = getTemplate(data.metadata?.template || "modern")
      const defaultLayout = currentTemplate?.defaultLayout || {
        main: ["summary", "experience", "education", "projects", "volunteer", "publications", "references"],
        sidebar: ["skills", "languages", "interests", "awards", "certifications", "profiles"]
      }

      const rawLayout = (data.metadata as any).layout
      const layout = {
        main: (rawLayout?.main && Array.isArray(rawLayout.main)) ? rawLayout.main : defaultLayout.main,
        sidebar: (rawLayout?.sidebar && Array.isArray(rawLayout.sidebar)) ? rawLayout.sidebar : defaultLayout.sidebar
      }

      const pagesList: PageContent[] = [{
        main: [],
        sidebar: [],
        showHeader: true,
        showFooter: true
      }]

      // Helper to get element by section ID from measurement container
      const getSectionEl = (id: string) => container.querySelector(`[data-section-id="${id}"]`) as HTMLElement

      // Calculate Header Height
      const header = container.querySelector("header")
      const headerHeight = header ? header.getBoundingClientRect().height + 32 : 0

      // Calculate Footer Height
      const footer = container.querySelector("footer")
      const footerHeight = footer ? footer.getBoundingClientRect().height + 32 : 0

      // Check template type (single vs 2-column)
      const isSingleColumn = currentTemplate?.defaultLayout?.sidebar?.length === 0

      // Heights tracks
      const mainHeights = [headerHeight]
      const sidebarHeights = [headerHeight]

      // Track last page index to preserve strict section ordering
      let lastMainPageIdx = 0
      let lastSidebarPageIdx = 0

      // Helper function to place sections and split them across page boundaries when necessary
      const placeSection = (sectionId: string, isSidebar: boolean) => {
        const el = getSectionEl(sectionId)
        if (!el) return

        const totalHeight = el.getBoundingClientRect().height
        if (totalHeight <= 0) return

        const itemEls = Array.from(el.querySelectorAll('[data-item-id]')) as HTMLElement[]
        const items = itemEls.map((itemEl) => ({
          id: itemEl.getAttribute('data-item-id')!,
          height: itemEl.getBoundingClientRect().height
        }))

        // If the section doesn't have split-supporting item blocks, treat it as an atomic block
        if (items.length === 0) {
          let placed = false
          const scanHeights = isSidebar ? sidebarHeights : mainHeights
          const startPageIdx = isSidebar ? lastSidebarPageIdx : lastMainPageIdx
          for (let i = startPageIdx; i < scanHeights.length; i++) {
            const currentHeight = scanHeights[i] ?? 0
            if (currentHeight + totalHeight <= availableHeight) {
              if (!pagesList[i]) {
                pagesList[i] = { main: [], sidebar: [], showHeader: i === 0, showFooter: true }
                mainHeights[i] = mainHeights[i] ?? 0
                sidebarHeights[i] = sidebarHeights[i] ?? 0
              }
              if (isSidebar) {
                pagesList[i].sidebar.push({ id: sectionId })
                sidebarHeights[i] = currentHeight + totalHeight + 32
                lastSidebarPageIdx = i
              } else {
                pagesList[i].main.push({ id: sectionId })
                mainHeights[i] = currentHeight + totalHeight + 32
                lastMainPageIdx = i
              }
              placed = true
              break
            }
          }

          if (!placed) {
            const nextIdx = scanHeights.length
            if (!pagesList[nextIdx]) {
              pagesList[nextIdx] = { main: [], sidebar: [], showHeader: nextIdx === 0, showFooter: true }
              mainHeights[nextIdx] = 0
              sidebarHeights[nextIdx] = 0
            }
            if (isSidebar) {
              pagesList[nextIdx].sidebar.push({ id: sectionId })
              sidebarHeights[nextIdx] = totalHeight + 32
              lastSidebarPageIdx = nextIdx
            } else {
              pagesList[nextIdx].main.push({ id: sectionId })
              mainHeights[nextIdx] = totalHeight + 32
              lastMainPageIdx = nextIdx
            }
          }
          return
        }

        // If the section has items, split them across pages greedily
        const sumItemHeights = items.reduce((sum, item) => sum + item.height, 0)
        const baseHeight = Math.max(0, totalHeight - sumItemHeights)

        let remainingItems = [...items]
        let pageIdx = isSidebar ? lastSidebarPageIdx : lastMainPageIdx

        // Find the first page where the heading + at least the first item fits
        while (true) {
          if (!pagesList[pageIdx]) {
            pagesList[pageIdx] = { main: [], sidebar: [], showHeader: pageIdx === 0, showFooter: true }
            mainHeights[pageIdx] = 0
            sidebarHeights[pageIdx] = 0
          }

          const currentHeight = isSidebar ? (sidebarHeights[pageIdx] ?? 0) : (mainHeights[pageIdx] ?? 0)
          const isPageEmpty = isSidebar ? (pagesList[pageIdx].sidebar.length === 0) : (pagesList[pageIdx].main.length === 0)

          if (isPageEmpty || currentHeight + baseHeight + remainingItems[0].height <= availableHeight) {
            break
          }
          pageIdx++
        }

        // Distribute items across pages
        while (remainingItems.length > 0) {
          if (!pagesList[pageIdx]) {
            pagesList[pageIdx] = { main: [], sidebar: [], showHeader: pageIdx === 0, showFooter: true }
            mainHeights[pageIdx] = 0
            sidebarHeights[pageIdx] = 0
          }

          let currentPageItems: string[] = []
          let accumulatedHeight = baseHeight

          // Must place at least the first item on the starting page
          currentPageItems.push(remainingItems[0].id)
          accumulatedHeight += remainingItems[0].height
          remainingItems.shift()

          // Place more items if they fit on the current page
          while (remainingItems.length > 0) {
            const nextItem = remainingItems[0]
            const currentHeight = isSidebar ? (sidebarHeights[pageIdx] ?? 0) : (mainHeights[pageIdx] ?? 0)
            if (currentHeight + accumulatedHeight + nextItem.height <= availableHeight) {
              currentPageItems.push(nextItem.id)
              accumulatedHeight += nextItem.height
              remainingItems.shift()
            } else {
              break
            }
          }

          // Add the placed items as a split section chunk
          if (isSidebar) {
            pagesList[pageIdx].sidebar.push({ id: sectionId, itemIds: currentPageItems })
            sidebarHeights[pageIdx] = (sidebarHeights[pageIdx] ?? 0) + accumulatedHeight + 32
            lastSidebarPageIdx = pageIdx
          } else {
            pagesList[pageIdx].main.push({ id: sectionId, itemIds: currentPageItems })
            mainHeights[pageIdx] = (mainHeights[pageIdx] ?? 0) + accumulatedHeight + 32
            lastMainPageIdx = pageIdx
          }

          if (remainingItems.length > 0) {
            pageIdx++
          }
        }
      }

      if (isSingleColumn) {
        const allSections = [...layout.main, ...layout.sidebar]
        allSections.forEach((sectionId: string) => {
          placeSection(sectionId, false)
        })
      } else {
        // 2-Column Logic
        // Fill Main
        layout.main.forEach((sectionId: string) => {
          placeSection(sectionId, false)
        })

        // Fill Sidebar
        layout.sidebar.forEach((sectionId: string) => {
          placeSection(sectionId, true)
        })
      }

      const finalPages = pagesList.filter(p => p.main.length > 0 || p.sidebar.length > 0)
      setPages(finalPages)
      
      // Cache pagination for fast export, but only if changed to prevent infinite loops
      if (context?.updateMetadata) {
        const currentCache = JSON.stringify(data.metadata.paginationCache || [])
        const newCache = JSON.stringify(finalPages)
        if (currentCache !== newCache) {
          context.updateMetadata("paginationCache", finalPages)
        }
      }
    }

    calculate()
  }, [debouncedData, renderCount, mobileView])

  const fontFamilyVar = getFontVariable(debouncedData.metadata.typography.fontFamily)

  return (
    <div className={`flex flex-col items-center gap-8 py-12`} style={{ fontFamily: fontFamilyVar }}>
      {/* Hidden measurement container */}
      <MeasurementLayer
        measureRef={(el: HTMLDivElement | null) => {
          ; (measureRef as React.MutableRefObject<HTMLDivElement | null>).current = el
          if (resumePreviewRef) {
            ; (resumePreviewRef as React.MutableRefObject<HTMLDivElement | null>).current = el
          }
        }}
        widthMm={widthMm}
        paddingMm={paddingMm}
        SelectedTemplate={SelectedTemplate}
        data={debouncedData}
      />

      {/* Visible paginated containers */}
      {pages.map((content, index) => (
        <PageContainer
          key={index}
          index={index}
          widthMm={widthMm}
          heightMm={heightMm}
          widthPx={widthPx}
          heightPx={heightPx}
          paddingPx={paddingPx}
          zoom={zoom}
          SelectedTemplate={SelectedTemplate}
          data={debouncedData}
          content={content}
        />
      ))}
    </div>
  )
}
