// 프런트 기본 설정 (민감 정보 없음)
// 서버리스 함수로 호출하므로 API 키는 여기에 두지 않습니다.

window.CONFIG = window.CONFIG || {
        MAX_HISTORY_ITEMS: 100,
        /**
         * FUNCTIONS_BASE_URL 예시
         * - Netlify 배포(동일 도메인) : 기본값 사용 (/.netlify/functions)
         * - GitHub Pages + Netlify Functions : "https://<your-netlify-site>.netlify.app/.netlify/functions"
         * - 로컬 Netlify Dev : "http://localhost:8888/.netlify/functions"
         */
        FUNCTIONS_BASE_URL: "",
        CATEGORY_TO_CAFE_MENU: {
                // 예시 매핑: 실제 값으로 교체하세요
                "KNS 자체 콘텐츠": { cafeId: "", menuId: "" },
                "학습법/공부 습관": { cafeId: "", menuId: "" },
                "학교 정보/입시 전략": { cafeId: "", menuId: "" },
                "자녀 관계/멘탈 관리": { cafeId: "", menuId: "" },
                "학원 생활/시스템 문의": { cafeId: "", menuId: "" },
                "일상/유머": { cafeId: "", menuId: "" }
        }
};

// 클라이언트에서는 API 키를 검증하지 않습니다.
// 백엔드(Netlify Functions)에서 환경변수로 검증합니다.
function validateApiKey() {
	return true;
}


