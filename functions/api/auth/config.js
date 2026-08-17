const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export function onRequestGet({ env }) {
  return json({ googleClientId: env.GOOGLE_CLIENT_ID || '' });
}
