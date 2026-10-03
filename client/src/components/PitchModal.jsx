import { useEffect, useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { api } from '../api.js';

export default function PitchModal({ lead, user, emailEnabled, close, onSent }) {
  const buyer = lead.contact || lead.company;
  const [subject, setSubject] = useState(`Partnership opportunity with ${lead.company}`);
  const [message, setMessage] = useState(
    `Hi ${lead.contact ? lead.contact.split(' ')[0] : 'there'},\n\n` +
      `I came across ${lead.company} and was impressed by your home decor focus. We supply premium, trend-forward decor products that would complement your current catalog.\n\n` +
      `I'd love to explore a partnership: wholesale, dropshipping, or custom sourcing. Would you be open to a quick call this week?\n\n` +
      `Best regards,\n${user.name}`
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  const send = async () => {
    setBusy(true);
    setError('');
    try {
      const d = await api('/pitches', {
        method: 'POST',
        body: { leadId: lead._id, recipient: lead.email, subject, message, buyerName: lead.contact, company: lead.company }
      });
      onSent(d.status, buyer);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-forest-900/50 p-4 backdrop-blur-sm" onClick={close}>
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-clay-600">Send pitch email</div>
            <h2 className="mt-1 font-display text-xl font-semibold text-ink">{buyer}</h2>
            {lead.contact && <div className="text-xs text-ink/55">{lead.company}</div>}
          </div>
          <button onClick={close} aria-label="Close" className="text-ink/45 hover:text-ink"><X size={20} /></button>
        </div>

        <label className="mt-5 block text-xs font-semibold text-ink/55">To</label>
        <input value={lead.email} readOnly className="field mt-1 bg-sand-100" />
        <label className="mt-3 block text-xs font-semibold text-ink/55">Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} className="field mt-1" />
        <label className="mt-3 block text-xs font-semibold text-ink/55">Message</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={9} className="field mt-1 resize-none" />

        {error && <p className="mt-3 rounded-lg bg-clay-50 px-3 py-2 text-xs text-clay-700">{error}</p>}

        <button
          disabled={busy || !subject.trim() || !message.trim()}
          onClick={send}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-forest-700 py-3 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:opacity-60"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          {busy ? 'Sending…' : emailEnabled ? 'Send Email' : 'Save Pitch'}
        </button>
        <p className="mt-2 text-center text-[11px] text-ink/45">
          {emailEnabled
            ? 'Replies will go to your account email. Demo buyers are saved, never emailed.'
            : 'Email sending is not configured (no Resend key), so this pitch will be saved only.'}
        </p>
      </div>
    </div>
  );
}
