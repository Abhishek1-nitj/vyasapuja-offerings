const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

const digits = (s) => (s || '').replace(/\D/g, '');
const maskEmail = (email) => {
  const [name, domain] = String(email || '').split('@');
  if (!domain) return '';
  return `${name.slice(0, 2)}***@${domain}`;
};
const maskPhone = (phone) => {
  const d = digits(phone);
  return d ? `******${d.slice(-4)}` : '';
};

export async function onRequestPost({ request, env }) {
  const { query = '' } = await request.json().catch(() => ({}));
  const q = String(query).trim().toLowerCase();
  if (!q) return json({ results: [] });
  const qDigits = digits(q);
  const like = `%${q}%`;
  const phoneLike = qDigits.length >= 3 ? `%${qDigits}%` : '__NO_PHONE_MATCH__';
  const { results } = await env.DB.prepare(
    `SELECT id, offering_number, devotee_name, center, email, phone, content, content_html, created_at, updated_at, word_count
     FROM offerings
     WHERE lower(devotee_name) LIKE ? OR lower(email) LIKE ? OR replace(replace(replace(phone, ' ', ''), '+', ''), '-', '') LIKE ?
     ORDER BY datetime(created_at) DESC LIMIT 20`
  ).bind(like, like, phoneLike).all();
  return json({
    results: results.map((r) => ({
      id: r.id,
      offeringNumber: r.offering_number,
      devoteeName: r.devotee_name,
      center: r.center,
      emailMasked: maskEmail(r.email),
      phoneMasked: maskPhone(r.phone),
      content: r.content,
      contentHtml: r.content_html || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      wordCount: r.word_count
    }))
  });
}
