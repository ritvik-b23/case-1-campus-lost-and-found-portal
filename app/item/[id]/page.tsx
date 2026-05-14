'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Item, Claim, Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { getMatches } from '@/lib/matching';
import ItemDetail from '@/components/ItemDetail';
import ClaimModal from '@/components/ClaimModal';
import type { NotifyEvent } from '@/app/api/notify/route';

export default function ItemDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const supabase = createClient();

  const [item,    setItem]    = useState<Item | null>(null);
  const [claims,  setClaims]  = useState<Claim[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showClaim, setShowClaim] = useState(false);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: userData }, { data: itemData }, { data: allData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('items').select('*').eq('id', id).single(),
        supabase.from('items').select('*'),
      ]);

      if (itemData)  setItem(itemData as Item);
      if (allData)   setAllItems(allData as Item[]);

      if (userData.user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', userData.user.id).single();
        if (prof) setProfile(prof as Profile);

        const { data: claimsData } = await supabase.from('claims').select('*').eq('item_id', id);
        if (claimsData) setClaims(claimsData as Claim[]);
      }

      setLoading(false);
    }
    load();
  }, [id, supabase]);

  async function handleClaimSuccess() {
    setShowClaim(false);
    // Refresh item and claims
    const [{ data: itemData }, { data: claimsData }] = await Promise.all([
      supabase.from('items').select('*').eq('id', id).single(),
      supabase.from('claims').select('*').eq('item_id', id),
    ]);
    if (itemData)  setItem(itemData as Item);
    if (claimsData) setClaims(claimsData as Claim[]);

    // Notify poster
    if (item && profile && item.contact_email) {
      const payload: NotifyEvent = {
        type: 'claim_submitted',
        posterEmail:  item.contact_email,
        posterName:   item.posted_by_name,
        itemTitle:    item.title,
        claimantName: profile.name ?? 'Someone',
        itemId:       item.id,
      };
      await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-500">
        <p className="text-5xl" aria-hidden="true">🔍</p>
        <p className="font-semibold">Item not found</p>
      </div>
    );
  }

  // Compute matches relevant to this item
  const allMatches  = getMatches(allItems);
  const itemMatches = allMatches.filter(
    (m) => m.lostItem.id === item.id || m.foundItem.id === item.id
  );

  return (
    <>
      <ItemDetail
        item={item}
        claims={claims}
        matches={itemMatches}
        profile={profile}
        onClaim={() => setShowClaim(true)}
      />
      {showClaim && profile && (
        <ClaimModal
          item={item}
          claimantId={profile.id}
          claimantName={profile.name ?? profile.email ?? 'Unknown'}
          claimantEmail={profile.email ?? ''}
          onClose={() => setShowClaim(false)}
          onSuccess={handleClaimSuccess}
        />
      )}
    </>
  );
}
