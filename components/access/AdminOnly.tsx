'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Props = {
  children: React.ReactNode;
  /** Optional: what to render for non-admins (defaults to nothing) */
  fallback?: React.ReactNode;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminOnly({ children, fallback = null }: Props) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      if (!user) {
        if (mounted) setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from('admin_roles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (mounted) setIsAdmin(!!data);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Render nothing until we know (prevents “blink”).
  if (isAdmin === null) return null;

  return isAdmin ? <>{children}</> : <>{fallback}</>;
}
