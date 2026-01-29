# Project Structure Overview

A visual guide to where everything goes.

```
learning-platform/
│
├── app/                          # Next.js pages (App Router)
│   ├── layout.tsx               # Root layout - wraps all pages
│   ├── page.tsx                 # Home page (/)
│   ├── globals.css              # Global styles with Tailwind
│   │
│   ├── lessons/                 # Lesson pages
│   │   ├── page.tsx            # /lessons (list view)
│   │   └── [id]/               # /lessons/[id] (detail view)
│   │       └── page.tsx
│   │
│   └── auth/                    # Authentication pages
│       ├── login/
│       │   └── page.tsx        # /auth/login
│       └── signup/
│           └── page.tsx        # /auth/signup
│
├── components/                   # React components
│   ├── ui/                      # Reusable UI (Button, Card, etc.)
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   │
│   └── features/                # Feature-specific components
│       ├── lessons/
│       │   ├── LessonCard.tsx
│       │   └── LessonList.tsx
│       └── auth/
│           └── LoginForm.tsx
│
├── lib/                         # Utilities and helpers
│   ├── supabase/               # Database utilities
│   │   ├── client.ts           # Supabase client setup
│   │   └── queries.ts          # Database queries
│   │
│   └── utils.ts                # General utilities
│
├── types/                       # TypeScript type definitions
│   └── database.ts             # Database table types
│
├── supabase/                    # Database schema (backend work)
│   ├── migrations/             # SQL migration files
│   │   └── 001_create_lessons.sql
│   └── seed/                   # Test data
│       └── seed_lessons.sql
│
├── public/                      # Static assets (images, fonts)
│   ├── logo.png
│   └── favicon.ico
│
├── .env.local                   # Environment variables (NOT committed)
├── .env.example                 # Example env file (committed)
├── .gitignore                   # Files to ignore in Git
│
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── next.config.js              # Next.js configuration
│
├── README.md                    # Project overview
├── QUICKSTART.md               # Quick setup guide
├── CONTRIBUTING.md             # Development workflow
└── STRUCTURE.md                # This file!
```

## Key Concepts

### App Directory (Pages)
- Each folder becomes a route
- `page.tsx` files are the actual pages
- Layouts wrap pages for shared UI

### Components
- **ui/** - Generic, reusable (Button, Card)
- **features/** - Business logic (LessonCard, LoginForm)

### Data Flow
```
Page (app/) 
  ↓ fetches data from
Supabase Client (lib/supabase/)
  ↓ passes data to
Components (components/)
  ↓ renders using
Types (types/)
```

### Configuration Files
| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts |
| `tsconfig.json` | TypeScript settings |
| `tailwind.config.js` | Tailwind customization |
| `next.config.js` | Next.js settings |
| `.env.local` | Secrets (never commit!) |

## Where Should My Code Go?

| I'm working on... | Put it in... |
|-------------------|--------------|
| A new page | `app/[route]/page.tsx` |
| A reusable button | `components/ui/Button.tsx` |
| A lesson card | `components/features/lessons/LessonCard.tsx` |
| Database query | `lib/supabase/queries.ts` |
| Type definition | `types/database.ts` |
| Database schema | `supabase/migrations/` |
| Helper function | `lib/utils.ts` |

## Examples

### Creating a New Page
```typescript
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Learn about our platform...</p>
    </div>
  )
}
```
Visit at: `http://localhost:3000/about`

### Creating a Component
```typescript
// components/ui/Badge.tsx
interface BadgeProps {
  text: string
  color?: 'blue' | 'green' | 'red'
}

export function Badge({ text, color = 'blue' }: BadgeProps) {
  return (
    <span className={`px-2 py-1 rounded bg-${color}-500 text-white`}>
      {text}
    </span>
  )
}
```

### Using a Component in a Page
```typescript
// app/lessons/page.tsx
import { Badge } from '@/components/ui/Badge'

export default function LessonsPage() {
  return (
    <div>
      <h1>Lessons</h1>
      <Badge text="New" color="green" />
    </div>
  )
}
```

## Import Path Aliases

Use `@/` to import from the root:

```typescript
// Instead of:
import { Button } from '../../../components/ui/Button'

// Use:
import { Button } from '@/components/ui/Button'
```

## Questions?

- Check where similar files are located
- Ask in Slack
- Review existing code for patterns