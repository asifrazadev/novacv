# 🌌 NovaCV - Premium Resume Builder

NovaCV is a high-fidelity, open-source resume builder designed for the modern job seeker. Built with speed, aesthetics, and ATS-optimization in mind, it provides a seamless "What You See Is What You Get" (WYSIWYG) experience with intelligent pagination, multi-template support, and AI-powered optimization.

![NovaCV Banner](https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=1200&h=400)

**Your data, your infrastructure.** NovaCV is a 100% open-source resume builder and application tracker. Unlike closed, paywalled competitors, you can self-host NovaCV to keep your professional data fully under your control. Use local AI models via Ollama to ensure your data never touches a third-party server.

## ✨ Features

### 🚀 Core Features - Currently Implemented

#### **Resume Builder & Editing Experience**
- **Real-time WYSIWYG Editor**: Live side-by-side editing interface with instantaneous visual feedback of the final layout.
- **Dynamic Multi-page Pagination**: Intelligent page height calculation and overflow management ensuring professional multi-page document separation.
- **Workspace Canvas Zoom**: Slider-based preview canvas zoom controls (from 25% to 150%) with automatic responsive zoom adjustment on mobile viewports.
- **Rich Text Editing**: Full-featured text styling powered by headless Tiptap integration for summaries and bullet descriptions.
- **Drag-and-Drop Reordering**: Rearrange columns, layout cards, and individual list entries smoothly using modern drag-and-drop logic.

#### **Comprehensive Resume Sections**
- **Basics**: Contact info, headline, and profile picture featuring extensive customization (Grayscale, Corner/Shape, Shadow, Border Weight, scale/size, and rotation).
- **Work Experience**: Organization details, positions, locations, date ranges, current job toggle, and detailed roles bullet lists.
- **Education**: School, Degree, Area of Study, GPA/Grade tracking, and date metrics.
- **Projects**: Project title, dates, descriptions, and repository/demo links.
- **Skills & Languages**: Categorized groups or simple tags with customizable progress indicator bars.
- **Additional Sections**: Summary, Social Profiles (with auto-detecting brand icons), Volunteer work, Publications, Awards, and References.
- **Custom List Sections**: Dynamically create entirely custom named sections (e.g., "Hackathons", "Patents", "Courses") with custom titles, Org, locations, dates, URLs, and descriptions.

#### **Extensive Resume Templates**
- **Modern**: Elegant double-column layout with main details on the left and a secondary sidebar for supporting details (skills, languages, social profiles).
- **Professional (Jake)**: Traditional, clean single-column layout optimized for corporate and technical resume screens.
- **Executive**: Comprehensive skills-focused layout designed to highlight senior achievements and competencies first.
- **Academic**: Custom formatted template optimized for research, credentials, teaching, publications, and professional references.

#### **Interactive AI Optimization Suite (ATS Tools)**
- **ATS Compatibility Scoring**: Instant metric computation analyzing word counts, character counts, and general structural quality.
- **Job Description Gap Analysis**: Compare resume details against target job descriptions to identify missing keywords, skills, and get suggestions.
- **AI Job Tailoring**: Auto-align summary, technical skills list, and experience bullet points to match target job descriptions with one-click injection.
- **AI Highlight Rewriter**: Select any text block to rewrite or rephrase on-the-fly using professional tones (*Professional*, *ATS Optimized*, *Action Oriented*, *Concise*, *Technical*).
- **AI Suggestions & Prompts**: Contextual creation of descriptions and target keywords based on input job titles.
- **Flexible Providers**: Native support for OpenAI, Anthropic (Claude), Google Gemini, OpenRouter, and local offline Ollama models.
- **AI Resume PDF Parsing**: Extract structured resume data from existing PDF resumes for quick onboarding.

#### **Advanced Layout & Styling Customization**
- **Premium Typography**: Select from 8 handpicked font pairings (`Inter`, `Roboto`, `Outfit`, `Playfair Display`, `Lora`, `EB Garamond`, `Georgia`, `JetBrains Mono`) with individual size sliders for names, headlines, titles, body copy, and line spacing.
- **Theme Color Customizer**: Toggle light/dark themes, select from a curated list of color presets, or input any custom hex color for accent styling.
- **Corner Radius / Border Control**: Interactive slider adjustments for rounded/square styling on tags, badges, and template borders.
- **Custom Dimensions**: Switch layouts between standard templates (`A4`, `Letter`, `Legal`, `Executive`) or define custom widths and heights in millimeters.
- **Adjustable Margins**: Custom margin/padding controls to regulate whitespace and balance page content layout.
- **Raw CSS Sandbox**: Write customized CSS code blocks directly in-editor for custom templates style overriding.

#### **Export, Sharing & Analytics**
- **High-Fidelity PDF Export**: Server-side Playwright rendering — the browser lays out the resume exactly as seen, Playwright captures it as a pixel-perfect PDF.
- **Word Document (.docx) Export**: Download resume as a native Microsoft Word document using structural tables and paragraph formatting.
- **Public Sharing**: Generate unique, secure links to share a web-viewable, read-only copy of your resume.
- **Public Link Analytics**: View count and last-viewed timestamp tracked on every shared resume link. QR code auto-generated for the public URL — scan to open on mobile.
- **One-Click Compact Mode**: Smart layout shrink that reduces font sizes and margins to squeeze a two-page resume down to one page within readable limits. Toggle to restore.

#### **Authentication & Security**
- **Auth.js (NextAuth v5)**: Email/password credentials, Google and GitHub OAuth, JWT sessions with DrizzleAdapter.
- **Magic Link Sign-In**: Email-only passwordless sign-in via Nodemailer — no password required.
- **Two-Factor Authentication (TOTP)**: Authenticator app 2FA (Google Authenticator, Authy, etc.) with QR code setup flow and manual entry fallback.
- **Account Deletion**: Self-service account wipe — permanently deletes the account, all resumes, and job applications after explicit confirmation.

#### **AI Tools**
- **Cover Letter Generator**: Paste a job description and generate a tailored 3-paragraph cover letter that weaves in your resume achievements and mirrors the JD keywords.
- **6-Second Recruiter Scan**: Simulates a recruiter's first-glance — AI reports what it notices first, what stands out positively, immediate red flags, and a gut-check verdict on whether the resume makes the shortlist.

#### **Job Application Tracker**
- **Kanban Board**: Track job applications across status columns with drag-and-drop reordering.
- **CSV Export**: Download the full tracker board as a CSV with company, position, status, date applied, salary, location, URL, and notes.

#### **Keyboard Shortcuts**
| Shortcut | Action |
|---|---|
| `Cmd/Ctrl+S` | Confirm auto-save |
| `Cmd/Ctrl+P` | Export as PDF |
| `Cmd/Ctrl+/` | Toggle AI panel |
| `Alt+↓` | Next section |
| `Alt+↑` | Previous section |
| `Escape` | Close active editor section |

### 🛠️ Planned Features & Roadmap
- [ ] **Expanded Template Gallery**: Additional industry-specific templates
- [ ] **Multilingual Support**: Localized resumes for global job markets
- [ ] **Analytics Dashboard**: Full public resume analytics — views over time, referrer tracking, geography
- [ ] **Batch Operations**: Bulk actions on multiple resumes
- [ ] **Template Marketplace**: Community-created templates
- [ ] **Resume Versioning**: Save and restore previous versions of a resume

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org) with React 19 - Latest cutting-edge version
- **Monorepo**: [Turborepo](https://turbo.build) - High-performance build system
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) with PostCSS support
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight client state management
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team) — type-safe queries, plain SQL migrations, no external service required
- **Authentication**: [Auth.js v5 (NextAuth)](https://authjs.dev) — credentials + OAuth, JWT sessions, Drizzle adapter
- **Rich Text Editing**: [Tiptap](https://tiptap.dev) - Headless WYSIWYG editor
- **UI Components**: [Shadcn UI](https://ui.shadcn.com) - Accessible component library built on Radix UI
- **Document Generation**: 
  - [Playwright Core](https://playwright.dev) - Server-side PDF rendering for high-fidelity exports
  - [docx](https://docx.js.org/) - Direct MS Word document (.docx) generation
- **Icons**: [Lucide React](https://lucide.dev) & [React Social Icons](https://jaketrent.com/react-social-icons/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai) - Multi-provider AI support
  - OpenAI GPT models
  - Anthropic Claude
  - Google Gemini
  - OpenRouter
  - Local Ollama support
- **Form Handling**: [Zod](https://zod.dev) - TypeScript-first schema validation
- **Drag & Drop**: [@dnd-kit](https://docs.dndkit.com/) - Modern drag-and-drop library
- **Date Management**: [date-fns](https://date-fns.org) - Functional date utilities
- **Notifications**: [Sonner](https://sonner.emilkowal.ski) - Toast notifications
- **Type Safety**: TypeScript 5 - Full type safety throughout
- **Linting & Code Quality**: ESLint 9 - With Next.js and Tailwind plugins

## 🏁 Getting Started

### Prerequisites

- **Node.js** 22+ (required by `@sparticuz/chromium` for PDF export)
- **npm** 10.8+
- A **PostgreSQL** database (local install, Docker, or any managed Postgres)
- (Optional) AI provider API keys for AI features

---

### Option A — Run locally (development)

#### 1. Clone and install

```bash
git clone https://github.com/asifrazadev/NovaCV.git
cd NovaCV
npm install
```

#### 2. Set up a PostgreSQL database

Any Postgres 15+ will work. Quickest local option:

```bash
docker run -d \
  --name novacv-db \
  -e POSTGRES_DB=novacv \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine
```

#### 3. Apply the database migrations

```bash
npm run migrate
```

This runs `scripts/migrate.js` — no `psql` needed. It reads `DATABASE_URL` from your `.env.local` and applies all pending `.sql` files from `drizzle/` in order.

#### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and set at minimum:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/novacv

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional — at least one AI key enables AI features
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
```

#### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and register an account.

---

### Option B — One-command Docker stack

No database setup needed. Postgres + migrations + Next.js all start together.

#### 1. Configure secrets (optional but recommended)

Create a `.env` file in the project root:

```env
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-random-secret-here

# Optional AI keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
OPENROUTER_API_KEY=sk-or-...
```

#### 2. Start everything

```bash
docker compose up --build
```

Docker Compose will:
1. Start PostgreSQL 16
2. Apply the schema migration automatically
3. Build and start the Next.js app

| Service | URL |
|---|---|
| App | http://localhost:3000 |

> **Auth is disabled by default** in the Docker build so you can use the app immediately without setting up email/OAuth. To enable multi-user auth, pass the build arg:
> ```bash
> NEXT_PUBLIC_AUTH_ENABLED=true docker compose up --build
> ```
> Or set `NEXT_PUBLIC_AUTH_ENABLED: "true"` in the `build.args` block of `docker-compose.yml`.

Open http://localhost:3000 and start building your resume.

#### Stop / restart

```bash
docker compose down          # stop, keep database data
docker compose down -v       # stop and wipe the database
docker compose up -d         # run in background (no logs)
```

---

### Project Structure

This is a **Turborepo monorepo** with two workspaces:

```
NovaCV/
├── apps/
│   └── web/                        # Next.js application
│       ├── src/
│       │   ├── app/                # App Router pages and API routes
│       │   │   ├── (auth)/         # Login, register, password reset
│       │   │   ├── api/            # API routes (PDF, extension endpoints)
│       │   │   ├── dashboard/      # Authenticated user area
│       │   │   └── p/[id]/         # Public resume viewer
│       │   ├── middleware.ts        # Auth session middleware
│       │   └── globals.css
│       ├── next.config.ts
│       └── package.json
│
├── packages/
│   └── core/                       # Shared library (used by apps/web)
│       └── src/
│           ├── actions/            # Next.js server actions (auth, resumes, applications)
│           ├── components/         # React components (builder, templates, UI)
│           ├── lib/                # Utilities (AI, Drizzle db, PDF, export)
│           ├── templates/          # Resume templates (Modern, Jake, Executive, Academic)
│           └── types/              # Shared TypeScript types
│
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── package.json                    # Turborepo root
```

### Available Scripts

Run all commands from the **repository root**:

```bash
npm run dev        # Start development server (all workspaces via Turborepo)
npm run build      # Production build
npm run lint       # Run ESLint across all workspaces
```

To run only the web app directly:

```bash
cd apps/web
npm run dev        # next dev
npm run build      # next build
npm start          # next start (production)
```

---

### Deployment

#### Deploy to Vercel (recommended)

1. Click the Deploy button below.
2. Set your environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and any AI keys) in the Vercel project settings.
3. Deploy.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fasifrazadev%2FNovaCV)

Vercel auto-detects the monorepo and builds `apps/web` correctly.

#### Deploy to other platforms

The app outputs a Next.js standalone build (`output: "standalone"` in `next.config.ts`). Any platform that runs Node.js 20+ and accepts a Docker image or a Node.js server works — Railway, Render, Fly.io, AWS, etc.

Required at runtime:
- `DATABASE_URL` — Postgres connection string
- `NEXTAUTH_SECRET` — random secret (32+ bytes)
- `NEXTAUTH_URL` — your public app URL
- At least one AI key if you want AI features enabled server-side

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please refer to our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to get started, branch naming, commit formats, and the PR process. By participating, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

### Areas We Need Help With
- 🎨 Additional resume templates
- 🌍 Localization/i18n translations
- 📈 Analytics and metrics tracking
- 🤖 AI prompt improvements
- 🐛 Bug fixes and performance optimizations
- 📚 Documentation improvements

## 💡 Key Features Deep Dive

### Real-Time Resume Building
Watch your resume update instantly as you type with our WYSIWYG editor. The live preview shows exactly how your resume will appear when exported or shared.

### AI-Powered Optimization
Our integrated AI assistant helps you:
- **Match job descriptions** with actionable recommendations
- **Rewrite content** in multiple professional tones
- **Generate bullet points** tailored to your industry
- **Score against ATS systems** for better applicant tracking compatibility

### Secure Resume Sharing
Generate unique, secure URLs to share your resume without exposing personal information. A QR code is auto-generated for mobile sharing, and every link tracks view count and last-viewed timestamp.

### Multi-Template Support
Switch between professionally designed templates without losing your data. Each template adapts your content intelligently.

## ❓ FAQ

**Q: Is NovaCV free?**
A: Yes! NovaCV is completely free and open-source. You just need a PostgreSQL database to run it.

**Q: Do I need to provide my own AI API keys?**
A: No, AI features are optional. You can use NovaCV as a standard resume builder without them. To enable AI features, provide your own API keys from OpenAI, Anthropic, Google, etc.

**Q: Can I export my resume as PDF?**
A: Yes! NovaCV generates pixel-perfect PDFs that match your screen exactly, fully optimized for ATS systems.

**Q: Can I share my resume publicly?**
A: Yes! Generate a public shareable link for your resume. Others can view it in a read-only format.

**Q: What happens to my data?**
A: Your data lives in your own PostgreSQL database. Only you have access — no third-party cloud service involved.

**Q: Can I use multiple templates?**
A: Yes! Switch between templates anytime. You can also create multiple resumes for different positions.

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea?
- **Report Bugs**: [GitHub Issues](https://github.com/asifrazadev/NovaCV/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/asifrazadev/NovaCV/discussions)

## 📞 Support & Community

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community support

## 🚀 Roadmap

### Next Steps (Q3 2026)
- 📱 Enhanced mobile builder experience
- 🎨 Additional resume templates
- 📊 Full public resume analytics dashboard
- 🔢 Resume versioning — save and restore snapshots

### Future (Q4 2026+)
- 🌐 Multilingual resume support
- 💼 LinkedIn profile sync
- 🔗 ATS system integrations
- 🎓 Industry-specific templates
- 🛒 Community template marketplace

---

Built with ❤️ by the NovaCV Team.


