'use client';

import { LayoutGrid, PlusCircle, Sparkles, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'feed' | 'post' | 'matches' | 'claims';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'feed',    label: 'Feed',    icon: <LayoutGrid className="w-5 h-5" /> },
  { id: 'post',    label: 'Post',    icon: <PlusCircle className="w-5 h-5" /> },
  { id: 'matches', label: 'Matches', icon: <Sparkles className="w-5 h-5" /> },
  { id: 'claims',  label: 'Claims',  icon: <Inbox className="w-5 h-5" /> },
];

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  claimsCount?: number;
}

export default function BottomNav({ activeTab, onTabChange, claimsCount = 0 }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 md:hidden"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors relative',
              activeTab === tab.id
                ? 'text-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            )}
            aria-label={tab.label}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className="relative">
              {tab.icon}
              {tab.id === 'claims' && claimsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {claimsCount > 9 ? '9+' : claimsCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
