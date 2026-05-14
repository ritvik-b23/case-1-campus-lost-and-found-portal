# FindIt Campus — Lost & Found Portal

A production-ready campus lost-and-found web application built as an interview case study for Infinia.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL + RLS) |
| Authentication | Google OAuth via Supabase Auth |
| File Storage | Supabase Storage (`item-images` bucket) |
| Email | Resend (transactional notifications) |
| Testing | Vitest + jsdom |
| Icons | Lucide React |

## Case Study Requirements → Implementation Mapping

| Requirement | Implementation |
|-------------|---------------|
| Users can report lost/found items | `ItemForm` component with Supabase Storage photo upload |
| Browse and search the feed | `SearchAndFilters` + `ItemCard` components, real-time Supabase queries |
| Smart item matching | `lib/matching.ts` — rule-based scoring (category, location, date, keywords, color, brand) |
| Claim workflow | `ClaimModal` → Supabase `claims` table → email via Resend |
| Notifications | `app/api/notify/route.ts` — claim submitted / approved / rejected emails |
| Authentication | Google OAuth → `profiles` table auto-upsert in OAuth callback |
| Mobile responsive | BottomNav for mobile, responsive grid layout |
| Seed data | `scripts/seed.ts` — 14 realistic campus items |

## Local Development Setup

### 1. Prerequisites
- Node.js 18+
- A Supabase project (https://supabase.com)
- A Resend account (https://resend.com)
- Google OAuth credentials (via Supabase Dashboard → Auth → Providers → Google)

### 2. Clone and install
```bash
git clone <repo-url>
cd case-1-campus-lost-and-found-portal
npm install
```

### 3. Configure environment variables
Copy `.env.local.example` to `.env.local` and fill in your values:
```bash
cp .env.local.example .env.local
```

### 4. Set up the database
Run `supabase/migrations/001_initial.sql` in your Supabase SQL editor.

### 5. Configure Supabase Storage
Create a public bucket named `item-images` in your Supabase project dashboard.

### 6. Seed demo data (optional)
```bash
npm run seed
```

### 7. Run the development server
```bash
npm run dev
```

Open http://localhost:3000

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm test` | Run Vitest unit tests |
| `npm run seed` | Seed demo data to Supabase |

## Project Structure

```
app/
  page.tsx              # Main feed (tabs: Feed / Post / Matches / Claims)
  layout.tsx            # Root layout with fonts and metadata
  globals.css           # Tailwind v4 + CSS custom properties
  login/page.tsx        # Google OAuth sign-in
  auth/callback/route.ts
  api/notify/route.ts   # Resend email notification endpoint
  item/[id]/page.tsx    # Item detail page

components/             # AppHeader, BottomNav, ItemCard, ItemForm,
                        # ItemDetail, ClaimModal, MatchCard,
                        # SearchAndFilters, StatusBadge, EmptyState

lib/
  types.ts / matching.ts / validation.ts / utils.ts / seed.ts
  supabase/client.ts / server.ts / middleware.ts

supabase/migrations/    # 001_initial.sql (schema + RLS)
scripts/seed.ts         # Demo data seeder
tests/                  # matching.test.ts, validation.test.ts
```

## Further Reading

- [Architecture Decisions](docs/DECISIONS.md)
- [Demo Script](docs/DEMO_SCRIPT.md)
- [Submission Notes](docs/SUBMISSION_NOTES.md)
- [Future Improvements](docs/FUTURE_IMPROVEMENTS.md)
