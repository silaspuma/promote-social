# promote.social - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier available at https://supabase.com)
- GitHub account (for Vercel deployment)
- Vercel account (https://vercel.com)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
cd promote-social
npm install
```

### 2. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Create a new project
3. Wait for the project to be provisioned
4. Go to Project Settings > API
5. Copy your project URL and anon key

### 3. Create Database Tables

1. In Supabase, go to SQL Editor
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into SQL Editor and click "Run"

This creates:
- `users` table with profile data
- `tasks` table for promotion tasks
- `task_completions` table for tracking completions
- Row Level Security (RLS) policies

### 4. Set Up Storage Bucket

1. In Supabase, go to Storage
2. Create a new bucket named `task-proofs`
3. Make it public
4. Go to bucket settings and click "Make it public"

### 5. Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 6. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Creating Test Data

1. Sign up through the app to create a test user (automatically gets 50 points)
2. Go to Create Task to create a task
3. Log out and sign in with another account to complete tasks
4. Go back to your first account's dashboard to approve completions

## Database Schema

### Users Table
- `id` (UUID): Primary key, linked to auth.uid()
- `username` (TEXT): Unique username
- `points` (INTEGER): Current points balance (starts at 50)
- `created_at` (TIMESTAMP): Account creation date

### Tasks Table
- `id` (UUID): Primary key
- `creator_id` (UUID): Foreign key to users table
- `title` (TEXT): Task title
- `platform` (TEXT): Social platform (tiktok, instagram, etc.)
- `action_type` (TEXT): Action type (follow, subscribe, like, comment)
- `link` (TEXT): URL to the content
- `reward` (INTEGER): Points per completion
- `max_completions` (INTEGER): Max people who can complete
- `completed_count` (INTEGER): Current completions
- `status` (TEXT): active, paused, or completed
- `created_at` (TIMESTAMP): Task creation date

### Task Completions Table
- `id` (UUID): Primary key
- `task_id` (UUID): Foreign key to tasks
- `user_id` (UUID): Foreign key to users
- `proof_url` (TEXT): Path to proof in storage
- `status` (TEXT): pending, approved, or rejected
- `created_at` (TIMESTAMP): Submission date
- `updated_at` (TIMESTAMP): Last update date

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/promote-social.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click Deploy

### 3. Configure Supabase for Your Domain

1. In Supabase, go to Authentication > URL Configuration
2. Add your Vercel domain to Authorized Redirect URLs
3. Format: `https://yourdomain.vercel.app/auth/callback`

## Production Checklist

- [ ] Update site name in `app/layout.tsx`
- [ ] Update footer disclaimer with correct social platforms
- [ ] Review and update RLS policies for security
- [ ] Set up monitoring for database performance
- [ ] Configure email templates in Supabase Auth
- [ ] Test complete user flow (signup, create task, complete task, approve)
- [ ] Set up analytics (e.g., Vercel Analytics)
- [ ] Enable CORS for your domain in Supabase

## Troubleshooting

### "Unauthorized" errors
- Check that Supabase RLS policies are enabled
- Verify environment variables are correct

### "Storage bucket not found"
- Ensure the `task-proofs` bucket exists and is public

### Database connection issues
- Verify your Supabase project is running
- Check database connection string

### Build fails on Vercel
- Ensure Node.js version is 18+
- Clear Vercel cache and redeploy

## Support

For issues with:
- **Supabase**: https://supabase.com/docs
- **Next.js**: https://nextjs.org/docs
- **Vercel**: https://vercel.com/docs
