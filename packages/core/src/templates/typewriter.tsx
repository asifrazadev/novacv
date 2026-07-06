import React from "react"
import { ResumeData } from "@/types/resume"
import { cn, isEmptyHtml } from "@/lib/utils"
import { sanitizeHtml } from "@/lib/sanitize"
import { processHtmlBullets } from "@/lib/html-utils"
import { getTranslation } from "@/lib/i18n"
import { LinkedTitle } from "@/components/shared/ui/linked-title"
import { id } from "zod/v4/locales"

export const TypewriterTemplate = React.memo(function TypewriterTemplate({ data, content }: { data: ResumeData; content?: any }) {
  const { metadata, basics, sections } = data
  const { typography, design, language = "en" } = metadata
  const t = (key: string) => getTranslation(language, key)
  const nameSizeStyle = typography?.nameSize ? `${typography.nameSize}pt` : undefined
  const headlineSizeStyle = typography?.headlineSize ? `${typography.headlineSize}pt` : undefined
  const sectionTitleSizeStyle = typography?.sectionTitleSize ? `${typography.sectionTitleSize}pt` : undefined
  const fontFamily = typography?.fontFamily || "'Courier Prime', 'Courier New', monospace"

  const defaultLayout = {
    main: ["summary", "experience", "skills", "profiles", "education", "projects", "volunteer", "languages", "awards", "certifications", "publications", "references", "interests"],
    sidebar: []
  }
  const rawLayout = (metadata as any).layout
  const layout = {
    main: (rawLayout?.main && Array.isArray(rawLayout.main)) ? rawLayout.main : defaultLayout.main,
    sidebar: (rawLayout?.sidebar && Array.isArray(rawLayout.sidebar)) ? rawLayout.sidebar : defaultLayout.sidebar
  }

  // The reference layout is single-column: sidebar sections render after main sections, in the same list.
  const mainSections = content ? content.main : (layout.main || []).map((id: string) => ({ id }))
  const sidebarSections = content ? content.sidebar : (layout.sidebar || []).map((id: string) => ({ id }))
  const allSections = [...mainSections, ...sidebarSections]
  const showHeader = content ? content.showHeader : true

  const formatDateRange = (item: { startDate?: string; endDate?: string; isCurrent?: boolean; date?: string }) => {
    if (item.startDate) {
      const end = item.isCurrent ? t("present") : (item.endDate || "")
      return `${item.startDate}${end ? ` to ${end}` : ""}`
    }
    return item.date || ""
  }

  // Heading: label + a rule that fills the rest of the row, like the reference.
  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-baseline gap-3 mb-3">
      <span
        className="text-xs font-bold uppercase tracking-[0.08em] whitespace-nowrap"
        style={{ color: "var(--primary)", fontSize: sectionTitleSizeStyle, fontVariant: "small-caps" }}
      >
        {children}
      </span>
      <span className="flex-1 border-b" style={{ borderColor: "var(--primary)", opacity: 0.6 }} />
    </div>
  )

  // Two-column row: a narrow date/label column, then content. Used by every section
  // so body text lines up under one shared left edge, matching the reference.
  const Row = ({ left, children, itemId, className }: { left?: React.ReactNode; children: React.ReactNode; itemId?: string, className?: string }) => (
    <div data-item-id={itemId || undefined} className={`grid gap-x-6 mb-4 ${className || ""}`} style={{ gridTemplateColumns: "150px 1fr" }}>
      <div className="font-bold opacity-80">{left}</div>
      <div>{children}</div>
    </div>
  )

  const renderExperience = (items: any[]) => (
    <>
      {items.map((exp: any, idx: number) => (
        <Row key={exp.id || idx} itemId={exp.id} left={formatDateRange(exp)}>
          <h3 className="font-bold">
            <LinkedTitle show={exp.showLinkInTitle} url={exp.website} fallback={exp.position || exp.company} color="var(--primary)" />
          </h3>
          <div className="opacity-80">{exp.company}{exp.location ? ` - ${exp.location}` : ""}</div>
          {!isEmptyHtml(exp.description) && (
            <div className="mt-1 opacity-80 rich-text text-[0.9em]">{processHtmlBullets(sanitizeHtml(exp.description), exp.id)}</div>
          )}
        </Row>
      ))}
    </>
  )

  const renderSection = (sectionRef: { id: string; itemIds?: string[]; bulletIds?: string[] }) => {
    const { id, itemIds, bulletIds } = sectionRef
    let items: any[] = []
    switch (id) {
      case "summary":
        return sections.summary && !isEmptyHtml(sections.summary.content) ? (
          <section key={id} data-section-id={id} className="mb-6">
            <SectionHeading>{t("profile")}</SectionHeading>
            <Row>
              <div className="rich-text leading-relaxed opacity-80">{/* @ts-ignore */}
                <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(sections.summary.content) }} />
              </div>
            </Row>
          </section>
        ) : null

      case "experience":
        items = itemIds ? sections.experience.filter((e: any) => itemIds.includes(e.id)) : sections.experience
        return items && items.length > 0 ? (
          <section key={id} data-section-id={id} className="mb-6 section-item">
            <SectionHeading>{t("experience")}</SectionHeading>
            {renderExperience(items)}
          </section>
        ) : null

      case "education":
        items = itemIds ? sections.education.filter((e: any) => itemIds.includes(e.id)) : sections.education
        return items && items.length > 0 ? (
          <section key={id} data-section-id={id} className="mb-3">
            <SectionHeading>{t("education")}</SectionHeading>
            {items.map((edu: any) => (
              <Row key={edu.id} itemId={edu.id} left={formatDateRange(edu)}>
                <div className="font-bold">{edu.school}</div>
                <div>{edu.degree ? `${edu.degree} in ${edu.areaOfStudy}` : ""}</div>
                {edu.location && <div className="opacity-80">{edu.location}</div>}
                {!isEmptyHtml(edu.description) && (
                  <div className="mt-1 rich-text opacity-80">{processHtmlBullets(sanitizeHtml(edu.description), edu.id, bulletIds)}</div>
                )}
              </Row>
            ))}
          </section>
        ) : null

      case "skills":
        items = itemIds ? sections.skills.filter((s: any) => itemIds.includes(s.id)) : sections.skills
        const skillsMode = (metadata as any).skillsMode ?? "category"
        return items && items.length > 0 ? (
          <section key={id} data-section-id={id} className="mb-3">
            <SectionHeading>{t("skills")}</SectionHeading>

            {metadata.skillsMode === "simple" ? (
              (() => {
                const names = items.map((s: any) => (typeof s === "string" ? s : (s.name || s))).filter(Boolean)
                const mid = Math.ceil(names.length / 2)
                const left = names.slice(0, mid)
                const right = names.slice(mid)
                return (
                  <Row key="skills-simple">
                    <div className="grid grid-cols-2 gap-3">
                    <ul className="list-disc ml-4 space-y-1">
                      {left.map((n: string, i: number) => (
                        <li key={`l-${i}`}>{n}</li>
                      ))}
                    </ul>
                    <ul className="list-disc ml-4 space-y-1">
                      {right.map((n: string, i: number) => (
                        <li key={`r-${i}`}>{n}</li>
                      ))}
                    </ul>
                  </div>
                  </Row>
                )
              })()
            ) : (<Row>
                {items.map((s: any) => {
                  const name = typeof s === "string" ? s : (s.name || s)
                  const keywords = (s && typeof s === "object" && Array.isArray(s.keywords)) ? s.keywords : undefined
                  return (
                    <div className="mb-2 flex gap-2" key={name}>
                        <p className="font-bold min-w-min ">{name}</p>
                        <div className="flex-1">
                      {keywords && keywords.length > 0 && (
                        <div className="text-xs opacity-75">{keywords.join(", ")}</div>
                      )}
                      </div>
                    </div>
                  )
                })}
                </Row>
            )}
          </section>
        ) : null

      case "projects":
        items = itemIds ? sections.projects.filter((p: any) => itemIds.includes(p.id)) : sections.projects
        return items && items.length > 0 ? (
          <section key={id} data-section-id={id} className="mb-6">
            <SectionHeading>{t("projects")}</SectionHeading>
                {items.map((proj: any) => (
              <Row key={proj.id} itemId={proj.id} className="section-item">
                <div className="font-bold">{proj.name}</div>
                {!isEmptyHtml(proj.description) && <div className="rich-text opacity-80">{processHtmlBullets(sanitizeHtml(proj.description), proj.id, bulletIds)}</div>}
              </Row>
            ))}
          </section>
        ) : null

      case "volunteer":
        items = itemIds ? sections.volunteer.filter((v: any) => itemIds.includes(v.id)) : sections.volunteer
        return items && items.length > 0 ? (
          <section key={id} data-section-id={id} className="mb-6">
            <SectionHeading>{t("volunteer")}</SectionHeading>
            {items.map((vol: any) => (
              <Row key={vol.id} itemId={vol.id}>
                <div className="font-bold">{vol.organization}</div>
                <div className="italic opacity-80">{vol.position}</div>
                {!isEmptyHtml(vol.description) && <div className="rich-text opacity-80">{processHtmlBullets(sanitizeHtml(vol.description), vol.id, bulletIds)}</div>}
              </Row>
            ))}
          </section>
        ) : null

      case "languages": {
        items = itemIds ? sections.languages.filter((l: any) => itemIds.includes(l.id)) : sections.languages
        return items && items.length > 0 ? (
          <section key={id} data-section-id={id} className="mb-6">
            <SectionHeading>{t("languages")}</SectionHeading>
            <Row>
                <div className="opacity-75">
                {items.map((l: any, i: number) => (
                  <span key={l.id || i} className="mr-2">{l.name}{l.level ? ` (${l.level >= 80 ? "Native" : l.level >= 60 ? "Fluent" : l.level >= 40 ? "Advanced" : l.level >= 20 ? "Intermediate" : "Beginner"})` : ""}{i < items.length - 1 ? ", " : ""}</span>
                ))}
              </div>
            </Row>
          </section>
        ) : null
      }

      case "awards": {
        items = itemIds ? sections.awards.filter((a: any) => itemIds.includes(a.id)) : sections.awards
        return items && items.length > 0 ? (
          <section key={id} data-section-id={id} className="mb-6">
            <SectionHeading>{t("awards")}</SectionHeading>
            <div className="space-y-2">
              {items.map((a: any) => (
                <Row key={a.id} itemId={a.id} left={a.date}>
                  <div className="font-bold">{a.title}</div>
                  <div className="italic opacity-75">{a.awarder}</div>
                  {!isEmptyHtml(a.description) && <div className="rich-text opacity-80">{processHtmlBullets(sanitizeHtml(a.description), a.id)}</div>}
                </Row>
              ))}
            </div>
          </section>
        ) : null
      }

      case "certifications": {
        items = itemIds ? sections.certifications.filter((c: any) => itemIds.includes(c.id)) : sections.certifications
        return items && items.length > 0 ? (
          <section key={id} data-section-id={id} className="mb-6">
            <SectionHeading>{t("certifications")}</SectionHeading>
            <div className="space-y-2">
              {items.map((c: any) => (
                <Row key={c.id} itemId={c.id} left={c.date}>
                  <div className="font-bold">{c.name}</div>
                  <div className="italic opacity-75">{c.issuer}</div>
                  {!isEmptyHtml(c.description) && <div className="rich-text opacity-80">{processHtmlBullets(sanitizeHtml(c.description), c.id)}</div>}
                </Row>
              ))}
            </div>
          </section>
        ) : null
      }

      case "publications": {
        items = itemIds ? sections.publications.filter((p: any) => itemIds.includes(p.id)) : sections.publications
        return items && items.length > 0 ? (
          <section key={id} data-section-id={id} className="mb-6">
            <SectionHeading>{t("publications")}</SectionHeading>
            <div className="space-y-2">
              {items.map((p: any) => (
                <Row key={p.id} itemId={p.id} left={p.date}>
                  <div className="font-bold">{p.name}</div>
                  <div className="italic opacity-75">{p.publisher}</div>
                  {!isEmptyHtml(p.description) && <div className="rich-text opacity-80">{processHtmlBullets(sanitizeHtml(p.description), p.id)}</div>}
                </Row>
              ))}
            </div>
          </section>
        ) : null
      }

      case "references": {
        items = itemIds ? sections.references.filter((r: any) => itemIds.includes(r.id)) : sections.references
        return items && items.length > 0 ? (
          <section key={id} data-section-id={id} className="mb-6">
            <SectionHeading>{t("references")}</SectionHeading>
            <div className="space-y-2">
              {items.map((r: any) => (
                <div key={r.id} data-item-id={r.id} className="section-item">
                  <div className="font-bold">{r.name}</div>
                  {!isEmptyHtml(r.description) && <div className="rich-text opacity-80">{processHtmlBullets(sanitizeHtml(r.description), r.id)}</div>}
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      case "interests": {
        items = itemIds ? sections.interests.filter((i: any) => itemIds.includes(i.id)) : sections.interests
        return items && items.length > 0 ? (
          <section key={id} data-section-id={id} className="mb-6">
            <SectionHeading>{t("interests")}</SectionHeading>
            <Row>
              <div className="flex flex-wrap gap-2 text-sm opacity-75">
                {items.map((it: any, idx: number) => (
                  <span key={it.id || idx} className="px-2 py-0.5 border rounded">{it.name}</span>
                ))}
              </div>
            </Row>
          </section>
        ) : null
      }

      default:
        // Handle custom_ sections
        if (id?.startsWith("custom_")) {
          const customSections = (sections as any).customSections ?? []
          const current = customSections.find((c: any) => c.id === id)
          if (!current) return null
          const allItems = current.items ?? []
          items = itemIds ? allItems.filter((it: any) => itemIds.includes(it.id)) : allItems
          return items.length > 0 ? (
            <section key={id} data-section-id={id} className="mb-6">
              <SectionHeading>{current.name}</SectionHeading>
              {items.map((it: any) => (
                <Row key={it.id}>
                  <div className="font-bold">{it.title}</div>
                  {!isEmptyHtml(it.description) && <div className="rich-text opacity-80">{processHtmlBullets(sanitizeHtml(it.description), it.id, bulletIds)}</div>}
                </Row>
              ))}
            </section>
          ) : null
        }
        return null
    }
  }
  const hasProfiles = Array.isArray(sections.profiles) && sections.profiles.length > 0
  return (
    <div
      className="typewriter-template h-full"
      style={{ fontFamily, fontSize: `${typography.fontSize}pt`, color: typography.color, "--primary": design.primaryColor } as any}
    >
      {showHeader && (
        <header className="relative  pb-6 " style={{ borderColor: "var(--primary)" }}>
          {basics.picture?.url && basics.picture?.visible !== false && (
            <div
              style={{ width: basics.picture.size || 72, height: basics.picture.size || 72 }}
              className={cn("absolute top-0 left-0 overflow-hidden rounded-full border", basics.picture.grayscale && "grayscale")}
            >
              <img src={basics.picture.url} alt={basics.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="text-center">
            <h1
              className="font-bold text-3xl tracking-[0.05em]"
              style={{ color: "var(--primary)", fontSize: nameSizeStyle, fontVariant: "small-caps" }}
            >
              {basics.name || "Your Name"}
            </h1>
            {basics.headline && (
              <p className="mt-1 opacity-80 text-sm" style={{ fontSize: headlineSizeStyle }}>{basics.headline}</p>
            )}
            <div className="mt-3 text-sm opacity-80 space-y-1">
              {basics.phone || basics.email || basics.location ? (
                <div>
                  {basics.phone}
                  {basics.phone && basics.email ? " - " : ""}
                  {basics.email}
                  {basics.email && basics.location ? " - " : ""}
                  {basics.location}
                </div>
              ) : null}
                {(basics.website || hasProfiles) && (
                  <div className="flex flex-wrap justify-center gap-2 w-6/10 m-auto opacity-80">
                    {basics.website && (
                      <a href={basics.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {basics.website}
                      </a>
                    )}
                    {basics.website && hasProfiles && <span> - </span>}
                    {hasProfiles && (
                      <span>
                        {sections.profiles.filter(Boolean).map((profile: any, index: number) => (
                          <React.Fragment key={profile?.id || `profile-${index}`}>
                            {profile?.url ? (
                              <a href={profile.url} target="_blank"  data-id={index} rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                {profile.network + "@" + profile.username || profile.url}
                              </a>
                            ) : (
                              <span className="text-blue-500">{profile.network || profile.username || "Profile"}</span>
                            )}
                            {index < sections.profiles.length - 1 ? <span>{" - "}</span> : null}
                          </React.Fragment>
                          
                        ))}
                      </span>
                    )}
                  </div>
                )}
            </div>

          </div>
        </header>
      )}

      <div>
        {allSections.map((ref: any) => (
          <React.Fragment key={ref.id}>{renderSection(ref)}</React.Fragment>
        ))}
      </div>
    </div>
  )
})

export default TypewriterTemplate