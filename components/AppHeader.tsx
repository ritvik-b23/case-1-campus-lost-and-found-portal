'use client';

import { MapPin, RotateCcw, LogOut, User } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AppHeaderProps {
  profile: Profile | null;
  onResetSeed: () => void;
}

export default function AppHeader({ profile, onResetSeed }: AppHeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold text-slate-900 leading-tight">FindIt Campus</h1>
            <p className="text-xs text-slate-500 leading-none">Lost it? Found it? Match it fast.</p>
          </div>
          <h1 className="sm:hidden text-base font-bold text-slate-900">FindIt</h1>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetSeed}
            title="Reset demo data"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 px-2.5 py-1.5 rounded-xl transition-colors"
            aria-label="Reset demo seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* User avatar + sign out */}
          {profile && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl px-2.5 py-1.5">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name ?? 'User avatar'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-600" />
                )}
                <span className="text-xs font-medium text-slate-700 max-w-[100px] truncate hidden sm:inline">
                  {profile.name ?? profile.email ?? 'User'}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="p-1.5 rounded-xl hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
