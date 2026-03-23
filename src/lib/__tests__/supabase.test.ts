import {
  describe,
  it,
  expect,
  afterEach
} from 'vitest';
import { getPublicSupabaseConfig, hasPublicSupabaseConfig } from '../supabase';

describe('getPublicSupabaseConfig', () => {
  const originalUrl = process.env.VITE_SUPABASE_URL;
  const originalKey = process.env.VITE_SUPABASE_ANON_KEY;

  afterEach(() => {
    // Restore env vars after each test
    if (originalUrl === undefined) {
      delete process.env.VITE_SUPABASE_URL;
    } else {
      process.env.VITE_SUPABASE_URL = originalUrl;
    }
    if (originalKey === undefined) {
      delete process.env.VITE_SUPABASE_ANON_KEY;
    } else {
      process.env.VITE_SUPABASE_ANON_KEY = originalKey;
    }
  });

  it('returns config object with supabaseUrl and supabaseAnonKey', () => {
    process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

    const config = getPublicSupabaseConfig();
    expect(config).toEqual({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'test-anon-key',
    });
  });

  it('returns empty strings when env vars are not set', () => {
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_ANON_KEY;

    const config = getPublicSupabaseConfig();
    expect(config.supabaseUrl).toBe('');
    expect(config.supabaseAnonKey).toBe('');
  });

  it('returns an object with the expected shape', () => {
    process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'key123';

    const config = getPublicSupabaseConfig();
    expect(config).toHaveProperty('supabaseUrl');
    expect(config).toHaveProperty('supabaseAnonKey');
  });
});

describe('hasPublicSupabaseConfig', () => {
  afterEach(() => {
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_ANON_KEY;
  });

  it('returns true when both env vars are set', () => {
    process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

    expect(hasPublicSupabaseConfig()).toBe(true);
  });

  it('returns false when URL is missing', () => {
    delete process.env.VITE_SUPABASE_URL;
    process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

    expect(hasPublicSupabaseConfig()).toBe(false);
  });

  it('returns false when anon key is missing', () => {
    process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.VITE_SUPABASE_ANON_KEY;

    expect(hasPublicSupabaseConfig()).toBe(false);
  });

  it('returns false when both env vars are missing', () => {
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_ANON_KEY;

    expect(hasPublicSupabaseConfig()).toBe(false);
  });

  it('returns false when URL is empty string', () => {
    process.env.VITE_SUPABASE_URL = '';
    process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

    expect(hasPublicSupabaseConfig()).toBe(false);
  });
});
