import { afterEach, describe, expect, it, vi } from 'vitest';

const loadClient = async () => {
  vi.resetModules();
  return import('./supabaseClient.js');
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Supabase browser configuration', () => {
  it('disables the client when the URL is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');

    const { isSupabaseConfigured, supabaseClient } = await loadClient();

    expect(isSupabaseConfigured).toBe(false);
    expect(supabaseClient).toBeNull();
  });

  it('disables the client when the anonymous key is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    const { isSupabaseConfigured, supabaseClient } = await loadClient();

    expect(isSupabaseConfigured).toBe(false);
    expect(supabaseClient).toBeNull();
  });

  it('exports a browser client when both environment variables are present', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');

    const { isSupabaseConfigured, supabaseClient } = await loadClient();

    expect(isSupabaseConfigured).toBe(true);
    expect(supabaseClient).toEqual(expect.objectContaining({
      from: expect.any(Function),
      auth: expect.any(Object),
    }));
  });
});
