exports.handler = async function(event, context) {
  try {
    const url = new URL(event.rawUrl || `https://example.com${event.path}${event.queryStringParameters ? '?' + new URLSearchParams(event.queryStringParameters).toString() : ''}`);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code) return { statusCode: 400, body: JSON.stringify({ error: 'missing code' }) };

    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;
    const redirectUri = process.env.NAVER_REDIRECT_URI;
    if (!clientId || !clientSecret || !redirectUri) {
      return { statusCode: 500, body: JSON.stringify({ error: 'NAVER env missing' }) };
    }

    const tokenUrl = `https://nid.naver.com/oauth2.0/token`;
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state,
      redirect_uri: redirectUri
    });

    const resp = await fetch(`${tokenUrl}?${params.toString()}`, { method: 'GET' });
    const token = await resp.json();
    if (!resp.ok) {
      return { statusCode: resp.status, body: JSON.stringify(token) };
    }

    // 토큰을 그대로 브라우저로 전달하지 않고, HttpOnly 쿠키에 저장하는 방식 권장
    // Netlify Functions에서 직접 Set-Cookie를 설정
    const cookies = [];
    if (token.access_token) cookies.push(`naver_access_token=${encodeURIComponent(token.access_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${token.expires_in || 3600}`);
    if (token.refresh_token) cookies.push(`naver_refresh_token=${encodeURIComponent(token.refresh_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);

    return {
      statusCode: 302,
      headers: {
        'Set-Cookie': cookies,
        Location: '/'
      },
      body: ''
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};


