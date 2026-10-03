import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Send, FileText, Handshake } from 'lucide-react';
import { api, session, setExpiredHandler } from './api.js';
import { Toast } from './components/ui.jsx';
import Shell from './components/Shell.jsx';
import Login from './components/Login.jsx';
import PitchModal from './components/PitchModal.jsx';
import { Discover, Results, PitchPanel, ActionButton } from './components/Dashboard.jsx';

export default function App() {
  const [user, setUser] = useState(() => session.user());
  const [config, setConfig] = useState({ googleClientId: '', resend: false, gemini: false });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState({ query: '', source: 'demo', tookMs: 0 });
  const [tab, setTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [pitches, setPitches] = useState([]);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const inputRef = useRef(null);

  const notify = (text) => setToast(text);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    api('/config').then(setConfig).catch(() => {});
  }, []);

  // If the server says the session expired, go back to the sign-in page.
  useEffect(() => {
    setExpiredHandler(() => {
      setUser(null);
      setResults([]);
      setPitches([]);
    });
  }, []);

  const loadPitches = useCallback(async () => {
    try {
      setPitches((await api('/pitches')).pitches || []);
    } catch {
      /* a 401 is handled globally; other errors just leave the list as is */
    }
  }, []);

  useEffect(() => {
    if (user) loadPitches();
  }, [user, loadPitches]);

  const logout = () => {
    session.clear();
    setUser(null);
    setResults([]);
    setPitches([]);
    setQuery('');
    setTab('search');
  };

  const doSearch = async (q) => {
    const text = (q ?? query).trim();
    if (!text || loading) return;
    setQuery(text);
    setTab('search'); // searching from another tab must bring the results into view (it didn't before)
    setLoading(true);
    try {
      const d = await api('/leads/search', { method: 'POST', body: { query: text } });
      setResults(d.results || []);
      setMeta({ query: text, source: d.source, tookMs: d.tookMs });
      notify(`Found ${d.results?.length ?? 0} buyers`);
    } catch (e) {
      notify(e.message);
    } finally {
      setLoading(false);
    }
  };

  const newSearch = () => {
    setResults([]);
    setQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => inputRef.current?.focus(), 250);
  };

  const moveStage = async (pitch, stage, message) => {
    try {
      const { pitch: updated } = await api(`/pitches/${pitch._id}/stage`, { method: 'PATCH', body: { stage } });
      setPitches((list) => list.map((p) => (p._id === updated._id ? updated : p)));
      notify(message);
    } catch (e) {
      notify(e.message);
    }
  };

  const clear = async (stage, question) => {
    if (!window.confirm(question)) return;
    try {
      await api(`/pitches?stage=${stage}`, { method: 'DELETE' });
      await loadPitches();
      notify('Cleared');
    } catch (e) {
      notify(e.message);
    }
  };

  const proposals = useMemo(() => pitches.filter((p) => p.stage === 'proposal'), [pitches]);
  const accepted = useMemo(() => pitches.filter((p) => p.stage === 'accepted'), [pitches]);
  const counts = { search: 0, sent: pitches.length, proposals: proposals.length, accepted: accepted.length };

  if (!user) {
    return <Login googleClientId={config.googleClientId} onUser={setUser} />;
  }

  return (
    <>
      <Shell user={user} onLogout={logout} tab={tab} setTab={setTab} counts={counts}>
        <main className="mx-auto max-w-4xl">
          {tab === 'search' && (
            <>
              <Discover query={query} setQuery={setQuery} onSearch={doSearch} loading={loading} inputRef={inputRef} />
              <Results results={results} meta={meta} onPitch={setModal} onNew={newSearch} />
            </>
          )}

          {tab === 'sent' && (
            <PitchPanel
              icon={Send}
              title="Outbox"
              subtitle="Every pitch you've sent or saved"
              pitches={pitches}
              showStage
              actionFor={(p) =>
                p.stage === 'pitched' && (
                  <ActionButton onClick={() => moveStage(p, 'proposal', 'Moved to Proposals')}>Move to Proposals</ActionButton>
                )
              }
              onClear={() => clear('all', 'Clear all pitches? This also removes their proposals and won deals.')}
              empty={{ icon: '💌', title: 'Nothing sent yet', text: 'Find a buyer and send your first pitch.' }}
            />
          )}

          {tab === 'proposals' && (
            <PitchPanel
              icon={FileText}
              title="Proposals"
              subtitle="Buyers who asked to see a proposal"
              pitches={proposals}
              actionFor={(p) => (
                <ActionButton tone="green" onClick={() => moveStage(p, 'accepted', 'Deal won 🎉')}>Mark as won</ActionButton>
              )}
              onClear={() => clear('proposal', 'Clear all proposals?')}
              empty={{ icon: '📄', title: 'No proposals yet', text: 'Move a pitch here when a buyer replies with interest.' }}
            />
          )}

          {tab === 'accepted' && (
            <PitchPanel
              icon={Handshake}
              title="Won deals"
              subtitle="Buyers who agreed to partner with you"
              pitches={accepted}
              actionFor={(p) => (
                <ActionButton onClick={() => moveStage(p, 'proposal', 'Moved back to Proposals')}>Undo</ActionButton>
              )}
              onClear={() => clear('accepted', 'Clear all won deals?')}
              empty={{ icon: '🤝', title: 'No won deals yet', text: 'Mark a proposal as won when a buyer says yes.' }}
            />
          )}
        </main>
      </Shell>

      {modal && (
        <PitchModal
          lead={modal}
          user={user}
          emailEnabled={config.resend}
          close={() => setModal(null)}
          onSent={(status, buyer) => {
            setModal(null);
            notify(status === 'sent' ? `Pitch emailed to ${buyer}` : `Pitch saved for ${buyer} (not emailed)`);
            loadPitches();
          }}
        />
      )}
      <Toast text={toast} />
    </>
  );
}
