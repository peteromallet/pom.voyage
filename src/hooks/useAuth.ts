import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient, type SupabaseSession, type SupabaseUser } from '../lib/supabase-client';

const PROFILE_CACHE_KEY = 'feedback-x-profile';

export interface XProfile {
  x_user_id: string | null;
  username: string | null;
  avatar_url: string | null;
  followers_count: number | null;
  account_created_at: string | null;
}

interface CachedXProfile {
  userId: string;
  profile: XProfile;
}

interface EnrichResponse {
  followers_count: number | null;
  username: string | null;
  profile_image_url: string | null;
  account_created_at: string | null;
}

function getTwitterIdentityId(user: SupabaseUser): string | null {
  const identity = user.identities?.find((item) => item.provider === 'x' || item.provider === 'twitter');
  return identity?.id ?? user.user_metadata?.provider_id ?? user.user_metadata?.sub ?? null;
}

function getFallbackProfile(user: SupabaseUser): XProfile {
  return {
    x_user_id: getTwitterIdentityId(user),
    username: user.user_metadata?.user_name ?? user.user_metadata?.preferred_username ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
    followers_count: null,
    account_created_at: null,
  };
}

function readCachedProfile(userId: string): XProfile | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedXProfile;
    return parsed.userId === userId ? parsed.profile : null;
  } catch {
    return null;
  }
}

function writeCachedProfile(userId: string, profile: XProfile) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ userId, profile } satisfies CachedXProfile));
}

function clearCachedProfile() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(PROFILE_CACHE_KEY);
}

async function enrichProfile(providerToken: string): Promise<EnrichResponse> {
  const response = await fetch('/api/feedback/enrich', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ provider_token: providerToken }),
  });

  if (!response.ok) {
    throw new Error(`Failed to enrich X profile (${response.status})`);
  }

  return response.json() as Promise<EnrichResponse>;
}

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [xProfile, setXProfile] = useState<XProfile | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    const syncProfile = async (nextSession: SupabaseSession | null, shouldEnrich: boolean) => {
      if (!active) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        clearCachedProfile();
        setXProfile(null);
        setLoading(false);
        return;
      }

      const fallback = getFallbackProfile(nextSession.user);

      if (shouldEnrich && nextSession.provider_token) {
        try {
          const enriched = await enrichProfile(nextSession.provider_token);
          if (!active) return;

          const mergedProfile: XProfile = {
            x_user_id: fallback.x_user_id,
            username: enriched.username ?? fallback.username,
            avatar_url: enriched.profile_image_url ?? fallback.avatar_url,
            followers_count: enriched.followers_count,
            account_created_at: enriched.account_created_at,
          };

          writeCachedProfile(nextSession.user.id, mergedProfile);
          setXProfile(mergedProfile);
        } catch {
          writeCachedProfile(nextSession.user.id, fallback);
          setXProfile(fallback);
        }
      } else {
        setXProfile(readCachedProfile(nextSession.user.id) ?? fallback);
      }

      setLoading(false);
    };

    void supabase.auth.getSession().then(({ data }) => syncProfile(data.session ?? null, Boolean(data.session?.provider_token)));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      const shouldEnrich = event === 'SIGNED_IN' && Boolean(nextSession?.provider_token);
      void syncProfile(nextSession, shouldEnrich);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithTwitter = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || typeof window === 'undefined') {
      throw new Error('Supabase auth is not configured in the browser.');
    }

    const redirectTo = new URL('/assorted/feedback', window.location.origin).toString();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'x',
      options: {
        redirectTo,
        scopes: 'users.read tweet.read offline.access',
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    clearCachedProfile();

    if (!supabase) {
      setSession(null);
      setUser(null);
      setXProfile(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    xProfile,
    signInWithTwitter,
    signOut,
  };
}
