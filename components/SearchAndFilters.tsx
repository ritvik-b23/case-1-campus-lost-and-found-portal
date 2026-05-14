'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface Filters {
  search: string;
  type: 'all' | 'lost' | 'found';
  category: string;
  status: 'all' | 'open' | 'claim_pending' | 'resolved';
}

export const DEFAULT_FILTERS: Filters = {
  search: '',
  type: 'all',
  category: '',
  status: 'open',
};

interface SearchAndFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  resultCount: number;
}

export default function SearchAndFilters({ filters, onChange, resultCount }: SearchAndFiltersProps) {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.category !== '' ||
    filters.status !== 'all';

  function update(partial: Partial<Filters>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search items, locations, descriptions…"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent placeholder:text-slate-400"
          aria-label="Search items"
        />
      </div>

      {/* Filter row */}
      <div className="flex gap-2 flex-wrap items-center">
        <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />

        {/* Type */}
        {(['all', 'lost', 'found'] as const).map((t) => (
          <button
            key={t}
            onClick={() => update({ type: t })}
            className={cn(
              'text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors capitalize',
              filters.type === t
                ? t === 'lost'
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : t === 'found'
                    ? 'bg-teal-100 text-teal-700 border-teal-200'
                    : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            )}
            aria-pressed={filters.type === t}
          >
            {t === 'all' ? 'All' : t}
          </button>
        ))}

        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) => update({ category: e.target.value })}
          className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => update({ status: e.target.value as Filters['status'] })}
          className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          aria-label="Filter by status"
        >
          <option value="all">All status</option>
          <option value="open">Open</option>
          <option value="claim_pending">Claim Pending</option>
          <option value="resolved">Resolved</option>
        </select>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
            aria-label="Clear all filters"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-slate-400 font-medium">
        {resultCount} item{resultCount !== 1 ? 's' : ''} found
      </p>
    </div>
  );
}
