import { Router } from 'express';
import { Resend } from 'resend';
import { auth } from '../middleware/auth.js';
import { EMAIL_RE, clip } from '../config.js';
import { listPitches, createPitch, setStage, clearPitches, countPitchesSince } from '../store.js';

const router = Router();
router.use(auth);

const STAGES = ['pitched', 'proposal', 'accepted'];
const DAILY_LIMIT = () => Number(process.env.DAILY_PITCH_LIMIT) || 30;
const escapeHtml = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

router.get('/', async (req, res) => {
  res.json({ pitches: await listPitches(req.user.id) });
});

router.post('/', async (req, res) => {
  const b = req.body || {};
  const recipient = clip(b.recipient, 200).toLowerCase();
  const subject = clip(b.subject, 200);
  const message = clip(b.message, 5000);

  if (!recipient || !subject || !message) {
    return res.status(400).json({ message: 'Recipient, subject and message are required' });
  }
  if (!EMAIL_RE.test(recipient)) return res.status(400).json({ message: 'Recipient email is not valid' });

  const sentToday = await countPitchesSince(req.user.id, new Date(Date.now() - 24 * 60 * 60 * 1000));
  if (sentToday >= DAILY_LIMIT()) {
    return res.status(429).json({ message: `Daily pitch limit reached (${DAILY_LIMIT()}). Try again tomorrow.` });
  }

  // Demo buyers use the reserved ".example" domain: never email them, just save the pitch.
  const isDemoAddress = /\.example$/i.test(recipient);
  let status = 'saved';

  if (process.env.RESEND_API_KEY && !isDemoAddress) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    // The Resend SDK RETURNS { data, error } instead of throwing, so the error must be checked.
    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: [recipient],
      replyTo: req.user.email, // replies go to the person who sent the pitch
      subject,
      text: message,
      html: `<div style="font-family:Arial,sans-serif;white-space:pre-wrap">${escapeHtml(message)}</div>`
    });
    if (error) return res.status(502).json({ message: `Email provider error: ${error.message || 'could not send'}` });
    status = 'sent';
  }

  const pitch = await createPitch(req.user.id, {
    leadId: b.leadId,
    recipient,
    subject,
    message,
    buyerName: clip(b.buyerName, 120),
    company: clip(b.company, 120),
    status
  });
  res.json({ pitch, status });
});

router.patch('/:id/stage', async (req, res) => {
  const stage = String(req.body?.stage ?? '');
  if (!STAGES.includes(stage)) return res.status(400).json({ message: 'Invalid stage' });
  const pitch = await setStage(req.user.id, req.params.id, stage);
  if (!pitch) return res.status(404).json({ message: 'Pitch not found' });
  res.json({ pitch });
});

// DELETE /api/pitches?stage=all|proposal|accepted
router.delete('/', async (req, res) => {
  const stage = String(req.query.stage ?? 'all');
  if (!['all', 'proposal', 'accepted'].includes(stage)) return res.status(400).json({ message: 'Invalid stage' });
  res.json({ deleted: await clearPitches(req.user.id, stage) });
});

export default router;
