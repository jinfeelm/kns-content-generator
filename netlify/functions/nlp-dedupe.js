// 팀 전역 중복 방지: Upstash Redis REST 사용 (패키지 불필요)
// 필요 env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[\p{P}\p{S}]/gu, '');
}

function tokenize(text) {
  return normalizeText(text).split(' ').filter(Boolean);
}

function simhash(text) {
  const tokens = tokenize(text);
  const bits = new Array(64).fill(0);
  for (const tok of tokens) {
    let h = murmurhash64(tok);
    for (let i = 0; i < 64; i++) {
      const bit = (h.big >> BigInt(i)) & 1n;
      bits[i] += bit === 1n ? 1 : -1;
    }
  }
  let out = 0n;
  for (let i = 0; i < 64; i++) if (bits[i] > 0) out |= 1n << BigInt(i);
  return out;
}

function murmurhash64(key) {
  // 간단한 64-bit 해시 (모사)
  let h = 0xcbf29ce484222325n; // FNV offset basis
  const prime = 0x100000001b3n; // FNV prime
  for (let i = 0; i < key.length; i++) {
    h ^= BigInt(key.charCodeAt(i));
    h *= prime;
    h &= 0xFFFFFFFFFFFFFFFFn;
  }
  return { big: h };
}

function hamming(a, b) {
  let x = a ^ b;
  let c = 0;
  while (x) {
    c++;
    x &= x - 1n;
  }
  return c;
}

async function redisFetch(path, init) {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) {
    throw new Error('Upstash 환경변수 미설정');
  }
  const url = `${base}${path}`;
  const resp = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init && init.headers)
    }
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Upstash 오류: ${resp.status} ${t}`);
  }
  return resp.json();
}

exports.handler = async function(event) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const { action, text, persona, category } = JSON.parse(event.body || '{}');
    if (!action || !text) return { statusCode: 400, body: JSON.stringify({ error: 'missing params' }) };

    const key = `kns:simhash:${persona || 'all'}:${category || 'all'}`;
    const sig = simhash(text);

    if (action === 'check') {
      // 최근 500개 simhash 조회
      const res = await redisFetch(`/lrange/${encodeURIComponent(key)}/0/499`);
      const arr = Array.isArray(res.result) ? res.result : [];
      let minHam = 64;
      for (const item of arr) {
        const prev = BigInt(item);
        const d = Number(hamming(sig, prev));
        if (d < minHam) minHam = d;
      }
      const similar = minHam <= 8; // 임계값: 8 이하면 매우 유사
      return { statusCode: 200, body: JSON.stringify({ similar, minHamming: minHam }) };
    }

    if (action === 'commit') {
      await redisFetch(`/lpush/${encodeURIComponent(key)}/${encodeURIComponent(sig.toString())}`);
      await redisFetch(`/ltrim/${encodeURIComponent(key)}/0/499`);
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'unknown action' }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};


