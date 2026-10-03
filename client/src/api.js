const TOKEN_KEY = 'decor_token';
const USER_KEY = 'decor_user';

export const session = {
  token: () => localStorage.getItem(TOKEN_KEY),
  user() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  save(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

let onExpired = () => {};
export const setExpiredHandler = (fn) => { onExpired = fn; };

export async function api(path, { method = 'GET', body } = {}) {
  const token = session.token();
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) {
    // Expired / invalid session: drop it so the user lands on the sign-in page instead of seeing silent failures.
    session.clear();
    onExpired();
  }
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}
