import React from "react"
import { ResumeData } from "@/types/resume"
import { isEmptyHtml } from "@/lib/utils"
import { sanitizeHtml } from "@/lib/sanitize"
import { processHtmlBullets } from "@/lib/html-utils"
import { getTranslation } from "@/lib/i18n"
import { LinkedTitle } from "@/components/shared/ui/linked-title"
import { SocialIcon } from "@/components/shared/ui/social-icon"

export interface PageContent {
  main: { id: string; itemIds?: string[]; bulletIds?: string[] }[]
  sidebar: { id: string; itemIds?: string[]; bulletIds?: string[] }[]
  showHeader: boolean
  showFooter: boolean
  isContinued?: boolean
}

export const ClassicTemplate = React.memo(function ClassicTemplate({
  data,
  content,
}: {
  data: ResumeData
  content?: PageContent
}) {
  const { metadata, basics, sections } = data
  const { typography, design, language = "en" } = metadata

  const nameSizeStyle = typography.nameSize ? `${typography.nameSize}pt` : undefined
  const headlineSizeStyle = typography.headlineSize ? `${typography.headlineSize}pt` : undefined
  const sectionTitleSizeStyle = typography.sectionTitleSize ? `${typography.sectionTitleSize}pt` : undefined

  const t = (key: string) => getTranslation(language, key)

  const defaultLayout = {
    main: [
      "summary",
      "experience",
      "education",
      "skills",
      "languages",
      "projects",
      "volunteer",
      "awards",
      "certifications",
      "publications",
      "references",
      "interests",
      "profiles",
    ],
    sidebar: [],
  }

  const rawLayout = (metadata as any).layout
  const layout = {
    main:
      rawLayout?.main && Array.isArray(rawLayout.main)
        ? rawLayout.main
        : defaultLayout.main,
    sidebar:
      rawLayout?.sidebar && Array.isArray(rawLayout.sidebar)
        ? rawLayout.sidebar
        : defaultLayout.sidebar,
  }

  const mainSections = content
    ? content.main
    : (layout.main || []).map((id: string) => ({ id }))
  const sidebarSections = content
    ? content.sidebar
    : (layout.sidebar || []).map((id: string) => ({ id }))
  const allSections = [...mainSections, ...sidebarSections]

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

  // Dotted-rule section heading matching the reference design
  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-3">
      <h2
        className="font-bold uppercase tracking-[0.12em] text-[0.72em] mb-1"
        style={{ color: "var(--primary)", fontSize: sectionTitleSizeStyle }}
      >
        {children}
      </h2>
      {/* Dotted rule */}
      <div
        className="w-full"
        style={{
          borderBottom: "1px dotted",
          borderColor: "var(--primary)",
          opacity: 0.4,
        }}
      />
    </div>
  )

  const ContinuedBadge = () => (
    <span className="text-[9px] opacity-40 lowercase font-normal ml-2 tracking-normal">
      {t("continued")}
    </span>
  )

  const renderSection = (sectionRef: {
    id: string
    itemIds?: string[]
    bulletIds?: string[]
  }) => {
    const bulletIds = sectionRef.bulletIds
    const { id, itemIds } = sectionRef

    let isContinued = false
    if (id.startsWith("custom_")) {
      const customSections = (sections as any).customSections ?? []
      const currentSection = customSections.find((c: any) => c.id === id)
      isContinued = !!(
        itemIds &&
        itemIds.length > 0 &&
        currentSection?.items?.[0] &&
        itemIds[0] !== currentSection.items[0].id
      )
    } else {
      isContinued = !!(
        itemIds &&
        itemIds.length > 0 &&
        itemIds[0] !== (sections as any)[id]?.[0]?.id
      )
    }

    switch (id) {
      // ── Summary ──────────────────────────────────────────────────────────────
      case "summary":
        return !isEmptyHtml(sections.summary?.content) ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading>
              {t("profile")} {isContinued && <ContinuedBadge />}
            </SectionHeading>
            <div
              className="rich-text text-[0.88em] leading-relaxed opacity-85 wrap-break-word"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(sections.summary.content),
              }}
            />
          </section>
        ) : null

      // ── Experience ───────────────────────────────────────────────────────────
      case "experience": {
        const items = itemIds
          ? sections.experience.filter((e) => itemIds.includes(e.id))
          : sections.experience
        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading>
              {t("experience")} {isContinued && <ContinuedBadge />}
            </SectionHeading>
            <div className="space-y-4">
              {items.map((exp, i) => (
                <div key={i} data-item-id={exp.id} className="section-item">
                  {exp.roles && exp.roles.length > 0 ? (
                    <>
                      {exp.roles.map((role, ri) => (
                        <div key={ri} className={ri > 0 ? "mt-3" : ""}>
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-[0.9em]">
                              {role.title}
                            </span>
                          </div>
                          <div className="text-[0.82em] opacity-75">
                            {[exp.company, exp.location, formatDateRange(role)]
                              .filter(Boolean)
                              .join(" | ")}
                          </div>
                          {role.description && !isEmptyHtml(role.description) && (
                            <div className="mt-1 rich-text text-[0.82em] opacity-80 leading-snug">
                              {processHtmlBullets(
                                sanitizeHtml(role.description),
                                role.id,
                                bulletIds
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-[0.9em]">
                          <LinkedTitle
                            show={exp.showLinkInTitle}
                            url={exp.website}
                            fallback={exp.position}
                            color="var(--primary)"
                          />
                        </span>
                      </div>
                      <div className="text-[0.82em] opacity-75">
                        {[exp.company, exp.location, formatDateRange(exp)]
                          .filter(Boolean)
                          .join(" | ")}
                      </div>
                      {!isEmptyHtml(exp.description) && (
                        <div className="mt-1 rich-text text-[0.82em] opacity-80 leading-snug">
                          {processHtmlBullets(
                            sanitizeHtml(exp.description),
                            exp.id,
                            bulletIds
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      // ── Education ────────────────────────────────────────────────────────────
      case "education": {
        const items = itemIds
          ? sections.education.filter((e) => itemIds.includes(e.id))
          : sections.education
        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading>
              {t("education")} {isContinued && <ContinuedBadge />}
            </SectionHeading>
            <div className="space-y-3">
              {items.map((edu, i) => (
                <div key={i} data-item-id={edu.id} className="section-item">
                  <span className="font-bold text-[0.9em]">
                    <LinkedTitle
                      show={edu.showLinkInTitle}
                      url={edu.website}
                      fallback={
                        [edu.degree, edu.areaOfStudy].filter(Boolean).join(", ") ||
                        edu.school
                      }
                      color="var(--primary)"
                    />
                  </span>
                  <div className="text-[0.82em] opacity-75">
                    {[edu.school, edu.location, formatDateRange(edu)]
                      .filter(Boolean)
                      .join(" | ")}
                  </div>
                  {!isEmptyHtml(edu.description) && (
                    <div className="mt-1 text-[0.82em] opacity-70 leading-snug rich-text">
                      {processHtmlBullets(
                        sanitizeHtml(edu.description),
                        edu.id,
                        bulletIds
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      // ── Skills ───────────────────────────────────────────────────────────────
      case "skills": {
        const items = itemIds
          ? sections.skills.filter((s) => itemIds.includes(s.id))
          : sections.skills
        const skillsMode = (metadata as any).skillsMode ?? "simple"

        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading>
              {t("skills")} {isContinued && <ContinuedBadge />}
            </SectionHeading>
            {skillsMode === "category" ? (
              <div className="space-y-1.5">
                {items.map((s, i) => (
                  <div key={i} data-item-id={s.id} className="section-item text-[0.85em]">
                    <span className="font-bold">{s.name}</span>
                    {s.keywords && s.keywords.length > 0 && (
                      <span className="opacity-75">
                        {": "}
                        {s.keywords.join(" • ")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Simple mode: bullet-separated inline list — matches reference design
              <p className="text-[0.85em] opacity-80 leading-relaxed">
                {items.map((s, i) => (
                  <span key={i} data-item-id={s.id} className="section-item">
                    {s.name}
                    {s.keywords && s.keywords.length > 0 && `: ${s.keywords.join(", ")}`}
                    {i < items.length - 1 && (
                      <span className="mx-1.5 opacity-50"> •</span>
                    )}
                  </span>
                ))}
              </p>
            )}
          </section>
        ) : null
      }

      // ── Languages ────────────────────────────────────────────────────────────
      case "languages": {
        const items = itemIds
          ? sections.languages.filter((l) => itemIds.includes(l.id))
          : sections.languages
        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading>
              {t("languages")} {isContinued && <ContinuedBadge />}
            </SectionHeading>
            <p className="text-[0.85em] opacity-80 leading-relaxed">
              {items.map((l, i) => (
                <span key={i} data-item-id={l.id} className="section-item">
                  {l.name}
                  {l.level
                    ? ` (${
                        l.level >= 80
                          ? "Native"
                          : l.level >= 60
                          ? "Fluent"
                          : l.level >= 40
                          ? "Advanced"
                          : l.level >= 20
                          ? "Intermediate"
                          : "Beginner"
                      })`
                    : ""}
                  {i < items.length - 1 && (
                    <span className="mx-1.5 opacity-50"> •</span>
                  )}
                </span>
              ))}
            </p>
          </section>
        ) : null
      }

      // ── Projects ─────────────────────────────────────────────────────────────
      case "projects": {
        const items = itemIds
          ? sections.projects.filter((p) => itemIds.includes(p.id))
          : sections.projects
        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading>
              {t("projects")} {isContinued && <ContinuedBadge />}
            </SectionHeading>
            <div className="space-y-3">
              {items.map((proj, i) => (
                <div key={i} data-item-id={proj.id} className="section-item">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[0.9em]">
                      <LinkedTitle
                        show={proj.showLinkInTitle}
                        url={proj.url}
                        fallback={proj.name}
                        color="var(--primary)"
                      />
                    </span>
                    <span className="text-[0.78em] opacity-55 shrink-0 ml-2">
                      {formatDateRange(proj)}
                    </span>
                  </div>
                  {!isEmptyHtml(proj.description) && (
                    <div className="mt-1 rich-text text-[0.82em] opacity-80 leading-snug">
                      {processHtmlBullets(
                        sanitizeHtml(proj.description),
                        proj.id,
                        bulletIds
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      // ── Volunteer ────────────────────────────────────────────────────────────
      case "volunteer": {
        const items = itemIds
          ? sections.volunteer.filter((v) => itemIds.includes(v.id))
          : sections.volunteer
        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading>
              {t("volunteer")} {isContinued && <ContinuedBadge />}
            </SectionHeading>
            <div className="space-y-3">
              {items.map((vol, i) => (
                <div key={i} data-item-id={vol.id} className="section-item">
                  <span className="font-bold text-[0.9em]">
                    <LinkedTitle
                      show={vol.showLinkInTitle}
                      url={vol.website}
                      fallback={vol.position}
                      color="var(--primary)"
                    />
                  </span>
                  <div className="text-[0.82em] opacity-75">
                    {[vol.organization, formatDateRange(vol)]
                      .filter(Boolean)
                      .join(" | ")}
                  </div>
                  {!isEmptyHtml(vol.description) && (
                    <div className="mt-1 rich-text text-[0.82em] opacity-80 leading-snug">
                      {processHtmlBullets(
                        sanitizeHtml(vol.description),
                        vol.id,
                        bulletIds
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      // ── Awards ───────────────────────────────────────────────────────────────
      case "awards": {
        const items = itemIds
          ? sections.awards.filter((a) => itemIds.includes(a.id))
          : sections.awards
        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading>
              {t("awards")} {isContinued && <ContinuedBadge />}
            </SectionHeading>
            <div className="space-y-2">
              {items.map((a, i) => (
                <div key={i} data-item-id={a.id} className="section-item">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[0.9em]">
                      <LinkedTitle
                        show={a.showLinkInTitle}
                        url={a.url}
                        fallback={a.title}
                        color="var(--primary)"
                      />
                    </span>
                    <span className="text-[0.78em] opacity-50 shrink-0 ml-2">
                      {a.date}
                    </span>
                  </div>
                  <span className="text-[0.82em] italic opacity-65">{a.awarder}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      // ── Certifications ───────────────────────────────────────────────────────
      case "certifications": {
        const items = itemIds
          ? sections.certifications.filter((c) => itemIds.includes(c.id))
          : sections.certifications
        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading>
              {t("certifications")} {isContinued && <ContinuedBadge />}
            </SectionHeading>
            <div className="space-y-2">
              {items.map((c, i) => (
                <div key={i} data-item-id={c.id} className="section-item">
                  <LinkedTitle
                    show={c.showLinkInTitle}
                    url={c.url}
                    fallback={`${c.name}${c.issuer ? `, ${c.issuer}` : ""}${c.date ? ` | ${c.date}` : ""}`}
                    color="var(--primary)"
                  />
                  {!isEmptyHtml(c.description) && (
                    <div className="mt-0.5 rich-text text-[0.82em] opacity-70 leading-snug">
                      {processHtmlBullets(
                        sanitizeHtml(c.description),
                        c.id,
                        bulletIds
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      // ── Publications ─────────────────────────────────────────────────────────
      case "publications": {
        const items = itemIds
          ? sections.publications?.filter((p) => itemIds.includes(p.id))
          : sections.publications
        return items?.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading>
              Publications {isContinued && <ContinuedBadge />}
            </SectionHeading>
            <div className="space-y-2">
              {items.map((pub, i) => (
                <div key={i} data-item-id={pub.id} className="section-item">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[0.9em]">
                      <LinkedTitle
                        show={pub.showLinkInTitle}
                        url={pub.url}
                        fallback={pub.name}
                        color="var(--primary)"
                      />
                    </span>
                    <span className="text-[0.78em] opacity-50 shrink-0 ml-2">
                      {pub.date}
                    </span>
                  </div>
                  <span className="text-[0.82em] italic opacity-65">{pub.publisher}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      // ── References ───────────────────────────────────────────────────────────
      case "references": {
        const items = itemIds
          ? sections.references?.filter((r) => itemIds.includes(r.id))
          : sections.references
        return items?.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading>
              References {isContinued && <ContinuedBadge />}
            </SectionHeading>
            <div className="space-y-2">
              {items.map((ref, i) => (
                <div key={i} data-item-id={ref.id} className="section-item">
                  <span className="font-bold text-[0.9em]">{ref.name}</span>
                  {ref.position && (
                    <span className="text-[0.82em] opacity-65"> — {ref.position}</span>
                  )}
                  {!isEmptyHtml(ref.description) && (
                    <div className="mt-0.5 rich-text text-[0.82em] opacity-70 leading-snug">
                      {processHtmlBullets(
                        sanitizeHtml(ref.description),
                        ref.id,
                        bulletIds
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      // ── Interests ────────────────────────────────────────────────────────────
      case "interests": {
        const items = itemIds
          ? sections.interests.filter((i) => itemIds.includes(i.id))
          : sections.interests
        return items.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading>
              {t("interests")} {isContinued && <ContinuedBadge />}
            </SectionHeading>
            <p className="text-[0.85em] opacity-80 leading-relaxed">
              {items.map((item, i) => (
                <span key={i} data-item-id={item.id} className="section-item">
                  {item.name}
                  {i < items.length - 1 && (
                    <span className="mx-1.5 opacity-50"> •</span>
                  )}
                </span>
              ))}
            </p>
          </section>
        ) : null
      }

      // ── Profiles / Social ────────────────────────────────────────────────────
      case "profiles": {
        return sections.profiles.length > 0 ? (
          <section key={id} data-section-id={id} className="section-block">
            <SectionHeading>{t("social")}</SectionHeading>
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {sections.profiles.map((p, i) => (
                <div key={i} className="section-item flex items-center gap-1.5 text-[0.85em] opacity-80">
                  <SocialIcon
                    network={p.icon || undefined}
                    url={p.icon ? undefined : p.url || ""}
                    style={{ height: 14, width: 14 }}
                  />
                  <span>{p.username || p.network}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null
      }

      // ── Custom sections ──────────────────────────────────────────────────────
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
              <SectionHeading>
                {currentSection.name} {isContinued && <ContinuedBadge />}
              </SectionHeading>
              <div className="space-y-3">
                {items.map((item: any, i: number) => (
                  <div key={i} data-item-id={item.id} className="section-item">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[0.9em]">
                        <LinkedTitle
                          show={!!item.url}
                          url={item.url}
                          fallback={item.title}
                          color="var(--primary)"
                        />
                      </span>
                      <span className="text-[0.78em] opacity-55 shrink-0 ml-2">
                        {formatDateRange(item)}
                      </span>
                    </div>
                    {item.subtitle && (
                      <div className="flex justify-between items-baseline opacity-75">
                        <span className="text-[0.82em] italic">{item.subtitle}</span>
                        <span className="text-[0.78em] opacity-55 shrink-0 ml-2">
                          {item.location}
                        </span>
                      </div>
                    )}
                    {!isEmptyHtml(item.description) && (
                      <div className="mt-1 rich-text text-[0.82em] opacity-80 leading-snug">
                        {processHtmlBullets(
                          sanitizeHtml(item.description),
                          item.id,
                          bulletIds
                        )}
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

  return (
    <div
      className="classic-template min-h-full flex flex-col"
      style={{
        fontFamily: typography.fontFamily,
        fontSize: `${typography.fontSize}pt`,
        lineHeight: typography.lineHeight,
        color: typography.color,
        "--primary": design.primaryColor,
      } as React.CSSProperties}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      {showHeader && (
        <header className="mb-5">
          {/* Name */}
          <h1
            className="font-bold leading-none"
            style={{ color: "var(--primary)", fontSize: nameSizeStyle || "2em" }}
          >
            {basics.name || "Your Name"}
          </h1>

          {/* Headline */}
          {basics.headline && (
            <p
              className="font-bold uppercase tracking-widest mt-0.5 text-[0.78em]"
              style={{ fontSize: headlineSizeStyle }}
            >
              {basics.headline}
            </p>
          )}

          {/* Contact row — 3 items spread across the width */}
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-0.5 text-[0.82em] opacity-70">
            {basics.email && <span>{basics.email}</span>}
            {basics.phone && <span>{basics.phone}</span>}
            {basics.location && <span>{basics.location}</span>}
            {basics.website && (
              <a href={basics.website} className="hover:underline">
                {basics.website}
              </a>
            )}
            {sections.profiles?.map((p, i) => (
              <span key={i}>
                {p.username ? `@${p.username}` : p.url}
              </span>
            ))}
          </div>

          {/* Photo (optional) */}
          {basics.picture?.url && basics.picture?.visible !== false && (
            <div
              className={`mt-2 overflow-hidden ${basics.picture.grayscale ? "grayscale" : ""}`}
              style={{
                width: `${basics.picture.size}px`,
                height: `${basics.picture.size}px`,
                borderRadius: `${basics.picture.borderRadius}%`,
                border: `${basics.picture.borderWidth}px solid var(--primary)`,
                boxShadow: basics.picture.shadow
                  ? `0 ${basics.picture.shadow}px ${basics.picture.shadow * 1.5}px rgba(0,0,0,0.15)`
                  : undefined,
                transform: basics.picture.rotation
                  ? `rotate(${basics.picture.rotation}deg)`
                  : undefined,
              }}
            >
              <img
                src={basics.picture.url}
                alt={basics.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Top dotted rule under contact row */}
          <div
            className="mt-3 w-full"
            style={{
              borderBottom: "1px dotted",
              borderColor: "var(--primary)",
              opacity: 0.35,
            }}
          />
        </header>
      )}

      {/* ── Body: single full-width column ─────────────────────────────────── */}
      <div className="flex-1 space-y-4 min-w-0">
        {allSections.map((ref: any) => (
          <React.Fragment key={ref.id}>{renderSection(ref)}</React.Fragment>
        ))}
      </div>
    </div>
  )
})
