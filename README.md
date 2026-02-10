# promote.social

A full-stack web application that connects creators with supporters. Users earn points by completing simple tasks like following, subscribing, liking, and commenting on creators' content, then spend those points to create their own promotion tasks.

## Features

### 🎯 Core Features
- **User Authentication**: Sign up and login with email/password using Supabase Auth
- **Points Economy**: Start with 50 free points; earn more by completing tasks
- **Multi-Platform Support**: Support for 13+ social platforms
- **Task Creation**: Create custom promotion tasks with flexible parameters
- **Task Completion Flow**: Proof submission, creator approval, automatic point transfer
- **User Profiles**: View profile stats, task history, and points balance
- **Task Feed**: Browse and filter available tasks across all platforms

### 📱 Supported Platforms
- TikTok
- Instagram
- Facebook
- Reddit
- X (Twitter)
- YouTube
- Medium
- Substack
- Threads
- Bluesky
- Quora
- Mastodon
- Product Hunt

### ✅ Supported Actions
- Follow
- Subscribe
- Like
- Comment

### 🛡️ Security & Anti-Abuse
- Row Level Security (RLS) on all database tables
- Users cannot complete their own tasks
- Duplicate completion prevention
- Unique proof submissions per task

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React with Tailwind CSS
- **Styling**: Responsive design with mobile-first approach

### Backend
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for proof files
- **Server Actions**: Next.js Server Actions for secure operations

### Deployment
- **Frontend**: Vercel
- **Backend**: Supabase Hosted
- **Database**: Supabase PostgreSQL

## Quick Start

### Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/promote-social.git
cd promote-social
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

4. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Full Setup Instructions

See [SETUP.md](./SETUP.md) for comprehensive setup and deployment guide.

## Project Structure

```
promote-social/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   ├── browse/              # Task browsing page
│   ├── create-task/         # Task creation page
│   ├── dashboard/           # User dashboard
│   ├── profile/             # User profile page
│   ├── tasks/[id]/          # Task detail page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   ├── Button.tsx          # Button component
│   ├── Card.tsx            # Card component
│   ├── Header.tsx          # Header/Navigation
│   ├── Footer.tsx          # Footer
│   └── TaskCard.tsx        # Task display card
├── lib/                     # Utility functions
│   ├── supabase.ts         # Supabase client
│   ├── types.ts            # TypeScript types
│   └── actions.ts          # Server actions
├── supabase/               # Database migrations
│   └── migrations/         # SQL migration files
├── public/                 # Static assets
├── .env.example            # Example environment variables
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
├── next.config.js          # Next.js config
└── package.json            # Project dependencies
```

## Available Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth/login` | Login page |
| `/auth/signup` | Sign up page |
| `/browse` | Browse all tasks |
| `/tasks/[id]` | Task detail and completion |
| `/create-task` | Create new task |
| `/dashboard` | User dashboard |
| `/profile` | User profile |

## Database Schema

### users
- `id` (UUID): Primary key
- `username` (TEXT, UNIQUE)
- `points` (INTEGER, DEFAULT: 50)
- `created_at` (TIMESTAMP)

### tasks
- `id` (UUID): Primary key
- `creator_id` (UUID): Foreign key
- `title` (TEXT)
- `platform` (TEXT): Social platform name
- `action_type` (TEXT): follow, subscribe, like, comment
- `link` (TEXT): URL to social content
- `reward` (INTEGER): Points per completion
- `max_completions` (INTEGER): Completion limit
- `completed_count` (INTEGER): Current completions
- `status` (TEXT): active, paused, completed
- `created_at` (TIMESTAMP)

### task_completions
- `id` (UUID): Primary key
- `task_id` (UUID): Foreign key
- `user_id` (UUID): Foreign key
- `proof_url` (TEXT): Storage path
- `status` (TEXT): pending, approved, rejected
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- UNIQUE(task_id, user_id)

## Key Features Explained

### Points System
- New users receive 50 free points
- Users earn points by completing tasks (when approved)
- Users spend points to create tasks
- Cost = reward_per_completion × max_completions

### Task Lifecycle
1. Creator publishes task (points deducted immediately)
2. Users find task and click to open link
3. Users submit proof of completion
4. Creator reviews and approves/rejects
5. On approval, points transferred to completer
6. Task closes when max_completions reached

### Security
- All tables use Row Level Security (RLS)
- Users can only view their own profile data
- Users can only create tasks as themselves
- Only creators can approve/reject completions
- Only users other than creator can complete tasks

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run ESLint
```

## Deployment

### Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

See [SETUP.md](./SETUP.md) for detailed deployment instructions.

## Legal & Compliance

promote.social is not affiliated with, endorsed by, or officially connected to any social platform including TikTok, Instagram, Facebook, Reddit, X, YouTube, Medium, Substack, Threads, Bluesky, Quora, Mastodon, or Product Hunt.

Users are responsible for compliance with each platform's terms of service and community guidelines.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For setup help, see [SETUP.md](./SETUP.md)

For issues and questions, please open a GitHub issue.

## Roadmap

- [ ] Admin dashboard for moderation
- [ ] User reputation system
- [ ] Task categories and tags
- [ ] Social sharing features
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Task scheduling
- [ ] Webhook integrations
- [ ] API documentation
- [ ] Mobile app
