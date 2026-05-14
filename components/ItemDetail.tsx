'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, User, Tag, Mail, Shield, TrendingUp } from 'lucide-react';
import type { Item, Claim, MatchResult, Profile } from '@/lib/types';
import { formatDate, formatDateTime, getCategoryIcon, getCategoryPlaceholder, getTypeColor, cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import MatchCard from './MatchCard';

interface ItemDetailProps {
  item: Item;
  claims: Claim[];
  matches: MatchResult[];
  profile: Profile | null;
  onClaim: () => void;
}

export default function ItemDetail({ item, claims, matches, profile, onClaim }: ItemDetailProps) {
  const imgSrc    = item.image_url ?? getCategoryPlaceholder(item.category);
  const typeColor = getTypeColor(item.type);
  const isOwner   = profile?.id === item.posted_by_user_id;
  const canClaim  = profile && !isOwner && item.status === 'open';

  const myPendingClaim = claims.find(
    (c) => c.claimant_user_id === profile?.id && c.status === 'pending'
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back nav */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100 px-4 py-3">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to feed
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Image */}
        <div className="rounded-3xl overflow-hidden aspect-video relative bg-slate-100 shadow-sm">
          <img src={imgSrc} alt={item.title} className="w-full h-full object-cover" />
          <span className={cn('absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide', typeColor)}>
            {item.type}
          </span>
          <span className="absolute top-3 right-3">
            <StatusBadge status={item.status} />
          </span>
        </div>

        {/* Title block */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" aria-hidden="true">{getCategoryIcon(item.category)}</span>
            <span className="text-xs text-slate-400 font-medium">{item.category}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h1>
          <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>

          {/* Tags */}
          {(item.color || item.brand) && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {item.color && (
                <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                  <Tag className="w-3 h-3" /> {item.color}
                </span>
              )}
              {item.brand && (
                <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                  <Tag className="w-3 h-3" /> {item.brand}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Details grid */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
          <h2 className="text-sm font-bold text-slate-700">Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2 text-slate-500">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
              <div><p className="text-xs text-slate-400">Location</p><p className="font-medium text-slate-700">{item.location}</p></div>
            </div>
            <div className="flex items-start gap-2 text-slate-500">
              <Calendar className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
              <div><p className="text-xs text-slate-400">Date</p><p className="font-medium text-slate-700">{formatDate(item.date)}</p></div>
            </div>
            <div className="flex items-start gap-2 text-slate-500">
              <User className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
              <div><p className="text-xs text-slate-400">Posted by</p><p className="font-medium text-slate-700">{item.posted_by_name}</p></div>
            </div>
            <div className="flex items-start gap-2 text-slate-500">
              <Calendar className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
              <div><p className="text-xs text-slate-400">Posted at</p><p className="font-medium text-slate-700">{formatDateTime(item.created_at)}</p></div>
            </div>
          </div>
          {item.identifying_details && (
            <div className="pt-2 border-t border-slate-50">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
                <div>
                  <p className="text-xs text-slate-400">Identifying details</p>
                  <p className="text-sm text-slate-700 font-medium">{item.identifying_details}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-2">
          <h2 className="text-sm font-bold text-slate-700">Contact</h2>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User className="w-4 h-4 text-indigo-400" />
            <span>{item.contact_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="w-4 h-4 text-indigo-400" />
            <a href={`mailto:${item.contact_email}`} className="text-indigo-600 hover:underline">{item.contact_email}</a>
          </div>
        </div>

        {/* Claim action */}
        {item.status === 'resolved' ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-green-700">✅ This item has been resolved</p>
          </div>
        ) : myPendingClaim ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-yellow-700">⏳ Your claim is pending review</p>
          </div>
        ) : canClaim ? (
          <button
            onClick={onClaim}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors text-sm shadow-sm"
          >
            {item.type === 'found' ? '🎯 This item is mine — Submit Claim' : '🔍 I found something like this — Submit Claim'}
          </button>
        ) : isOwner ? (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-indigo-700">This is your post. Check the Claims tab to review any incoming claims.</p>
          </div>
        ) : null}

        {/* Match suggestions */}
        {matches.length > 0 && (
          <section aria-labelledby="matches-heading">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h2 id="matches-heading" className="text-sm font-bold text-slate-700">Likely matches for this item</h2>
            </div>
            <div className="space-y-3">
              {matches.slice(0, 3).map((m, i) => (
                <MatchCard key={i} match={m} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
