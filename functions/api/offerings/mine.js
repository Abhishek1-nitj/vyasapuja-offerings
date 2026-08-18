import { currentUser } from '../../_lib/auth.js';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export async function onRequestGet({ request, env }) {
  let owner;
  try {
    owner = await currentUser(request, env);
  } catch (e) {
    return json({ error: e.message }, 401);
  }
  const { results } = await env.DB.prepare(
    `SELECT id, offering_number, devotee_name, center, email, phone, content, content_html, created_at, updated_at, word_count
     FROM offerings WHERE owner_google_sub = ? ORDER BY datetime(created_at) DESC`
  ).bind(owner.sub).all();
  return json({
    offerings: results.map((r) => ({
      id: r.id,
      offeringNumber: r.offering_number,
      devoteeName: r.devotee_name,
      center: r.center,
      email: r.email,
      phone: r.phone,
      content: r.content,
      contentHtml: r.content_html || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      wordCount: r.word_count
    }))
  });
}
