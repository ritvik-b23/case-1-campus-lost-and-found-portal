'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, PlusCircle, Sparkles, Inbox, CheckCircle, XCircle } from 'lucide-react';
import type { Item, Claim, Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { getMatches } from '@/lib/matching';
import { cn, getCategoryPlaceholder, formatDateTime } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import ItemCard from '@/components/ItemCard';
import ItemForm from '@/components/ItemForm';
import MatchCard from '@/components/MatchCard';
import ClaimModal from '@/components/ClaimModal';
import SearchAndFilters, { DEFAULT_FILTERS, type Filters } from '@/components/SearchAndFilters';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import type { NotifyEvent } from './api/notify/route';

type Tab = 'feed' | 'post' | 'matches' | 'claims';

export default function HomePage() {
  const router   = useRouter();
  const supabase = createClient();

  const [profile,     setProfile]     = useState<Profile | null>(null);
  const [items,       setItems]       = useState<Item[]>([]);
  const [claims,      setClaims]      = useState<Claim[]>([]);
  const [activeTab,   setActiveTab]   = useState<Tab>('feed');
  const [filters,     setFilters]     = useState<Filters>(DEFAULT_FILTERS);
  const [claimTarget, setClaimTarget] = useState<Item | null>(null);
  const [loading,     setLoading]     = useState(true);

  // Auth guard
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/login');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile(data as Profile);
  }, [supabase]);

  const loadItems = useCallback(async () => {
    const { data } = await supabase.from('items').select('*').order('created_at', { ascending: false });
    if (data) setItems(data as Item[]);
  }, [supabase]);

  const loadClaims = useCallback(async (prof: Profile, allItems: Item[]) => {
    const { data: asClaimer } = await supabase
      .from('claims').select('*, item:items(*)').eq('claimant_user_id', prof.id).order('created_at', { ascending: false });

    const myItemIds = allItems.filter((i) => i.posted_by_user_id === prof.id).map((i) => i.id);
    let asOwner: Claim[] = [];
    if (myItemIds.length > 0) {
      const { data } = await supabase.from('claims').select('*, item:items(*)').in('item_id', myItemIds).order('created_at', { ascending: false });
      asOwner = (data as Claim[]) ?? [];
    }
    const all  = [...((asClaimer as Claim[]) ?? []), ...asOwner];
    const seen = new Set<string>();
    setClaims(all.filter((c) => { if (seen.has(c.id)) return false; seen.add(c.id); return true; }));
  }, [supabase]);

  useEffect(() => {
    (async () => {
      await loadProfile();
      await loadItems();
      setLoading(false);
    })();
  }, [loadProfile, loadItems]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (profile && items.length >= 0) loadClaims(profile, items);
  }, [profile, items, loadClaims]);

  function handleResetSeed() {
    alert('To re-seed demo data, run:\n\nnpx ts-node scripts/seed.ts\n\nOr manage data in the Supabase dashboard.');
  }

  const filteredItems = items.filter((item) => {
    const q = filters.search.toLowerCase();
    if (filters.type !== 'all' && item.type !== filters.type) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.status !== 'all' && item.status !== filters.status) return false;
    if (q) {
      const hay = [item.title, item.description, item.category, item.location, item.color ?? '', item.brand ?? ''].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const matches      = getMatches(items);
  const pendingCount = claims.filter((c) => {
    const it = items.find((i) => i.id === c.item_id);
    return c.status === 'pending' && it?.posted_by_user_id === profile?.id;
  }).length;

  async function handleClaimSuccess() {
    setClaimTarget(null);
    await loadItems();
    if (profile) await loadClaims(profile, items);
    setActiveTab('claims');
  }

  async function handleApprove(claim: Claim) {
    await supabase.from('claims').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', claim.id);
    await supabase.from('items').update({ status: 'resolved' }).eq('id', claim.item_id);
    if (claim.claimant_email) {
      const payload: NotifyEvent = { type: 'claim_approved', claimantEmail: claim.claimant_email, claimantName: claim.claimant_name, itemTitle: items.find((i) => i.id === claim.item_id)?.title ?? 'Item', itemId: claim.item_id };
      await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    await loadItems();
    if (profile) await loadClaims(profile, items);
  }

  async function handleReject(claim: Claim) {
    await supabase.from('claims').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', claim.id);
    const remaining = claims.filter((c) => c.item_id === claim.item_id && c.id !== claim.id && c.status === 'pending');
    if (remaining.length === 0) await supabase.from('items').update({ status: 'open' }).eq('id', claim.item_id);
    if (claim.claimant_email) {
      const payload: NotifyEvent = { type: 'claim_rejected', claimantEmail: claim.claimant_email, claimantName: claim.claimant_name, itemTitle: items.find((i) => i.id === claim.item_id)?.title ?? 'Item', itemId: claim.item_id };
      await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    await loadItems();
    if (profile) await loadClaims(profile, items);
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'feed',    label: 'Feed',    icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'post',    label: 'Post',    icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'matches', label: 'Matches', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'claims',  label: 'Claims',  icon: <Inbox className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <AppHeader profile={profile} onResetSeed={handleResetSeed} />

      {/* Desktop tab bar */}
      <div className="hidden md:flex max-w-4xl mx-auto px-4 pt-4 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors relative',
              activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
            )}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.icon}{tab.label}
            {tab.id === 'claims' && pendingCount > 0 && (
              <span className="w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <main className="max-w-4xl mx-auto px-4 py-4">
        {activeTab === 'feed' && (
          <div className="space-y-4">
            <SearchAndFilters filters={filters} onChange={setFilters} resultCount={filteredItems.length} />
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <EmptyState title="No items found" description="Try adjusting your filters or search terms."
                action={<button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-sm text-indigo-600 font-semibold hover:underline">Clear filters</button>} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} currentUserId={profile?.id} onClaim={setClaimTarget} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'post' && profile && (
          <div className="max-w-xl mx-auto">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-800">Post an item</h2>
              <p className="text-sm text-slate-500">Fill in the details to help others find or claim the item.</p>
            </div>
            <ItemForm userId={profile.id} userName={profile.name ?? profile.email ?? 'Anonymous'}
              onSuccess={() => { loadItems(); setActiveTab('feed'); }} />
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Likely Matches</h2>
              <p className="text-sm text-slate-500">Lost and found items ranked by match score.</p>
            </div>
            {matches.length === 0
              ? <EmptyState title="No matches yet" description="Matches appear automatically when items share location, category, date, and keywords." />
              : <div className="space-y-4">{matches.map((m, i) => <MatchCard key={i} match={m} />)}</div>}
          </div>
        )}

        {activeTab === 'claims' && (
          <ClaimsTab claims={claims} items={items} profile={profile} onApprove={handleApprove} onReject={handleReject} />
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} claimsCount={pendingCount} />

      {claimTarget && profile && (
        <ClaimModal item={claimTarget} claimantId={profile.id}
          claimantName={profile.name ?? profile.email ?? 'Unknown'}
          claimantEmail={profile.email ?? ''}
          onClose={() => setClaimTarget(null)} onSuccess={handleClaimSuccess} />
      )}
    </div>
  );
}

interface ClaimsTabProps { claims: Claim[]; items: Item[]; profile: Profile | null; onApprove: (c: Claim) => void; onReject: (c: Claim) => void; }

function ClaimsTab({ claims, items, profile, onApprove, onReject }: ClaimsTabProps) {
  const myItemIds      = items.filter((i) => i.posted_by_user_id === profile?.id).map((i) => i.id);
  const incomingClaims = claims.filter((c) => myItemIds.includes(c.item_id) && c.claimant_user_id !== profile?.id);
  const myClaims       = claims.filter((c) => c.claimant_user_id === profile?.id);
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    approved: 'bg-green-50 border-green-200 text-green-700',
    rejected: 'bg-red-50 border-red-200 text-red-700',
  };

  function ClaimRow({ claim, isOwner }: { claim: Claim; isOwner: boolean }) {
    const item   = items.find((i) => i.id === claim.item_id) ?? (claim.item as Item | undefined);
    const imgSrc = item?.image_url ?? getCategoryPlaceholder(item?.category ?? 'Other');
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="flex gap-3 items-center">
          <img src={imgSrc} alt={item?.title ?? 'Item'} className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800 truncate">{item?.title ?? 'Unknown item'}</p>
            <p className="text-xs text-slate-400">{item?.location}</p>
          </div>
          {item && <StatusBadge status={item.status} />}
        </div>
        <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs text-slate-600">
          <p><span className="font-semibold">From:</span> {claim.claimant_name} ({claim.claimant_email})</p>
          <p><span className="font-semibold">Message:</span> {claim.message}</p>
          <p><span className="font-semibold">Proof:</span> {claim.proof_answer}</p>
          <p className="text-slate-400">{formatDateTime(claim.created_at)}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border capitalize', statusColors[claim.status])}>{claim.status}</span>
          {isOwner && claim.status === 'pending' && (
            <div className="flex gap-2">
              <button onClick={() => onReject(claim)} className="flex items-center gap-1 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors" aria-label="Reject claim">
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
              <button onClick={() => onApprove(claim)} className="flex items-center gap-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-xl transition-colors" aria-label="Approve claim">
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="incoming-heading">
        <h2 id="incoming-heading" className="text-lg font-bold text-slate-800 mb-3">Claims on your items</h2>
        {incomingClaims.length === 0
          ? <EmptyState title="No incoming claims yet" description="When someone claims one of your posts, it will appear here." />
          : <div className="space-y-3">{incomingClaims.map((c) => <ClaimRow key={c.id} claim={c} isOwner={true} />)}</div>}
      </section>
      <section aria-labelledby="my-claims-heading">
        <h2 id="my-claims-heading" className="text-lg font-bold text-slate-800 mb-3">Claims you submitted</h2>
        {myClaims.length === 0
          ? <EmptyState title="No submitted claims yet" description="Browse the feed and tap 'This is mine' on a found item." />
          : <div className="space-y-3">{myClaims.map((c) => <ClaimRow key={c.id} claim={c} isOwner={false} />)}</div>}
      </section>
    </div>
  );
}

