const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

async function verifyGoogle(request, env) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) throw new Error('Please sign in with Google.');
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
  const profile = await res.json().catch(() => ({}));
  if (!res.ok || profile.aud !== env.GOOGLE_CLIENT_ID || profile.email_verified !== 'true') {
    throw new Error('Google sign-in could not be verified.');
  }
  return { sub: profile.sub };
}

export async function onRequestGet({ request, env }) {
  let owner;
  try {
    owner = await verifyGoogle(request, env);
  } catch (e) {
    return json({ error: e.message }, 401);
  }
  const { results } = await env.DB.prepare(
    `SELECT id, offering_number, devotee_name, center, email, phone, content, created_at, updated_at, word_count
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
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      wordCount: r.word_count
    }))
  });
}
