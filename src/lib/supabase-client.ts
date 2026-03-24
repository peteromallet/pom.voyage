import type { AppConfig } from '../types';

type JsonRecord = Record<string, any>;

export interface SupabaseUser {
  id: string;
  app_metadata?: JsonRecord;
  user_metadata?: JsonRecord;
  identities?: Array<{ id?: string; provider?: string }>;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  provider_token?: string | null;
  provider_refresh_token?: string | null;
  token_type?: string;
  user: SupabaseUser;
}

export type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'INITIAL_SESSION';

interface AuthSubscription {
  unsubscribe: () => void;
}

interface AuthListener {
  (event: AuthChangeEvent, session: SupabaseSession | null): void;
}

interface UploadOptions {
  cacheControl?: string;
  upsert?: boolean;
  contentType?: string;
}

interface QueryResult<T> {
  data: T | null;
  error: Error | null;
}

function getBrowserConfig(): AppConfig | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const config = window.__APP_CONFIG__;
  if (!config?.supabaseUrl || !config?.supabaseAnonKey) {
    return null;
  }

  return config;
}

function getStorageKey(config: AppConfig): string {
  const host = new URL(config.supabaseUrl).host.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  return `feedback-supabase-session:${host}`;
}

function getHashParams(): URLSearchParams {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  return new URLSearchParams(hash);
}

function clearAuthHash() {
  if (!window.location.hash) {
    return;
  }

  const nextUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState({}, document.title, nextUrl);
}

function encodePath(path: string): string {
  return path.split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

export class BrowserSupabaseClient {
  private readonly config: AppConfig;
  private readonly listeners = new Set<AuthListener>();
  private hydratedUrlSession = false;

  constructor(config: AppConfig) {
    this.config = config;
  }

  private get headers() {
    return {
      apikey: this.config.supabaseAnonKey,
    };
  }

  private getSessionStorageKey() {
    return getStorageKey(this.config);
  }

  private readStoredSession(): SupabaseSession | null {
    try {
      const raw = window.localStorage.getItem(this.getSessionStorageKey());
      return raw ? (JSON.parse(raw) as SupabaseSession) : null;
    } catch {
      return null;
    }
  }

  private writeStoredSession(session: SupabaseSession | null) {
    const key = this.getSessionStorageKey();
    if (!session) {
      window.localStorage.removeItem(key);
      return;
    }

    const storedSession: SupabaseSession = {
      ...session,
      provider_token: undefined,
      provider_refresh_token: undefined,
    };

    window.localStorage.setItem(key, JSON.stringify(storedSession));
  }

  private notify(event: AuthChangeEvent, session: SupabaseSession | null) {
    for (const listener of this.listeners) {
      listener(event, session);
    }
  }

  private async fetchUser(accessToken: string): Promise<SupabaseUser> {
    const response = await fetch(`${this.config.supabaseUrl}/auth/v1/user`, {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to fetch Supabase user (${response.status}): ${body}`);
    }

    return response.json() as Promise<SupabaseUser>;
  }

  private async hydrateSessionFromUrl(): Promise<SupabaseSession | null> {
    if (this.hydratedUrlSession || typeof window === 'undefined') {
      return null;
    }

    this.hydratedUrlSession = true;
    const params = getHashParams();
    const accessToken = params.get('access_token');

    if (!accessToken) {
      return null;
    }

    try {
      const user = await this.fetchUser(accessToken);
      const session: SupabaseSession = {
        access_token: accessToken,
        refresh_token: params.get('refresh_token') ?? undefined,
        expires_at: params.get('expires_at') ? Number(params.get('expires_at')) : undefined,
        expires_in: params.get('expires_in') ? Number(params.get('expires_in')) : undefined,
        provider_token: params.get('provider_token'),
        provider_refresh_token: params.get('provider_refresh_token'),
        token_type: params.get('token_type') ?? 'bearer',
        user,
      };

      this.writeStoredSession(session);
      clearAuthHash();
      this.notify('SIGNED_IN', session);
      return session;
    } catch {
      clearAuthHash();
      this.writeStoredSession(null);
      return null;
    }
  }

  private async refreshSession(session: SupabaseSession): Promise<SupabaseSession | null> {
    if (!session.refresh_token) {
      return session;
    }

    const response = await fetch(`${this.config.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });

    if (!response.ok) {
      this.writeStoredSession(null);
      this.notify('SIGNED_OUT', null);
      return null;
    }

    const payload = await response.json() as Partial<SupabaseSession>;
    const refreshedSession: SupabaseSession = {
      access_token: payload.access_token ?? session.access_token,
      refresh_token: payload.refresh_token ?? session.refresh_token,
      expires_at: payload.expires_at ?? session.expires_at,
      expires_in: payload.expires_in ?? session.expires_in,
      token_type: payload.token_type ?? session.token_type,
      user: payload.user ?? session.user,
    };

    this.writeStoredSession(refreshedSession);
    this.notify('TOKEN_REFRESHED', refreshedSession);
    return refreshedSession;
  }

  private async getActiveStoredSession(): Promise<SupabaseSession | null> {
    const storedSession = this.readStoredSession();
    if (!storedSession) {
      return null;
    }

    if (!storedSession.expires_at) {
      return storedSession;
    }

    const now = Math.floor(Date.now() / 1000);
    if (storedSession.expires_at <= now + 60) {
      return this.refreshSession(storedSession);
    }

    return storedSession;
  }

  private async restRequest<T>(path: string, init?: RequestInit, authToken?: string): Promise<T> {
    const response = await fetch(`${this.config.supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        ...this.headers,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Supabase REST request failed (${response.status}): ${body}`);
    }

    const text = await response.text();
    if (!text) {
      return null as T;
    }

    return JSON.parse(text) as T;
  }

  auth = {
    getSession: async (): Promise<{ data: { session: SupabaseSession | null } }> => {
      if (typeof window === 'undefined') {
        return { data: { session: null } };
      }

      const hydratedSession = await this.hydrateSessionFromUrl();
      if (hydratedSession) {
        return { data: { session: hydratedSession } };
      }

      return { data: { session: await this.getActiveStoredSession() } };
    },

    onAuthStateChange: (listener: AuthListener): { data: { subscription: AuthSubscription } } => {
      this.listeners.add(listener);

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              this.listeners.delete(listener);
            },
          },
        },
      };
    },

    signInWithOAuth: async ({
      provider,
      options,
    }: {
      provider: string;
      options?: { redirectTo?: string; scopes?: string };
    }): Promise<{ error: Error | null }> => {
      if (typeof window === 'undefined') {
        return { error: new Error('OAuth sign-in requires a browser environment.') };
      }

      const authorizeUrl = new URL(`${this.config.supabaseUrl}/auth/v1/authorize`);
      authorizeUrl.searchParams.set('provider', provider);

      if (options?.redirectTo) {
        authorizeUrl.searchParams.set('redirect_to', options.redirectTo);
      }

      if (options?.scopes) {
        authorizeUrl.searchParams.set('scopes', options.scopes);
      }

      window.location.assign(authorizeUrl.toString());
      return { error: null };
    },

    signOut: async (): Promise<{ error: Error | null }> => {
      if (typeof window === 'undefined') {
        return { error: null };
      }

      const session = this.readStoredSession();
      this.writeStoredSession(null);

      try {
        if (session?.access_token) {
          await fetch(`${this.config.supabaseUrl}/auth/v1/logout`, {
            method: 'POST',
            headers: {
              ...this.headers,
              Authorization: `Bearer ${session.access_token}`,
            },
          });
        }
      } catch {
        // Local session removal is the critical action.
      }

      this.notify('SIGNED_OUT', null);
      return { error: null };
    },
  };

  from(table: string) {
    return {
      insert: async (values: JsonRecord): Promise<QueryResult<null>> => {
        try {
          const session = await this.auth.getSession().then((result) => result.data.session);
          await this.restRequest(table, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify(values),
          }, session?.access_token);
          return { data: null, error: null };
        } catch (error) {
          return { data: null, error: error instanceof Error ? error : new Error('Insert failed.') };
        }
      },

      select: (columns: string) => ({
        order: async (column: string, options: { ascending: boolean }): Promise<QueryResult<JsonRecord[]>> => {
          try {
            const params = new URLSearchParams({
              select: columns,
              order: `${column}.${options.ascending ? 'asc' : 'desc'}`,
            });
            const data = await this.restRequest<JsonRecord[]>(`${table}?${params.toString()}`);
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error instanceof Error ? error : new Error('Select failed.') };
          }
        },
      }),
    };
  }

  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File, options?: UploadOptions): Promise<QueryResult<null>> => {
        try {
          const session = await this.auth.getSession().then((result) => result.data.session);
          if (!session?.access_token) {
            throw new Error('Missing auth session for storage upload.');
          }

          const response = await fetch(
            `${this.config.supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodePath(path)}`,
            {
              method: 'POST',
              headers: {
                ...this.headers,
                Authorization: `Bearer ${session.access_token}`,
                'cache-control': options?.cacheControl ?? '3600',
                'x-upsert': options?.upsert ? 'true' : 'false',
                ...(options?.contentType ? { 'Content-Type': options.contentType } : {}),
              },
              body: file,
            },
          );

          if (!response.ok) {
            const body = await response.text();
            throw new Error(`Supabase storage upload failed (${response.status}): ${body}`);
          }

          return { data: null, error: null };
        } catch (error) {
          return { data: null, error: error instanceof Error ? error : new Error('Upload failed.') };
        }
      },

      remove: async (paths: string[]): Promise<QueryResult<null>> => {
        try {
          const session = await this.auth.getSession().then((result) => result.data.session);
          if (!session?.access_token) {
            throw new Error('Missing auth session for storage cleanup.');
          }

          const response = await fetch(`${this.config.supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}`, {
            method: 'DELETE',
            headers: {
              ...this.headers,
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(paths),
          });

          if (!response.ok) {
            const body = await response.text();
            throw new Error(`Supabase storage remove failed (${response.status}): ${body}`);
          }

          return { data: null, error: null };
        } catch (error) {
          return { data: null, error: error instanceof Error ? error : new Error('Storage cleanup failed.') };
        }
      },
    }),
  };
}

let browserClient: BrowserSupabaseClient | null = null;

export function getSupabaseBrowserClient(): BrowserSupabaseClient | null {
  const config = getBrowserConfig();
  if (!config) {
    return null;
  }

  if (!browserClient) {
    browserClient = new BrowserSupabaseClient(config);
  }

  return browserClient;
}
