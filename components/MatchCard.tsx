'use client';

import Link from 'next/link';
import { TrendingUp, ArrowRight } from 'lucide-react';
import type { MatchResult } from '@/lib/types';
import { getCategoryPlaceholder, getTypeColor, formatDate, cn } from '@/lib/utils';

interface MatchCardProps {
  match: MatchResult;
}

function MiniItemCard({ item, label }: { item: MatchResult['lostItem']; label: string }) {
  const imgSrc = item.image_url ?? getCategoryPlaceholder(item.category);
  const typeColor = getTypeColor(item.type);
  return (
    <Link
      href={`/item/${item.id}`}
      className="flex-1 min-w-0 bg-slate-50 rounded-xl overflow-hidden hover:bg-slate-100 transition-colors block"
      aria-label={`View ${item.title}`}
    >
      <div className="aspect-[3/2] overflow-hidden relative">
        <img src={imgSrc} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        <span className={cn('absolute top-1.5 left-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase', typeColor)}>
          {label}
        </span>
      </div>
      <div className="p-2.5">
        <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{item.location}</p>
        <p className="text-[10px] text-slate-400">{formatDate(item.date)}</p>
      </div>
    </Link>
  );
}

export default function MatchCard({ match }: MatchCardProps) {
  const { lostItem, foundItem, score, reasons } = match;

  const scoreColor =
    score >= 80 ? 'text-green-600 bg-green-50'
    : score >= 60 ? 'text-indigo-600 bg-indigo-50'
    : 'text-yellow-600 bg-yellow-50';

  const barColor =
    score >= 80 ? 'bg-green-500'
    : score >= 60 ? 'bg-indigo-500'
    : 'bg-yellow-500';

  return (
    <article className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
      {/* Score header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" aria-hidden="true" />
          <span className="text-sm font-bold text-slate-700">Likely Match</span>
        </div>
        <span className={cn('text-sm font-black px-3 py-1 rounded-full', scoreColor)}>
          {score}% match
        </span>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`Match score: ${score}%`}>
        <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${score}%` }} />
      </div>

      {/* Item pair */}
      <div className="flex gap-2 items-stretch">
        <MiniItemCard item={lostItem}  label="Lost"  />
        <div className="flex items-center">
          <ArrowRight className="w-4 h-4 text-slate-300" aria-hidden="true" />
        </div>
        <MiniItemCard item={foundItem} label="Found" />
      </div>

      {/* Reasons */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-1.5">Why this match?</p>
        <div className="flex flex-wrap gap-1.5">
          {reasons.map((reason, i) => (
            <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
              {reason}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
