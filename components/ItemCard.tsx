'use client';

import Link from 'next/link';
import { MapPin, Calendar, User, Tag } from 'lucide-react';
import type { Item } from '@/lib/types';
import { formatDate, getCategoryIcon, getCategoryPlaceholder, getTypeColor, cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';

interface ItemCardProps {
  item: Item;
  currentUserId?: string;
  onClaim?: (item: Item) => void;
}

export default function ItemCard({ item, currentUserId, onClaim }: ItemCardProps) {
  const isOwner  = currentUserId && item.posted_by_user_id === currentUserId;
  const canClaim = !isOwner && item.status === 'open' && currentUserId;
  const typeColor = getTypeColor(item.type);
  const imgSrc = item.image_url ?? getCategoryPlaceholder(item.category);

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Image */}
      <Link href={`/item/${item.id}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-100" aria-label={`View details for ${item.title}`}>
        <img
          src={imgSrc}
          alt={item.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Type badge overlaid on image */}
        <span className={cn(
          'absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide',
          typeColor
        )}>
          {item.type}
        </span>
        {/* Status badge */}
        {item.status !== 'open' && (
          <span className="absolute top-2 right-2">
            <StatusBadge status={item.status} />
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Category + title */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base" aria-hidden="true">{getCategoryIcon(item.category)}</span>
            <span className="text-xs text-slate-400 font-medium">{item.category}</span>
          </div>
          <Link href={`/item/${item.id}`}>
            <h2 className="text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
              {item.title}
            </h2>
          </Link>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Meta */}
        <div className="space-y-1 pt-1 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>{formatDate(item.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <User className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.posted_by_name}</span>
          </div>
          {(item.color || item.brand) && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Tag className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>{[item.color, item.brand].filter(Boolean).join(' · ')}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <Link
            href={`/item/${item.id}`}
            className="flex-1 text-center text-xs font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 py-2 rounded-xl transition-colors"
          >
            View Details
          </Link>
          {canClaim && (
            <button
              onClick={() => onClaim?.(item)}
              className="flex-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 py-2 rounded-xl transition-colors"
              aria-label={`Claim ${item.title}`}
            >
              {item.type === 'found' ? 'This is mine' : 'I found this'}
            </button>
          )}
          {isOwner && (
            <span className="flex-1 text-center text-xs text-slate-400 py-2">Your post</span>
          )}
        </div>
      </div>
    </article>
  );
}
