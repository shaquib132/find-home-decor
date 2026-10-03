// One place that decides the JWT secret, so signing and verifying can never disagree
// (the original signed with a fallback but verified without one, which broke every request).
export function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return 'dev-only-secret-change-me';
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const clip = (value, max) => String(value ?? '').trim().slice(0, max);
