# Quick Reference Guide

## Getting Started (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local file
cp .env.example .env.local
# Edit with your Supabase credentials

# 3. Start the development server
npm run dev

# Visit http://localhost:3000
```

## Supabase Setup Checklist

- [ ] Create Supabase project
- [ ] Create storage bucket: `task-proofs`
- [ ] Run SQL migrations from `supabase/migrations/001_initial_schema.sql`
- [ ] Make `task-proofs` bucket public
- [ ] Copy project URL and anon key to `.env.local`

## Database Quick Reference

### Create New User
```sql
INSERT INTO users (id, username, points) 
VALUES (auth.uid(), 'username', 50);
```

### View Database Stats
```sql
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM tasks) as total_tasks,
  (SELECT COUNT(*) FROM task_completions WHERE status='pending') as pending_completions;
```

## API Reference (Server Actions)

### User Functions
- `getCurrentUser()` - Get authenticated user
- `getUserById(userId)` - Get user by ID
- `getUserByUsername(username)` - Get user by username
- `updateUserPoints(userId, amount)` - Update user points

### Task Functions
- `createTask(creatorId, taskData)` - Create new task
- `getTask(taskId)` - Get task details
- `getTasks(filters?)` - Get all tasks with optional filters
- `getUserCreatedTasks(userId)` - Get user's created tasks
- `updateTaskStatus(taskId, status)` - Update task status

### Completion Functions
- `createTaskCompletion(taskId, userId, proofUrl?)` - Submit completion
- `getTaskCompletion(completionId)` - Get completion details
- `getTaskCompletions(taskId)` - Get all completions for a task
- `getUserTaskCompletions(userId)` - Get user's completions
- `approveTaskCompletion(completionId)` - Approve completion
- `rejectTaskCompletion(completionId)` - Reject completion

## Component Reference

### Button
```tsx
<Button 
  variant="primary" // primary, secondary, outline, danger
  size="md" // sm, md, lg
  loading={false}
  onClick={() => {}}
>
  Click Me
</Button>
```

### Card
```tsx
<Card className="p-4">
  Content here
</Card>
```

### TaskCard
```tsx
<TaskCard 
  task={task}
  creator={{ username: "creator" }}
/>
```

## Deployment Checklist

### Before Going Live
- [ ] Test complete user flow locally
- [ ] Verify all Supabase tables are created
- [ ] Test auth signup and login
- [ ] Test task creation and approval flow
- [ ] Update site metadata in `app/layout.tsx`
- [ ] Review `SETUP.md` for Supabase configuration

### Vercel Deployment
- [ ] Push code to GitHub
- [ ] Create Vercel account
- [ ] Import GitHub repo to Vercel
- [ ] Set environment variables
- [ ] Configure Supabase URL config for Vercel domain
- [ ] Deploy

## Common Issues & Solutions

### "Database not found"
- Check NEXT_PUBLIC_SUPABASE_URL in .env.local
- Verify Supabase project is active

### "Storage bucket not found"
- Go to Supabase Storage > Create bucket named "task-proofs"
- Enable public access

### "Unauthorized" on task creation
- Check RLS policies in Supabase
- Verify user is authenticated

### "File upload failed"
- Ensure task-proofs bucket exists and is public
- Check storage bucket permissions

### Build errors on Vercel
- Clear cache and redeploy
- Check Node.js version (18+)
- Verify all environment variables are set

## Points Economy Examples

### Creating a Task
- Reward per completion: 10 points
- Max completions: 5 people
- Total cost: 10 × 5 = **50 points**

### Completing Tasks
- User has 50 points
- Completes task with 10 point reward
- Submission approved
- User now has 60 points

### Task Status
- `active` - Available for users to complete
- `paused` - Creator paused it
- `completed` - Max completions reached

## Supported Platforms & Actions

### Platforms
tiktok, instagram, facebook, reddit, x, youtube, medium, substack, threads, bluesky, quora, mastodon, producthunt

### Actions
follow, subscribe, like, comment

## File Structure Map

| Path | Purpose |
|------|---------|
| `/app` | Next.js pages and layout |
| `/components` | Reusable React components |
| `/lib` | Utilities and server actions |
| `/supabase/migrations` | Database migrations |
| `/public` | Static files |
| `.env.local` | Local environment variables |

## Useful Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Check code quality

# Supabase CLI (if installed)
supabase start          # Start local Supabase
supabase migration list # View migrations
```

## Environment Variables Explained

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon public key (safe to expose)

Note: "PUBLIC" in env var names means they're exposed to browser (don't put secrets here)

## Need Help?

- **Setup Issues**: See `SETUP.md`
- **Project Info**: See `README.md`
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
