import type { AppConfig } from '../types';

function getEnvVar(name: string): string {
  return process.env[name] ?? '';
}

export function getPublicSupabaseConfig(): AppConfig {
  return {
    supabaseUrl: getEnvVar('VITE_SUPABASE_URL'),
    supabaseAnonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  };
}

export function hasPublicSupabaseConfig() {
  const config = getPublicSupabaseConfig();
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}

export async function supabaseRestRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase public environment variables.');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return [] as unknown as T;
  }

  return (await response.json()) as T;
}
