# Contributing to NovaCV

Thanks for your interest in contributing! NovaCV is MIT-licensed and built in public — all contributions are welcome.

---

## Project Structure

```
novacv/
├── apps/
│   └── web/                  # Next.js 16 app (App Router)
│       ├── src/app/           # Pages, API routes, layouts
│       └── .env.local         # Environment variables (create from .env.example)
├── packages/
│   └── core/                 # Shared component library consumed by apps/web
│       └── src/
│           ├── actions/       # Server actions (auth, resumes, AI)
│           ├── components/    # UI components (builder, dashboard, home, shared)
│           ├── hooks/         # Custom React hooks
│           ├── lib/           # Utilities (db, auth, pdf, import parser, mail)
│           ├── pages/         # Page-level components imported by apps/web
│           ├── store/         # Zustand stores
│           ├── templates/     # Resume templates (React components)
│           └── types/         # TypeScript types (resume data schema)
├── drizzle/                  # Plain SQL migrations (applied via npm run migrate)
├── scripts/
│   └── migrate.js            # Node.js migration runner (no psql required)
└── turbo.json                # Turborepo config
```

---

## Local Setup

### Prerequisites

- **Node.js** 22+
- **npm** 10.8+
- A **PostgreSQL** database (local or Docker)

### Steps

```bash
# 1. Fork and clone
git clone https://github.com/asifrazadev/NovaCV.git
cd NovaCV

# 2. Install dependencies
npm install

# 3. Create your env file
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local — set DATABASE_URL and NEXTAUTH_SECRET at minimum

# 4. Apply migrations
npm run migrate

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Adding a Template

Templates are self-contained React components in `packages/core/src/templates/`.

1. Copy an existing template file (e.g. `modern.tsx`) and rename it.
2. Register it in `packages/core/src/templates/index.ts`:
   ```ts
   {
     id: "my-template",
     name: "My Template",
     component: MyTemplate,
     thumbnail: "/thumbnails/my-template.png",
     features: { skillLevel: false, languageLevel: true },
     defaultLayout: { main: [...], sidebar: [] }
   }
   ```
3. Add a `600×848px` thumbnail PNG to `apps/web/public/thumbnails/`.
4. The template receives `{ data, metadata, sections }` props — render whatever you like.

---

## Adding a Migration

All schema changes go through plain SQL migrations:

```bash
# Create a new file in drizzle/ with the next sequence number
# e.g. drizzle/0004_my_change.sql

# Apply it locally
npm run migrate
```

The migration runner (`scripts/migrate.js`) tracks applied files in a `schema_migrations` table — re-running is safe.

---

## Running Linting

```bash
npm run lint
```

---

## Branch Naming

| Type | Pattern |
|---|---|
| Feature | `feat/short-description` |
| Bug fix | `fix/short-description` |
| Docs | `docs/what-changed` |
| Chore | `chore/what-changed` |

---

## Commit Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add cover letter generator to AI panel
fix: prevent ATS scorer from flagging 2025 dates as outdated
docs: update CONTRIBUTING with migration guide
chore: remove @react-pdf/renderer dead dependency
```

---

## Pull Request Process

1. Open a PR against `master`.
2. Describe **what** changed and **why** — link to an issue if one exists.
3. Ensure `npm run lint` passes.
4. A maintainer will review and merge.

---

## AI Provider Setup (optional)

AI features require at least one provider key in `.env.local`:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
OPENROUTER_API_KEY=sk-or-...
```

For fully local/offline AI, set `OLLAMA_BASE_URL=http://localhost:11434` and select Ollama inside the builder settings panel — no key needed.
