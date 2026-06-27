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

  const {
    widthMm,
    heightMm,
    paddingMm,
    widthPx,
    heightPx,
    paddingPx,
    availableHeightPx
  } = usePageDimensions(debouncedData.metadata.page)

  useLayoutEffect(() => {
    // Function to calculate exact page splits based on actual DOM measurements
    const calculate = () => {
      const container = measureRef.current
      if (!container) return

      const availableHeight = availableHeightPx

      // 1. Get layout information
      const currentTemplate = getTemplate(debouncedData.metadata?.template || "modern")
      const defaultLayout = currentTemplate?.defaultLayout || {
        main: ["summary", "experience", "education", "projects", "volunteer", "publications", "references"],
        sidebar: ["skills", "languages", "interests", "awards", "certifications", "profiles"]
      }

      const rawLayout = (debouncedData.metadata as any).layout
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

      // Calculate dynamic gap between sections based on the template's CSS (e.g. space-y-4 vs space-y-8)
      const allSections = Array.from(container.querySelectorAll('[data-section-id]')) as HTMLElement[]
      let sectionGap = 32 // Fallback default
      if (allSections.length > 1) {
        const s1 = allSections[0].getBoundingClientRect()
        const s2 = allSections[1].getBoundingClientRect()
        if (s2.top >= s1.bottom) {
          sectionGap = s2.top - s1.bottom
        }
      }

      // Calculate Header Height
      const header = container.querySelector("header")
      const headerHeight = header ? header.getBoundingClientRect().height + sectionGap : 0

      // Calculate Footer Height
      const footer = container.querySelector("footer")
      const footerHeight = footer ? footer.getBoundingClientRect().height + sectionGap : 0

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
        // Filter empty sections first
        const sectionData = debouncedData.sections[sectionId as keyof typeof debouncedData.sections]
        const hasContent = Array.isArray(sectionData) ? sectionData.length > 0 : !!sectionData
        if (!hasContent) return

        const el = getSectionEl(sectionId)
        if (!el) return

        const totalHeight = el.getBoundingClientRect().height
        if (totalHeight <= 0) return

        const itemEls = Array.from(el.querySelectorAll('[data-item-id]')) as HTMLElement[]
        const items = itemEls.map((itemEl) => {
          const bulletEls = Array.from(itemEl.querySelectorAll('[data-bullet-id]')) as HTMLElement[];
          const bullets = bulletEls.map(b => ({
            id: b.getAttribute('data-bullet-id')!,
            height: b.getBoundingClientRect().height
          }));
          const sumBulletsHeight = bullets.reduce((sum, b) => sum + b.height, 0);
          return {
            id: itemEl.getAttribute('data-item-id')!,
            height: itemEl.getBoundingClientRect().height,
            bullets,
            baseHeight: Math.max(0, itemEl.getBoundingClientRect().height - sumBulletsHeight)
          };
        })

        // Detect if items are laid out horizontally (e.g. inline spans or flex-wrap pills)
        // If the second item starts before the first item ends vertically, they are on the same line.
        let isHorizontal = false;
        if (itemEls.length > 1) {
          const rect1 = itemEls[0].getBoundingClientRect();
          const rect2 = itemEls[1].getBoundingClientRect();
          if (rect2.top < rect1.bottom) {
            isHorizontal = true;
          }
        }

        // If the section doesn't have split-supporting item blocks, or if it's horizontally laid out, treat it as an atomic block
        if (items.length === 0 || isHorizontal) {
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
                sidebarHeights[i] = currentHeight + totalHeight + sectionGap
                lastSidebarPageIdx = i
              } else {
                pagesList[i].main.push({ id: sectionId })
                mainHeights[i] = currentHeight + totalHeight + sectionGap
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
              sidebarHeights[nextIdx] = totalHeight + sectionGap
              lastSidebarPageIdx = nextIdx
            } else {
              pagesList[nextIdx].main.push({ id: sectionId })
              mainHeights[nextIdx] = totalHeight + sectionGap
              lastMainPageIdx = nextIdx
            }
          }
          return
        }

        // If the section has items, split them across pages greedily
        const sumItemHeights = items.reduce((sum, item) => sum + item.height, 0)
        
        // Calculate vertical gap between items (e.g. from space-y-X classes)
        let gap = 0;
        if (itemEls.length > 1) {
          const rect1 = itemEls[0].getBoundingClientRect();
          const rect2 = itemEls[1].getBoundingClientRect();
          if (rect2.top >= rect1.bottom) {
            gap = (rect2.top - rect1.bottom) * 1.1; // Add 10% buffer
          }
        }

        const baseHeight = Math.max(0, totalHeight - sumItemHeights - (gap * Math.max(0, items.length - 1)))

        let remainingItems = [...items]
        let pageIdx = isSidebar ? lastSidebarPageIdx : lastMainPageIdx

        // Find the first page where the heading + at least the first item fits
        let guard = 0
        while (guard < 100) {
          guard++
          if (!pagesList[pageIdx]) {
            pagesList[pageIdx] = { main: [], sidebar: [], showHeader: pageIdx === 0, showFooter: true }
            mainHeights[pageIdx] = 0
            sidebarHeights[pageIdx] = 0
          }

          const currentHeight = isSidebar ? (sidebarHeights[pageIdx] ?? 0) : (mainHeights[pageIdx] ?? 0)
          const isPageEmpty = isSidebar ? (pagesList[pageIdx].sidebar.length === 0) : (pagesList[pageIdx].main.length === 0)

          // Infinite loop guard: if first item alone exceeds available space, force placement
          const firstItemHeight = remainingItems[0].height
          if (baseHeight + firstItemHeight >= availableHeight) {
            pageIdx = isSidebar ? lastSidebarPageIdx : lastMainPageIdx
            break
          }

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
          let currentPageBulletIds: string[] | undefined = undefined;

          // Helper to calculate nextItem's actual height based on remaining bullets
          const getActualItemHeight = (item: typeof remainingItems[0]) => {
             if (item.bullets && item.bullets.length > 0) {
                return item.baseHeight + item.bullets.reduce((sum, b) => sum + b.height, 0);
             }
             return item.height;
          };

          while (remainingItems.length > 0) {
            const nextItem = remainingItems[0]
            const currentHeight = isSidebar ? (sidebarHeights[pageIdx] ?? 0) : (mainHeights[pageIdx] ?? 0)
            const gapToAdd = currentPageItems.length > 0 ? gap : 0;
            const actualItemHeight = getActualItemHeight(nextItem);
            
            const availableSpace = availableHeight - (currentHeight + accumulatedHeight + gapToAdd);

            if (actualItemHeight <= availableSpace || (currentPageItems.length === 0 && (!nextItem.bullets || nextItem.bullets.length === 0))) {
              // Fits entirely, OR it's the first item on an empty page and cannot be split
              currentPageItems.push(nextItem.id)
              accumulatedHeight += gapToAdd + actualItemHeight
              
              if (nextItem.bullets && nextItem.bullets.length > 0) {
                 if (!currentPageBulletIds) currentPageBulletIds = [];
                 currentPageBulletIds.push(...nextItem.bullets.map(b => b.id));
              }
              
              remainingItems.shift()
            } else {
              // Does not fit entirely. Try to split by bullets.
              if (nextItem.bullets && nextItem.bullets.length > 0) {
                 let fitBullets = 0;
                 let tempHeight = nextItem.baseHeight;
                 
                 for (let i = 0; i < nextItem.bullets.length; i++) {
                   if (tempHeight + nextItem.bullets[i].height <= availableSpace) {
                     fitBullets++;
                     tempHeight += nextItem.bullets[i].height;
                   } else {
                     break;
                   }
                 }
                 
                 if (fitBullets > 0) {
                   // Fit some bullets
                   currentPageItems.push(nextItem.id);
                   accumulatedHeight += gapToAdd + tempHeight;
                   
                   if (!currentPageBulletIds) currentPageBulletIds = [];
                   currentPageBulletIds.push(...nextItem.bullets.slice(0, fitBullets).map(b => b.id));
                   
                   remainingItems[0] = {
                     ...nextItem,
                     bullets: nextItem.bullets.slice(fitBullets)
                   };
                   break; // Move to next page
                 } else {
                   // Cannot fit even 1 bullet.
                   if (currentPageItems.length === 0) {
                      // Force place at least 1 bullet to avoid infinite loop on empty page
                      currentPageItems.push(nextItem.id);
                      accumulatedHeight += gapToAdd + nextItem.baseHeight + nextItem.bullets[0].height;
                      
                      if (!currentPageBulletIds) currentPageBulletIds = [];
                      currentPageBulletIds.push(nextItem.bullets[0].id);
                      
                      remainingItems[0] = {
                        ...nextItem,
                        bullets: nextItem.bullets.slice(1)
                      };
                   }
                   break; // Move to next page
                 }
              } else {
                 // Cannot be split by bullets
                 if (currentPageItems.length === 0) {
                    // Force place
                    currentPageItems.push(nextItem.id);
                    accumulatedHeight += gapToAdd + actualItemHeight;
                    remainingItems.shift();
                 }
                 break; // Move to next page
              }
            }
          }

          // currentPageBulletIds is already complete: bullets were pushed incrementally
          // during placement above, so no post-processing is needed here.

          // Add the placed items as a split section chunk
          if (isSidebar) {
            pagesList[pageIdx].sidebar.push({ id: sectionId, itemIds: currentPageItems, bulletIds: currentPageBulletIds })
            sidebarHeights[pageIdx] = (sidebarHeights[pageIdx] ?? 0) + accumulatedHeight + sectionGap
            lastSidebarPageIdx = pageIdx
          } else {
            pagesList[pageIdx].main.push({ id: sectionId, itemIds: currentPageItems, bulletIds: currentPageBulletIds })
            mainHeights[pageIdx] = (mainHeights[pageIdx] ?? 0) + accumulatedHeight + sectionGap
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

      let finalPages = pagesList.filter(p => p.main.length > 0 || p.sidebar.length > 0)
      if (finalPages.length === 0) {
        finalPages = [{
          main: [],
          sidebar: [],
          showHeader: true,
          showFooter: true
        }]
      }
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

    if (measureRef.current) {
      const ro = new ResizeObserver(() => calculate())
      ro.observe(measureRef.current)
      return () => ro.disconnect()
    }
  }, [debouncedData, availableHeightPx, mobileView])

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
