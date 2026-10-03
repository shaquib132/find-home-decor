import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jwtSecret, EMAIL_RE, clip } from '../config.js';
import { findUserByEmail, createUser } from '../store.js';

const router = Router();

const sessionFor = (u) => ({
  token: jwt.sign({ id: String(u._id), email: u.email, name: u.name }, jwtSecret(), { expiresIn: '7d' }),
  user: { name: u.name, email: u.email }
});

router.post('/register', async (req, res) => {
  const name = clip(req.body?.name, 80);
  const email = clip(req.body?.email, 200).toLowerCase();
  const password = String(req.body?.password ?? '');

  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Enter a valid email address' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
  if (await findUserByEmail(email)) return res.status(409).json({ message: 'Email already registered' });

  try {
    const user = await createUser({ name, email, passwordHash: await bcrypt.hash(password, 10) });
    res.json(sessionFor(user));
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ message: 'Email already registered' });
    throw e;
  }
});

router.post('/login', async (req, res) => {
  const email = clip(req.body?.email, 200).toLowerCase();
  const password = String(req.body?.password ?? '');
  const user = email ? await findUserByEmail(email) : null;
  // Google-only accounts have no passwordHash, so guard before bcrypt.compare.
  const ok = user?.passwordHash && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' });
  res.json(sessionFor(user));
});

// "Continue with Google": the browser sends the Google ID token, we verify it with Google.
router.post('/google', async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(501).json({ message: 'Google sign-in is not configured on this server' });

  const credential = String(req.body?.credential ?? '');
  if (!credential) return res.status(400).json({ message: 'Missing Google credential' });

  const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  if (!r.ok) return res.status(401).json({ message: 'Google sign-in failed' });
  const info = await r.json();
  const verified = info.email_verified === true || info.email_verified === 'true';
  if (info.aud !== clientId || !info.email || !verified) {
    return res.status(401).json({ message: 'Google sign-in failed' });
  }

  const email = String(info.email).toLowerCase();
  const user =
    (await findUserByEmail(email)) ||
    (await createUser({ name: clip(info.name, 80) || email.split('@')[0], email, googleId: info.sub }));
  res.json(sessionFor(user));
});

export default router;
