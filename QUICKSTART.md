# Quick Start Guide

Get up and running in 5 minutes! 🚀

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd learning-platform
```

## Step 2: Install Dependencies

```bash
npm install
```

This will take a minute or two. Go grab some water! 💧

## Step 3: Set Up Environment Variables

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Open `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

**Where do I get these?**
- Project lead will provide them
- Or check the pinned message in Slack

## Step 4: Run the Development Server

```bash
npm run dev
```

## Step 5: Open Your Browser

Visit: http://localhost:3000

You should see the welcome page! 🎉

## Next Steps

1. **Read the docs**
   - Student Onboarding Guide (PDF)
   - README.md (project overview)
   - CONTRIBUTING.md (workflow)

2. **Check Trello**
   - Find your assigned task
   - Read the task description

3. **Create your feature branch**
   ```bash
   git checkout -b feature/<your-name>-<task>
   ```

4. **Start coding!**

## Common Issues

### "Module not found" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### "Can't connect to Supabase"
- Check your `.env.local` file exists
- Verify the values are correct (no extra spaces)
- Make sure you used `NEXT_PUBLIC_` prefix

### "Port 3000 already in use"
```bash
# Use a different port
npm run dev -- -p 3001
```

## Need Help?

- 💬 Ask in Slack
- 📋 Check Trello
- 👨‍🏫 Tag project lead

---

**Remember:** Mistakes are part of learning. Don't be afraid to ask questions!