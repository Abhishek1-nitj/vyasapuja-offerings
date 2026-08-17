const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

const countWords = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;
const digits = (s) => (s || '').replace(/\D/g, '');

async function verifyGoogle(request, env) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) throw new Error('Please sign in with Google.');
  if (!env.GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID === 'REPLACE_WITH_GOOGLE_CLIENT_ID') {
    throw new Error('Google login is not configured yet.');
  }
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
  const profile = await res.json().catch(() => ({}));
  if (!res.ok || profile.aud !== env.GOOGLE_CLIENT_ID || profile.email_verified !== 'true') {
    throw new Error('Google sign-in could not be verified.');
  }
  return { sub: profile.sub, email: String(profile.email || '').toLowerCase() };
}

function validate(body) {
  const name = (body.devoteeName || '').trim();
  const center = (body.center || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const phoneDigits = digits(body.phone);
  const content = (body.content || '').trim();
  if (!name) return 'Please enter your name.';
  if (!center) return 'Please select your center.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email.';
  if (phoneDigits.length !== 10) return 'Please enter a valid 10-digit phone number.';
  if (content.length < 20) return 'Please write your offering text.';
  return null;
}

function owns(row, owner) {
  return row.owner_google_sub && row.owner_google_sub === owner.sub;
}

export async function onRequestGet({ request, env, params }) {
  let owner;
  try {
    owner = await verifyGoogle(request, env);
  } catch (e) {
    return json({ error: e.message }, 401);
  }
  const row = await env.DB.prepare(
    `SELECT id, offering_number, devotee_name, center, email, phone, content, created_at, updated_at, word_count, owner_google_sub
     FROM offerings WHERE id = ?`
  ).bind(params.id).first();
  if (!row) return json({ error: 'Offering not found.' }, 404);
  if (!owns(row, owner)) return json({ error: 'Only the Google account that submitted this offering can edit it.' }, 403);
  return json({
    offering: {
      id: row.id, offeringNumber: row.offering_number, devoteeName: row.devotee_name, center: row.center,
      email: row.email, phone: row.phone, content: row.content, createdAt: row.created_at,
      updatedAt: row.updated_at, wordCount: row.word_count
    }
  });
}

export async function onRequestPut({ request, env, params }) {
  const id = params.id;
  let owner;
  try {
    owner = await verifyGoogle(request, env);
  } catch (e) {
    return json({ error: e.message }, 401);
  }
  const body = await request.json().catch(() => ({}));
  const error = validate(body);
  if (error) return json({ error }, 400);

  const existing = await env.DB.prepare('SELECT owner_google_sub FROM offerings WHERE id = ?').bind(id).first();
  if (!existing) return json({ error: 'Offering not found.' }, 404);
  if (!owns(existing, owner)) return json({ error: 'Only the Google account that submitted this offering can edit it.' }, 403);

  const phoneDigits = digits(body.phone);
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE offerings
     SET devotee_name = ?, center = ?, email = ?, phone = ?, content = ?, word_count = ?, updated_at = ?
     WHERE id = ?`
  ).bind(
    body.devoteeName.trim(), body.center.trim(), body.email.trim().toLowerCase(),
    `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`,
    body.content.trim(), countWords(body.content), now, id
  ).run();

  return json({ ok: true });
}
