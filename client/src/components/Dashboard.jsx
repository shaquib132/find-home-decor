import { Search, Send, Mail, MapPin, Globe, ArrowRight, RotateCcw, Loader2, Check, Trash2 } from 'lucide-react';
import { Avatar, safeHref, prettyUrl } from './ui.jsx';

/* ------------------------------------------------------------ Discover */

// Each chip runs a ready-made query.
export const QUICK_SEARCHES = [
  ['California', 'home decor boutiques California'],
  ['New York', 'interior design stores New York'],
  ['Texas', 'furniture boutiques Texas'],
  ['Florida', 'luxury home decor retailers Florida'],
  ['Midwest', 'home furnishing stores Midwest']
];

export function Discover({ query, setQuery, onSearch, loading, inputRef }) {
  return (
    <section className="pt-8 md:pt-12">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-clay-600">New search</p>
      <h1 className="mt-2 max-w-2xl font-display text-3xl font-semibold leading-tight text-ink md:text-5xl">
        Who should stock your products next?
      </h1>
      <p className="mt-3 max-w-xl text-ink/60">
        Look up boutiques, retailers and interior designers anywhere in the US, then pitch them straight from here.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); onSearch(query); }}
        className="mt-6 flex max-w-3xl items-center gap-2 rounded-xl border-2 border-forest-700 bg-white p-1.5 shadow-soft"
      >
        <Search size={18} className="ml-3 shrink-0 text-forest-700" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. home decor boutiques in New York"
          className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-[15px] text-ink outline-none placeholder:text-ink/35"
        />
        <button disabled={loading || !query.trim()} className="btn-primary shrink-0">
          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
          {loading ? 'Searching' : 'Find buyers'}
          {!loading && <ArrowRight size={15} />}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink/50">Quick regions</span>
        {QUICK_SEARCHES.map(([label, q]) => (
          <button
            key={label}
            type="button"
            disabled={loading}
            // Pass the query explicitly so the chip never searches stale text.
            onClick={() => { setQuery(q); onSearch(q); }}
            className="rounded-md border border-sand-300 bg-white px-3 py-1.5 text-ink/70 transition hover:border-forest-600 hover:text-forest-700 disabled:opacity-60"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Results */

function Line({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink/65">
      <Icon size={14} className="shrink-0 text-clay-600" />
      <span className="min-w-0 truncate">{children}</span>
    </div>
  );
}

function LeadRow({ lead, index, onPitch }) {
  const top = lead.contact || lead.company;
  const sub = lead.contact ? lead.company : lead.category;
  const href = safeHref(lead.website);
  return (
    <li className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-sand-200 bg-white p-4 shadow-soft">
      <div className="flex min-w-0 basis-60 flex-1 items-center gap-3">
        <Avatar name={top} index={index} />
        <div className="min-w-0">
          <div className="truncate font-semibold text-ink">{top}</div>
          <div className="truncate text-sm text-forest-700">{sub}</div>
          {lead.contact && <div className="truncate text-xs text-ink/45">{lead.category}</div>}
        </div>
      </div>
      <div className="min-w-0 basis-64 flex-1 space-y-1">
        <Line icon={MapPin}>{lead.location || 'Location not available'}</Line>
        <Line icon={Mail}>{lead.email || 'Email not available'}</Line>
        <Line icon={Globe}>
          {href ? (
            <a href={href} target="_blank" rel="noreferrer noopener" className="text-forest-700 underline-offset-2 hover:underline">{prettyUrl(href)}</a>
          ) : (
            'Website not available'
          )}
        </Line>
      </div>
      <button disabled={!lead.email} onClick={() => onPitch(lead)} className="btn-primary w-full sm:w-auto">
        <Send size={14} /> {lead.email ? 'Pitch' : 'No email'}
      </button>
    </li>
  );
}

export function Results({ results, meta, onPitch, onNew }) {
  if (!results.length) return null;
  const seconds = (meta.tookMs / 1000).toFixed(1);
  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">{results.length} buyers for &ldquo;{meta.query}&rdquo;</h2>
          <p className="mt-1 text-xs text-ink/50">
            {meta.source === 'gemini' ? 'AI-suggested prospects' : 'Demo data: sample buyers, not real businesses'} · found in {seconds}s · verify details before outreach
          </p>
        </div>
        <button onClick={onNew} className="btn-ghost"><RotateCcw size={14} /> Start over</button>
      </div>
      <ul className="space-y-3">
        {results.map((r, i) => (
          <LeadRow key={r._id || i} lead={r} index={i} onPitch={onPitch} />
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------- Pitch panels */

export function Empty({ icon, title, text }) {
  return (
    <div className="rounded-xl border border-dashed border-sand-300 py-14 text-center">
      <div className="text-3xl">{icon}</div>
      <p className="mt-3 text-sm font-semibold text-ink/70">{title}</p>
      {text && <p className="mt-1 text-xs text-ink/45">{text}</p>}
    </div>
  );
}

const STAGE_CHIP = {
  pitched: ['Pitched', 'bg-sand-200 text-ink/70'],
  proposal: ['Proposal', 'bg-clay-100 text-clay-700'],
  accepted: ['Won', 'bg-forest-100 text-forest-800']
};

function PitchRow({ pitch, showStage, action }) {
  const who = pitch.buyerName || pitch.company || pitch.recipient;
  const chip = showStage ? STAGE_CHIP[pitch.stage] : null;
  return (
    <li className="flex flex-wrap items-center gap-4 rounded-xl border border-sand-200 bg-white px-4 py-3.5">
      <Avatar name={who} />
      <div className="min-w-0 flex-1 basis-56">
        <div className="truncate font-semibold text-ink">
          {who}
          {pitch.buyerName && pitch.company && <span className="font-normal text-forest-700"> · {pitch.company}</span>}
        </div>
        <div className="truncate text-sm text-ink/60">{pitch.subject}</div>
        <div className="mt-0.5 text-xs text-ink/40">{pitch.recipient} · {new Date(pitch.createdAt).toLocaleDateString()}</div>
      </div>
      {chip && <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${chip[1]}`}>{chip[0]}</span>}
      {pitch.status === 'sent' ? (
        <span className="flex items-center gap-1 rounded-md bg-forest-50 px-2.5 py-1 text-xs font-semibold text-forest-700"><Check size={12} /> Emailed</span>
      ) : (
        <span title="Saved in the app, not emailed" className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Saved only</span>
      )}
      {action}
    </li>
  );
}

export function PitchPanel({ icon: Icon, title, subtitle, pitches, showStage, actionFor, onClear, empty }) {
  return (
    <section className="pt-8 md:pt-12">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2.5 font-display text-3xl font-semibold text-ink">
            <Icon size={24} className="text-clay-600" /> {title}
          </h1>
          <p className="mt-1 text-sm text-ink/55">{subtitle}</p>
        </div>
        <button onClick={onClear} disabled={!pitches.length} className="btn-ghost hover:!border-clay-500 hover:!text-clay-700">
          <Trash2 size={13} /> Clear all
        </button>
      </div>
      {pitches.length ? (
        <ul className="space-y-3">
          {pitches.map((p) => (
            <PitchRow key={p._id} pitch={p} showStage={showStage} action={actionFor?.(p)} />
          ))}
        </ul>
      ) : (
        <Empty {...empty} />
      )}
    </section>
  );
}

export const ActionButton = ({ children, onClick, tone = 'forest' }) => (
  <button
    onClick={onClick}
    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
      tone === 'green' ? 'bg-forest-700 text-white hover:bg-forest-800' : 'bg-sand-100 text-forest-800 hover:bg-forest-100'
    }`}
  >
    {children}
  </button>
);
