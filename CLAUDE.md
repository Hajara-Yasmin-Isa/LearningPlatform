# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Language-First Computing Education Platform - a collaborative web application built by students for students to learn programming concepts. Currently in alpha (v0.1.0).

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **Deployment:** Vercel

## Common Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Create production build
npm start        # Run production server
npm run lint     # Run ESLint
```

## Project Structure

```
app/                    # Next.js App Router pages
  layout.tsx           # Root layout
  page.tsx             # Home page
  lessons/             # Lessons routes
  auth/                # Auth routes (login, signup)

components/
  ui/                  # Reusable UI components (Button, Card)
  features/            # Feature-specific components
    lessons/           # LessonCard, LessonList
    auth/              # Auth forms

lib/
  supabase/
    client.ts          # Supabase client initialization
    queries.ts         # Database query functions

types/
  database.ts          # TypeScript interfaces for DB models

supabase/
  migrations/          # SQL migration files (sequential: 001, 002...)
  seed/                # Seed data SQL files
```

## Architecture Patterns

### Data Flow
```
Pages (app/) → Supabase Client (lib/supabase/) → Components → Types
```

### Database
- Always use Supabase client, never direct DB access
- Row Level Security (RLS) required on all tables
- Migrations must include: table creation, RLS enablement, security policies

### Components
- Functional components only
- One component per file, <300 lines preferred
- Reusable components in `components/ui/`
- Feature components in `components/features/<feature>/`

## Coding Conventions

- **File naming:** PascalCase for components (`LessonCard.tsx`), camelCase for utilities (`queries.ts`)
- **Styling:** Tailwind utility classes only (no inline styles)
- **Types:** Define in `types/database.ts`, avoid `any`
- **Imports:** Use `@/*` path alias for root imports

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Variables must be prefixed with `NEXT_PUBLIC_` to be browser-accessible.

## Git Workflow

- **Main branch:** `main` (production)
- **Dev branch:** `dev` (integration)
- **Feature branches:** `feature/<name>-<task>` (e.g., `feature/fatima-login-page`)
- PRs target `dev`, not `main`
- Never push directly to `main` or `dev`

## Database Models

Key types defined in `types/database.ts`:
- `Lesson`: id, title, description, lesson_order
- `Section`: id, lesson_id, title, content, section_order
- `Exercise`: id, section_id, question, exercise_type, correct_answer
- `UserProgress`: id, user_id, lesson_id, completed, last_accessed
