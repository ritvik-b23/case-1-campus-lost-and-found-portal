# Future Improvements

Prioritized backlog of features and improvements beyond the current case study scope.

## High Priority

### 1. Real-time Updates (Supabase Realtime)
Subscribe to `items` and `claims` channels so the feed updates live when another user posts or approves a claim — no page refresh needed.

### 2. Push / In-App Notifications
Beyond email, show a notification bell in the header with unread claim updates using Supabase Realtime + browser Notification API.

### 3. Admin Dashboard
A separate `/admin` route (gated by a `role` column on `profiles`) for bulk-resolving old items, exporting reports, and managing flagged content.

## Medium Priority

### 4. Server-Side Matching
Move `getMatches()` to a Supabase Edge Function or Next.js Server Action so it runs on a schedule (e.g., nightly) and stores pre-computed match scores — avoids O(n²) client-side computation as the dataset grows.

### 5. ML-Based Matching with pgvector
Embed item descriptions using OpenAI `text-embedding-3-small` and store vectors in a `pgvector` column. Use cosine similarity for a complementary ranking signal alongside the rule-based score.

### 6. Image Search
Allow users to upload an image of a lost item and find visually similar found items using an image embedding model.

## Lower Priority

### 7. Expiry & Auto-Archive
Automatically mark items as `expired` after 30 days with no activity, and send a reminder email to the poster before archival.

### 8. Multi-Campus / Multi-Tenant
Support multiple campuses with a `campus_id` on items and scoped auth domains (e.g., only `@university.edu` emails can post).

### 9. Native Mobile App
Convert to a React Native (Expo) app using the same Supabase backend. The matching and notification logic is already backend-agnostic and would port directly.

### 10. Rate Limiting & Abuse Prevention
Add `upstash/ratelimit` middleware on the `/api/notify` endpoint and image upload route to prevent abuse. Add CAPTCHA on item posting for unauthenticated flows (if ever opened to anonymous posting).
