# Architecture Decisions

## 1. Database: Supabase (PostgreSQL) vs. LocalStorage

| Factor | LocalStorage | Supabase PostgreSQL |
|--------|-------------|---------------------|
| Persistence | Browser-only, clears on device change | Server-side, survives any device |
| Multi-user | No — each user sees only their own data | Yes — shared across all users |
| Querying | Manual JS filtering | Full SQL, indexes, JOIN |
| Auth integration | Manual token storage | Built-in JWT + Row Level Security |

**Decision:** Supabase. A lost-and-found portal only makes sense when users can see each other's items. LocalStorage would be a toy prototype. Supabase gave us a real PostgreSQL database with RLS policies in <30 minutes of setup.

---

## 2. Authentication: Google OAuth vs. Email/Password vs. No Auth

| Factor | No Auth | Email/Password | Google OAuth |
|--------|---------|---------------|--------------|
| Barrier to entry | None | Medium (register + verify) | Low (1-click) |
| Campus fit | Poor — anyone can impersonate | OK | Good — campus users have Google accounts |
| Implementation time | — | High (password hashing, reset flows) | Low (Supabase handles it) |
| Accountability | None | Moderate | High (tied to real Google account) |

**Decision:** Google OAuth via Supabase. Students already have Google accounts through their university. One-click sign-in removes friction while still providing identity. Supabase's `@supabase/ssr` package handles the OAuth handshake and session cookie refresh transparently.

---

## 3. Email Notifications: Resend vs. Nodemailer/SMTP vs. No Email

| Factor | No Email | Nodemailer/SMTP | Resend |
|--------|----------|----------------|--------|
| Deliverability | — | Poor (SPF/DKIM config required) | High (pre-configured) |
| Dev experience | — | Verbose config | Clean TypeScript SDK |
| Free tier | — | Self-hosted infra needed | 3,000 emails/month free |
| React templates | — | No | Yes (optional) |

**Decision:** Resend. It provides a dead-simple REST API with a TypeScript SDK. The sandbox `onboarding@resend.dev` sender works immediately without domain verification, making it ideal for a demo/case study that must run out of the box.

---

## 4. File Storage: Supabase Storage vs. Base64 in DB vs. Cloudinary

| Factor | Base64 in DB | Cloudinary | Supabase Storage |
|--------|-------------|-----------|-----------------|
| DB bloat | Severe (images are large) | None | None |
| Extra service | No | Yes (another free account) | No (same Supabase project) |
| Transforms | No | Yes (CDN, resize) | Basic (size limits only) |
| Setup friction | None | Medium | Low |

**Decision:** Supabase Storage (`item-images` public bucket). Keeps everything in one service, avoids DB bloat, and public bucket URLs are directly embeddable in `<img>` tags with no extra auth.

---

## 5. Matching Algorithm: Rule-Based vs. ML/Embeddings

| Factor | ML / Vector Embeddings | Rule-Based Scoring |
|--------|----------------------|-------------------|
| Explainability | Low (black box) | High (score reasons shown to user) |
| Infrastructure | Vector DB, embedding model | None |
| Cold start | Needs training data | Works immediately |
| Accuracy for structured data | Overkill | Sufficient (category/location/date are structured) |

**Decision:** Rule-based scoring. The matching criteria for lost-and-found items are well-understood and structured: same category, same location, close dates, overlapping keywords, matching color/brand. A rule-based approach produces a score with human-readable reasons ("Same category", "Similar location"), which is far more useful for users than an opaque similarity score. This can be upgraded to embeddings later if needed.

---

## 6. Seed Data: `posted_by_user_id = null`

Seed items are posted with `posted_by_user_id = null` and explicit `contact_name`/`contact_email` fields. This means:
- They appear in the feed for all users without requiring any real poster account
- New users logging in for the first time can immediately see a populated feed
- RLS policies allow SELECT by all users but restrict UPDATE/DELETE to the owner — seed items with null owner cannot be accidentally modified by authenticated users
