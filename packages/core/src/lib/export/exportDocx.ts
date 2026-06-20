// src/lib/export/exportDocx.ts
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx"
import { ResumeData } from "@/types/resume"

// Helper to strip HTML tags and decode HTML entities
function cleanHtml(html: string): string[] {
  if (!html) return []
  // Split block elements to lines
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<p>/gi, "")
    .replace(/<li>/gi, "• ")
    .replace(/<div>/gi, "")

  // Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, "")

  // Decode standard XML/HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export async function exportResumeToDocx(data: ResumeData, filename: string): Promise<boolean> {
  try {
    const { basics, sections, metadata } = data
    const docChildren: any[] = []

    // 1. Header (Name, Title, Contact Info)
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: basics.name || "Your Name",
            bold: true,
            size: 32, // 16pt
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    )

    if (basics.headline) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: basics.headline,
              italics: true,
              size: 22, // 11pt
            }),
          ],
          alignment: AlignmentType.CENTER,
        })
      )
    }

    const contactParts = [
      basics.email,
      basics.phone,
      basics.location,
      basics.website,
    ].filter(Boolean)

    if (contactParts.length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactParts.join("  |  "),
              size: 20, // 10pt
            }),
          ],
          alignment: AlignmentType.CENTER,
        })
      )
    }

    // Spacing
    docChildren.push(new Paragraph({ text: "" }))

    // Helper to format Date Range
    const formatDateRange = (item: any) => {
      if (item.startDate) {
        const end = item.isCurrent ? "Present" : item.endDate || ""
        return `${item.startDate}${end ? ` – ${end}` : ""}`
      }
      return item.date || ""
    }

    // Helper to add section headers
    const addSectionHeader = (title: string) => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: title.toUpperCase(),
              bold: true,
              size: 24, // 12pt
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          thematicBreak: true, // Divider line
        })
      )
    }

    // Helper to add list descriptions
    const addDescription = (htmlDesc: string) => {
      const lines = cleanHtml(htmlDesc)
      lines.forEach((line) => {
        const isBullet = line.startsWith("•")
        const cleanLine = isBullet ? line.replace(/^•\s*/, "") : line
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: cleanLine, size: 20 })],
            bullet: isBullet ? { level: 0 } : undefined,
            indent: isBullet ? undefined : { left: 360 }, // Small indent if not bulleted
          })
        )
      })
    }

    // 2. Summary Section
    if (sections.summary?.content && cleanHtml(sections.summary.content).length > 0) {
      addSectionHeader("Professional Summary")
      addDescription(sections.summary.content)
      docChildren.push(new Paragraph({ text: "" }))
    }

    // 3. Experience Section
    if (sections.experience && sections.experience.length > 0) {
      addSectionHeader("Work Experience")
      sections.experience.forEach((exp) => {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.company || "", bold: true, size: 22 }),
              new TextRun({ text: exp.location ? ` (${exp.location})` : "", size: 20 }),
              new TextRun({ text: `\t${formatDateRange(exp)}`, bold: true, size: 20 }),
            ],
            alignment: AlignmentType.LEFT,
          })
        )

        if (exp.position) {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: exp.position, italics: true, size: 20 })],
            })
          )
        }

        if (exp.roles && exp.roles.length > 0) {
          exp.roles.forEach((role: any) => {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `  ${role.title}`, bold: true, size: 20 }),
                  new TextRun({ text: `\t${formatDateRange(role)}`, size: 20 }),
                ],
              })
            )
            if (role.description) {
              addDescription(role.description)
            }
          })
        } else if (exp.description) {
          addDescription(exp.description)
        }
        docChildren.push(new Paragraph({ text: "" }))
      })
    }

    // 4. Education Section
    if (sections.education && sections.education.length > 0) {
      addSectionHeader("Education")
      sections.education.forEach((edu) => {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.school || "", bold: true, size: 22 }),
              new TextRun({ text: edu.location ? ` (${edu.location})` : "", size: 20 }),
              new TextRun({ text: `\t${formatDateRange(edu)}`, bold: true, size: 20 }),
            ],
          })
        )
        const degreeDetails = [edu.degree, edu.areaOfStudy].filter(Boolean).join(", ")
        if (degreeDetails || edu.grade) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: degreeDetails || "", italics: true, size: 20 }),
                new TextRun({ text: edu.grade ? ` (GPA/Grade: ${edu.grade})` : "", size: 20 }),
              ],
            })
          )
        }
        if (edu.description) {
          addDescription(edu.description)
        }
        docChildren.push(new Paragraph({ text: "" }))
      })
    }

    // 5. Projects Section
    if (sections.projects && sections.projects.length > 0) {
      addSectionHeader("Projects")
      sections.projects.forEach((proj) => {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: proj.name || "", bold: true, size: 22 }),
              new TextRun({ text: proj.url ? ` (${proj.url})` : "", size: 18, color: "0000FF" }),
              new TextRun({ text: `\t${formatDateRange(proj)}`, bold: true, size: 20 }),
            ],
          })
        )
        if (proj.description) {
          addDescription(proj.description)
        }
        docChildren.push(new Paragraph({ text: "" }))
      })
    }

    // 6. Skills Section
    if (sections.skills && sections.skills.length > 0) {
      addSectionHeader("Skills")
      const skillsMode = (metadata as any).skillsMode ?? "category"

      if (skillsMode === "simple") {
        const skillsList = sections.skills.map((s) => s.name).join(", ")
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: skillsList, size: 20 })],
          })
        )
      } else {
        sections.skills.forEach((s) => {
          const keywordsStr = Array.isArray(s.keywords) ? s.keywords.join(", ") : s.keywords
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${s.name}: `, bold: true, size: 20 }),
                new TextRun({ text: keywordsStr || "", size: 20 }),
              ],
            })
          )
        })
      }
      docChildren.push(new Paragraph({ text: "" }))
    }

    // 7. Certifications
    if (sections.certifications && sections.certifications.length > 0) {
      addSectionHeader("Certifications")
      sections.certifications.forEach((cert) => {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: cert.name || "", bold: true, size: 22 }),
              new TextRun({ text: `\t${cert.date || ""}`, size: 20 }),
            ],
          })
        )
        if (cert.issuer) {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: cert.issuer, italics: true, size: 20 })],
            })
          )
        }
        if (cert.description) {
          addDescription(cert.description)
        }
        docChildren.push(new Paragraph({ text: "" }))
      })
    }

    // 8. Custom Sections
    const customSections = (sections as any).customSections ?? []
    customSections.forEach((c: any) => {
      const items = c.items ?? []
      if (items.length === 0) return

      addSectionHeader(c.name || "Custom Section")
      items.forEach((item: any) => {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.title || "", bold: true, size: 22 }),
              new TextRun({ text: item.location ? ` (${item.location})` : "", size: 20 }),
              new TextRun({ text: `\t${formatDateRange(item)}`, bold: true, size: 20 }),
            ],
          })
        )
        if (item.subtitle || item.url) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: item.subtitle || "", italics: true, size: 20 }),
                new TextRun({ text: item.url ? ` (${item.url})` : "", size: 18, color: "0000FF" }),
              ],
            })
          )
        }
        if (item.description) {
          addDescription(item.description)
        }
        docChildren.push(new Paragraph({ text: "" }))
      })
    })

    // Additional generic sections (languages, awards, interests, etc.)
    const genericSectionsList = [
      { id: "languages", label: "Languages" },
      { id: "interests", label: "Interests" },
      { id: "awards", label: "Awards & Recognition" },
      { id: "volunteer", label: "Volunteer Work" },
      { id: "publications", label: "Publications" },
      { id: "references", label: "References" },
    ]

    genericSectionsList.forEach((sec) => {
      const list = sections[sec.id as keyof typeof sections] as any[]
      if (list && list.length > 0) {
        addSectionHeader(sec.label)
        list.forEach((item) => {
          if (sec.id === "languages") {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({ text: item.name || "", bold: true, size: 20 }),
                  new TextRun({ text: item.level ? ` - Level: ${item.level}%` : "", size: 20 }),
                ],
              })
            )
          } else if (sec.id === "interests") {
            docChildren.push(
              new Paragraph({
                children: [new TextRun({ text: item.name || "", size: 20 })],
              })
            )
          } else if (sec.id === "awards") {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({ text: item.title || "", bold: true, size: 20 }),
                  new TextRun({ text: item.awarder ? ` (${item.awarder})` : "", size: 20 }),
                  new TextRun({ text: `\t${item.date || ""}`, size: 20 }),
                ],
              })
            )
          } else if (sec.id === "volunteer") {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({ text: item.organization || "", bold: true, size: 22 }),
                  new TextRun({ text: `\t${formatDateRange(item)}`, size: 20 }),
                ],
              })
            )
            if (item.position) {
              docChildren.push(
                new Paragraph({
                  children: [new TextRun({ text: item.position, italics: true, size: 20 })],
                })
              )
            }
            if (item.description) {
              addDescription(item.description)
            }
          } else if (sec.id === "publications") {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({ text: item.name || "", bold: true, size: 20 }),
                  new TextRun({ text: item.publisher ? ` - ${item.publisher}` : "", size: 20 }),
                  new TextRun({ text: `\t${item.date || ""}`, size: 20 }),
                ],
              })
            )
          } else if (sec.id === "references") {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({ text: item.name || "", bold: true, size: 20 }),
                  new TextRun({ text: item.position ? ` (${item.position})` : "", italics: true, size: 20 }),
                ],
              })
            )
            if (item.email || item.phone) {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: `Contact: ${[item.email, item.phone].filter(Boolean).join(" | ")}`, size: 18 }),
                  ],
                })
              )
            }
          }
        })
        docChildren.push(new Paragraph({ text: "" }))
      }
    })

    // Build Word Document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    })

    // Compile & Save
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error("Error generating Word Document:", error)
    return false
  }
}
