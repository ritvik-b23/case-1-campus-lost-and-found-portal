import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Upsert profile on first login
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: data.user.user_metadata?.full_name ?? data.user.email ?? 'Unknown',
        email: data.user.email ?? '',
        avatar_url: data.user.user_metadata?.avatar_url ?? null,
      });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — redirect to login with error param
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
