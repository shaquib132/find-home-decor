import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api, session } from '../api.js';
import { Logo } from './ui.jsx';

const STEPS = [
  ['1', 'Search', 'Describe the kind of buyer and place you want to reach.'],
  ['2', 'Pitch', 'Edit a ready-made email and send it, or save it for later.'],
  ['3', 'Track', 'Move each buyer from pitch to proposal to won deal.']
];

export default function Login({ googleClientId, onUser }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const googleRef = useRef(null);

  const finish = (d) => {
    session.save(d.token, d.user);
    onUser(d.user);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = mode === 'login' ? { email, password } : { name, email, password };
      finish(await api(`/auth/${mode === 'login' ? 'login' : 'register'}`, { method: 'POST', body }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Google Identity Services button (only when GOOGLE_CLIENT_ID is configured on the server).
  useEffect(() => {
    if (!googleClientId) return undefined;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      if (!window.google || !googleRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          setError('');
          try {
            finish(await api('/auth/google', { method: 'POST', body: { credential } }));
          } catch (err) {
            setError(err.message);
          }
        }
      });
      window.google.accounts.id.renderButton(googleRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: Math.min(googleRef.current.offsetWidth || 340, 400)
      });
    };
    document.head.appendChild(script);
    return () => script.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleClientId]);

  return (
    <div className="grid min-h-screen bg-sand-100 md:grid-cols-[minmax(380px,1fr)_1.1fr]">
      {/* Left: form */}
      <div className="flex flex-col px-6 py-8 md:px-14">
        <Logo />
        <div className="mx-auto my-auto w-full max-w-sm py-10">
          <h1 className="font-display text-4xl font-semibold leading-tight text-ink">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            {mode === 'login' ? 'Sign in to keep working on your buyer list.' : 'Start finding stockists for your home decor products.'}
          </p>

          {googleClientId && (
            <>
              <div ref={googleRef} className="mt-6 flex min-h-[44px] justify-center" />
              <div className="my-4 flex items-center gap-3 text-xs text-ink/40">
                <div className="h-px flex-1 bg-sand-300" /> or use email <div className="h-px flex-1 bg-sand-300" />
              </div>
            </>
          )}

          <form onSubmit={submit} className={`space-y-3 ${googleClientId ? '' : 'mt-6'}`}>
            {mode === 'register' && (
              <input className="field" placeholder="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <input className="field" type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input
              className="field"
              type="password"
              placeholder={mode === 'register' ? 'Password (min 8 characters)' : 'Password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="rounded-lg bg-clay-50 px-3 py-2 text-xs text-clay-700">{error}</p>}
            <button disabled={busy} className="btn-primary w-full py-3">
              {busy && <Loader2 size={15} className="animate-spin" />}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="mt-4 w-full text-center text-sm font-medium text-forest-700 hover:underline"
          >
            {mode === 'login' ? "New here? Create an account" : 'Have an account? Sign in'}
          </button>
        </div>
      </div>

      {/* Right: how it works */}
      <div className="hidden flex-col justify-center bg-forest-800 px-14 text-forest-100 md:flex">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-clay-100">How it works</p>
        <h2 className="mt-3 max-w-md font-display text-4xl font-semibold leading-tight text-white">
          From &ldquo;who could stock this?&rdquo; to a sent pitch in minutes.
        </h2>
        <ol className="mt-10 max-w-md space-y-7">
          {STEPS.map(([n, title, text]) => (
            <li key={n} className="flex gap-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-clay-500 font-display font-semibold text-white">{n}</span>
              <div>
                <div className="font-semibold text-white">{title}</div>
                <div className="text-sm text-forest-200">{text}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
