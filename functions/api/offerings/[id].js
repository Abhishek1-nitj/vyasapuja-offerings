const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

const countWords = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;
const digits = (s) => (s || '').replace(/\D/g, '');

async function hashCode(id, code) {
  const bytes = new TextEncoder().encode(`${id}:${code}`);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function validate(body) {
  const name = (body.devoteeName || '').trim();
  const center = (body.center || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const phoneDigits = digits(body.phone);
  const content = (body.content || '').trim();
  const editCode = String(body.editCode || '').trim();
  if (!editCode) return 'Please enter your edit code.';
  if (!name) return 'Please enter your name.';
  if (!center) return 'Please select your center.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email.';
  if (phoneDigits.length !== 10) return 'Please enter a valid 10-digit phone number.';
  if (content.length < 20) return 'Please write your offering text.';
  return null;
}

export async function onRequestPut({ request, env, params }) {
  const id = params.id;
  const body = await request.json().catch(() => ({}));
  const error = validate(body);
  if (error) return json({ error }, 400);

  const existing = await env.DB.prepare('SELECT edit_code_hash FROM offerings WHERE id = ?').bind(id).first();
  if (!existing) return json({ error: 'Offering not found.' }, 404);
  if (!existing.edit_code_hash) return json({ error: 'This older offering does not have an edit code.' }, 403);
  if (await hashCode(id, String(body.editCode).trim()) !== existing.edit_code_hash) {
    return json({ error: 'Incorrect edit code.' }, 403);
  }

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
