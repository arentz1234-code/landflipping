import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createDemoClient } from './demo-client';

const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ||
         !process.env.NEXT_PUBLIC_SUPABASE_URL;
};

export async function createClient() {
  // Use demo client if Supabase isn't configured
  if (isDemoMode()) {
    return createDemoClient();
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore in Server Components
          }
        },
      },
    }
  );
}
