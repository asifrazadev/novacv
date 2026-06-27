import React from "react"
import { ResumeData } from "@/types/resume"
import { cn, isEmptyHtml } from "@/lib/utils"
import { sanitizeHtml } from "@/lib/sanitize"
import { processHtmlBullets } from "@/lib/html-utils"
import { getTranslation } from "@/lib/i18n"
import { LinkedTitle } from "@/components/shared/ui/linked-title"

export interface PageContent {
    main: { id: string; itemIds?: string[]; bulletIds?: string[] }[]
    sidebar: { id: string; itemIds?: string[]; bulletIds?: string[] }[]
    showHeader: boolean
    showFooter: boolean
    isContinued?: boolean
}

export const ExecutiveTemplate = React.memo(function ExecutiveTemplate({ data, content }: { data: ResumeData; content?: PageContent }) {
    const { metadata, basics, sections } = data
    const { typography, design, language = "en" } = metadata

    const nameSizeStyle = typography?.nameSize ? `${typography.nameSize}pt` : undefined
    const headlineSizeStyle = typography?.headlineSize ? `${typography.headlineSize}pt` : undefined
    const sectionTitleSizeStyle = typography?.sectionTitleSize ? `${typography.sectionTitleSize}pt` : undefined

    const t = (key: string) => getTranslation(language, key)

    const defaultLayout = {
        main: ["summary", "skills", "experience", "education", "projects", "volunteer", "publications", "references", "languages", "interests", "awards", "certifications"],
        sidebar: []
    }

    const rawLayout = (metadata as any).layout
    const layout = {
        main: (rawLayout?.main && Array.isArray(rawLayout.main)) ? rawLayout.main : defaultLayout.main,
        sidebar: (rawLayout?.sidebar && Array.isArray(rawLayout.sidebar)) ? rawLayout.sidebar : defaultLayout.sidebar
    }

    const mainSections = content ? content.main : (layout.main || []).map((id: string) => ({ id }))
    const sidebarSections = content ? content.sidebar : (layout.sidebar || []).map((id: string) => ({ id }))
    const showHeader = content ? content.showHeader : true

    const formatDateRange = (item: { startDate?: string; endDate?: string; isCurrent?: boolean; date?: string }) => {
        if (item.startDate) {
            const end = item.isCurrent ? t("present") : (item.endDate || "")
            return `${item.startDate}${end ? ` – ${end}` : ""}`
        }
        return item.date || ""
    }

    const styles = {
        page: {
            fontFamily: typography.fontFamily || "'Garamond', 'EB Garamond', 'Times New Roman', Georgia, serif",
            fontSize: `${typography.fontSize}pt` || "10pt",
            lineHeight: typography.lineHeight || 1.5,
            color: typography.color || "#1a1a1a",
            display: "grid",
            gridTemplateColumns: "6px 1fr",
        },
        accent: {
            background: design.primaryColor || "#1a1a1a",
            borderRadius: "0",
        },
        body: {
            paddingLeft: "2rem",
        },
        name: {
            fontSize: nameSizeStyle || "2.4em",
            fontWeight: "700",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
            marginBottom: "2px",
            color: design.primaryColor || "#1a1a1a",
        },
        headline: {
            fontWeight: "400",
            color: "#555",
            letterSpacing: "0.04em",
            textTransform: "uppercase" as const,
            fontSize: headlineSizeStyle || "0.72em",
            marginBottom: "10px",
        },
        contactRow: {
            display: "flex",
            flexWrap: "wrap" as const,
            gap: "4px 16px",
            fontSize: "0.78em",
            color: "#444",
            marginBottom: "1.5rem",
            paddingBottom: "1rem",
            borderBottom: `1.5px solid ${design.primaryColor || "#1a1a1a"}`,
        },
        sectionTitle: {
            fontSize: sectionTitleSizeStyle || "0.62em",
            fontWeight: "700",
            textTransform: "uppercase" as const,
            letterSpacing: "0.18em",
            color: design.primaryColor || "#1a1a1a",
            marginBottom: "4px",
            marginTop: "0.5rem",
        },
        rule: {
            height: "1px",
            background: "#d4d0c8",
            marginBottom: "10px",
        },
    }

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

        const SectionTitle = ({ title }: { title: string }) => (
            <>
                <div style={styles.sectionTitle}>{title} {isContinued && <span className="text-[9px] opacity-40 lowercase font-normal ml-2 tracking-normal">{t("continued")}</span>}</div>
                <div style={styles.rule} />
            </>
        )

        switch (id) {
            case "summary":
                return !isEmptyHtml(sections.summary?.content) && (
                    <section key={id}>
                        <SectionTitle title={t("profile")} />
                        <div
                            className="rich-text text-[0.85em] italic opacity-90 leading-relaxed text-justify"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(sections.summary.content) }}
                        />
                    </section>
                )
            case "experience": {
                const items = itemIds ? sections.experience.filter(item => itemIds.includes(item.id)) : sections.experience
                return items.length > 0 && (
                    <section key={id}>
                        <SectionTitle title={t("experience")} />
                        <div className="space-y-4">
                            {items.map((exp, index) => (
                                <div key={index} data-item-id={exp.id}>
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-[0.92em] w-[80%]">
                                            <LinkedTitle
                                                show={exp.showLinkInTitle}
                                                url={exp.website}
                                                fallback={exp.company}
                                            />
                                        </span>
                                        <span className="text-[0.75em] text-[#666] ml-2">{exp.location} &nbsp;·&nbsp; {formatDateRange(exp)}</span>
                                    </div>
                                    <div className="text-[0.82em] italic text-[#444] mb-1">{exp.position}</div>

                                    {exp.roles && exp.roles.length > 0 && (
                                        <div className="mt-1 space-y-2 pl-4 border-l border-muted">
                                            {exp.roles.map((role, ri) => (
                                                <div key={ri} className="space-y-0.5 text-[0.8em]">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="font-semibold italic">{role.title}</span>
                                                        <span className="text-[0.75em] opacity-60">{formatDateRange(role)}</span>
                                                    </div>
                                                    {role.description && !isEmptyHtml(role.description) && (
                                                        <div
                                                            className="rich-text pl-5 opacity-90 leading-relaxed executive-bullets"
                                                            >
                      {processHtmlBullets(sanitizeHtml(role.description), role.id, bulletIds)}
                    </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {(!exp.roles || exp.roles.length === 0) && !isEmptyHtml(exp.description) && (
                                        <div
                                            className="rich-text text-[0.8em] opacity-90 leading-relaxed executive-bullets"
                                            >
                      {processHtmlBullets(sanitizeHtml(exp.description), exp.id, bulletIds)}
                    </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )
            }
            case "projects": {
                const items = itemIds ? sections.projects.filter(item => itemIds.includes(item.id)) : sections.projects
                return items.length > 0 && (
                    <section key={id}>
                        <SectionTitle title={t("projects")} />
                        <div className="space-y-4">
                            {items.map((proj, index) => (
                                <div key={index} data-item-id={proj.id}>
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-[0.92em] w-[80%]">
                                            <LinkedTitle
                                                show={proj.showLinkInTitle}
                                                url={proj.url}
                                                fallback={proj.name}
                                                color={design.primaryColor}
                                            />
                                        </span>
                                        <span className="text-[0.75em] text-[#666] ml-2">{formatDateRange(proj)}</span>
                                    </div>
                                    {!isEmptyHtml(proj.description) && (
                                        <div
                                            className="rich-text pl-5 text-[0.8em] opacity-90 leading-relaxed executive-bullets"
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
            case "volunteer": {
                const items = itemIds ? sections.volunteer.filter(item => itemIds.includes(item.id)) : sections.volunteer
                return items.length > 0 && (
                    <section key={id}>
                        <SectionTitle title={t("volunteer")} />
                        <div className="space-y-4">
                            {items.map((vol, index) => (
                                <div key={index} data-item-id={vol.id}>
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-[0.92em] w-[80%]">
                                            <LinkedTitle
                                                show={vol.showLinkInTitle}
                                                url={vol.website}
                                                fallback={vol.organization}
                                            />
                                        </span>
                                        <span className="text-[0.75em] text-[#666] ml-2">{formatDateRange(vol)}</span>
                                    </div>
                                    <div className="text-[0.82em] italic text-[#444] mb-1">{vol.position}</div>
                                    {!isEmptyHtml(vol.description) && (
                                        <div
                                            className="rich-text pl-5 text-[0.8em] opacity-90 leading-relaxed executive-bullets"
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
                const items = itemIds ? sections.publications.filter(item => itemIds.includes(item.id)) : sections.publications
                return items.length > 0 && (
                    <section key={id}>
                        <SectionTitle title={t("publications")} />
                        <div className="space-y-3">
                            {items.map((pub, index) => (
                                <div key={index} data-item-id={pub.id}>
                                    <div className="flex justify-between items-baseline text-[0.85em]">
                                        <span className="font-bold w-[80%]">
                                            <LinkedTitle
                                                show={pub.showLinkInTitle}
                                                url={pub.url}
                                                fallback={pub.name}
                                            />
                                        </span>
                                        <span className="text-[#888] ml-2">{pub.date}</span>
                                    </div>
                                    <div className="text-[0.8em] italic opacity-80">{pub.publisher}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )
            }
            case "references": {
                const items = itemIds ? sections.references.filter(item => itemIds.includes(item.id)) : sections.references
                return items.length > 0 && (
                    <section key={id}>
                        <SectionTitle title={t("references")} />
                        <div className="grid grid-cols-2 gap-4">
                            {items.map((ref, index) => (
                                <div key={index} data-item-id={ref.id} className="text-[0.8em]">
                                    <div className="font-bold">{ref.name}</div>
                                    <div className="italic opacity-80">{ref.position}</div>
                                    <div className="text-[0.9em] mt-1 space-y-0.5">
                                        {ref.email && <div>{ref.email}</div>}
                                        {ref.phone && <div>{ref.phone}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )
            }
            case "languages": {
                const items = itemIds ? sections.languages.filter(item => itemIds.includes(item.id)) : sections.languages
                return items.length > 0 && (
                    <section key={id}>
                        <SectionTitle title={t("languages")} />
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[0.8em]">
                            {items.map((l, index) => (
                                <div key={index} data-item-id={l.id} className="flex gap-2">
                                    <span className="font-bold">{l.name}</span>
                                    <span className="opacity-60">{l.level >= 80 ? t("native") : l.level >= 60 ? t("fluent") : t("intermediate")}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )
            }
            case "interests": {
                const items = itemIds ? sections.interests.filter(item => itemIds.includes(item.id)) : sections.interests
                return items.length > 0 && (
                    <section key={id}>
                        <SectionTitle title={t("interests")} />
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8em] opacity-80">
                            {items.map((i, index) => (
                                <span key={index} data-item-id={i.id}>{i.name}</span>
                            ))}
                        </div>
                    </section>
                )
            }
            case "education": {
                const items = itemIds ? sections.education.filter(item => itemIds.includes(item.id)) : sections.education
                return items.length > 0 && (
                    <section key={id}>
                        <SectionTitle title={t("education")} />
                        <div className="space-y-3">
                            {items.map((edu, index) => (
                                <div key={index} data-item-id={edu.id}>
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-[0.92em] w-[80%]">
                                            <LinkedTitle
                                                show={edu.showLinkInTitle}
                                                url={edu.website}
                                                fallback={edu.school}
                                            />
                                        </span>
                                        <span className="text-[0.75em] text-[#666] ml-2">{edu.location} &nbsp;·&nbsp; {formatDateRange(edu)}</span>
                                    </div>
                                    <div className="text-[0.82em] italic text-[#444]">{edu.degree}{edu.areaOfStudy && `, ${edu.areaOfStudy}`}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )
            }
            case "skills": {
                const items = itemIds ? sections.skills.filter(item => itemIds.includes(item.id)) : sections.skills
                const skillsMode = (metadata as any).skillsMode ?? "category"

                return items.length > 0 && (
                    <section key={id}>
                        <SectionTitle title={t("skills")} />

                        {skillsMode === "simple" ? (
                            // ── Simple: pill-style tags ──
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8em]">
                                {items.map((s, index) => (
                                    <span key={index} data-item-id={s.id} className="font-medium opacity-80">
                                        {s.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            // ── Category: bold label + dot-separated keywords ──
                            <div className="space-y-1.5">
                                {items.map((s, index) => (
                                    <div key={index} data-item-id={s.id} className="flex gap-2 text-[0.82em] items-baseline">
                                        <span className="font-bold min-w-[90px] shrink-0 text-black/90 uppercase tracking-wide text-[0.9em]">{s.name}</span>
                                        <span className="text-[#444] leading-relaxed">
                                            {Array.isArray(s.keywords) ? s.keywords.join(" · ") : s.keywords}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )
            }
            case "certifications": {
                const items = itemIds ? sections.certifications.filter(item => itemIds.includes(item.id)) : sections.certifications
                return items.length > 0 && (
                    <section key={id}>
                        <SectionTitle title={t("certifications")} />
                        <div className="space-y-2">
                            {items.map((c, index) => (
                                <div key={index} data-item-id={c.id}>
                                    <div className="flex justify-between text-[0.8em]">
                                        <span className="font-semibold w-[80%]">
                                            <LinkedTitle
                                                show={c.showLinkInTitle}
                                                url={c.url}
                                                fallback={c.name}
                                            />
                                        </span>
                                        <span className="text-[#888] ml-2 shrink-0">{c.date}</span>
                                    </div>
                                    {c.issuer && <div className="text-[0.78em] italic opacity-80">{c.issuer}</div>}
                                    {!isEmptyHtml(c.description) && (
                                        <div
                                            className="rich-text text-[0.8em] opacity-90 leading-relaxed executive-bullets"
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
            case "awards": {
                const items = itemIds ? sections.awards.filter(item => itemIds.includes(item.id)) : sections.awards
                return items.length > 0 && (
                    <section key={id}>
                        <SectionTitle title={t("recognition")} />
                        <div className="space-y-1">
                            {items.map((a, index) => (
                                <div key={index} data-item-id={a.id} className="flex justify-between text-[0.8em]">
                                    <span className="w-[80%]">
                                        <LinkedTitle
                                            show={a.showLinkInTitle}
                                            url={a.url}
                                            fallback={a.title}
                                        />
                                    </span>
                                    <span className="text-[#888] ml-2 shrink-0">{a.date}</span>
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

                    return items.length > 0 && (
                        <section key={id}>
                            <SectionTitle title={currentSection.name} />
                            <div className="space-y-4">
                                {items.map((item: any, index: number) => (
                                    <div key={index} data-item-id={item.id}>
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-[0.92em] w-[80%]">
                                                <LinkedTitle
                                                    show={!!item.url}
                                                    url={item.url}
                                                    fallback={item.title}
                                                />
                                            </span>
                                            <span className="text-[0.75em] text-[#666] ml-2">{item.location} &nbsp;·&nbsp; {formatDateRange(item)}</span>
                                        </div>
                                        <div className="text-[0.82em] italic text-[#444] mb-1">{item.subtitle}</div>
                                        {item.description && !isEmptyHtml(item.description) && (
                                            <div
                                                className="rich-text text-[0.8em] opacity-90 leading-relaxed executive-bullets"
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
            className="executive-template min-h-full flex flex-col bg-white p-6"
            style={{
                fontFamily: typography.fontFamily || "'Garamond', 'EB Garamond', 'Times New Roman', Georgia, serif",
                fontSize: `${typography.fontSize}pt` || "10pt",
                lineHeight: typography.lineHeight || 1.5,
                color: typography.color || "#1a1a1a",
            }}
        >
            <div style={styles.page as any}>
                {/* Left accent bar */}
                <div style={styles.accent} />

                {/* Main body */}
                <div style={styles.body}>
                    {showHeader && (
                        <header className="flex flex-col mb-4">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div style={styles.name}>{basics.name || "Your Name"}</div>
                                    <div style={styles.headline}>{basics.headline || "Professional Headline"}</div>
                                </div>
                                {basics.picture?.url && basics.picture?.visible !== false && (
                                    <div
                                        className={`shrink-0 overflow-hidden ${basics.picture.grayscale ? "grayscale" : ""}`}
                                        style={{
                                            width: `${basics.picture.size}px`,
                                            height: `${basics.picture.size}px`,
                                            borderRadius: `${basics.picture.borderRadius}%`,
                                            border: `${basics.picture.borderWidth}px solid ${design.primaryColor || "#1a1a1a"}`,
                                            boxShadow: basics.picture.shadow ? `0 ${basics.picture.shadow}px ${basics.picture.shadow * 1.5}px rgba(0,0,0,0.15)` : undefined,
                                            transform: basics.picture.rotation ? `rotate(${basics.picture.rotation}deg)` : undefined
                                        }}
                                    >
                                        <img src={basics.picture.url} alt={basics.name} className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <div style={styles.contactRow}>
                                {basics.email && <a href={`mailto:${basics.email}`} className="hover:underline">{basics.email}</a>}
                                {basics.phone && <span>{basics.phone}</span>}
                                {basics.location && <span>{basics.location}</span>}
                                {basics.website && (
                                    <a href={basics.website.startsWith("http") ? basics.website : `https://${basics.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {basics.website?.replace(/^https?:\/\//, "")}
                                    </a>
                                )}
                                {sections.profiles?.map((p, i) => (
                                    <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {p.username || p.network}
                                    </a>
                                ))}
                            </div>
                        </header>
                    )}

                    <div className="flex-1 grid grid-cols-2 gap-x-12 items-start">
                        {mainSections.map((ref: any, index: number) => {
                            const compacts = ["languages", "interests", "awards", "certifications", "volunteer", "publications"]
                            const isCompact = compacts.includes(ref.id)
                            const prevIsCompact = index > 0 && compacts.includes(mainSections[index - 1].id)
                            const nextIsCompact = index < mainSections.length - 1 && compacts.includes(mainSections[index + 1].id)

                            const shouldBeFullWidth = !isCompact || (!prevIsCompact && !nextIsCompact)

                            return (
                                <div key={ref.id} data-section-id={ref.id} className={cn("section-block mb-6 min-w-0", shouldBeFullWidth && "col-span-2")}>
                                    {renderSection(ref)}
                                </div>
                            )
                        })}
                        {sidebarSections.length > 0 && (
                            <div className="col-span-2 mt-6 grid grid-cols-2 gap-x-12 items-start">
                                {sidebarSections.map((ref: any, index: number) => {
                                    const compacts = ["languages", "interests", "awards", "certifications", "volunteer", "publications"]
                                    const isCompact = compacts.includes(ref.id)
                                    const prevIsCompact = index > 0 && compacts.includes(sidebarSections[index - 1].id)
                                    const nextIsCompact = index < sidebarSections.length - 1 && compacts.includes(sidebarSections[index + 1].id)

                                    const shouldBeFullWidth = !isCompact || (!prevIsCompact && !nextIsCompact)

                                    return (
                                        <div key={ref.id} data-section-id={ref.id} className={cn("section-block mb-6 min-w-0", shouldBeFullWidth && "col-span-2")}>
                                            {renderSection(ref)}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
        .executive-bullets ul {
          list-style: none;
          padding-left: 0;
        }
        .executive-bullets li {
          position: relative;
          padding-left: 1.2em;
          margin-bottom: 2px;
        }
        .executive-bullets li::before {
          content: "▸";
          position: absolute;
          left: 0;
          color: ${design.primaryColor || "#1a1a1a"};
        }
      `}</style>
        </div>
    )
})