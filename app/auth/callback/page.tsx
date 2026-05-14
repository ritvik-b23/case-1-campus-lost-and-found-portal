'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function CallbackHandler() {
  const router   = useRouter();
  const params   = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const code = params.get('code');

    if (!code) {
      router.replace('/login?error=auth_failed');
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
      if (error || !data.user) {
        router.replace('/login?error=auth_failed');
        return;
      }

      // Upsert profile row on first sign-in
      await supabase.from('profiles').upsert({
        id:         data.user.id,
        name:       data.user.user_metadata?.full_name ?? data.user.email ?? 'Unknown',
        email:      data.user.email ?? '',
        avatar_url: data.user.user_metadata?.avatar_url ?? null,
      });

      router.replace('/');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
