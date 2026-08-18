import { clearSessionCookie, createSession, currentUser, sessionCookie, verifyGoogleToken } from '../../_lib/auth.js';

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } });

export async function onRequestGet({ request, env }) {
  try {
    const user = await currentUser(request, env);
    return json({ user: { email: user.email, name: user.name, picture: user.picture } });
  } catch {
    return json({ user: null }, 401);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const owner = await verifyGoogleToken(request, env);
    const session = await createSession(owner, env);
    return json({ user: { email: owner.email, name: owner.name, picture: owner.picture } }, 200, { 'set-cookie': sessionCookie(session.token) });
  } catch (e) {
    return json({ error: e.message }, 401);
  }
}

export async function onRequestDelete() {
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
}
