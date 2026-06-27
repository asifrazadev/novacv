// templates/jake/index.tsx
import React from "react"
import { ResumeData } from "@/types/resume"
import { sanitizeHtml } from "@/lib/sanitize"
import { processHtmlBullets } from "@/lib/html-utils"
import { isEmptyHtml } from "@/lib/utils"
import { getTranslation } from "@/lib/i18n"
import { LinkedTitle } from "@/components/shared/ui/linked-title"

export interface PageContent {
    main: { id: string; itemIds?: string[]; bulletIds?: string[] }[]
    sidebar: { id: string; itemIds?: string[]; bulletIds?: string[] }[]
    showHeader: boolean
    showFooter: boolean
    isContinued?: boolean
}

export const JakeTemplate = React.memo(function JakeTemplate({ data, content }: { data: ResumeData; content?: PageContent }) {
    const { metadata, basics, sections } = data
    const { typography, design, language = "en" } = metadata

    const nameSizeStyle = typography?.nameSize ? `${typography.nameSize}pt` : undefined
    const sectionTitleSizeStyle = typography?.sectionTitleSize ? `${typography.sectionTitleSize}pt` : undefined

    const t = (key: string) => getTranslation(language, key)

    const defaultLayout = {
        main: ["summary", "experience", "education", "projects", "volunteer", "publications", "references"],
        sidebar: [],
    }

    const rawLayout = (metadata as any).layout
    const layout = {
        main: (rawLayout?.main && Array.isArray(rawLayout.main)) ? rawLayout.main : defaultLayout.main,
        sidebar: (rawLayout?.sidebar && Array.isArray(rawLayout.sidebar)) ? rawLayout.sidebar : defaultLayout.sidebar
    }

    const mainSections = content ? content.main : layout.main.map((id: string) => ({ id }))
    const sidebarSections = content ? content.sidebar : layout.sidebar.map((id: string) => ({ id }))
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

    // ── Shared primitives ────────────────────────────────────────────────────────

    const SectionHeading = ({ children }: { children: React.ReactNode }) => (
        <div className="mb-2">
            <h2
                className="font-bold uppercase tracking-[0.15em]"
                style={{ color: "var(--primary)", fontSize: sectionTitleSizeStyle || "0.65em" }}
            >
                {children}
            </h2>
            <div className="mt-0.5 h-px w-full" style={{ backgroundColor: "var(--primary)" }} />
        </div>
    )

    const ContinuedBadge = () => (
        <span className="text-[9px] opacity-40 lowercase font-normal ml-2 tracking-normal">
            {t("continued")}
        </span>
    )

    // ── Section renderer ─────────────────────────────────────────────────────────

    const renderSection = (sectionRef: { id: string; itemIds?: string[]; bulletIds?: string[] }) => {
    const bulletIds = sectionRef.bulletIds;
        const { id, itemIds } = sectionRef
        let isContinued = false
        if (id.startsWith("custom_")) {
            const customSections = (sections as any).customSections ?? []
            const currentSection = customSections.find((c: any) => c.id === id)
            isContinued = !!(itemIds && itemIds.length > 0 && currentSection?.items?.[0] && itemIds[0] !== currentSection.items[0].id)
        } else {
            isContinued = !!(itemIds && itemIds.length > 0 && itemIds[0] !== (sections as any)[id]?.[0]?.id)
        }

        switch (id) {
            // ── Summary ────────────────────────────────────────────────────────────
            case "summary":
                return !isEmptyHtml(sections.summary?.content) ? (
                    <section key={id} data-section-id={id} className="section-block">
                        <SectionHeading>
                            {t("profile")} {isContinued && <ContinuedBadge />}
                        </SectionHeading>
                        <div
                            className="rich-text text-[0.82em] leading-relaxed opacity-80 mt-2"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(sections.summary.content) }}
                        />
                    </section>
                ) : null

            // ── Experience ─────────────────────────────────────────────────────────
            case "experience": {
                const items = itemIds
                    ? sections.experience.filter((e) => itemIds.includes(e.id))
                    : sections.experience
                return items.length > 0 ? (
                    <section key={id} data-section-id={id} className="section-block">
                        <SectionHeading>
                            {t("experience")} {isContinued && <ContinuedBadge />}
                        </SectionHeading>
                        <div className="mt-2 space-y-3">
                            {items.map((exp, i) => (
                                <div key={i} data-item-id={exp.id} className="section-item">
                                    {/* Row 1: Company + Location */}
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-[0.9em] w-[80%]">
                                            <LinkedTitle
                                                show={exp.showLinkInTitle}
                                                url={exp.website}
                                                fallback={exp.company}
                                            />
                                        </span>
                                        <span className="text-[0.75em] opacity-60 shrink-0 ml-2">
                                            {exp.location}
                                        </span>
                                    </div>

                                    {/* Row 2: Roles or single position */}
                                    {exp.roles?.length > 0 ? (
                                        exp.roles.map((role, ri) => (
                                            <div key={ri} className="space-y-0.5">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-[0.82em] italic">{role.title}</span>
                                                    <span className="text-[0.75em] opacity-55 shrink-0 ml-2">
                                                        {formatDateRange(role)}
                                                    </span>
                                                </div>
                                                {role.description && (
                                                    <div
                                                        className="rich-text pl-5 text-[0.8em] opacity-70 leading-snug"
                                                        >
                      {processHtmlBullets(sanitizeHtml(role.description), role.id, bulletIds)}
                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-[0.82em] italic">{exp.position}</span>
                                            <span className="text-[0.75em] opacity-55 shrink-0 ml-2">
                                                {formatDateRange(exp)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {(!exp.roles || exp.roles.length === 0) && exp.description && (
                                        <div
                                            className="mt-1 rich-text text-[0.8em] opacity-70 leading-snug"
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

            // ── Education ──────────────────────────────────────────────────────────
            case "education": {
                const items = itemIds
                    ? sections.education.filter((e) => itemIds.includes(e.id))
                    : sections.education
                return items.length > 0 ? (
                    <section key={id} data-section-id={id} className="section-block">
                        <SectionHeading>
                            {t("education")} {isContinued && <ContinuedBadge />}
                        </SectionHeading>
                        <div className="mt-2 space-y-2">
                            {items.map((edu, i) => (
                                <div key={i} data-item-id={edu.id} className="section-item">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-[0.9em] w-[80%]">
                                            <LinkedTitle
                                                show={edu.showLinkInTitle}
                                                url={edu.website}
                                                fallback={edu.school}
                                            />
                                        </span>
                                        <span className="text-[0.75em] opacity-55 shrink-0 ml-2">
                                            {formatDateRange(edu)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-[0.82em] italic opacity-75">
                                            {[edu.degree, edu.areaOfStudy].filter(Boolean).join(", ")}
                                        </span>
                                        <span className="text-[0.75em] opacity-55 shrink-0 ml-2">
                                            {edu.location}
                                        </span>
                                    </div>
                                    {edu.description && (
                                        <div
                                            className="mt-1 rich-text pl-5 text-[0.8em] opacity-65 leading-snug"
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

            // ── Projects ───────────────────────────────────────────────────────────
            case "projects": {
                const items = itemIds
                    ? sections.projects.filter((p) => itemIds.includes(p.id))
                    : sections.projects
                return items.length > 0 ? (
                    <section key={id} data-section-id={id} className="section-block">
                        <SectionHeading>
                            {t("projects")} {isContinued && <ContinuedBadge />}
                        </SectionHeading>
                        <div className="mt-2 space-y-2">
                            {items.map((proj, i) => (
                                <div key={i} data-item-id={proj.id} className="section-item">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-[0.9em] w-[80%]">
                                            <LinkedTitle
                                                show={proj.showLinkInTitle}
                                                url={proj.url}
                                                fallback={proj.name}
                                                color="var(--primary)"
                                            />
                                        </span>
                                        <span className="text-[0.75em] opacity-55 shrink-0 ml-2">
                                            {formatDateRange(proj)}
                                        </span>
                                    </div>
                                    {proj.description && (
                                        <div
                                            className="mt-0.5 rich-text pl-5 text-[0.8em] opacity-70 leading-snug"
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

            // ── Skills ─────────────────────────────────────────────────────────────
            case "skills": {
                const items = itemIds
                    ? sections.skills.filter((s) => itemIds.includes(s.id))
                    : sections.skills
                const skillsMode = (metadata as any).skillsMode ?? "category"

                return items.length > 0 ? (
                    <section key={id} data-section-id={id} className="section-block">
                        <SectionHeading>
                            {t("skills")} {isContinued && <ContinuedBadge />}
                        </SectionHeading>

                        {skillsMode === "simple" ? (
                            // ── Simple: all names on one line, comma-separated ──
                            <div className="mt-2 text-[0.82em] opacity-75 leading-relaxed">
                                {items.map((s: any, i) => (
                                    <span key={i} data-item-id={s.id} className="section-item">
                                        {s.name}{i < items.length - 1 ? ", " : ""}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            // ── Category: bold name: skill1, skill2 ──
                            <div className="mt-2 space-y-0.5">
                                {items.map((s: any, i) => (
                                    <div key={i} data-item-id={s.id} className="section-item text-[0.82em]">
                                        <span className="font-bold">{s.name}: </span>
                                        <span className="opacity-70">
                                            {Array.isArray(s.keywords) ? s.keywords.join(", ") : s.keywords}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                ) : null
            }

            // ── Languages ──────────────────────────────────────────────────────────
            case "languages": {
                const items = itemIds
                    ? sections.languages.filter((l) => itemIds.includes(l.id))
                    : sections.languages
                return items.length > 0 ? (
                    <section key={id} data-section-id={id} className="section-block">
                        <SectionHeading>
                            {t("languages")} {isContinued && <ContinuedBadge />}
                        </SectionHeading>
                        <div className="mt-2 text-[0.82em] opacity-75">
                            {items.map((l: any, i) => (
                                <span key={i} data-item-id={l.id} className="section-item">
                                    {l.name}
                                    {l.level ? ` (${l.level >= 80 ? "Native" :
                                        l.level >= 60 ? "Fluent" :
                                            l.level >= 40 ? "Advanced" :
                                                l.level >= 20 ? "Intermediate" :
                                                    "Beginner"
                                        })` : ""}
                                    {i < items.length - 1 ? ", " : ""}
                                </span>
                            ))}
                        </div>
                    </section>
                ) : null
            }

            // ── Volunteer ──────────────────────────────────────────────────────────
            case "volunteer": {
                const items = itemIds
                    ? sections.volunteer.filter((v) => itemIds.includes(v.id))
                    : sections.volunteer
                return items.length > 0 ? (
                    <section key={id} data-section-id={id} className="section-block">
                        <SectionHeading>
                            {t("volunteer")} {isContinued && <ContinuedBadge />}
                        </SectionHeading>
                        <div className="mt-2 space-y-2">
                            {items.map((vol, i) => (
                                <div key={i} data-item-id={vol.id} className="section-item">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-[0.9em] w-[80%]">
                                            <LinkedTitle
                                                show={vol.showLinkInTitle}
                                                url={vol.website}
                                                fallback={vol.organization}
                                            />
                                        </span>
                                        <span className="text-[0.75em] opacity-55 shrink-0 ml-2">
                                            {formatDateRange(vol)}
                                        </span>
                                    </div>
                                    <span className="text-[0.82em] italic opacity-75">{vol.position}</span>
                                    {vol.description && (
                                        <div
                                            className="mt-0.5 rich-text pl-5 text-[0.8em] opacity-65 leading-snug"
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

            // ── Awards ─────────────────────────────────────────────────────────────
            case "awards": {
                const items = itemIds
                    ? sections.awards.filter((a) => itemIds.includes(a.id))
                    : sections.awards
                return items.length > 0 ? (
                    <section key={id} data-section-id={id} className="section-block">
                        <SectionHeading>
                            {t("awards")} {isContinued && <ContinuedBadge />}
                        </SectionHeading>
                        <div className="mt-2 space-y-1.5">
                            {items.map((a, i) => (
                                <div key={i} data-item-id={a.id} className="section-item">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-[0.82em] w-[80%]">
                                            <LinkedTitle
                                                show={a.showLinkInTitle}
                                                url={a.url}
                                                fallback={a.title}
                                            />
                                        </span>
                                        <span className="text-[0.75em] opacity-45 shrink-0 ml-2">{a.date}</span>
                                    </div>
                                    <span className="text-[0.78em] italic opacity-65">{a.awarder}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null
            }

            // ── Certifications ─────────────────────────────────────────────────────
            case "certifications": {
                const items = itemIds
                    ? sections.certifications.filter((c) => itemIds.includes(c.id))
                    : sections.certifications
                return items.length > 0 ? (
                    <section key={id} data-section-id={id} className="section-block">
                        <SectionHeading>
                            {t("certifications")} {isContinued && <ContinuedBadge />}
                        </SectionHeading>
                        <div className="mt-2 space-y-1.5">
                            {items.map((c, i) => (
                                <div key={i} data-item-id={c.id} className="section-item">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-[0.82em] w-[80%]">
                                            <LinkedTitle
                                                show={c.showLinkInTitle}
                                                url={c.url}
                                                fallback={c.name}
                                            />
                                        </span>
                                        <span className="text-[0.75em] opacity-45 shrink-0 ml-2">{c.date}</span>
                                    </div>
                                    <span className="text-[0.78em] italic opacity-65">{c.issuer}</span>
                                    {c.description && (
                                        <div
                                            className="mt-0.5 rich-text pl-5 text-[0.8em] opacity-65 leading-snug"
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

            // ── Publications ───────────────────────────────────────────────────────
            case "publications": {
                const items = itemIds
                    ? sections.publications?.filter((p) => itemIds.includes(p.id))
                    : sections.publications
                return items?.length > 0 ? (
                    <section key={id} data-section-id={id} className="section-block">
                        <SectionHeading>
                            Publications {isContinued && <ContinuedBadge />}
                        </SectionHeading>
                        <div className="mt-2 space-y-1.5">
                            {items.map((pub, i) => (
                                <div key={i} data-item-id={pub.id} className="section-item">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-[0.82em] w-[80%]">
                                            <LinkedTitle
                                                show={pub.showLinkInTitle}
                                                url={pub.url}
                                                fallback={pub.name}
                                            />
                                        </span>
                                        <span className="text-[0.75em] opacity-45 shrink-0 ml-2">{pub.date}</span>
                                    </div>
                                    <span className="text-[0.78em] italic opacity-65">{pub.publisher}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null
            }

            // ── References ─────────────────────────────────────────────────────────
            case "references": {
                const items = itemIds
                    ? sections.references?.filter((r) => itemIds.includes(r.id))
                    : sections.references
                return items?.length > 0 ? (
                    <section key={id} data-section-id={id} className="section-block">
                        <SectionHeading>
                            References {isContinued && <ContinuedBadge />}
                        </SectionHeading>
                        <div className="mt-2 space-y-2">
                            {items.map((ref, i) => (
                                <div key={i} data-item-id={ref.id} className="section-item">
                                    <span className="font-bold text-[0.82em]">{ref.name}</span>
                                    {ref.description && (
                                        <div
                                            className="rich-text pl-5 text-[0.78em] opacity-65 leading-snug"
                                            >
                      {processHtmlBullets(sanitizeHtml(ref.description), ref.id, bulletIds)}
                    </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null
            }

            // ── Interests ───────────────────────────────────────────────────────────
            case "interests": {
                const items = itemIds
                    ? sections.interests.filter((i) => itemIds.includes(i.id))
                    : sections.interests
                return items.length > 0 ? (
                    <section key={id} data-section-id={id} className="section-block">
                        <SectionHeading>
                            {t("interests")} {isContinued && <ContinuedBadge />}
                        </SectionHeading>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.82em] opacity-75">
                            {items.map((i, idx) => (
                                <span key={idx} data-item-id={i.id} className="section-item">
                                    {i.name}{idx < items.length - 1 ? "," : ""}
                                </span>
                            ))}
                        </div>
                    </section>
                ) : null
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
                            <SectionHeading>
                                {currentSection.name} {isContinued && <ContinuedBadge />}
                            </SectionHeading>
                            <div className="mt-2 space-y-2">
                                {items.map((item: any, i: number) => (
                                    <div key={i} data-item-id={item.id} className="section-item">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-[0.9em] w-[80%]">
                                                <LinkedTitle
                                                    show={!!item.url}
                                                    url={item.url}
                                                    fallback={item.title}
                                                />
                                            </span>
                                            <span className="text-[0.75em] opacity-55 shrink-0 ml-2">
                                                {formatDateRange(item)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-[0.82em] italic opacity-75">
                                                {item.subtitle}
                                            </span>
                                            <span className="text-[0.75em] opacity-55 shrink-0 ml-2">
                                                {item.location}
                                            </span>
                                        </div>
                                        {item.description && (
                                            <div
                                                className="mt-0.5 rich-text pl-5 text-[0.8em] opacity-70 leading-snug"
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

    return (
        <div
            className="jake-template min-h-full flex flex-col"
            style={{
                fontFamily: typography?.fontFamily ?? "Georgia, serif",
                fontSize: `${typography?.fontSize ?? 10}pt`,
                lineHeight: typography?.lineHeight ?? 1.4,
                color: typography?.color ?? "#000",
                "--primary": design?.primaryColor ?? "#000000",
            } as React.CSSProperties}
        >
            {/* ── Header ──────────────────────────────────────────────────────────── */}
            {showHeader && (
                <header className="text-center mb-4 pb-0 flex flex-col items-center">
                    {basics.picture?.url && basics.picture?.visible !== false && (
                        <div
                            className={`mb-3 overflow-hidden ${basics.picture.grayscale ? "grayscale" : ""}`}
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
                    <h1 className="font-bold tracking-tight leading-none" style={{ fontSize: nameSizeStyle || "2em" }}>
                        {basics.name || "Your Name"}
                    </h1>

                    {basics.headline && (
                        <p className="mt-1 text-[0.82em] opacity-65 font-medium tracking-widest uppercase">
                            {basics.headline}
                        </p>
                    )}

                    {/* Contact row — Jake's classic pipe-separated inline list */}
                    <div className="mt-1.5 flex flex-wrap justify-center items-center gap-x-1 text-[0.78em] opacity-70">
                        {basics.phone && (
                            <>
                                <span>{basics.phone}</span>
                                <span className="opacity-40">|</span>
                            </>
                        )}
                        {basics.email && (
                            <>
                                <a href={`mailto:${basics.email}`} className="hover:underline">
                                    {basics.email}
                                </a>
                                <span className="opacity-40">|</span>
                            </>
                        )}
                        {basics.location && (
                            <>
                                <span>{basics.location}</span>
                            </>
                        )}
                        {sections.profiles?.map((p, i) => (
                            <React.Fragment key={i}>
                                <span className="opacity-40">|</span>
                                <a
                                    href={p.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                >
                                    {p.username || p.network}
                                </a>
                            </React.Fragment>
                        ))}
                    </div>
                </header>
            )}

            {/* ── Body: single full-width column (Jake has no sidebar) ────────────── */}
            <div className="flex-1 space-y-4 min-w-0">
                {mainSections.map((ref: any) => (
                    <React.Fragment key={ref.id}>{renderSection(ref)}</React.Fragment>
                ))}

                {/* Sidebar sections fall through to main column if layout has sidebar */}
                {sidebarSections.length > 0 && (
                    <div className="space-y-4">
                        {sidebarSections.map((ref: any) => (
                            <React.Fragment key={ref.id}>{renderSection(ref)}</React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
})