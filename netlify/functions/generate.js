exports.handler = async function(event, context) {
  const requestBody = JSON.parse(event.body);
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = "gemini-2.5-pro"; 

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `API 요청 실패: ${response.statusText}` })
      };
    }

    const result = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};