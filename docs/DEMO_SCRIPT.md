# Demo Script — FindIt Campus

**Duration:** ~5 minutes  
**URL:** http://localhost:3000 (or deployed Vercel URL)

---

## Scene 1: Login (30 sec)

> "The portal requires authentication so we know who posted what. Let me sign in with Google."

1. Open the app — you land on `/login`
2. Point out the feature list on the left panel
3. Click **Continue with Google** — Google OAuth flow runs
4. Return to the app at `/` — your avatar appears in the header

---

## Scene 2: Browse the Feed (60 sec)

> "This is the main feed. There are 14 seed items already in the database — a mix of lost and found reports from around campus."

1. Show the default grid view with item cards
2. Filter by **Lost** type — notice the count updates
3. Filter by category **Electronics** — narrows results further
4. Type "wallet" in search — matching items highlight
5. Click **Clear** to reset
6. Click any item card → navigates to `/item/[id]`

---

## Scene 3: Item Detail + Matches (60 sec)

> "The detail page shows everything about an item. But the interesting part is the Matches section — our rule-based engine compares every lost item against every found item."

1. Scroll to the **Potential Matches** section
2. Show a MatchCard — point out the score bar and reason chips
   - "Same category", "Similar location", "Close date", "Keyword overlap"
3. Explain: "No ML black box — every match is explainable"

---

## Scene 4: Post an Item (60 sec)

> "Let's post a new lost item."

1. Click the **Post** tab (or BottomNav on mobile)
2. Select **Lost**
3. Upload a photo — watch the preview appear
4. Fill: Title="Blue Hydroflask", Category=Water Bottle, Description="Lost near the gym", Location="Sports Complex", Date=today
5. Fill contact info
6. Click **Submit** — item appears in the feed

---

## Scene 5: Claim an Item (60 sec)

> "Now I'll claim one of the found items to show the claim and notification flow."

1. Click a found item in the feed
2. Click **I Found This** (or **This is Mine** for lost items)
3. Fill in the claim modal: message + proof answer
4. Submit — item status changes to **Claim Pending** (yellow badge)
5. Switch to the **Claims** tab — new claim is listed
6. Click **Approve** — item status → **Resolved** (gray badge)
7. Note: "Resend fires an email to the claimant at this step"

---

## Scene 6: Mobile View (30 sec)

> "The layout is fully responsive."

1. Open DevTools → mobile breakpoint
2. Show BottomNav replacing desktop tabs
3. Show single-column card grid

---

## Closing

> "To summarize: Google OAuth for identity, Supabase for data and storage, explainable rule-based matching, and Resend for email — all wired together in a Next.js App Router app with full TypeScript and RLS policies."
