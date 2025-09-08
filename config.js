// 프런트 기본 설정 (민감 정보 없음)
// 서버리스 함수로 호출하므로 API 키는 여기에 두지 않습니다.

window.CONFIG = window.CONFIG || {
	MAX_HISTORY_ITEMS: 100
};

// 클라이언트에서는 API 키를 검증하지 않습니다.
// 백엔드(Netlify Functions)에서 환경변수로 검증합니다.
function validateApiKey() {
	return true;
}


