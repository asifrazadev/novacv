// templates/academic.tsx
// Based on the popular Indian CS LaTeX resume style
// Small-caps section headings with full-width rule, two-column header, dense layout

import React from "react"
import { ResumeData } from "@/types/resume"
import { sanitizeHtml } from "@/lib/sanitize"
import { processHtmlBullets } from "@/lib/html-utils"
import { isEmptyHtml } from "@/lib/utils"
import { getTranslation } from "@/lib/i18n"

export interface PageContent {
  main: { id: string; itemIds?: string[]; bulletIds?: string[] }[]
  sidebar: { id: string; itemIds?: string[]; bulletIds?: string[] }[]
  showHeader: boolean
  showFooter: boolean
  isContinued?: boolean
}

export const AcademicTemplate = React.memo(function AcademicTemplate({ data, content }: { data: ResumeData; content?: PageContent }) {
  const { metadata, basics, sections } = data
  const { typography, design, language = "en" } = metadata

  const t = (key: string) => getTranslation(language, key)
  const primary = design?.primaryColor ?? "#000000"
  const nameSizeStyle = typography?.nameSize ? `${typography.nameSize}pt` : "18pt"
  const sectionTitleSizeStyle = typography?.sectionTitleSize ? `${typography.sectionTitleSize}pt` : "10pt"

  const defaultLayout = {
    main: ["summary", "education", "experience", "projects", "skills", "awards", "certifications", "volunteer", "publications", "references", "languages", "interests", "profiles"],
    sidebar: [],
  }

  const rawLayout = (metadata as any).layout
  const layout = {
    main: rawLayout?.main && Array.isArray(rawLayout.main) ? rawLayout.main : defaultLayout.main,
    sidebar: [],
  }

  const mainSections = content ? content.main : layout.main.map((id: string) => ({ id }))
  const showHeader = content ? content.showHeader : true

  const formatDateRange = (item: {
    startDate?: string
    endDate?: string
    isCurrent?: boolean
    date?: string
  }) => {
    if (item.startDate) {
      const end = item.isCurrent ? t("present") : item.endDate || ""
      return `${item.startDate}${end ? ` – ${end}` : ""}`
    }
    return item.date || ""
  }

  // ── Section Heading: small caps + full-width colored rule ─────────────────
  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-2 mt-1">
      <h2
        className="uppercase tracking-[0.12em] font-bold"
        style={{ fontSize: sectionTitleSizeStyle, color: primary }}
      >
        {children}
      </h2>
      <div className="w-full mt-0.5" style={{ height: "1.5px", backgroundColor: primary }} />
    </div>
  )

  // ── Two-column row: left content, right aligned text ─────────────────────
  const Row = ({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) => (
    <div className="flex justify-between items-baseline gap-2 ">
      <div className="flex-1 min-w-0">{left}</div>
      {right && <div className="shrink-0 text-right pl-3 min-w-fit">{right}</div>}
    </div>
  )

  // ── Linked title: respects showLinkInTitle + websiteLabel ─────────────────
  const LinkedTitle = ({
    show,
    url,
    label,
    fallback,
    className = "",
  }: {
    show?: boolean
    url?: string
    label?: string
    fallback: string
    className?: string
  }) => {
    if (show && url) {
      const href = url.startsWith("http") ? url : `https://${url}`
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={`hover:underline ${className}`} style={{ color: primary }}>
          {label || fallback}
        </a>
      )
    }
    return <>{fallback}</>
  }

  // ── Summary section ───────────────────────────────────────────────────────
  const renderSummary = () => {
    if (isEmptyHtml(sections.summary?.content)) return null
    return (
      <section key="summary" data-section-id="summary" className="section-block mb-3">
        <SectionHeading>{t("profile")}</SectionHeading>
        <div
          className="rich-text text-justify text-[0.88em] leading-relaxed opacity-90 mt-1"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(sections.summary.content) }}
        />
      </section>
    )
  }

  // ── Section renderer ──────────────────────────────────────────────────────
  const renderSection = (sectionRef: { id: string; itemIds?: string[]; bulletIds?: string[] }) => {
    const bulletIds = sectionRef.bulletIds;
    const { id, itemIds } = sectionRef

    switch (id) {
      case "summary":
        return renderSummary()

      case "education": {
        const items = itemIds
          ? sections.education.filter((e) => itemIds.includes(e.id))
          : sections.education
        if (!items.length) return null
        return (
          <section key={id} data-section-id={id} className="section-block mb-3">
            <SectionHeading>{t("education")}</SectionHeading>
            <div className="mt-1 space-y-2">
              {items.map((edu, i) => (
                <div key={i} data-item-id={edu.id} className="section-item">
                  <Row
                    left={
                      <span className="font-bold text-[0.9em]">
                        <LinkedTitle
                          show={edu.showLinkInTitle}
                          url={edu.website}
                          fallback={edu.school}
                        />
                      </span>
                    }
                    right={<span className="text-[0.78em] italic opacity-70">{formatDateRange(edu)}</span>}
                  />
                  <Row
                    left={
                      <span className="text-[0.82em] italic opacity-80">
                        {[edu.degree, edu.areaOfStudy].filter(Boolean).join(", ")}
                      </span>
                    }
                    right={edu.grade ? <span className="text-[0.78em] opacity-65">{edu.grade}</span> : undefined}
                  />
                  {edu.location && (
                    <span className="text-[0.78em] opacity-55">{edu.location}</span>
                  )}
                  {edu.description && (
                    <div
                      className="rich-text mt-1 text-[0.8em] opacity-80 leading-snug pl-4"
                      >
                      {processHtmlBullets(sanitizeHtml(edu.description), edu.id, bulletIds)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )
      }

      case "experience": {
        const items = itemIds
          ? sections.experience.filter((e) => itemIds.includes(e.id))
          : sections.experience
        if (!items.length) return null
        return (
          <section key={id} data-section-id={id} className="section-block mb-3">
            <SectionHeading>{t("experience")}</SectionHeading>
            <div className="mt-1 space-y-2.5">
              {items.map((exp, i) => (
                <div key={i} data-item-id={exp.id} className="section-item">
                  <Row
                    left={
                      <span className="font-bold text-[0.9em] ">
                        <LinkedTitle
                          show={exp.showLinkInTitle}
                          url={exp.website}
                          fallback={exp.company}
                        />
                      </span>
                    }
                    right={<span className="text-[0.78em] opacity-60 italic">{exp.location}</span>}
                  />
                  {exp.roles && exp.roles.length > 0 ? (
                    <div className="space-y-1.5">
                      {exp.roles.map((role, ri) => (
                        <div key={ri}>
                          <Row
                            left={<span className="text-[0.82em] italic opacity-80">{role.title}</span>}
                            right={<span className="text-[0.78em] italic opacity-65">{formatDateRange(role)}</span>}
                          />
                          {role.description && (
                            <div
                              className="rich-text academic-bullets text-[0.8em] opacity-85 leading-snug"
                              >
                      {processHtmlBullets(sanitizeHtml(role.description), role.id, bulletIds)}
                    </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <Row
                        left={<span className="text-[0.82em] italic opacity-80">{exp.position}</span>}
                        right={<span className="text-[0.78em] italic opacity-65">{formatDateRange(exp)}</span>}
                      />
                      {exp.description && (
                        <div
                          className="rich-text academic-bullets text-[0.8em] opacity-85 leading-snug mt-0.5"
                          >
                      {processHtmlBullets(sanitizeHtml(exp.description), exp.id, bulletIds)}
                    </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )
      }

      case "projects": {
        const items = itemIds
          ? sections.projects.filter((p) => itemIds.includes(p.id))
          : sections.projects
        if (!items.length) return null
        return (
          <section key={id} data-section-id={id} className="section-block mb-3">
            <SectionHeading>{t("projects")}</SectionHeading>
            <div className="mt-1 space-y-2.5">
              {items.map((proj, i) => (
                <div key={i} data-item-id={proj.id} className="section-item">
                  <Row
                    left={
                      <span className="font-bold text-[0.9em]">
                        <LinkedTitle
                          show={proj.showLinkInTitle}
                          url={proj.url}
                          fallback={proj.name}
                        />
                      </span>
                    }
                    right={<span className="text-[0.78em] italic opacity-65">{formatDateRange(proj)}</span>}
                  />
                  {proj.description && (
                    <div
                      className="rich-text academic-bullets text-[0.8em] opacity-85 leading-snug mt-0.5"
                      >
                      {processHtmlBullets(sanitizeHtml(proj.description), proj.id, bulletIds)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )
      }

      case "skills": {
        const items = itemIds
          ? sections.skills.filter((s) => itemIds.includes(s.id))
          : sections.skills
        const skillsMode = (metadata as any).skillsMode ?? "category"
        if (!items.length) return null
        return (
          <section key={id} data-section-id={id} className="section-block mb-3">
            <SectionHeading>{t("skills")}</SectionHeading>
            <div className="mt-1">
              {skillsMode === "simple" ? (
                // Simple: comma-separated inline
                <div className="text-[0.82em] leading-relaxed">
                  {items.map((s: any, i: number) => (
                    <span key={i} data-item-id={s.id} className="section-item">
                      {s.name}{i < items.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              ) : (
                // Category: bold label + colon + values
                <div className="space-y-0.5">
                  {items.map((s: any, i: number) => (
                    <div key={i} data-item-id={s.id} className="section-item text-[0.82em]">
                      <span className="font-bold">{s.name}</span>
                      {s.keywords && s.keywords.length > 0 && (
                        <span className="opacity-80">
                          {": "}{Array.isArray(s.keywords) ? s.keywords.join(", ") : s.keywords}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )
      }

      case "awards": {
        const items = itemIds
          ? sections.awards.filter((a) => itemIds.includes(a.id))
          : sections.awards
        if (!items.length) return null
        return (
          <section key={id} data-section-id={id} className="section-block mb-3">
            <SectionHeading>{t("awards")}</SectionHeading>
            <div className="mt-1 space-y-1.5">
              {items.map((a, i) => (
                <div key={i} data-item-id={a.id} className="section-item">
                  <Row
                    left={
                      <span className="font-bold text-[0.85em]">
                        <LinkedTitle
                          show={a.showLinkInTitle}
                          url={a.url}
                          fallback={a.title}
                        />
                      </span>
                    }
                    right={<span className="text-[0.78em] italic opacity-65">{a.date}</span>}
                  />
                  {a.awarder && <span className="text-[0.78em] italic opacity-70">{a.awarder}</span>}
                </div>
              ))}
            </div>
          </section>
        )
      }

      case "certifications": {
        const items = itemIds
          ? sections.certifications.filter((c) => itemIds.includes(c.id))
          : sections.certifications
        if (!items.length) return null
        return (
          <section key={id} data-section-id={id} className="section-block mb-3">
            <SectionHeading>{t("certifications")}</SectionHeading>
            <div className="mt-1 space-y-1.5">
              {items.map((c, i) => (
                <div key={i} data-item-id={c.id} className="section-item">
                  <Row
                    left={
                      <span className="font-bold text-[0.85em]">
                        <LinkedTitle
                          show={c.showLinkInTitle}
                          url={c.url}
                          fallback={c.name}
                        />
                      </span>
                    }
                    right={<span className="text-[0.78em] italic opacity-65">{c.date}</span>}
                  />
                  {c.issuer && <span className="text-[0.78em] italic opacity-70">{c.issuer}</span>}
                  {c.description && (
                    <div
                      className="rich-text academic-bullets text-[0.8em] opacity-85 leading-snug mt-0.5"
                      >
                      {processHtmlBullets(sanitizeHtml(c.description), c.id, bulletIds)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )
      }

      case "volunteer": {
        const items = itemIds
          ? sections.volunteer.filter((v) => itemIds.includes(v.id))
          : sections.volunteer
        if (!items.length) return null
        return (
          <section key={id} data-section-id={id} className="section-block mb-3">
            <SectionHeading>{t("volunteer")}</SectionHeading>
            <div className="mt-1 space-y-2.5">
              {items.map((vol, i) => (
                <div key={i} data-item-id={vol.id} className="section-item">
                  <Row
                    left={
                      <span className="font-bold text-[0.9em]">
                        <LinkedTitle
                          show={vol.showLinkInTitle}
                          url={vol.website}
                          fallback={vol.organization}
                        />
                      </span>
                    }
                    right={<span className="text-[0.78em] italic opacity-65">{formatDateRange(vol)}</span>}
                  />
                  <span className="text-[0.82em] italic opacity-80">{vol.position}</span>
                  {vol.description && (
                    <div
                      className="rich-text academic-bullets text-[0.8em] opacity-85 leading-snug mt-0.5"
                      >
                      {processHtmlBullets(sanitizeHtml(vol.description), vol.id, bulletIds)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )
      }

      case "publications": {
        const items = itemIds
          ? sections.publications?.filter((p) => itemIds.includes(p.id))
          : sections.publications
        if (!items?.length) return null
        return (
          <section key={id} data-section-id={id} className="section-block mb-3">
            <SectionHeading>Publications</SectionHeading>
            <div className="mt-1 space-y-1.5">
              {items.map((pub, i) => (
                <div key={i} data-item-id={pub.id} className="section-item">
                  <Row
                    left={
                      <span className="font-bold text-[0.85em]">
                        <LinkedTitle
                          show={pub.showLinkInTitle}
                          url={pub.url}
                          fallback={pub.name}
                        />
                      </span>
                    }
                    right={<span className="text-[0.78em] italic opacity-65">{pub.date}</span>}
                  />
                  {pub.publisher && <span className="text-[0.78em] italic opacity-70">{pub.publisher}</span>}
                </div>
              ))}
            </div>
          </section>
        )
      }

      case "references": {
        const items = itemIds
          ? sections.references?.filter((r) => itemIds.includes(r.id))
          : sections.references
        if (!items?.length) return null
        return (
          <section key={id} data-section-id={id} className="section-block mb-3">
            <SectionHeading>References</SectionHeading>
            <div className="mt-1 grid grid-cols-2 gap-4">
              {items.map((ref, i) => (
                <div key={i} data-item-id={ref.id} className="section-item text-[0.82em] min-w-0">
                  <div className="font-bold">{ref.name}</div>
                  <div className="italic opacity-75">{ref.position}</div>
                  {ref.email && <div className="opacity-65">{ref.email}</div>}
                  {ref.phone && <div className="opacity-65">{ref.phone}</div>}
                </div>
              ))}
            </div>
          </section>
        )
      }

      case "languages": {
        const items = itemIds
          ? sections.languages.filter((l) => itemIds.includes(l.id))
          : sections.languages
        if (!items.length) return null
        return (
          <section key={id} data-section-id={id} className="section-block mb-3">
            <SectionHeading>{t("languages")}</SectionHeading>
            <div className="mt-1 text-[0.82em] opacity-80">
              {items.map((l: any, i) => (
                <span key={i} data-item-id={l.id} className="section-item">
                  {l.name}
                  {l.level ? ` (${l.level >= 80 ? "Native" : l.level >= 60 ? "Fluent" : l.level >= 40 ? "Advanced" : l.level >= 20 ? "Intermediate" : "Beginner"})` : ""}
                  {i < items.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          </section>
        )
      }

      case "interests": {
        const items = itemIds
          ? sections.interests.filter((i) => itemIds.includes(i.id))
          : sections.interests
        if (!items.length) return null
        return (
          <section key={id} data-section-id={id} className="section-block mb-3">
            <SectionHeading>{t("interests")}</SectionHeading>
            <div className="mt-1 text-[0.82em] opacity-80">
              {items.map((i: any, idx) => (
                <span key={idx} data-item-id={i.id} className="section-item">
                  {i.name}{idx < items.length - 1 ? ", " : ""}
                </span>
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

          if (!items.length) return null

          return (
            <section key={id} data-section-id={id} className="section-block mb-3">
              <SectionHeading>{currentSection.name}</SectionHeading>
              <div className="mt-1 space-y-2">
                {items.map((item: any, i: number) => (
                  <div key={i} data-item-id={item.id} className="section-item">
                    <Row
                      left={
                        <span className="font-bold text-[0.9em]">
                          <LinkedTitle
                            show={!!item.url}
                            url={item.url}
                            fallback={item.title}
                          />
                        </span>
                      }
                      right={<span className="text-[0.78em] italic opacity-70">{formatDateRange(item)}</span>}
                    />
                    <Row
                      left={
                        <span className="text-[0.82em] italic opacity-80">
                          {item.subtitle}
                        </span>
                      }
                      right={item.location ? <span className="text-[0.78em] opacity-65">{item.location}</span> : undefined}
                    />
                    {item.description && (
                      <div
                        className="rich-text academic-bullets mt-1 text-[0.8em] opacity-80 leading-snug pl-4"
                        >
                      {processHtmlBullets(sanitizeHtml(item.description), item.id, bulletIds)}
                    </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )
        }
        return null
      }
    }
  }

  return (
    <div
      className="academic-template min-h-full flex flex-col bg-white"
      style={{
        fontFamily: typography?.fontFamily ?? "Georgia, serif",
        fontSize: `${typography?.fontSize ?? 10}pt`,
        lineHeight: typography?.lineHeight ?? 1.4,
        color: typography?.color ?? "#000000",
        "--primary": primary,
      } as React.CSSProperties}
    >
      {/* ── Header: two-column table layout ───────────────────────────────── */}
      {showHeader && (
        <header className="mb-3">
          <div className="flex justify-between items-start gap-4">
            {/* Left: Name + Headline + Location */}
            <div className="flex-1">
              <h1
                className="font-bold tracking-tight leading-none"
                style={{ fontSize: nameSizeStyle }}
              >
                {basics.name || "Your Name"}
              </h1>
              {basics.headline && (
                <div className="text-[0.85em] opacity-75 mt-0.5 font-medium">
                  {basics.headline}
                </div>
              )}
              {basics.location && (
                <div className="text-[0.78em] opacity-60 mt-0.5">{basics.location}</div>
              )}
            </div>

            {/* Right: Contact details stacked */}
            <div className="text-right text-[0.78em] opacity-70 space-y-0.5 shrink-0">
              {basics.phone && (
                <div>📞 {basics.phone}</div>
              )}
              {basics.email && (
                <div>
                  <a href={`mailto:${basics.email}`} className="hover:underline">✉ {basics.email}</a>
                </div>
              )}
              {basics.website && (
                <div>
                  <a href={basics.website.startsWith("http") ? basics.website : `https://${basics.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    🔗 {basics.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {sections.profiles?.map((p, i) => (
                <div key={i}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {p.network}: {p.username}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </header>
      )}

      {/* ── Body: single column ───────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {mainSections.map((ref: any) => (
          <React.Fragment key={ref.id}>{renderSection(ref)}</React.Fragment>
        ))}
      </div>

      {/* ── Scoped styles for bullet lists ───────────────────────────────── */}
      <style>{`
      .academic-template .rich-text {
        text-align: justify;
      }
        .academic-template .academic-bullets ul {
          list-style: none;
          padding-left: 0;
          margin: 0;
        }
        .academic-template .academic-bullets li {
          position: relative;
          padding-left: 1.4em;
          margin-bottom: 1px;
        }
        .academic-template .academic-bullets li::before {
          content: "•";
          position: absolute;
          left: 0.3em;
          font-size: 0.7em;
          top: 0.15em;
        }
        .academic-template .rich-text ul {
          list-style: none;
          padding-left: 0;
        }
        .academic-template .rich-text li {
          position: relative;
          padding-left: 1.4em;
          margin-bottom: 1px;
        }
        .academic-template .rich-text li::before {
          content: "•";
          position: absolute;
          left: 0.3em;
          font-size: 0.7em;
          top: 0.15em;
        }
      `}</style>
    </div>
  )
})
