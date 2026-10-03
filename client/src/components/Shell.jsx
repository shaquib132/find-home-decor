import { Compass, Send, FileText, Handshake, LogOut } from 'lucide-react';
import { Logo } from './ui.jsx';

const NAV = [
  ['search', 'Discover', Compass],
  ['sent', 'Outbox', Send],
  ['proposals', 'Proposals', FileText],
  ['accepted', 'Won deals', Handshake]
];

export default function Shell({ user, onLogout, tab, setTab, counts, children }) {
  return (
    <div className="min-h-screen bg-sand-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-forest-800 p-5 text-forest-100 md:flex">
        <Logo light />
        <nav className="mt-10 space-y-1">
          {NAV.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                tab === id ? 'bg-forest-700 text-white' : 'text-forest-200 hover:bg-forest-700/60 hover:text-white'
              }`}
            >
              <Icon size={17} />
              <span className="flex-1 text-left">{label}</span>
              {counts[id] > 0 && <span className="rounded bg-clay-500 px-1.5 text-[11px] font-semibold text-white">{counts[id]}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-forest-700 pt-4">
          <div className="truncate text-sm font-medium text-white">{user.name}</div>
          <div className="truncate text-xs text-forest-200">{user.email}</div>
          <button onClick={onLogout} className="mt-3 flex items-center gap-2 text-xs text-forest-200 hover:text-white">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-sand-200 bg-sand-50/95 px-4 backdrop-blur md:hidden">
        <Logo />
        <button onClick={onLogout} aria-label="Sign out" className="text-ink/60"><LogOut size={18} /></button>
      </header>

      <div className="px-4 pb-24 md:pl-72 md:pr-8 md:pb-10">{children}</div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-sand-200 bg-sand-50 md:hidden">
        {NAV.map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${tab === id ? 'text-forest-700' : 'text-ink/50'}`}
          >
            <Icon size={19} />
            {label}
            {counts[id] > 0 && <span className="absolute right-[22%] top-1 rounded-full bg-clay-500 px-1.5 text-[9px] font-semibold text-white">{counts[id]}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
