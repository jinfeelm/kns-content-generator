exports.handler = async function(event, context) {
  try {
    const clientId = process.env.NAVER_CLIENT_ID;
    const redirectUri = process.env.NAVER_REDIRECT_URI; // 예: https://<site>/.netlify/functions/naver-auth-callback
    const scope = process.env.NAVER_SCOPE || ""; // 필요 시 스페이스로 구분

    if (!clientId || !redirectUri) {
      return { statusCode: 500, body: JSON.stringify({ error: "NAVER_CLIENT_ID 또는 NAVER_REDIRECT_URI 미설정" }) };
    }

    const state = Math.random().toString(36).slice(2);
    const query = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      state
    });

    if (scope) query.append("scope", scope);

    const authorizeUrl = `https://nid.naver.com/oauth2.0/authorize?${query.toString()}`;
    return {
      statusCode: 200,
      body: JSON.stringify({ url: authorizeUrl, state })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};



