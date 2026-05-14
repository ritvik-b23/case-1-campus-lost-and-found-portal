/**
 * Seed script — inserts demo items into Supabase using the service role key.
 * Run with: npx ts-node --project tsconfig.json scripts/seed.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (or env).
 * Service role bypasses RLS so items can be inserted without a real user.
 */
import { createClient } from '@supabase/supabase-js';
import { SEED_ITEMS } from '../lib/seed';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log('🌱  Seeding FindIt Campus demo data...');

  // Check if already seeded
  const { count } = await supabase
    .from('items')
    .select('id', { count: 'exact', head: true })
    .is('posted_by_user_id', null);

  if ((count ?? 0) >= 14) {
    console.log(`✅  Already seeded (${count} system items found). Skipping.`);
    return;
  }

  const { error } = await supabase.from('items').insert(SEED_ITEMS);

  if (error) {
    console.error('❌  Seed failed:', error.message);
    process.exit(1);
  }

  console.log(`✅  Inserted ${SEED_ITEMS.length} seed items successfully.`);
}

run();
