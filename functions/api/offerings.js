const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });

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
  return { sub: profile.sub, email: String(profile.email || '').toLowerCase(), name: profile.name || '' };
}

function publicOffering(row) {
  return {
    id: row.id,
    offeringNumber: row.offering_number,
    devoteeName: row.devotee_name,
    center: row.center,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    wordCount: row.word_count
  };
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

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT id, offering_number, devotee_name, center, content, created_at, updated_at, word_count
     FROM offerings ORDER BY datetime(created_at) DESC`
  ).all();
  return json({ offerings: results.map(publicOffering) });
}

export async function onRequestPost({ request, env }) {
  let owner;
  try {
    owner = await verifyGoogle(request, env);
  } catch (e) {
    return json({ error: e.message }, 401);
  }
  const body = await request.json().catch(() => ({}));
  const error = validate(body);
  if (error) return json({ error }, 400);

  const max = await env.DB.prepare('SELECT COALESCE(MAX(offering_number), 100) AS n FROM offerings').first();
  const id = `off-${crypto.randomUUID()}`;
  const phoneDigits = digits(body.phone);
  const now = new Date().toISOString();
  const offeringNumber = Number(max.n) + 1;
  const row = {
    id,
    offeringNumber,
    devoteeName: body.devoteeName.trim(),
    center: body.center.trim(),
    email: body.email.trim().toLowerCase(),
    phone: `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`,
    content: body.content.trim(),
    wordCount: countWords(body.content),
    createdAt: now,
    updatedAt: now
  };

  await env.DB.prepare(
    `INSERT INTO offerings
     (id, offering_number, devotee_name, center, email, phone, content, word_count, owner_google_sub, owner_google_email, owner_google_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(row.id, row.offeringNumber, row.devoteeName, row.center, row.email, row.phone, row.content, row.wordCount, owner.sub, owner.email, owner.name, row.createdAt, row.updatedAt).run();

  return json({ offering: publicOffering({
    id: row.id, offering_number: row.offeringNumber, devotee_name: row.devoteeName, center: row.center,
    content: row.content, created_at: row.createdAt, updated_at: row.updatedAt, word_count: row.wordCount
  }) }, 201);
}
