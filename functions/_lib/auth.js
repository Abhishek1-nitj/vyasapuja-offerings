const SESSION_DAYS = 21;

const cookieValue = (request, name) => {
  const cookie = request.headers.get('cookie') || '';
  return cookie.split(';').map((p) => p.trim()).find((p) => p.startsWith(`${name}=`))?.slice(name.length + 1) || '';
};

const hashToken = async (token) => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const sessionCookie = (token, maxAge = SESSION_DAYS * 86400) =>
  `offering_session=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;

export const clearSessionCookie = () =>
  'offering_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax';

export async function verifyGoogleToken(request, env) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) throw new Error('Please sign in with Google.');
  if (!env.GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID === 'REPLACE_WITH_GOOGLE_CLIENT_ID') throw new Error('Google login is not configured yet.');
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
  const profile = await res.json().catch(() => ({}));
  if (!res.ok || profile.aud !== env.GOOGLE_CLIENT_ID || profile.email_verified !== 'true') throw new Error('Google sign-in could not be verified.');
  return { sub: profile.sub, email: String(profile.email || '').toLowerCase(), name: profile.name || '', picture: profile.picture || '' };
}

export async function createSession(owner, env) {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = await hashToken(token);
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86400 * 1000).toISOString();
  await env.DB.prepare(
    `INSERT INTO auth_sessions (token_hash, google_sub, email, name, picture, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(tokenHash, owner.sub, owner.email, owner.name || '', owner.picture || '', expires, now.toISOString()).run();
  return { token, expires };
}

export async function currentUser(request, env) {
  const token = cookieValue(request, 'offering_session');
  if (token) {
    const row = await env.DB.prepare(
      `SELECT google_sub, email, name, picture, expires_at FROM auth_sessions WHERE token_hash = ? AND datetime(expires_at) > datetime('now')`
    ).bind(await hashToken(token)).first();
    if (row) return { sub: row.google_sub, email: row.email, name: row.name || '', picture: row.picture || '' };
  }
  return verifyGoogleToken(request, env);
}
