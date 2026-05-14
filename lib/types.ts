// ============================================================
// Core domain types for FindIt Campus
// ============================================================

export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'claim_pending' | 'resolved';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export const CATEGORIES = [
  'Wallet',
  'ID Card',
  'Keys',
  'Electronics',
  'Earbuds / Headphones',
  'Water Bottle',
  'Bag / Backpack',
  'Stationery',
  'Clothing',
  'Jewellery',
  'Books / Notebooks',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;           // ISO date string YYYY-MM-DD
  image_url: string | null;
  color?: string;
  brand?: string;
  identifying_details?: string;
  contact_name: string;
  contact_email: string;
  posted_by_user_id: string | null;  // null for seeded demo items
  posted_by_name: string;
  status: ItemStatus;
  created_at: string;
}

export interface Claim {
  id: string;
  item_id: string;
  claimant_user_id: string;
  claimant_name: string;
  claimant_email: string;
  message: string;
  proof_answer: string;
  status: ClaimStatus;
  created_at: string;
  reviewed_at?: string | null;
  // joined fields (not in DB, hydrated client-side)
  item?: Item;
}

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface MatchResult {
  lostItem: Item;
  foundItem: Item;
  score: number;        // 0–100
  reasons: string[];
}

// Form shape before saving (no id/created_at/status/posted_by)
export type ItemFormData = Omit<Item, 'id' | 'created_at' | 'status' | 'posted_by_user_id' | 'posted_by_name'>;
