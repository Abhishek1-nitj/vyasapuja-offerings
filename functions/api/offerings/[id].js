import { currentUser } from '../../_lib/auth.js';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

const countWords = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;
const digits = (s) => (s || '').replace(/\D/g, '');
const sanitizeHtml = (html) => String(html || '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<\/?(script|style|iframe|object|embed|link|meta)[^>]*>/gi, '')
  .replace(/\s+on\w+="[^"]*"/gi, '')
  .replace(/\s+on\w+='[^']*'/gi, '')
  .replace(/\s+(style|class|id)="[^"]*"/gi, '')
  .replace(/\s+(style|class|id)='[^']*'/gi, '')
  .replace(/<(\/?)(?!div\b|p\b|br\b|strong\b|b\b|em\b|i\b|u\b|ul\b|ol\b|li\b|blockquote\b)[^>]+>/gi, '')
  .replace(/<(\/?)(div|p|br|strong|b|em|i|u|ul|ol|li|blockquote)(?:\s[^>]*)?>/gi, '<$1$2>');

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
    owner = await currentUser(request, env);
  } catch (e) {
    return json({ error: e.message }, 401);
  }
  const row = await env.DB.prepare(
    `SELECT id, offering_number, devotee_name, center, email, phone, content, content_html, created_at, updated_at, word_count, owner_google_sub
     FROM offerings WHERE id = ?`
  ).bind(params.id).first();
  if (!row) return json({ error: 'Offering not found.' }, 404);
  if (!owns(row, owner)) return json({ error: 'Only the Google account that submitted this offering can edit it.' }, 403);
  return json({
    offering: {
      id: row.id, offeringNumber: row.offering_number, devoteeName: row.devotee_name, center: row.center,
      email: row.email, phone: row.phone, content: row.content, contentHtml: row.content_html || '', createdAt: row.created_at,
      updatedAt: row.updated_at, wordCount: row.word_count
    }
  });
}

export async function onRequestPut({ request, env, params }) {
  const id = params.id;
  let owner;
  try {
    owner = await currentUser(request, env);
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
     SET devotee_name = ?, center = ?, email = ?, phone = ?, content = ?, content_html = ?, word_count = ?, updated_at = ?
     WHERE id = ?`
  ).bind(
    body.devoteeName.trim(), body.center.trim(), body.email.trim().toLowerCase(),
    `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`,
    body.content.trim(), sanitizeHtml(body.contentHtml || body.content), countWords(body.content), now, id
  ).run();

  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }) {
  let owner;
  try {
    owner = await currentUser(request, env);
  } catch (e) {
    return json({ error: e.message }, 401);
  }

  const existing = await env.DB.prepare('SELECT owner_google_sub FROM offerings WHERE id = ?').bind(params.id).first();
  if (!existing) return json({ error: 'Offering not found.' }, 404);
  if (!owns(existing, owner)) return json({ error: 'Only the Google account that submitted this offering can delete it.' }, 403);

  await env.DB.prepare('DELETE FROM offerings WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
