import React from "react"
import { ResumeData } from "@/types/resume"
import { cn, isEmptyHtml } from "@/lib/utils"
import { sanitizeHtml } from "@/lib/sanitize"
import { processHtmlBullets } from "@/lib/html-utils"
import { SocialIcon } from "@/components/shared/ui/social-icon"
import { getTranslation } from "@/lib/i18n"
import { LinkedTitle } from "@/components/shared/ui/linked-title"

export interface PageContent {
  main: { id: string; itemIds?: string[]; bulletIds?: string[] }[]
  sidebar: { id: string; itemIds?: string[]; bulletIds?: string[] }[]
  showHeader: boolean
  showFooter: boolean
  isContinued?: boolean
}

export const ModernTemplate = React.memo(function ModernTemplate({ data, content }: { data: ResumeData; content?: PageContent }) {
  const { metadata, basics, sections } = data
  const { typography, design, language = "en" } = metadata

  const nameSizeStyle = typography.nameSize ? `${typography.nameSize}pt` : undefined
  const headlineSizeStyle = typography.headlineSize ? `${typography.headlineSize}pt` : undefined
  const sectionTitleSizeStyle = typography.sectionTitleSize ? `${typography.sectionTitleSize}pt` : undefined

  const t = (key: string) => getTranslation(language, key)

  const defaultLayout = {
    main: ["summary", "experience", "education", "projects", "volunteer", "publications", "references"],
    sidebar: ["skills", "languages", "interests", "awards", "certifications", "profiles"]
  }
  const rawLayout = (metadata as any).layout
  const layout = {
    main: (rawLayout?.main && Array.isArray(rawLayout.main)) ? rawLayout.main : defaultLayout.main,
    sidebar: (rawLayout?.sidebar && Array.isArray(rawLayout.sidebar)) ? rawLayout.sidebar : defaultLayout.sidebar
  }

  const mainSections = content ? content.main : (layout.main || []).map((id: string) => ({ id }))
  const sidebarSections = content ? content.sidebar : (layout.sidebar || []).map((id: string) => ({ id }))

  const formatDateRange = (item: { startDate?: string; endDate?: string; isCurrent?: boolean; date?: string }) => {
    if (item.startDate) {
      const end = item.isCurrent ? t("present") : (item.endDate || "")
      return `${item.startDate}${end ? ` – ${end}` : ""}`
    }
    return item.date || ""
  }

  const SectionHeading = ({ children, className = "mb-4" }: { children: React.ReactNode; className?: string }) => (
    <h2 className={cn("text-sm font-bold uppercase tracking-widest", className)} style={{ color: "var(--primary)", fontSize: sectionTitleSizeStyle }}>
      {children}
    </h2>
  )

  const renderSection = (sectionRef: { id: string; itemIds?: string[]; bulletIds?: string[] }) => {
    const bulletIds = sectionRef.bulletIds;
    const id = sectionRef.id
    const itemIds = sectionRef.itemIds
    let isContinued = false
    if (id.startsWith("custom_")) {
      const customSections = (sections as any).customSections ?? []
      const currentSection = customSections.find((c: any) => c.id === id)
      isContinued = !!(itemIds && itemIds.length > 0 && currentSection?.items?.[0] && itemIds[0] !== currentSection.items[0].id)
    } else {
      isContinued = !!(itemIds && itemIds.length > 0 && itemIds[0] !== (sections as any)[id]?.[0]?.id)
    }

    switch (id) {
      case "summary":
        return !isEmptyHtml(sections.summary?.content) && (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading className="mb-3">
              {t("profile")} {isContinued && <span className="text-[10px] opacity-40 lowercase ml-2">{t("continued")}</span>}
            </SectionHeading>
            <div
              className="rich-text wrap-break-word text-justify leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(sections.summary.content) }}
            />
          </section>
        )
      case "experience": {
        const items = itemIds
          ? sections.experience.filter(item => itemIds.includes(item.id))
          : sections.experience

        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading className="mb-4  ">
              {t("experience")} {isContinued && <span className="text-[10px] opacity-40 lowercase ml-2">{t("continued")}</span>}
            </SectionHeading>
            <div className="space-y-6">
              {items.map((exp, index) => (
                <div key={index} data-item-id={exp.id} className="section-item space-y-2">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-baseline gap-2 w-[80%]">
                      <h3 className="text-base font-bold text-wrap w-full ">
                        <LinkedTitle
                          show={exp.showLinkInTitle}
                          url={exp.website}
                          fallback={exp.company}
                          color="var(--primary)"
                        />
                      </h3>
                    </div>
                    <span className="text-xs opacity-55 font-medium shrink-0 ml-2">{exp.location}</span>
                  </div>
                  {exp.roles && exp.roles.length > 0 ? (
                    <div className="relative pl-4 space-y-2">
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-px" style={{ backgroundColor: "var(--primary)", opacity: 0.25 }} />
                      {exp.roles.map((role, index) => (
                        <div key={index} className="space-y-1">
                          <div className="relative flex justify-between items-baseline">
                            <div className="absolute -left-5 top-1.5 w-2 h-2 rounded-full border-2 bg-background" style={{ borderColor: "var(--primary)" }} />
                            <span className="text-sm font-semibold italic opacity-85">{role.title}</span>
                            <span className="text-[11px] opacity-55 shrink-0 ml-2">{formatDateRange(role)}</span>
                          </div>
                          {role.description && !isEmptyHtml(role.description) && (
                            <div
                              className="opacity-65 rich-text pl-5 leading-relaxed text-[0.8em]"
                              >
                      {processHtmlBullets(sanitizeHtml(role.description), role.id, bulletIds)}
                    </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-between items-baseline italic opacity-80">
                      <span className="text-sm">{exp.position}</span>
                      <span className="text-xs opacity-70 shrink-0 ml-2">{formatDateRange(exp)}</span>
                    </div>
                  )}
                  {(!exp.roles || exp.roles.length === 0) && !isEmptyHtml(exp.description) && (
                    <div
                      className="mt-1 opacity-65 rich-text pl-5 leading-relaxed text-[0.8em]"
                      >
                      {processHtmlBullets(sanitizeHtml(exp.description), exp.id, bulletIds)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      case "education": {
        const items = itemIds
          ? sections.education.filter(item => itemIds.includes(item.id))
          : sections.education

        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading className="mb-4">
              {t("education")} {isContinued && <span className="text-[10px] opacity-40 lowercase ml-2">{t("continued")}</span>}
            </SectionHeading>
            <div className="space-y-5">
              {items.map((edu, index) => (
                <div key={index} data-item-id={edu.id} className="section-item space-y-1">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-baseline gap-2 w-[80%]">
                      <h3 className="text-base font-bold text-wrap w-full">
                        <LinkedTitle
                          show={edu.showLinkInTitle}
                          url={edu.website}
                          fallback={edu.school}
                          color="var(--primary)"
                        />
                      </h3>
                    </div>
                    <span className="text-xs opacity-55 font-medium shrink-0">{formatDateRange(edu)}</span>
                  </div>
                  <div className="flex justify-between items-baseline opacity-80">
                    <span className="text-sm italic">{[edu.degree, edu.areaOfStudy].filter(Boolean).join(" · ")}</span>
                    <span className="text-xs shrink-0 ml-2">{edu.location}</span>
                  </div>
                  {!isEmptyHtml(edu.description) && (
                    <div
                      className="mt-1 opacity-65 rich-text pl-5 leading-relaxed text-[0.8em]"
                      >
                      {processHtmlBullets(sanitizeHtml(edu.description), edu.id, bulletIds)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      case "skills": {
        const items = itemIds
          ? sections.skills.filter(item => itemIds.includes(item.id))
          : sections.skills
        const skillsMode = (metadata as any).skillsMode ?? "category"

        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading className="mb-4">
              {t("skills")} {isContinued && <span className="text-[10px] opacity-40 lowercase ml-2">{t("continued")}</span>}
            </SectionHeading>

            {skillsMode === "simple" ? (
              // ── Simple: flat pill tags ──
              <div className="flex flex-wrap gap-1.5">
                {items.map((s, index) => (
                  <span
                    key={index}
                    data-item-id={s.id}
                    className="section-item text-[0.78em] px-2.5 py-1 rounded-full border font-medium"
                    style={{ borderColor: "var(--primary)", color: "var(--primary)", opacity: 0.85 }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            ) : (
              // ── Category: name + keywords ──
              <div className="space-y-2.5">
                {items.map((s, index) => (
                  <div key={index} data-item-id={s.id} className="section-item">
                    <span className="text-xs font-bold block mb-0.5">{s.name}</span>
                    {s.keywords && s.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {s.keywords.map((kw: string, ki: number) => (
                          <span key={ki} className="text-[0.75em] px-2 py-0.5 bg-muted/40 rounded border border-muted/60 opacity-80">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null
      }

      case "languages": {
        const items = itemIds
          ? sections.languages.filter(item => itemIds.includes(item.id))
          : sections.languages

        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading className="mb-4">
              {t("languages")} {isContinued && <span className="text-[10px] opacity-40 lowercase ml-2">{t("continued")}</span>}
            </SectionHeading>
            <div className="space-y-2">
              {items.map((l, index) => (
                <div key={index} data-item-id={l.id} className="section-item flex justify-between items-center">
                  <span className="font-semibold">{l.name}</span>
                  <div className="flex gap-1">
                    {[20, 40, 60, 80, 100].map(v => (
                      <div key={v} className={cn("w-1.5 h-1.5 rounded-full", l.level >= v ? "bg-primary" : "bg-muted opacity-30")} style={l.level >= v ? { backgroundColor: "var(--primary)" } : {}} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      case "projects": {
        const items = itemIds
          ? sections.projects.filter(item => itemIds.includes(item.id))
          : sections.projects

        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading className="mb-4">
              {t("projects")} {isContinued && <span className="text-[10px] opacity-40 lowercase ml-2">{t("continued")}</span>}
            </SectionHeading>
            <div className="space-y-5">
              {items.map((proj, index) => (
                <div key={index} data-item-id={proj.id} className="section-item space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-baseline gap-2 w-[80%]">
                      <h3 className="text-base font-bold text-wrap w-full">
                        <LinkedTitle
                          show={proj.showLinkInTitle}
                          url={proj.url}
                          fallback={proj.name}
                          color="var(--primary)"
                        />
                      </h3>
                    </div>
                    <span className="text-xs opacity-55 font-medium shrink-0 ml-2">{formatDateRange(proj)}</span>
                  </div>
                  {!isEmptyHtml(proj.description) && (
                    <div
                      className="opacity-65 rich-text pl-5 leading-relaxed text-[0.8em]"
                      >
                      {processHtmlBullets(sanitizeHtml(proj.description), proj.id, bulletIds)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      case "volunteer": {
        const items = itemIds
          ? sections.volunteer.filter(item => itemIds.includes(item.id))
          : sections.volunteer

        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading className="mb-4">
              {t("volunteer")} {isContinued && <span className="text-[10px] opacity-40 lowercase ml-2">{t("continued")}</span>}
            </SectionHeading>
            <div className="space-y-6">
              {items.map((vol, index) => (
                <div key={index} data-item-id={vol.id} className="section-item space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-baseline gap-2 w-[80%]">
                      <h3 className="text-base font-bold text-wrap w-full">
                        <LinkedTitle
                          show={vol.showLinkInTitle}
                          url={vol.website}
                          fallback={vol.organization}
                          color="var(--primary)"
                        />
                      </h3>
                    </div>
                    <span className="text-xs opacity-55 font-medium shrink-0 ml-2">{formatDateRange(vol)}</span>
                  </div>
                  <p className="text-sm italic opacity-80">{vol.position}</p>
                  {!isEmptyHtml(vol.description) && (
                    <div
                      className="opacity-65 rich-text pl-5 leading-relaxed text-[0.8em]"
                      >
                      {processHtmlBullets(sanitizeHtml(vol.description), vol.id, bulletIds)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      case "awards": {
        const items = itemIds
          ? sections.awards.filter(item => itemIds.includes(item.id))
          : sections.awards

        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading className="mb-4">
              {t("awards")} {isContinued && <span className="text-[10px] opacity-40 lowercase ml-2">{t("continued")}</span>}
            </SectionHeading>
            <div className="space-y-3">
              {items.map((a, index) => (
                <div key={index} data-item-id={a.id} className="section-item space-y-1">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-baseline gap-2 w-[80%]">
                      <h4 className="text-sm font-bold text-wrap w-full">
                        <LinkedTitle
                          show={a.showLinkInTitle}
                          url={a.url}
                          fallback={a.title}
                          color="var(--primary)"
                        />
                      </h4>
                    </div>
                    <span className="text-[10px] opacity-45 font-medium shrink-0 ml-2">{a.date}</span>
                  </div>
                  <p className="text-xs opacity-70 italic">{a.awarder}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      case "certifications": {
        const items = itemIds
          ? sections.certifications.filter(item => itemIds.includes(item.id))
          : sections.certifications

        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading className="mb-4">
              {t("certifications")} {isContinued && <span className="text-[10px] opacity-40 lowercase ml-2">{t("continued")}</span>}
            </SectionHeading>
            <div className="space-y-3">
              {items.map((c, index) => (
                <div key={index} data-item-id={c.id} className="section-item space-y-1">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-baseline">
                      <h4 className="text-sm font-bold text-wrap w-full">
                        <LinkedTitle
                          show={c.showLinkInTitle}
                          url={c.url}
                          fallback={c.name}
                          color="var(--primary)"
                        />
                      </h4>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <p className="text-xs opacity-70 italic">{c.issuer}</p>
                    <span className="text-[10px] opacity-45 font-medium shrink-0 ml-2">{c.date}</span>
                  </div>

                  {!isEmptyHtml(c.description) && (
                    <div
                      className="mt-1 opacity-65 rich-text pl-5 leading-relaxed text-[0.8em]"
                      >
                      {processHtmlBullets(sanitizeHtml(c.description), c.id, bulletIds)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      case "interests": {
        const items = itemIds
          ? sections.interests.filter(item => itemIds.includes(item.id))
          : sections.interests

        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading className="mb-4">
              {t("interests")} {isContinued && <span className="text-[10px] opacity-40 lowercase ml-2">{t("continued")}</span>}
            </SectionHeading>
            <div className="flex flex-wrap gap-2">
              {items.map((i, index) => (
                <span key={index} data-item-id={i.id} className="section-item text-xs px-2 py-1 bg-muted/30 rounded border border-muted/50">{i.name}</span>
              ))}
            </div>
          </section>
        ) : null
      }

      case "profiles": {
        return sections.profiles.length > 0 && (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading className="mb-4">{t("social")}</SectionHeading>
            <div className="flex flex-wrap gap-3">
              {sections.profiles.map((p, index) => (
                <div key={index} className="section-item flex items-center gap-1.5 text-xs">
                  <SocialIcon network={p.icon || undefined} url={p.icon ? undefined : (p.url || "")} style={{ height: 18, width: 18 }} />
                  <span className="font-semibold">{p.username || p.network}</span>
                </div>
              ))}
            </div>
          </section>
        )
      }

      default: {
        if (id.startsWith("custom_")) {
          const customSections = (sections as any).customSections ?? []
          const currentSection = customSections.find((c: any) => c.id === id)
          if (!currentSection) return null

          const allItems = currentSection.items ?? []
          const items = itemIds
            ? allItems.filter((item: any) => itemIds.includes(item.id))
            : allItems

          return items.length > 0 ? (
            <section key={id} data-section-id={id} className="section-block">
              <SectionHeading className="mb-4">
                {currentSection.name} {isContinued && <span className="text-[10px] opacity-40 lowercase ml-2">{t("continued")}</span>}
              </SectionHeading>
              <div className="space-y-5">
                {items.map((item: any, index: number) => (
                  <div key={index} data-item-id={item.id} className="section-item space-y-1">
                    <div className="flex justify-between items-baseline">
                      <div className="flex items-baseline gap-2 w-[80%]">
                        <h3 className="text-base font-bold text-wrap w-full">
                          <LinkedTitle
                            show={!!item.url}
                            url={item.url}
                            fallback={item.title}
                            color="var(--primary)"
                          />
                        </h3>
                      </div>
                      <span className="text-xs opacity-55 font-medium shrink-0">{formatDateRange(item)}</span>
                    </div>
                    <div className="flex justify-between items-baseline opacity-80">
                      <span className="text-sm italic">{item.subtitle}</span>
                      <span className="text-xs shrink-0 ml-2">{item.location}</span>
                    </div>
                    {!isEmptyHtml(item.description) && (
                      <div
                        className="mt-1 opacity-65 rich-text pl-5 leading-relaxed text-[0.8em]"
                        >
                      {processHtmlBullets(sanitizeHtml(item.description), item.id, bulletIds)}
                    </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ) : null
        }
        return null
      }
    }
  }

  const showHeader = content ? content.showHeader : true

  return (
    <div
      className="modern-template h-full flex flex-col"
      style={{
        fontFamily: typography.fontFamily,
        fontSize: `${typography.fontSize}pt`,
        lineHeight: typography.lineHeight,
        color: typography.color,
        "--primary": design.primaryColor,
      } as any}
    >
      {showHeader && (
        <header className="flex justify-between items-start border-b-2 pb-6 mb-8" style={{ borderColor: "var(--primary)" }}>
          <div className="flex-1">
            <h1 className="font-extrabold tracking-tight" style={{ color: "var(--primary)", fontSize: nameSizeStyle }}>{basics.name || "Your Name"}</h1>
            <p className="font-medium mt-1 opacity-80" style={{ fontSize: headlineSizeStyle }}>{basics.headline || "Your Professional Headline"}</p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-70">
              {basics.email && <span>{basics.email}</span>}
              {basics.phone && <span>{basics.phone}</span>}
              {basics.location && <span>{basics.location}</span>}
            </div>
          </div>
          {basics.picture?.url && basics.picture?.visible !== false && (
            <div
              className={cn("shrink-0 ml-8 overflow-hidden", basics.picture.grayscale && "grayscale")}
              style={{
                width: `${basics.picture.size}px`,
                height: `${basics.picture.size}px`,
                borderRadius: `${basics.picture.borderRadius}%`,
                border: `${basics.picture.borderWidth}px solid var(--primary)`,
                boxShadow: basics.picture.shadow ? `0 ${basics.picture.shadow}px ${basics.picture.shadow * 1.5}px rgba(0,0,0,0.15)` : undefined,
                transform: basics.picture.rotation ? `rotate(${basics.picture.rotation}deg)` : undefined
              }}
            >
              <img src={basics.picture.url} alt={basics.name} className="w-full h-full object-cover" />
            </div>
          )}
        </header>
      )}

      <div className="flex-1 grid grid-cols-12 gap-8">
        {/* Main Column */}
        <div className={cn(layout.sidebar.length > 0 ? "col-span-8" : "col-span-12", "space-y-8 min-w-0")}>
          {mainSections.map((ref: any) => (
            <React.Fragment key={ref.id}>{renderSection(ref)}</React.Fragment>
          ))}
        </div>

        {/* Sidebar Column */}
        {layout.sidebar.length > 0 && (
          <div className="col-span-4 space-y-8 border-l pl-8 h-full min-h-[500px] min-w-0">
            {sidebarSections.map((ref: any) => (
              <React.Fragment key={ref.id}>{renderSection(ref)}</React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
