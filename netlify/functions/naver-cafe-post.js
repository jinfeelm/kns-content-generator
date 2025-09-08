exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const { cafeId, menuId, title, content } = JSON.parse(event.body || '{}');
    if (!cafeId || !menuId || !title || !content) {
      return { statusCode: 400, body: JSON.stringify({ error: 'missing params' }) };
    }

    // 쿠키에서 access token 읽기 (naver-auth-callback이 심은 값)
    const cookie = event.headers.cookie || '';
    const accessToken = (cookie.match(/naver_access_token=([^;]+)/) || [])[1];
    if (!accessToken) {
      return { statusCode: 401, body: JSON.stringify({ error: 'unauthorized' }) };
    }

    // 네이버 카페 글쓰기 API 호출
    // 참고: 실제 엔드포인트/필드명은 네이버 공식 문서에 따라 조정 필요
    const endpoint = `https://apis.naver.com/cafe-web/cafe-articleapi/v2/cafes/${encodeURIComponent(cafeId)}/menus/${encodeURIComponent(menuId)}/articles`; 
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${decodeURIComponent(accessToken)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, content })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return { statusCode: resp.status, body: JSON.stringify(data) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, data })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};


