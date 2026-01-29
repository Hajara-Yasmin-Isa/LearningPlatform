# Contributing Guide

Thank you for contributing to the Learning Platform! This guide will help you make effective contributions.

## Before You Start

1. **Check Trello** - Make sure you have an assigned task
2. **Read the docs** - Familiarize yourself with the Student Onboarding Guide
3. **Ask questions** - Reach out in Slack if anything is unclear

## Development Workflow

### 1. Pull Latest Code

Always start by pulling the latest code from `dev`:

```bash
git checkout dev
git pull origin dev
```

### 2. Create Your Feature Branch

```bash
git checkout -b feature/<your-name>-<task-description>
```

Examples:
- `feature/fatima-login-page`
- `feature/david-lessons-api`
- `feature/olive-progress-ui`

### 3. Work on Your Task

- Make small, focused commits
- Test your changes as you go
- Follow code conventions
- Keep your branch updated with `dev`

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add <files>
git commit -m "Add login form component"
```

Good commit messages:
- ✅ "Add user authentication flow"
- ✅ "Fix lesson ordering bug"
- ✅ "Update progress tracking API"

Bad commit messages:
- ❌ "Fixed stuff"
- ❌ "WIP"
- ❌ "asdf"

### 5. Push Your Branch

```bash
git push origin feature/<your-name>-<task-description>
```

### 6. Create a Pull Request

Go to GitHub and create a PR:

- **Base branch:** `dev`
- **Compare branch:** your feature branch
- **Title:** Match your Trello card title
- **Description:** Include:
  - What changed
  - How to test it
  - Link to Trello card
  - Vercel preview URL (if applicable)
  - Screenshots (if UI changes)

Example PR description:
```markdown
## Changes
Added login form component with email/password fields

## Testing
1. Go to /login
2. Enter email and password
3. Click "Sign In"
4. Should redirect to dashboard

## Trello
https://trello.com/c/abc123

## Preview
https://learning-platform-pr-42.vercel.app
```

### 7. Update Trello

Once PR is created:
1. Add PR link to your Trello card
2. Move card to "In Review"
3. Wait for feedback

### 8. Address Review Feedback

When reviewers leave comments:
1. Read all feedback carefully
2. Make requested changes
3. Push new commits to the same branch
4. Reply to comments when done

### 9. Merge Your PR

After approval:
1. Ensure all checks pass
2. Merge to `dev` (or reviewer will do this)
3. Move Trello card to "Done"
4. Delete your feature branch (GitHub will prompt you)

## Code Standards

### TypeScript
- Use TypeScript for all new files
- Define proper types for props and functions
- Avoid `any` type

### React Components
- Use functional components
- Keep components small and focused
- Extract reusable logic into hooks or utilities

### Styling
- Use Tailwind CSS utility classes
- Follow existing patterns
- Ensure responsive design (mobile-first)

### File Naming
- Components: `PascalCase.tsx` (e.g., `LessonCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `camelCase.ts` (e.g., `database.ts`)

### Code Organization
- One component per file
- Group related files in folders
- Keep file size reasonable (<300 lines)

## Testing Your Changes

### Locally
```bash
npm run dev
# Test in browser at http://localhost:3000
```

### Preview Deployments
- Every PR gets a Vercel preview URL
- Test your changes on the preview
- Share preview URL with reviewers

## Common Scenarios

### Syncing with Latest Dev
If `dev` has been updated while you're working:

```bash
git checkout dev
git pull origin dev
git checkout feature/<your-branch>
git merge dev
# Resolve any conflicts
git push origin feature/<your-branch>
```

### Fixing Mistakes in Last Commit
```bash
# Make your fixes
git add <files>
git commit --amend --no-edit
git push --force-with-lease
```

### Starting Over
If you need to abandon your work and start fresh:

```bash
git checkout dev
git pull origin dev
git branch -D feature/<old-branch>
git checkout -b feature/<new-branch>
```

## Do's and Don'ts

### DO:
- ✅ Test your changes before pushing
- ✅ Write clear commit messages
- ✅ Keep PRs focused on one task
- ✅ Ask questions when stuck
- ✅ Review your own code before submitting
- ✅ Update documentation if needed

### DON'T:
- ❌ Commit secrets or API keys
- ❌ Push directly to `main` or `dev`
- ❌ Work without a Trello card
- ❌ Make huge PRs (>500 lines)
- ❌ Ignore reviewer feedback
- ❌ Rush through testing

## Getting Help

### Stuck on something?
1. Check documentation (README, onboarding guide)
2. Review existing code for examples
3. Ask in Slack
4. Tag project lead in Trello

### Found a bug?
1. Check if it's already reported
2. Create a Trello card if it's new
3. Include steps to reproduce
4. Tag with "bug" label

### Have an idea?
1. Discuss in Slack first
2. Get buy-in from the team
3. Create a Trello card
4. Wait for assignment

## Review Process

### As a Reviewer
- Be kind and constructive
- Explain why something should change
- Test the PR on the preview URL
- Approve when ready, or request changes

### As an Author
- Don't take feedback personally
- Ask for clarification if needed
- Make changes promptly
- Thank reviewers for their time

## Remember

- **Quality over speed** - It's better to do it right than fast
- **Ask questions** - There are no dumb questions
- **Learn from feedback** - Reviews make you a better developer
- **Stay organized** - Keep Trello updated
- **Have fun** - This is a learning project!

## Checklist Before Submitting PR

- [ ] Code runs locally without errors
- [ ] Followed naming conventions
- [ ] Added necessary comments
- [ ] No console.log statements (unless debugging tool)
- [ ] No commented-out code
- [ ] PR description is complete
- [ ] Trello card is updated
- [ ] Screenshots added (if UI changes)

---

**Questions?** Reach out in Slack or tag project lead!