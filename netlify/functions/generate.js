const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Netlify는 스트리밍 응답을 위해 "ReadableStream"을 반환하는 것을 지원합니다.
// 함수 시그니처를 약간 조정하여 이를 활용합니다.
exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    const requestBody = event.body ? JSON.parse(event.body) : {};
    const apiKey = process.env.GEMINI_API_KEY;
    // ✅ 요청에 따라 최신 2.5 flash 모델을 사용하도록 수정했습니다.
    const modelName = 'gemini-2.5-flash'; 

    // ✅ 스트리밍 요청을 위해 URL에 `streamGenerateContent`를 사용합니다.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?key=${apiKey}&alt=sse`;

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error("Gemini API Error:", errorBody);
      return {
        statusCode: geminiResponse.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: `API 요청 실패: ${geminiResponse.statusText}`, details: errorBody })
      };
    }
    
    // ✅ Gemini로부터 받은 ReadableStream을 그대로 클라이언트에 전달합니다.
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream', // SSE 표준 타입
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      body: geminiResponse.body 
    };

  } catch (error) {
    console.error("Handler Error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};

