# Case 1: Campus Lost & Found Portal

**Live demo:** https://finditcampus.netlify.app/
**Repo:** https://github.com/ritvik-b23/case-1-campus-lost-and-found-portal
**Demo video:** https://drive.google.com/file/d/1KsWnkjSvNYNKdrEA6H-DGP4H_JJns6cY/view?usp=sharing

## What this is

FindIt Campus is a mobile-first lost-and-found portal for university students to post lost or found items, browse a searchable feed, and see likely matches based on category, location, date, and item details. Students can submit claims on found items and the original poster can approve or reject them.

## How to run locally

1. `git clone <ADD_GITHUB_REPO_URL>`
2. `cd case-1-campus-lost-and-found-portal`
3. `npm install`
4. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   Run `supabase/migrations/001_initial.sql` in your Supabase SQL editor to set up the schema.
5. `npm run dev`
6. Open `http://localhost:3000`

## Stack

- **Next.js 16 (App Router, TypeScript)** — full-stack framework; server components keep Supabase calls off the client
- **Tailwind CSS v4** — utility-first styling; fast to iterate on a mobile-first layout
- **Supabase (PostgreSQL + RLS)** — persistent multi-user database with Row Level Security; avoids building a custom backend
- **Google OAuth via Supabase Auth** — one-click sign-in using the campus Google account students already have
- **Supabase Storage** — image uploads in the same project as the database; no extra service needed
- **Resend** — simple transactional email API for claim notifications; works out of the box without domain configuration
- **Vitest** — fast unit tests for the matching engine and validation logic

## What's NOT done

- No college SSO or email OTP — authentication is Google OAuth only; a real campus deployment would restrict sign-in to the university email domain
- No advanced image similarity — matching is rule-based (category, location, date, keywords, color, brand); perceptual hash or CLIP-based matching was out of scope
- No admin moderation panel — there is no way for staff to remove inappropriate posts or review flagged items
- Production privacy and RLS policies would need a security review before a real campus launch

## In production, I would also add

- College SSO or email OTP restricted to the university domain
- Cloud image storage with access controls and automatic resizing
- Email or WhatsApp notifications when a strong match is detected automatically
- Image similarity matching using perceptual hash or a CLIP-style embedding
- Admin moderation dashboard and audit trail for reported or disputed items
scripts/seed.ts         # Demo data seeder
tests/                  # matching.test.ts, validation.test.ts
```

## Further Reading

- [Architecture Decisions](docs/DECISIONS.md)
- [Demo Script](docs/DEMO_SCRIPT.md)
- [Submission Notes](docs/SUBMISSION_NOTES.md)
- [Future Improvements](docs/FUTURE_IMPROVEMENTS.md)
