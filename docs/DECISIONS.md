# Decisions Log — Case 1

## Assumptions I made

1. Students need a fast, mobile-first posting flow — because a lost-and-found report is time-sensitive; the sooner an item is posted, the more likely a match happens.
2. A rule-based matching system is acceptable for a prototype — because the matching criteria (category, location, date, keywords, color, brand) are structured and known upfront, and the results are easy to explain to the user.
3. Supabase is acceptable as the database for this prototype — because it gives real multi-user PostgreSQL persistence with Row Level Security and auth without building a custom backend.
4. Netlify is acceptable for frontend deployment — because it is fast to set up for a Next.js static/SSR site and has a generous free tier suitable for a demo.
5. Google OAuth is a reasonable stand-in for campus SSO — because most university students already have a Google account tied to their institution, and it removes friction compared to email/password registration.

## Trade-offs

| Choice | Alternative | Why I picked this |
|---|---|---|
| Supabase (managed PostgreSQL + RLS) | Custom Postgres server or full backend API | Supabase gives multi-user persistence, auth, storage, and RLS in one service; building a custom backend would take much longer without adding value for a prototype |
| Netlify | Vercel | Both work well with Next.js; Netlify was chosen for familiarity — either would be fine |
| Rule-based matching engine | ML embeddings / image similarity | Rule-based scoring is immediately explainable ("Same category", "Both mention Library") and requires no training data or vector infrastructure; ML can be layered on later |
| Simple claim approval flow (poster approves/rejects) | Fully verified identity workflow with email OTP | A full verification flow adds significant complexity; the claim + approval model is sufficient to demonstrate the workflow for a prototype |
| Social-app-style feed UI | Traditional admin form layout | A feed-like design (inspired by mobile social apps) is faster to scan and more likely to be used under time pressure than a table-heavy admin interface |

## What I de-scoped and why

- **College SSO / email domain restriction** — implementing real university SSO (SAML, OIDC) or restricting OAuth to a specific email domain requires institutional credentials and DNS access; Google OAuth is a practical stand-in for a demo.
- **Image similarity matching** — perceptual hash or CLIP-based image comparison would meaningfully improve match quality for items with photos, but it requires a model inference step and was out of scope for the time box.
- **Admin moderation panel** — a real deployment needs staff to remove inappropriate posts and handle disputes; this was cut to keep the scope focused on the student-facing flow.
- **Push / WhatsApp notifications** — Resend handles transactional email for claim events; in-app push or WhatsApp alerts for automatic match detection would add noticeable value but were cut for time.
- **Privacy / RLS hardening** — the current RLS policies are functional for a prototype but have not been audited against edge cases (e.g., mass enumeration, claim spam).

## What I'd do differently with another day

- Add email domain restriction to the OAuth callback so only `@university.edu` addresses can sign in, making the campus-specific use case concrete.
- Build a lightweight admin page so a moderator can hide or delete posts without touching the database directly.
- Implement automatic match notifications: when a new item is posted and a strong match (score ≥ 70) already exists, send an email to the relevant poster immediately rather than waiting for them to visit the Matches tab.
- Write integration tests against a local Supabase instance (using `supabase start`) to cover the claim approval flow end-to-end, not only the unit-level matching logic.
