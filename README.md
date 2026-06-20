# 🌌 NovaCV - Premium Resume Builder

NovaCV is a high-fidelity, open-source resume builder designed for the modern job seeker. Built with speed, aesthetics, and ATS-optimization in mind, it provides a seamless "What You See Is What You Get" (WYSIWYG) experience with intelligent pagination, multi-template support, and AI-powered optimization.

![NovaCV Banner](https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=1200&h=400)

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

#### **Export, Sharing & Security**
- **High-Fidelity PDF Export**: Dual-engine generation (server-side Playwright rendering or client-side react-pdf renderer) for pixel-perfect printouts.
- **Word Document (.docx) Export**: Download resume as a native Microsoft Word document using structural tables and paragraph formatting.
- **Public Sharing**: Generate unique, secure links to share a web-viewable, read-only copy of your resume.
- **Authentication & RLS**: Fully protected Supabase login with Row-Level Security policies ensuring private database isolation.

### 🛠️ Planned Features & Roadmap
- [ ] **Expanded Template Gallery**: Additional industry-specific templates
- [ ] **LinkedIn Sync**: Direct LinkedIn profile integration (UI in progress)
- [ ] **Multilingual Support**: Localized resumes for global job markets
- [ ] **Analytics Dashboard**: Track views, downloads, and engagement metrics for shared resumes
- [ ] **Batch Operations**: Bulk actions on multiple resumes
- [ ] **Template Marketplace**: Community-created templates

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org) with React 19 - Latest cutting-edge version
- **Monorepo**: [Turborepo](https://turbo.build) - High-performance build system
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) with PostCSS support
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight client state management
- **Database & Authentication**: [Supabase](https://supabase.com) - Open-source Firebase alternative
  - PostgreSQL database with Row-Level Security (RLS)
  - Email, Google, and GitHub OAuth providers
  - Automatic profile creation on signup via database triggers
- **Rich Text Editing**: [Tiptap](https://tiptap.dev) - Headless WYSIWYG editor
- **UI Components**: [Shadcn UI](https://ui.shadcn.com) - Accessible component library built on Radix UI
- **Document Generation**: 
  - [Playwright Core](https://playwright.dev) - Server-side PDF rendering for high-fidelity exports
  - [@react-pdf/renderer](https://react-pdf.org) - Client-side alternative PDF rendering engine
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
- **Node.js** 20+ (LTS recommended)
- **npm** 10+ or **pnpm** 8+
- A **Supabase Project** (free tier available at [supabase.com](https://supabase.com))
- (Optional) AI Provider API Keys (OpenAI, Anthropic, Google, etc.) for AI features

### Installation & Setup

This project is structured as a **Turborepo monorepo**.

#### 1. **Clone the Repository**
```bash
git clone https://github.com/asifrazadev/NovaCV.git
cd NovaCV
```

#### 2. **Install Dependencies**
```bash
npm install
```

#### 3. **Set Up Supabase Project**
1. Create a new project at [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** in your Supabase project
3. Click **New Query** and paste the contents of:
   ```
   supabase/migrations/20260415152653_init_schema.sql
   ```
4. Execute the SQL to set up:
   - `profiles` table with user profile information
   - `resumes` table for storing resume data
   - Row-Level Security (RLS) policies for data protection
   - Automatic profile creation trigger on user signup

#### 4. **Configure Environment Variables**
1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials from your project settings:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # AI Provider Keys (optional, can be set in UI later)
   OPENAI_API_KEY=your-key-here
   ANTHROPIC_API_KEY=your-key-here
   GEMINI_API_KEY=your-key-here
   OPENROUTER_API_KEY=your-key-here
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   OPENROUTER_MODEL=openai/gpt-4o
   ```

3. **Get Your Supabase Credentials**:
   - Go to **Settings > API** in your Supabase project
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public key` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

#### 5. **Run the Development Server**
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start building resumes.

### Project Structure
```
NovaCV/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/          # Authentication pages (login, register, etc.)
│   │   ├── api/             # API routes
│   │   ├── dashboard/       # Dashboard and user area
│   │   ├── resumes/         # Resume builder and public viewer
│   │   └── page.tsx         # Landing page
│   ├── components/          # Reusable React components
│   │   ├── builder/         # Resume builder components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── auth/            # Authentication components
│   │   ├── home/            # Landing page components
│   │   └── ui/              # Shadcn UI component library
│   ├── lib/                 # Utility functions
│   │   ├── ai-helper.ts     # AI provider initialization
│   │   ├── ai-provider.ts   # AI API integrations
│   │   ├── export-pdf.ts    # PDF generation logic
│   │   ├── import-parser.ts # PDF parsing for resume import
│   │   └── utils.ts         # General utilities
│   ├── store/               # Zustand state management
│   │   └── use-ai-store.ts  # AI configuration store
│   ├── templates/           # Resume templates
│   │   ├── modern.tsx       # Modern two-column template
│   │   ├── Jake.tsx         # Professional single-column template
│   │   └── executive.tsx    # Executive skills-first template
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Supabase and utility helpers
│   └── middleware.ts        # Authentication middleware
├── supabase/
│   └── migrations/          # Database schema and migrations
├── public/                  # Static assets
├── package.json             # Project dependencies
└── next.config.ts           # Next.js configuration
```

### Available Scripts

```bash
# Development
npm run dev           # Start development server

# Production
npm run build         # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### Deployment

#### Deploy to Vercel (Recommended)
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project" and select your NovaCV repository
4. Set environment variables in Vercel project settings
5. Deploy!

#### Deploy to Other Platforms
The app is a standard Next.js application and can be deployed to any Node.js hosting service (AWS, Heroku, Railway, etc.). Ensure:
- Node.js 20+ is available
- Environment variables are configured
- Database migrations are applied to your Supabase instance

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
Generate unique, secure URLs to share your resume without exposing personal information. Track who views your shared resume (coming soon in analytics dashboard).

### Multi-Template Support
Switch between professionally designed templates without losing your data. Each template adapts your content intelligently.

## ❓ FAQ

**Q: Is NovaCV free?**
A: Yes! NovaCV is completely free and open-source. You only need a free Supabase account.

**Q: Do I need to provide my own AI API keys?**
A: No, AI features are optional. You can use NovaCV as a standard resume builder without them. To enable AI features, provide your own API keys from OpenAI, Anthropic, Google, etc.

**Q: Can I export my resume as PDF?**
A: Yes! NovaCV generates pixel-perfect PDFs that match your screen exactly, fully optimized for ATS systems.

**Q: Can I share my resume publicly?**
A: Yes! Generate a public shareable link for your resume. Others can view it in a read-only format.

**Q: What happens to my data?**
A: Your data is stored securely in your Supabase database. Only you have access (with Row-Level Security policies in place).

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
- 🎨 Template customization UI
- 📊 Public analytics dashboard for shared resumes

### Future (Q4 2026+)
- 🌐 Multilingual resume support
- 💼 LinkedIn profile sync
- 📧 Email-based resume sharing
- 🔗 Applicant tracking system (ATS) integrations
- 🎓 Industry-specific templates

---

Built with ❤️ by the NovaCV Team.


