import { createSession, currentUser, sessionCookie, verifyGoogleToken } from '../_lib/auth.js';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });

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

function publicOffering(row) {
  return {
    id: row.id,
    offeringNumber: row.offering_number,
    devoteeName: row.devotee_name,
    center: row.center,
    content: row.content,
    contentHtml: row.content_html || '',
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
    `SELECT id, offering_number, devotee_name, center, content, content_html, created_at, updated_at, word_count
     FROM offerings ORDER BY datetime(created_at) DESC`
  ).all();
  return json({ offerings: results.map(publicOffering) });
}

export async function onRequestPost({ request, env }) {
  let setCookie = '';
  let owner;
  try {
    try {
      owner = await currentUser(request, env);
    } catch {
      owner = await verifyGoogleToken(request, env);
      const session = await createSession(owner, env);
      setCookie = sessionCookie(session.token);
    }
  } catch (e) {
    return json({ error: e.message }, 401);
  }
  const body = await request.json().catch(() => ({}));
  const error = validate(body);
  if (error) return json({ error }, 400);

  const max = await env.DB.prepare('SELECT COALESCE(MAX(offering_number), 0) AS n FROM offerings').first();
  const id = `off-${crypto.randomUUID()}`;
  const phoneDigits = digits(body.phone);
  const now = new Date().toISOString();
  const contentHtml = sanitizeHtml(body.contentHtml || body.content);
  const offeringNumber = Number(max.n) + 1;
  const row = {
    id,
    offeringNumber,
    devoteeName: body.devoteeName.trim(),
    center: body.center.trim(),
    email: body.email.trim().toLowerCase(),
    phone: `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`,
    content: body.content.trim(),
    contentHtml,
    wordCount: countWords(body.content),
    createdAt: now,
    updatedAt: now
  };

  await env.DB.prepare(
    `INSERT INTO offerings
     (id, offering_number, devotee_name, center, email, phone, content, content_html, word_count, owner_google_sub, owner_google_email, owner_google_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(row.id, row.offeringNumber, row.devoteeName, row.center, row.email, row.phone, row.content, row.contentHtml, row.wordCount, owner.sub, owner.email, owner.name, row.createdAt, row.updatedAt).run();

  const response = json({ offering: publicOffering({
    id: row.id, offering_number: row.offeringNumber, devotee_name: row.devoteeName, center: row.center,
    content: row.content, content_html: row.contentHtml, created_at: row.createdAt, updated_at: row.updatedAt, word_count: row.wordCount
  }) }, 201);
  if (setCookie) response.headers.set('set-cookie', setCookie);
  return response;
}
