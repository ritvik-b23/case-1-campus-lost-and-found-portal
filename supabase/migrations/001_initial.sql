-- FindIt Campus — Supabase Database Schema
-- Run this in the Supabase SQL Editor

-- ============================================================
-- PROFILES (mirrors auth.users, created on first Google login)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name        TEXT,
  email       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all"   ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own"   ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- ITEMS
-- posted_by_user_id is nullable so seeded demo items can exist
-- without a real auth user attached.
-- ============================================================
CREATE TABLE IF NOT EXISTS items (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type                 TEXT CHECK (type IN ('lost','found')) NOT NULL,
  title                TEXT NOT NULL,
  category             TEXT NOT NULL,
  description          TEXT NOT NULL,
  location             TEXT NOT NULL,
  date                 DATE NOT NULL,
  image_url            TEXT,
  color                TEXT,
  brand                TEXT,
  identifying_details  TEXT,
  contact_name         TEXT NOT NULL,
  contact_email        TEXT NOT NULL,
  posted_by_user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  posted_by_name       TEXT NOT NULL,
  status               TEXT CHECK (status IN ('open','claim_pending','resolved')) DEFAULT 'open' NOT NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "items_select_all"
  ON items FOR SELECT USING (true);

CREATE POLICY "items_insert_authenticated"
  ON items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = posted_by_user_id);

CREATE POLICY "items_update_owner"
  ON items FOR UPDATE
  USING (auth.uid() = posted_by_user_id);

CREATE POLICY "items_delete_owner"
  ON items FOR DELETE
  USING (auth.uid() = posted_by_user_id);

-- Allow service role to insert seed data (service role bypasses RLS automatically)

-- ============================================================
-- CLAIMS
-- ============================================================
CREATE TABLE IF NOT EXISTS claims (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id           UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  claimant_user_id  UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  claimant_name     TEXT NOT NULL,
  claimant_email    TEXT NOT NULL,
  message           TEXT NOT NULL,
  proof_answer      TEXT NOT NULL,
  status            TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending' NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reviewed_at       TIMESTAMPTZ
);

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Claimant can see their own claims
CREATE POLICY "claims_select_claimant"
  ON claims FOR SELECT
  USING (auth.uid() = claimant_user_id);

-- Item owner can see claims on their items
CREATE POLICY "claims_select_item_owner"
  ON claims FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = claims.item_id
        AND items.posted_by_user_id = auth.uid()
    )
  );

-- Authenticated users can submit claims
CREATE POLICY "claims_insert_authenticated"
  ON claims FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = claimant_user_id);

-- Only the item owner can approve/reject (update) claims
CREATE POLICY "claims_update_item_owner"
  ON claims FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = claims.item_id
        AND items.posted_by_user_id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE BUCKET  (run separately in Supabase Storage UI or via CLI)
-- Create a public bucket named: item-images
-- ============================================================
