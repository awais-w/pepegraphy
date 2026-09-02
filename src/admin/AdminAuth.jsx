// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabaseClient } from '../lib/supabaseClient';

const initialForm = { email: '', password: '' };

export function AdminAuth({ children, onAuthenticated }) {
  const [form, setForm] = useState(initialForm);
  const [session, setSession] = useState(null);
  const [state, setState] = useState(isSupabaseConfigured ? 'checking' : 'unavailable');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabaseClient) return undefined;

    let active = true;
    const loadSession = async () => {
      try {
        const { data, error: sessionError } = await supabaseClient.auth.getSession();
        if (!active) return;
        if (sessionError) {
          setError(sessionError.message);
          setState('unauthenticated');
          return;
        }

        setSession(data.session);
        setState(data.session ? 'authenticated' : 'unauthenticated');
        if (data.session) void Promise.resolve(onAuthenticated?.()).catch(() => {});
      } catch (sessionError) {
        if (!active) return;
        setError(sessionError instanceof Error ? sessionError.message : 'We could not check your session. Please try again.');
        setState('unauthenticated');
      }
    };

    void loadSession();
    const { data } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setError(null);
      setState(nextSession ? 'authenticated' : 'unauthenticated');
      if (nextSession) void Promise.resolve(onAuthenticated?.()).catch(() => {});
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [onAuthenticated]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const signIn = async (event) => {
    event.preventDefault();
    if (!supabaseClient) return;

    setError(null);
    setState('signing-in');
    try {
      const { data, error: signInError } = await supabaseClient.auth.signInWithPassword(form);
      if (signInError) {
        setError(signInError.message);
        setSession(null);
        setState('unauthenticated');
        return;
      }

      setSession(data.session);
      setState('authenticated');
      if (data.session) await onAuthenticated?.();
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'We could not sign you in. Please try again.');
      setSession(null);
      setState('unauthenticated');
    }
  };

  const signOut = async () => {
    if (!supabaseClient) return;

    setError(null);
    setState('signing-out');
    try {
      const { error: signOutError } = await supabaseClient.auth.signOut();
      if (signOutError) {
        setError(signOutError.message);
        setState('authenticated');
        return;
      }

      setSession(null);
      setState('unauthenticated');
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'We could not sign you out. Please try again.');
      setState('authenticated');
    }
  };

  if (state === 'checking') {
    return <p className="admin-auth-status" role="status">Checking your admin session…</p>;
  }

  if (session) return children({ session, signOut, signingOut: state === 'signing-out', error });

  return (
    <main className="admin-auth-page" aria-labelledby="admin-sign-in-title">
      <section className="admin-auth-card">
        <p className="admin-eyebrow">Pepegraphy</p>
        <h1 id="admin-sign-in-title">Admin sign in</h1>
        <p>Sign in with the Supabase user created for your studio.</p>

        {!isSupabaseConfigured && (
          <p className="admin-message" role="alert">
            Admin sign-in is unavailable. Add the Supabase URL and anonymous key to this environment, then restart the app.
          </p>
        )}
        {error && <p className="admin-message" role="alert">{error}</p>}

        <form className="admin-sign-in-form" onSubmit={signIn}>
          <label htmlFor="admin-email">Email address</label>
          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={updateField}
            required
            disabled={!isSupabaseConfigured || state === 'signing-in'}
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={updateField}
            required
            disabled={!isSupabaseConfigured || state === 'signing-in'}
          />

          <button type="submit" disabled={!isSupabaseConfigured || state === 'signing-in'}>
            {state === 'signing-in' ? 'Signing in…' : 'Sign in'}
          </button>
          {state === 'signing-in' && <p role="status">Signing you in…</p>}
        </form>
      </section>
    </main>
  );
}
