import { Store, Sparkles } from 'lucide-react';
import { BRAND } from '../brand.js';

const AVATARS = [
  'bg-forest-100 text-forest-800',
  'bg-clay-100 text-clay-700',
  'bg-amber-100 text-amber-800',
  'bg-sky-100 text-sky-800',
  'bg-rose-100 text-rose-800',
  'bg-lime-100 text-lime-800'
];

export function Avatar({ name = '?', index, size = 'h-11 w-11 text-base' }) {
  const initial = (String(name).trim()[0] || '?').toUpperCase();
  const i = index ?? initial.charCodeAt(0);
  return (
    <div className={`${size} shrink-0 rounded-full ${AVATARS[i % AVATARS.length]} grid place-items-center font-display font-semibold`}>
      {initial}
    </div>
  );
}

export function Logo({ light = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`grid h-9 w-9 place-items-center rounded-lg ${light ? 'bg-clay-500 text-white' : 'bg-forest-700 text-white'}`}>
        <Store size={18} />
      </div>
      <span className={`font-display text-xl font-semibold ${light ? 'text-white' : 'text-ink'}`}>
        {BRAND.first}
        <span className={light ? 'text-clay-100' : 'text-clay-600'}>{BRAND.second}</span>
      </span>
    </div>
  );
}

export function Toast({ text }) {
  if (!text) return null;
  return (
    <div
      role="status"
      className="fixed bottom-20 left-1/2 z-50 flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-lg bg-forest-900 px-4 py-3 text-sm text-white shadow-xl md:bottom-6 md:left-auto md:right-6 md:translate-x-0"
    >
      <Sparkles size={15} className="shrink-0 text-clay-100" />
      <span className="truncate">{text}</span>
    </div>
  );
}

// Only http(s) links are clickable. Lead data can come from an AI, so never trust it as an href.
export function safeHref(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : undefined;
  } catch {
    return undefined;
  }
}

export const prettyUrl = (url) => String(url || '').replace(/^https?:\/\//i, '').replace(/\/$/, '');
