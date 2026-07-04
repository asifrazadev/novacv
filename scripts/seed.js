#!/usr/bin/env node
/**
 * NovaCV seed script — inserts a demo user with a sample resume and a
 * couple of job applications, so a freshly migrated database (e.g. staging)
 * isn't empty. Safe to re-run: existing rows for the demo user are left as-is.
 *
 * Usage:
 *   node scripts/seed.js
 *   node scripts/seed.js --staging     (uses STAGING_DATABASE_URL)
 */

const bcrypt = require("bcryptjs")
const { Pool } = require("pg")
const { resolveDatabaseUrl } = require("./lib/db-url")

const DEMO_EMAIL = "demo@novacv.app"
const DEMO_PASSWORD = "demo12345"

const demoResumeData = {
  id: "",
  title: "Demo Resume",
  basics: {
    name: "Jordan Rivera",
    headline: "Senior Product Designer",
    email: DEMO_EMAIL,
    phone: "+1 555-0100",
    location: "Austin, TX",
    website: "https://jordanrivera.example.com",
    picture: {
      url: "", size: 64, aspectRatio: 1, borderRadius: 0, borderWidth: 0,
      borderColor: "#000000", rotation: 0, shadow: 0, grayscale: false, visible: true,
    },
  },
  sections: {
    summary: { content: "Product designer with 8+ years shipping design systems and 0-to-1 products." },
    profiles: [],
    experience: [{
      id: "exp-1",
      company: "Acme Corp",
      position: "Senior Product Designer",
      location: "Remote",
      startDate: "2021-01-01",
      endDate: "",
      isCurrent: true,
      website: "",
      websiteLabel: "",
      showLinkInTitle: false,
      roles: [],
      description: "Led design for the core dashboard product used by 50k+ customers.",
    }],
    education: [{
      id: "edu-1",
      school: "University of Texas at Austin",
      areaOfStudy: "Human-Computer Interaction",
      degree: "B.S.",
      grade: "",
      location: "Austin, TX",
      startDate: "2013-08-01",
      endDate: "2017-05-01",
      isCurrent: false,
      website: "",
      websiteLabel: "",
      showLinkInTitle: false,
      description: "",
    }],
    projects: [],
    skills: [
      { id: "skill-1", name: "Figma", level: 5, keywords: [] },
      { id: "skill-2", name: "Design Systems", level: 4, keywords: [] },
    ],
    languages: [],
    interests: [],
    awards: [],
    certifications: [],
    publications: [],
    volunteer: [],
    references: [],
  },
  metadata: {
    template: "modern",
    layout: {
      main: ["summary", "experience", "education", "projects", "volunteer"],
      sidebar: ["skills", "languages", "interests", "awards", "certifications", "publications", "references"],
    },
    typography: { fontFamily: "Inter", fontSize: 10, lineHeight: 1.5, color: "#000000", nameSize: 24, headlineSize: 12, sectionTitleSize: 10 },
    design: { primaryColor: "#2563eb", spacing: 1, borderRadius: 4 },
    page: { format: "a4", width: 210, height: 297, padding: 20 },
    language: "en",
    css: "",
  },
}

async function main() {
  const staging = process.argv.includes("--staging")
  const varName = staging ? "STAGING_DATABASE_URL" : "DATABASE_URL"

  const connectionString = resolveDatabaseUrl(varName)
  if (!connectionString) {
    console.error(`❌  ${varName} is not set. Pass it as an env var or set it in .env.local`)
    process.exit(1)
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("supabase.com") || connectionString.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : false,
  })

  const client = await pool.connect()

  try {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)

    const { rows: userRows } = await client.query(
      `INSERT INTO users (email, name, password_hash, professional_title)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      [DEMO_EMAIL, "Jordan Rivera", passwordHash, "Senior Product Designer"]
    )
    const userId = userRows[0].id
    console.log(`  ✅  demo user ready (${DEMO_EMAIL} / ${DEMO_PASSWORD})`)

    const { rows: existingResumes } = await client.query(
      `SELECT id FROM resumes WHERE user_id = $1 LIMIT 1`,
      [userId]
    )

    if (existingResumes.length === 0) {
      await client.query(
        `INSERT INTO resumes (user_id, title, data, is_public)
         VALUES ($1, $2, $3, $4)`,
        [userId, "Demo Resume", JSON.stringify(demoResumeData), true]
      )
      console.log("  ✅  demo resume created")
    } else {
      console.log("  ⏭  demo resume already exists, skipping")
    }

    const { rows: existingApps } = await client.query(
      `SELECT id FROM job_applications WHERE user_id = $1 LIMIT 1`,
      [userId]
    )

    if (existingApps.length === 0) {
      await client.query(
        `INSERT INTO job_applications (user_id, company, position, status, location)
         VALUES ($1, $2, $3, $4, $5), ($1, $6, $7, $8, $9)`,
        [
          userId,
          "Globex", "Product Designer", "applied", "Remote",
          "Initech", "Staff Product Designer", "interviewing", "Austin, TX",
        ]
      )
      console.log("  ✅  demo job applications created")
    } else {
      console.log("  ⏭  demo job applications already exist, skipping")
    }

    console.log("\nSeed complete.")
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(err => {
  console.error("Seed script crashed:", err.message)
  process.exit(1)
})
