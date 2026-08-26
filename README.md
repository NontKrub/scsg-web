<p align="center">
  <img src="src/assets/sgsc-logo.png" alt="Saint Gabriel's Student Congress logo" width="150" />
</p>

<h1 align="center">Saint Gabriel's Student Congress</h1>

<p align="center">
  <strong>SGSC / S.C.S.G.</strong><br />
  Official web platform for the Student Congress of Saint Gabriel's College.
</p>

<p align="center">
  <em>68 student leaders · 4 organizations · 9 houses · One Congress</em>
</p>

---

## About

This repository contains the website for the **Student Congress of Saint Gabriel's College (SGSC)**. The platform brings the Congress, House of Saints, Clubs of Interest, Student Government, class representatives, student services, news, and House Competition information into one responsive website.

The Congress is represented through four main organizations:

- **Student Government** — 20 student leaders
- **House of Saints** — representatives from 9 houses
- **Clubs of Interest** — representatives from 6 interest clubs
- **Class Representatives** — 24 classroom representatives

The site is designed as a student-led public information and service platform rather than a personalized student dashboard.

## Features

### Public website

- Responsive SGSC homepage and organization overview
- Congress structure, executive board, advisory board, and member directory
- House of Saints directory with individual House pages
- House Competition rankings, monthly scores, growth, tiers, and honors
- Clubs directory with individual club profiles
- Student Government information and projects
- News and announcements with individual article pages
- SG Radio weekly schedule and song/message booking requests
- Student complaint and suggestion form with optional anonymous submission
- Thai-first content with English visual headings and labels

### Administration

The protected admin console can manage:

- Congress members
- Congress executive board
- Advisory board
- Houses
- House Competition scores and monthly honors
- Clubs
- News and publishing status
- SG Radio slots and booking requests
- Student complaints and their workflow status
- Global site settings
- Image fields used by editable content

### MCP integration

The project also exposes MCP-compatible endpoints and tools for reading selected public SGSC information, including:

- House scores
- Organization information
- SG Radio schedule
- Clubs
- Houses
- Congress members
- News

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage and SGSC overview |
| `/about` | Congress structure, members, and organization information |
| `/houses` | House of Saints directory |
| `/houses/:slug` | Individual House profile |
| `/competition` | House Competition standings and score information |
| `/clubs` | Clubs of Interest directory |
| `/clubs/:slug` | Individual club profile |
| `/student-government` | Student Government information and projects |
| `/news` | News and announcements |
| `/news/:slug` | Individual news article |
| `/radio` | SG Radio schedule and booking form |
| `/complaints` | Complaint and suggestion submission |
| `/login` | Administrator authentication |
| `/admin` | Protected website management console |
| `/mcp` | MCP endpoint |

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | React 19 + TanStack Start |
| Routing | TanStack Router |
| Data fetching | TanStack Query |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI primitives | Radix UI / shadcn-style components |
| Backend | Supabase |
| Authentication | Supabase Auth |
| Database | PostgreSQL via Supabase |
| Build tooling | Vite 8 + Nitro |
| Package manager | Bun |
| Icons | Lucide React |
| Validation/forms | React Hook Form + Zod |

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/NontKrub/scsg-web.git
cd scsg-web
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

For local development, create a `.env.local` file in the project root:

```env
# Browser / Vite
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# Server-side authentication
SUPABASE_URL=your_supabase_project_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# Server-only privileged operations
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

`SUPABASE_SERVICE_ROLE_KEY` is a privileged credential. It must only be available to the server runtime and must never be exposed to browser code.

### 4. Configure the database

Supabase migrations are stored in:

```text
supabase/migrations/
```

Apply the migrations to the Supabase project you intend to use. The application expects the database schema, policies, storage configuration, and supporting functions defined by these migrations.

### 5. Start the development server

```bash
bun run dev
```

Open the local URL printed by Vite in your terminal.

## Available scripts

```bash
bun run dev        # Start the development server
bun run build      # Create a production build
bun run build:dev  # Build using development mode
bun run preview    # Preview the production build locally
bun run lint       # Run ESLint
bun run format     # Format the codebase with Prettier
```

## Project structure

```text
scsg-web/
├── public/                     # Static public files
├── src/
│   ├── assets/                 # SGSC logo and House artwork
│   ├── components/
│   │   ├── site/               # SGSC-specific UI components
│   │   └── ui/                 # Reusable UI primitives
│   ├── data/                   # Shared SGSC structure and House information
│   ├── hooks/                  # React hooks
│   ├── integrations/
│   │   └── supabase/           # Supabase clients, auth middleware, generated types
│   ├── lib/
│   │   ├── mcp/                # MCP server tools
│   │   └── ...                 # Content, admin, derivation, and server functions
│   ├── routes/                 # TanStack file-based routes
│   ├── router.tsx              # Router configuration
│   ├── server.ts               # Server entry / SSR error wrapper
│   └── styles.css              # Global styles and design tokens
├── supabase/
│   ├── config.toml
│   └── migrations/             # Database migrations
├── package.json
├── vite.config.ts
└── README.md
```

## Content architecture

Public pages read SGSC content through the shared content layer in `src/lib`. Supabase stores editable data such as members, houses, clubs, news, scores, radio bookings, complaints, and site settings.

Static SGSC structure and presentation data are kept under `src/data`, while the admin console writes changes through server-side admin functions.

This separation keeps privileged database operations on the server and allows the public website to remain focused on read-heavy content and student service submissions.

## Authentication and admin access

The admin area uses **Supabase Auth**.

The browser obtains a user session through the public Supabase client. Protected server functions validate the authenticated user's bearer token before allowing authenticated operations, while privileged administration uses the server-only Supabase service role client where required.

The `/admin` route is marked `noindex, nofollow` and should not be treated as a public content page.

## House Competition

The House system contains nine Houses:

1. St. George
2. St. Gregory
3. St. Louis
4. St. Martin
5. St. Montfort
6. St. Edmund
7. St. Mary
8. St. Dominic
9. St. Francis

Competition data supports monthly scores from June through December, ranking calculations, score growth, House tiers, House of the Month, and character honors.

## SG Radio

SG Radio provides a weekly schedule for Monday through Friday. Students can select an available day and submit a request containing their name, class, requested song, and an optional message.

Bookings move through states such as `PENDING`, `APPROVED`, and `REJECTED`, while schedule slots can be `AVAILABLE`, `BOOKED`, `PENDING`, or `CLOSED`.

## Complaints and suggestions

Students can submit issues under categories including facilities, academics, activities, welfare, safety/bullying, suggestions, and other topics.

Submissions may be anonymous. Administrators can review complaints and update their state through the management console.

## Deployment

Create a production build with:

```bash
bun run build
```

The current Vite/TanStack configuration uses Nitro and defaults to a **Cloudflare** build target. Configure all server-side Supabase environment variables and secrets in the deployment platform rather than embedding them in the client bundle.

## Security notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code.
- Prefer local environment files such as `.env.local` for development secrets.
- Do not commit production credentials or service-role secrets to Git.
- Keep Supabase Row Level Security policies enabled for user-accessible tables.
- Privileged writes should stay inside trusted server-side functions.
- Review database migrations and access policies before deploying changes to production.

## Development notes

- `src/routeTree.gen.ts` is generated by TanStack Router and should not be edited manually.
- Supabase integration files marked as generated should also be treated as generated code.
- Run `bun run lint` before committing significant changes.
- Run `bun run format` to keep formatting consistent.

---

<p align="center">
  <strong>Student Congress of Saint Gabriel's College</strong><br />
  For Saints. By Saints.
</p>
