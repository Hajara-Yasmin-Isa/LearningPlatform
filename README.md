# Language-First Computing Education Platform

**Status:** Alpha / v0  
**Purpose:** Collaborative learning platform built by students, for students

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git configured
- Access to project Trello board
- Supabase credentials (provided by project lead)

### Initial Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd learning-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
# Add your Supabase credentials to .env.local
```

4. **Run the development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 📁 Project Structure

```
learning-platform/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── lessons/           # Lesson pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── features/         # Feature-specific components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client & helpers
│   └── utils.ts          # General utilities
├── supabase/             # Database schema & migrations
│   ├── migrations/       # SQL migration files
│   └── seed/            # Sample data for testing
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🔄 Development Workflow

### Before You Start Any Task

1. **Check Trello** - Find your assigned card
2. **Pull latest code** - Always start fresh
3. **Create feature branch** - Follow naming convention

### Step-by-Step Process

1. **Pull latest dev branch**
```bash
git checkout dev
git pull origin dev
```

2. **Create your feature branch**
```bash
git checkout -b feature/<your-name>-<task-name>
# Example: feature/fatima-auth-ui
```

3. **Do your work**
- Make small, focused changes
- Test as you go
- Follow code conventions

4. **Commit your changes**
```bash
git add <files>
git commit -m "Brief description of what changed"
```

5. **Push your branch**
```bash
git push origin feature/<your-name>-<task-name>
```

6. **Create Pull Request**
- Base: `dev`
- Title: Match your Trello card
- Description: What changed, how to test it
- Link the Trello card

7. **Update Trello**
- Add PR link to card
- Move to "In Review"

## 🛠️ Tech Stack

| Category | Tool | Purpose |
|----------|------|---------|
| Frontend | Next.js 14 | React framework with App Router |
| UI | Tailwind CSS | Styling |
| Backend | Supabase | Auth, Database, APIs |
| Database | PostgreSQL | Data storage |
| Hosting | Vercel | Deployment |
| Version Control | GitHub | Code management |

## 🔐 Environment Variables

Required variables (add to `.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Important:** Never commit `.env.local` to Git!

## 📚 Key Principles

1. **No direct database access** - Always use Supabase client
2. **Security first** - RLS protects all data
3. **Branch workflow** - Never push directly to `main` or `dev`
4. **One task, one PR** - Keep changes focused
5. **Test before submitting** - Use Vercel preview URLs

## 🆘 Common Issues

**Build fails locally?**
- Check Node.js version (need 18+)
- Delete `node_modules` and `.next`, then `npm install`

**Can't connect to Supabase?**
- Verify `.env.local` exists and has correct values
- Check you're using `NEXT_PUBLIC_` prefix

**Git conflicts?**
- Pull latest `dev` before creating your branch
- Ask for help if conflicts appear

## 📖 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Project Trello Board](https://trello.com/invite/b/6968665af9e3d762ca017de5/ATTI0ccdfd9720a01aa2bf10419aed22b017C70F9A09/education-platform-project)

## 🤝 Getting Help

- Check the Student Onboarding Guide (PDF)
- Ask in Slack
- Tag project lead Trello
- Review existing PRs for examples

---

**Remember:** This is a learning environment. Mistakes are expected. Silent confusion is not. Ask questions!
