import { createBrowserClient } from '@supabase/ssr';
import { createDemoClient } from './demo-client';
import { isDemoMode } from '../demo-data';

const isPlaceholderConfig = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ||
         !process.env.NEXT_PUBLIC_SUPABASE_URL;
};

export function createClient() {
  // Use demo client if Supabase isn't configured or demo mode is enabled
  if (isPlaceholderConfig() || (typeof window !== 'undefined' && isDemoMode())) {
    return createDemoClient();
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
