# Submission Notes

## What Works

- Google OAuth sign-in via Supabase (redirect flow)
- Profile auto-creation on first login
- Full CRUD for items (post, view, filter, search)
- Photo upload to Supabase Storage with inline preview
- Rule-based matching engine with score + explanations
- Claim submission and approve/reject workflow
- Resend email notifications for all claim events
- Row Level Security on all tables
- Mobile-responsive layout with BottomNav
- 14-item seed dataset (no account required to browse)
- 16 passing unit tests (Vitest)

## Known Limitations

### Email Sender
The app uses `onboarding@resend.dev` (Resend sandbox sender). In production, you must:
1. Verify a custom domain in Resend
2. Update the `from` address in `app/api/notify/route.ts`

### Image Moderation
There is no server-side image validation beyond file type checking. In production, add a virus scan / content moderation step before writing to Supabase Storage.

### No Admin Panel
Admins cannot bulk-resolve items or view all claims. An admin role with a separate dashboard would be a natural next step.

### Matching Runs Client-Side
`getMatches()` runs in the browser on the full items array. For large datasets (>1,000 items) this should move to a server action or background job.

### Rate Limiting
The `/api/notify` endpoint has no rate limiting. Any authenticated user can trigger emails in a loop. Add `upstash/ratelimit` or Supabase Edge Functions rate limiting before production.

## Deployment Checklist (Vercel + Supabase)

- [ ] Create Supabase project and run `supabase/migrations/001_initial.sql`
- [ ] Create `item-images` public storage bucket
- [ ] Configure Google OAuth in Supabase Dashboard (add production redirect URI)
- [ ] Add Vercel environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your Vercel deployment URL (used in OAuth redirect)
- [ ] Verify a domain in Resend and update `from` address
- [ ] Run seed script against production DB: `npm run seed`
- [ ] Smoke-test OAuth flow on production URL

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed only | Bypasses RLS for seed script |
| `RESEND_API_KEY` | Yes | Resend API key for email |
