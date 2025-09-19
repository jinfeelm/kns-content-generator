// KNS 카페 콘텐츠 생성기 v4.6 - Topic Sparks Update
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.validateApiKey !== 'function') {
      window.validateApiKey = function() { return true; };
    }
    function showApiKeyError() { console.error("API Key is not configured in config.js"); }

    if (!validateApiKey()) { 
        showApiKeyError();
        return;
    }

    // --- DOM 요소 ---
    const personaSelect = document.getElementById('persona');
    const categorySelect = document.getElementById('category');
    const postLengthSelect = document.getElementById('postLength');
    const userNameInput = document.getElementById('userName');
    const regenNameBtn = document.getElementById('regenNameBtn');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const outputPlaceholder = document.getElementById('placeholder');
    const outputLoading = document.getElementById('loading');
    const outputResult = document.getElementById('result');
    const resultTitle = document.getElementById('resultTitle');
    const resultPersonaIcon = document.getElementById('resultPersonaIcon');
    const resultPersonaName = document.getElementById('resultPersonaName');
    const resultBody = document.getElementById('resultBody');
    const rewriteHookBtn = document.getElementById('rewriteHookBtn');
    const rewriteLineBtn = document.getElementById('rewriteLineBtn');
    const goalBtnConcern = document.getElementById('goalBtnConcern');
    const goalBtnInfo = document.getElementById('goalBtnInfo');
    const goalBtnDaily = document.getElementById('goalBtnDaily');
    const goalBtnComment = document.getElementById('goalBtnComment');
    const advancedControls = document.getElementById('advancedControls');
    const toggleAdvanced = document.getElementById('toggleAdvanced');
    const postModeBtn = document.getElementById('postModeBtn');
    const commentModeBtn = document.getElementById('commentModeBtn');
    const postTypeSelect = document.getElementById('postType');
    const postTypeSection = document.getElementById('postTypeSection');
    const referencePostSection = document.getElementById('referencePostSection');
    const referencePostInput = document.getElementById('referencePost');
    const historyBtn = document.getElementById('historyBtn');
    const statsBtn = document.getElementById('statsBtn');
    const helpBtn = document.getElementById('helpBtn');
    const historyModal = document.getElementById('historyModal');
    const statsModal = document.getElementById('statsModal');
    const helpModal = document.getElementById('helpModal');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const closeStatsBtn = document.getElementById('closeStatsBtn');
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    const historyList = document.getElementById('historyList');
    const ocrUploadBtn = document.getElementById('ocrUploadBtn');
    const ocrImageUpload = document.getElementById('ocrImageUpload');
    const ocrStatus = document.getElementById('ocrStatus');
    
    let currentMode = 'post';
    let contentHistory = JSON.parse(localStorage.getItem('knsContentHistory') || '[]');
    let currentGoal = null;

    const appConfig = window.CONFIG || {};
    const normalizedFunctionsBaseUrl = (() => {
        const rawBase = typeof appConfig.FUNCTIONS_BASE_URL === 'string'
            ? appConfig.FUNCTIONS_BASE_URL.trim()
            : '';
        if (!rawBase) return '/.netlify/functions';
        const sanitized = rawBase.replace(/\/+$/, '');
        return sanitized || '/.netlify/functions';
    })();
    const getFunctionUrl = (name) => {
        const sanitizedName = name.startsWith('/') ? name.slice(1) : name;
        return `${normalizedFunctionsBaseUrl}/${sanitizedName}`;
    };
    
    const nameAdjectives = ['익명의', '신비로운', '슬기로운', '날쌘', '용감한', '우아한', '명랑한', '엉뚱한'];
    const nameNouns = ['쿼카', '카피바라', '알파카', '북극곰', '사막여우', '너구리', '돌고래', '미어캣', '펭귄', '부엉이'];

    const postTypeGuidelines = {
        'SOS형': '도움과 위로를 구하는 고민 토로. 솔직하고 감정선이 살아 있는 톤, 상황 설명 후 구체적인 질문으로 마무리.',
        '공유형': '정보·경험을 나누는 글. 핵심 요약 → 배경 → 실제 경험 또는 팁 → 마무리 인사 순으로 정리된 구조.',
        'Q&A형': '단문 문의 글. 현재 상황 요약, 궁금한 포인트를 번호나 불릿으로 정리, 답변 요청으로 마무리.'
    };

    const goalIntent = {
        concern: '고민/질문 있어요 — 아이 상황을 구체적으로 묘사하고, 공감과 조언을 구하는 진솔한 톤으로 써주세요.',
        info: '유용한 정보 공유 — 최근에 확인한 KNS 수업·입시 정보나 노하우를 체계적으로 정리해 공유해주세요.',
        daily: '가벼운 일상/유머 — 친근한 대화체와 이모티콘으로 일상 에피소드를 전하며 따뜻한 분위기를 만드세요.',
        comment: '자연스러운 댓글 — 기존 글의 핵심을 먼저 요약해 공감 표시 후, 개인 경험이나 팁을 간결히 덧붙여주세요.'
    };

    function generateRandomName() {
        const adj = nameAdjectives[Math.floor(Math.random() * nameAdjectives.length)];
        const noun = nameNouns[Math.floor(Math.random() * nameNouns.length)];
        return `${adj} ${noun}`;
    }
    
    async function processImageFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            ocrStatus.textContent = '⚠️ 이미지 파일만 업로드할 수 있어요.';
            setTimeout(() => { ocrStatus.textContent = ''; }, 3000);
            return;
        }

        ocrStatus.textContent = '이미지를 분석 중입니다... 🧠';
        referencePostInput.disabled = true;
        ocrUploadBtn.disabled = true;

        try {
            const worker = await Tesseract.createWorker('kor', 1, {
                logger: m => console.log(m)
            });
            const { data: { text } } = await worker.recognize(file);
            await worker.terminate();
            
            referencePostInput.value = text;
            ocrStatus.textContent = '✅ 텍스트 추출 완료!';
            
        } catch (error) {
            console.error('OCR Error:', error);
            ocrStatus.textContent = '❌ 오류: 텍스트를 추출하지 못했습니다.';
        } finally {
            referencePostInput.disabled = false;
            ocrUploadBtn.disabled = false;
            ocrImageUpload.value = '';
            setTimeout(() => { ocrStatus.textContent = ''; }, 3000);
        }
    }


    const personaModifiers = {
        personalities: ['정보력이 뛰어나고 꼼꼼한', '다른 엄마들과 교류를 즐기는 사교적인', '아이의 의견을 존중하는 민주적인', '목표 지향적이고 계획적인', '다소 불안감이 높고 예민한', '긍정적이고 낙천적인', '데이터와 통계를 신뢰하는 분석적인', '감성적이고 공감 능력이 뛰어난', '자녀 교육에 대한 주관이 뚜렷한', '유머 감각이 있고 위트있는'],
        situations: ['최근 아이가 성적이 올라 기분이 좋은 상태', '아이의 사춘기 때문에 골머리를 앓고 있는 상태', 'KNS 설명회에서 좋은 정보를 얻어 신이 난 상태', '다른 엄마와의 교육관 차이로 스트레스를 받은 상태', '자녀의 장래희망 때문에 진지하게 고민 중인 상태', '겨울방학 특강을 뭘 들을지 행복한 고민에 빠진 상태', '아이의 스마트폰 사용 문제로 크게 다툰 상태', '시험 결과에 실망했지만, 아이를 다독여주려는 상태', '새로운 입시 정책 발표로 마음이 복잡한 상태', '아이의 학습 태도가 좋아져 뿌듯함을 느끼는 상태', '주변의 기대 때문에 부담감을 느끼는 상태', '자녀의 친구 관계 때문에 걱정이 많은 상태'],
        styles: ['이모티콘(😂, 👍, ㅠㅠ)을 많이 사용하는', '핵심만 간단하게 전달하는', '질문을 던져 다른 사람의 의견을 구하는', '자신의 경험을 상세하게 공유하는', '다소 직설적이고 솔직한 화법을 구사하는', '객관적인 정보를 바탕으로 이야기하는', '따뜻하고 다정한 말투를 사용하는', '유머와 농담을 섞어 분위기를 부드럽게 만드는']
    };

    const personaDetails = {
        '초등 저학년맘': { 
            icon: '🧐', 
            color: 'text-yellow-400',
            description: "당신은 초등학교 저학년(2~4학년) 자녀를 둔 엄마입니다. 이제 막 '엄마표 영어'의 한계를 느끼고 첫 영어학원을 알아보는 단계입니다. 당신의 주된 관심사는 아이가 영어에 흥미를 잃지 않고 즐겁게 배우는 것, 좋은 학습 습관을 형성하는 것, 그리고 영어 원서 읽기 등입니다. '영재교육원' 같은 어려운 입시보다는, 아이의 눈높이에 맞는 현실적인 고민을 이야기합니다."
        }, 
        '특목·자사고 준비맘': { 
            icon: '📚', 
            color: 'text-blue-400',
            description: "당신은 초등학교 고학년(5~6학년) 자녀를 둔, 특목고·자사고 입시를 본격적으로 준비하는 엄마입니다. 중등 과정 선행 학습과 입시 로드맵에 관심이 많습니다. KNS의 '앤솔로지'나 '수단비' 같은 프로그램을 중등 과정의 핵심 목표로 삼고 있으며, 설명회나 주변 정보를 통해 얻은 지식을 바탕으로 이야기합니다."
        }, 
        '중등 입문맘': { 
            icon: '🧭', 
            color: 'text-indigo-400',
            description: "당신은 중학교 1학년 자녀를 둔 엄마입니다. 초등학교와는 모든 게 달라진 중학교 시스템에 적응하느라 정신없습니다. 아이가 새로운 친구는 잘 사귀는지, 수행평가는 어떻게 챙겨야 할지, 1년 뒤에 볼 첫 시험은 벌써부터 걱정되는, 모든 것이 처음이라 서툴고 궁금한 게 많은 학부모입니다."
        }, 
        '내신 격전지맘': { 
            icon: '🔥', 
            color: 'text-red-400',
            description: "당신은 중학교 2학년 자녀를 둔 엄마입니다. 갑자기 어려워진 내신, 자녀의 사춘기와 교우관계 등 가장 현실적이고 힘든 시기를 보내고 있습니다. 다른 학부모들과의 공감과 위로를 원하며, KNS의 심화 프로그램이 이 시기를 극복하는 데 어떤 도움을 줄 수 있는지에 대한 경험담을 나누고 싶어합니다."
        }, 
        '고입 최종관문맘': { 
            icon: '🎯', 
            color: 'text-purple-400',
            description: "당신은 중학교 3학년 자녀를 둔 엄마입니다. 고등학교 최종 선택, 자기소개서, 면접 준비 등 입시의 마지막 단계를 치르고 있습니다. 자녀의 스펙을 기반으로 한 예리한 질문을 던지거나, 다른 사람의 글에 깊이 있는 분석 댓글을 다는 '고수'의 면모를 보입니다. KNS의 콘텐츠가 최종 입시 결과에 미치는 영향에 대해 확신을 가지고 이야기합니다."
        }
    };

    // ✅ New: Specific topic sparks for each persona to increase variety
    const topicSparks = {
        '초등 저학년맘': [
            "아이가 갑자기 학원 가기 싫다고 떼를 써서 고민이에요. 어떻게 달래야 할까요?",
            "영어 원서 읽기, 어떤 레벨부터 시작해야 아이가 흥미를 붙일까요? 책 추천 좀 해주세요.",
            "초3 되니 영어 격차가 확 벌어지는 것 같은데, 다들 어떻게 대비하고 계신가요?",
            "아이가 친구 관계 때문에 힘들어하는데, 부모가 어디까지 개입해야 할지 모르겠어요.",
            "KNS 다니고 있는데, 숙제 말고 집에서 더 해줄 게 있을까요?",
            "요즘 애들 장래희망은 저희 때랑은 완전 다른 것 같아요. 다들 아이 꿈이 뭔가요?",
            "주말마다 아이랑 뭐하고 놀아주시나요?"
        ],
        '특목·자사고 준비맘': [
            "KNS 레벨테스트 보신 분 계시면 후기 좀 부탁드려요! 난이도가 어떤가요?",
            "중등 선행, 방학 때 영어의 어떤 영역 다뤄야 할까요?",
            "슬슬 중학교 내신 대비해야 할 것 같은데, KNS 중등부 프로그램이 도움이 많이 될까요?",
            "아이가 공부는 잘하는데, 체력이 너무 약해서 걱정이에요. 체력 관리 팁 있나요?",
            "수행평가 비중이 점점 커진다는데, 미리 준비할 만한 게 있을까요?",
            "아이 용돈, 다들 얼마씩 주시나요? 경제 교육도 시켜야 할 것 같아서요."
        ],
        '중등 입문맘': [
            "중학교 올라가니 수행평가가 너무 많아요. 일정 관리 어떻게 해줘야 할까요?",
            "아이가 스마트폰에 너무 빠져 있어서 걱정이에요. 좋은 해결 방법 없을까요?",
            "중1 첫 시험 생각하면 벌써부터 긴장되네요.",
            "KNS 중등부 처음인데, 레벨이 너무 다양해서 어떤 반을 목표로 해야할지 모르겠어요.",
            "아이가 사춘기인지 부쩍 말을 안 하려고 해요. 이 시기 어떻게 지나가야 할까요?",
            "친구들이랑 학원 끝나고 맨날 편의점 가는데, 그냥 둬도 괜찮겠죠?"
        ],
        '내신 격전지맘': [
            "중2 영어 내신, 정말 장난 아니네요. KNS 내신 대비반 효과 보신 분 계신가요?",
            "아이 친구 문제 때문에 속상한 일이 있었는데, 어디다 털어놓을 데가 없네요.",
            "사춘기 자녀와 대화하는 꿀팁 좀 전수해주세요. 정말 하루하루가 전쟁 같아요.",
            "진도가 너무 빨라서 아이가 힘들어하는데, 학원을 바꿔야 할까요?",
            "요즘 아이가 부쩍 외모에 신경 쓰는데, 공부에 방해될까 봐 걱정이에요.",
            "KNS 다니면서 다른 과목 성적까지 같이 오른 경험 있으신 분 있나요?",
            "시험 기간만 되면 너무 예민해지는 아이, 어떻게 멘탈 관리 해주시나요?"
        ],
        '고입 최종관문맘': [
            "고등학교 원서 쓸 시즌이 다가오니 하루하루 피가 마르네요. 다들 어디 생각하고 계세요?",
            "자사고 면접 준비, KNS 특강 말고 따로 준비해야 할 게 또 있을까요?",
            "중3 마지막 내신, 끝까지 긴장을 놓을 수가 없네요. 다들 파이팅해요!",
            "자기소개서에 어떤 내용을 녹여내야 좋은 평가를 받을 수 있을까요? 막막하네요.",
            "아이가 원하는 고등학교랑 부모가 원하는 고등학교가 달라서 갈등이 있어요.",
            "고등학교 최종 합격하고 나면, 입학 전까지 뭘 준비시켜야 할까요? (예비 고1)",
            "고생한 아이에게 어떤 선물을 해줘야 좋아할까요?"
        ]
    };

    const seasonalKeywords = {
        0: { guide: "지금은 1월입니다. 겨울방학 특강, 새 학년 준비, 예비중/예비고1 과정에 대한 주제가 좋습니다.", activeCategories: ['학습법/공부 습관', '학교 정보/입시 전략', 'KNS 자체 콘텐츠', '학원 생활/시스템 문의'], backgroundCategories: ['자녀 관계/멘탈 관리'] },
        1: { guide: "지금은 2월입니다. 신학기 증후군, 새 학년 내신 대비 전략, 마무리 특강에 대한 주제가 좋습니다.", activeCategories: ['학습법/공부 습관', '학교 정보/입시 전략', 'KNS 자체 콘텐츠', '학원 생활/시스템 문의'], backgroundCategories: ['자녀 관계/멘탈 관리'] },
        2: { guide: "지금은 3월입니다. 새 학기 시작, 새로운 친구 관계, 1학기 학습 계획에 대한 주제가 좋습니다.", activeCategories: ['학습법/공부 습관', '학교 정보/입시 전략', 'KNS 자체 콘텐츠', '학원 생활/시스템 문의'], backgroundCategories: ['자녀 관계/멘탈 관리'] },
        3: { guide: "지금은 4월입니다. 1학기 중간고사 대비, 수행평가 시즌, 춘곤증 극복에 대한 주제가 좋습니다.", activeCategories: ['학습법/공부 습관', '학교 정보/입시 전략', 'KNS 자체 콘텐츠', '학원 생활/시스템 문의'], backgroundCategories: ['자녀 관계/멘탈 관리'] },
        4: { guide: "지금은 5월입니다. 중간고사 결과 분석, 가정의 달, 학습 슬럼프 극복에 대한 주제가 좋습니다.", activeCategories: ['학습법/공부 습관', '학교 정보/입시 전략', 'KNS 자체 콘텐츠', '학원 생활/시스템 문의'], backgroundCategories: ['자녀 관계/멘탈 관리'] },
        5: { guide: "지금은 6월입니다. 기말고사 대비, 여름방학 계획, 입시 설명회 시즌에 대한 주제가 좋습니다.", activeCategories: ['학습법/공부 습관', '학교 정보/입시 전략', 'KNS 자체 콘텐츠', '학원 생활/시스템 문의'], backgroundCategories: ['자녀 관계/멘탈 관리'] },
        6: { guide: "지금은 7월입니다. 여름방학 시작, 방학 특강, 휴가와 학습 밸런스에 대한 주제가 좋습니다.", activeCategories: ['학습법/공부 습관', '학교 정보/입시 전략', 'KNS 자체 콘텐츠', '학원 생활/시스템 문의'], backgroundCategories: ['자녀 관계/멘탈 관리'] },
        7: { guide: "지금은 8월입니다. 2학기 선행, 개학 준비, 방학 숙제 마무리에 대한 주제가 좋습니다.", activeCategories: ['학습법/공부 습관', '학교 정보/입시 전략', 'KNS 자체 콘텐츠', '학원 생활/시스템 문의'], backgroundCategories: ['자녀 관계/멘탈 관리'] },
        8: { guide: "지금은 9월입니다. 2학기 시작, 중간고사 대비, 대입 수시 원서 접수 시즌에 대한 주제가 좋습니다.", activeCategories: ['학습법/공부 습관', '학교 정보/입시 전략', 'KNS 자체 콘텐츠', '학원 생활/시스템 문의'], backgroundCategories: ['자녀 관계/멘탈 관리'] },
        9: { guide: "지금은 10월입니다. 2학기 중간고사, 단기 방학, 고입 원서 준비에 대한 주제가 좋습니다.", activeCategories: ['학습법/공부 습관', '학교 정보/입시 전략', 'KNS 자체 콘텐츠', '학원 생활/시스템 문의'], backgroundCategories: ['자녀 관계/멘탈 관리'] },
        10: { guide: "지금은 11월입니다. 기말고사 대비, 수능 시즌, 겨울방학 계획에 대한 주제가 좋습니다.", activeCategories: ['학습법/공부 습관', '학교 정보/입시 전략', 'KNS 자체 콘텐츠', '학원 생활/시스템 문의'], backgroundCategories: ['자녀 관계/멘탈 관리'] },
        11: { guide: "지금은 12월입니다. 겨울방학 시작, 연말, 새해 학습 계획에 대한 주제가 좋습니다.", activeCategories: ['학습법/공부 습관', '학교 정보/입시 전략', 'KNS 자체 콘텐츠', '학원 생활/시스템 문의'], backgroundCategories: ['자녀 관계/멘탈 관리'] }
    };

    function switchMode(mode) {
        currentMode = mode;
        if (mode === 'post' && currentGoal === 'comment') {
            currentGoal = null;
        } else if (mode === 'comment' && currentGoal && currentGoal !== 'comment') {
            currentGoal = null;
        }
        if (mode === 'post') {
            postModeBtn.className = 'bg-emerald-500 text-white py-2 px-4 rounded-lg font-medium';
            commentModeBtn.className = 'bg-slate-700 text-slate-300 py-2 px-4 rounded-lg font-medium';
            postTypeSection.classList.remove('hidden');
            referencePostSection.classList.add('hidden');
        } else {
            postModeBtn.className = 'bg-slate-700 text-slate-300 py-2 px-4 rounded-lg font-medium';
            commentModeBtn.className = 'bg-emerald-500 text-white py-2 px-4 rounded-lg font-medium';
            postTypeSection.classList.add('hidden');
            referencePostSection.classList.remove('hidden');
        }
    }

    async function generateGoalBasedContent(goal) {
        postLengthSelect.value = '자동';
        currentGoal = goal;
        try {
            switch(goal) {
                case 'concern':
                    postTypeSelect.value = 'SOS형';
                    categorySelect.value = ['학습법/공부 습관', '자녀 관계/멘탈 관리', '학교 정보/입시 전략'][Math.floor(Math.random() * 3)];
                    switchMode('post');
                    break;
                case 'info':
                    postTypeSelect.value = '공유형';
                    categorySelect.value = Math.random() > 0.3 ? 'KNS 자체 콘텐츠' : '학교 정보/입시 전략';
                    switchMode('post');
                    break;
                case 'daily':
                    postTypeSelect.value = '공유형';
                    categorySelect.value = '일상/유머';
                    switchMode('post');
                    break;
                case 'comment':
                    switchMode('comment');
                    advancedControls.classList.remove('hidden');
                    toggleAdvanced.textContent = '⚙️ 전문가 모드 닫기';
                    referencePostInput.focus();
                    return;
            }
            await generateContent();
        } finally {
            if (goal !== 'comment') {
                currentGoal = null;
            }
        }
    }
    
    function getSmartInstruction(category) {
        let instruction = "";
        switch(category) {
            case 'KNS 자체 콘텐츠':
            case '학원 생활/시스템 문의':
                instruction = "8. **[주제 집중!] 당신은 지금 KNS 학원과 직접 관련된 글을 쓰고 있습니다. KNS의 프로그램, 시스템, 영어 교육 방식에 대해 집중적으로 이야기해주세요.**";
                break;
            case '학습법/공부 습관':
            case '학교 정보/입시 전략':
                instruction = "8. **[주제 유연성] 다른 과목(수학, 국어 등)에 대한 고민을 자유롭게 이야기해도 좋습니다. 하지만 만약 자연스러운 기회가 생긴다면, 영어 실력이 다른 과목에 미치는 긍정적인 영향에 대해 살짝 언급해줄 수 있습니다. 억지로 연결하지는 마세요.**";
                break;
            case '자녀 관계/멘탈 관리':
            case '일상/유머':
                instruction = "8. **[공감 집중!] 지금은 공부나 학원 이야기는 잠시 접어두세요. 아이와의 관계, 엄마의 감정, 소소한 일상 등 순수하게 감성적이고 인간적인 부분에 100% 집중하여 공감과 위로를 주는 글을 작성해주세요.**";
                break;
            default:
                instruction = "8. KNS는 영어가 중심인 학원이라는 점을 기억해주세요.";
        }
        
        const selectedLength = postLengthSelect.value;
        if (selectedLength === "짧게") {
            instruction += "\n9. **[글 길이 절대 규칙!] 당신은 '짧게' 쓰라는 명령을 받았습니다. 반드시 1~3개의 문장으로 글을 마무리해야 합니다. 이 규칙은 선택이 아닌 필수입니다.**";
        } else if (selectedLength === "보통") {
            instruction += "\n9. **[글 길이 절대 규칙!] 당신은 '보통' 길이로 쓰라는 명령을 받았습니다. 반드시 4~7개의 문장으로 글을 작성해야 합니다. 이 규칙은 선택이 아닌 필수입니다.**";
        } else if (selectedLength === "길게") {
            instruction += "\n9. **[글 길이 절대 규칙!] 당신은 '길게' 쓰라는 명령을 받았습니다. 반드시 8개 이상의 문장과 여러 문단으로 글을 작성해야 합니다. 이 규칙은 선택이 아닌 필수입니다.**";
        }
        return instruction;
    }

    function getSeasonalGuide(month, category) {
        const season = seasonalKeywords[month];
        if (!season) return "";

        if (season.activeCategories.includes(category)) {
            return `**[시의성 가이드] ${season.guide}**`;
        }
        if (season.backgroundCategories.includes(category)) {
            const hint = season.guide.split('입니다.')[1]?.trim().split(' ')[0] || "현재 시기";
            return `**[시의성 힌트] 현재 시점은 '${hint}'인 것을 참고하여 글의 배경으로만 자연스럽게 활용해주세요.**`;
        }
        return "";
    }

    async function generateContent() {
        if (!userNameInput.value.trim()) {
             const randomName = generateRandomName();
             userNameInput.value = randomName;
             localStorage.setItem('knsContentGeneratorUserName', randomName);
        }
        
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(b => b.disabled = true);
        outputPlaceholder.classList.add('hidden');
        outputResult.classList.add('hidden');
        outputLoading.classList.remove('hidden');

        const selectedPersona = personaSelect.value;
        const selectedCategory = categorySelect.value;
        const selectedPostType = postTypeSelect.value;
        const personaInfo = personaDetails[selectedPersona];

        const coreDescription = personaDetails[selectedPersona].description;

        const randomModifier = {
            personality: personaModifiers.personalities[Math.floor(Math.random() * personaModifiers.personalities.length)],
            situation: personaModifiers.situations[Math.floor(Math.random() * personaModifiers.situations.length)],
            style: personaModifiers.styles[Math.floor(Math.random() * personaModifiers.styles.length)],
        };
        const dynamicPersonaDescription = `**기본 프로필:** ${coreDescription}\n\n**추가 상황:**\n- 당신의 성격은 '${randomModifier.personality}' 타입입니다.\n- 당신의 현재 상황은 '${randomModifier.situation}'입니다.\n- 당신의 주된 소통 스타일은 '${randomModifier.style}' 방식입니다.\n이 모든 조합에 완벽하게 몰입하여, 실제 학부모가 쓴 것처럼 자연스럽고 현실적인 콘텐츠를 생성해주세요.`;
        
        const smartInstruction = getSmartInstruction(selectedCategory);
        const currentMonth = new Date().getMonth();
        const seasonalGuide = getSeasonalGuide(currentMonth, selectedCategory);
        const postTypeGuide = currentMode === 'post' ? postTypeGuidelines[selectedPostType] : '';
        const goalGuide = currentGoal ? (goalIntent[currentGoal] || '') : '';
        const goalContextLabel = currentMode === 'comment' ? '댓글 목표 맥락' : '글 목표 맥락';
        const contextualDirectiveItems = [
            seasonalGuide,
            currentMode === 'post' && postTypeGuide ? `**글 유형 가이드:** ${selectedPostType} — ${postTypeGuide}` : '',
            goalGuide ? `**${goalContextLabel}:** ${goalGuide}` : '',
            `**글 유형/목표 준수 규칙:**\n- 위에서 정의한 글 유형·목표 설명을 반드시 반영하여 톤, 문단 구성, 마무리 방식을 조정하세요.\n- 글 유형과 목표가 충돌할 경우, 글 유형의 구조를 우선하되 목표가 요구하는 감정선과 메시지를 본문에서 살려주세요.`
        ].filter(Boolean);
        const contextualDirectiveText = contextualDirectiveItems.length > 0 ? contextualDirectiveItems.join('\n\n') + '\n\n' : '';

        // ✅ System prompt updated for more natural tone and to use topic sparks
        let systemPrompt = `당신은 대한민국 서울 대치동의 학부모들이 이용하는 온라인 입시 정보 카페를 위한 콘텐츠를 생성하는 AI입니다. 실제 학부모가 쓴 것처럼 자연스럽고 현실감 있는 톤앤매너를 완벽하게 구현해야 합니다. 다음 페르소나의 역할에 100% 빙의하여 응답해주세요:\n\n**페르소나 프로필:**\n${dynamicPersonaDescription}\n\n${contextualDirectiveText}**콘텐츠 생성 규칙:**
1. **[가장 중요] 지금부터 당신은 아래 '사용자 요청'에 제시된 '주제 씨앗'에 대해 이야기하는 실제 학부모입니다. 페르소나의 특징을 유지하면서, 이 '주제 씨앗'을 중심으로 자연스러운 글을 작성하세요.**
2. 게시글의 경우, 제목과 본문을 "제목: [제목 내용]"과 "본문: [본문 내용]" 형식으로 명확히 구분하여 생성합니다.
3. 댓글의 경우, "댓글: [댓글 내용]" 형식으로 생성합니다.
4. 실제 커뮤니티처럼 이모티콘(😊, ㅠㅠ, 👍 등)을 자연스럽게 사용하고, 적절한 줄 바꿈으로 가독성을 높여주세요.
5. 매번 다른 스타일과 표현을 사용하여 천편일률적이지 않게 작성하세요.
6. 개인적인 경험이나 구체적인 상황을 포함하여 현실감을 높이세요.
7. **[매우 중요] 절대로 '[핵심요약]', '[마무리]'와 같은 형식적인 소제목이나 구분선을 사용하지 마세요. 모든 글은 실제 학부모가 쓰는 것처럼 자연스러운 문장과 문단으로만 구성되어야 합니다.**
8. **[강조 최소화] 텍스트 강조(\`**\`)는 꼭 필요한 핵심 단어에만 최소한으로 사용하고, 인위적인 느낌을 주지 않도록 주의하세요.**
${smartInstruction}`;

        let userQuery = '';
        if (currentMode === 'post') {
            // ✅ Select a random topic spark
            const sparks = topicSparks[selectedPersona] || ["최근 교육 관련해서 고민이 있어요."];
            const randomSpark = sparks[Math.floor(Math.random() * sparks.length)];
            
            const postTypeLine = `- 글 유형: ${selectedPostType}${postTypeGuide ? ` — ${postTypeGuide}` : ''}`;
            const goalLine = `- 글 목표: ${goalGuide || '사용자가 직접 설정한 목표가 없습니다.'}`;
            userQuery = `다음 조건에 맞춰 글을 생성해주세요.\n- 주제 씨앗: "${randomSpark}"\n${postTypeLine}\n${goalLine}\n- 콘텐츠 카테고리: ${selectedCategory}`;
        } else {
            const referencePost = referencePostInput.value.trim();
            if (!referencePost) {
                displayError("댓글을 달고 싶은 기존 글의 내용을 입력해주세요.");
                allButtons.forEach(b => b.disabled = false);
                outputLoading.classList.add('hidden');
                return;
            }
            const goalLine = `- 댓글 목표: ${goalGuide || '기본 댓글 모드'}`;
            userQuery = `다음 조건에 맞춰 댓글을 생성해주세요.\n- 참조할 기존 글: \n${referencePost}\n${goalLine}\n- 콘텐츠 카테고리: ${selectedCategory}`;
        }

        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                const response = await fetch(getFunctionUrl('generate'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: userQuery }] }],
                        systemInstruction: { parts: [{ text: systemPrompt }] },
                        generationConfig: { temperature: 1.1, topP: 0.95, topK: 40 }
                    })
                });

                if (response.status === 504 || response.status === 404) {
                    throw new Error(`서버 응답 오류: ${response.status}`);
                }
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API 요청 실패: ${response.status} ${errorText}`);
                }

                outputLoading.classList.add('hidden');
                outputResult.classList.remove('hidden');
                
                resultTitle.textContent = "콘텐츠 생성 중...";
                resultPersonaIcon.textContent = personaInfo.icon;
                resultPersonaName.textContent = selectedPersona;
                resultPersonaName.className = `font-semibold ${personaInfo.color}`;
                resultBody.innerHTML = '';
                
                const cursor = document.createElement('span');
                cursor.className = 'blinking-cursor';
                resultBody.appendChild(cursor);

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const parts = buffer.split('\n\n');
                    buffer = parts.pop() || '';
                    
                    for(const part of parts) {
                        if (part.startsWith('data: ')) {
                            try {
                                const jsonString = part.substring(6);
                                const json = JSON.parse(jsonString);
                                const textChunk = json.candidates?.[0]?.content?.parts?.[0]?.text;
                                if (textChunk) {
                                    resultBody.insertBefore(document.createTextNode(textChunk), cursor);
                                }
                            } catch(e) {
                                console.warn("JSON 파싱 오류:", part);
                            }
                        }
                    }
                }

                cursor.remove();
                
                const rawText = resultBody.innerText;
                let titleText = "생성된 콘텐츠", bodyText = rawText;
                
                if (rawText.includes("제목:") && rawText.includes("본문:")) {
                    titleText = rawText.split("제목:")[1].split("본문:")[0].trim();
                    bodyText = rawText.split("본문:")[1].trim();
                } else if (rawText.includes("댓글:")) {
                    titleText = `(댓글)`;
                    bodyText = rawText.split("댓글:")[1].trim();
                }
                
                resultTitle.textContent = titleText;
                resultBody.innerText = bodyText;
                copyBtn.disabled = false;
                
                saveToHistory({ title: titleText, body: bodyText });
                
                return;

            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error);
                attempt++;

                if (attempt < maxRetries) {
                    displayError(`요청이 불안정하여 재시도 중입니다... (${attempt}/${maxRetries})`);
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error("Content generation failed after multiple retries:", error);
                    displayError(`오류가 반복해서 발생했습니다. 잠시 후 다시 시도해주세요: ${error.message}`);
                }
            }
        }
        
        allButtons.forEach(b => b.disabled = false);
        outputLoading.classList.add('hidden');
    }
    
    function displayError(message) {
         outputLoading.classList.add('hidden');
         outputResult.classList.remove('hidden');
         resultTitle.textContent = "알림";
         resultPersonaIcon.textContent = "⚠️";
         resultPersonaName.textContent = "시스템";
         resultPersonaName.className = `font-semibold text-yellow-400`;
         resultBody.textContent = message;
    }

    function saveToHistory(content) {
        const historyItem = { id: Date.now(), timestamp: new Date().toLocaleString('ko-KR'), mode: currentMode, persona: personaSelect.value, category: categorySelect.value, title: content.title, body: content.body, author: userNameInput.value.trim() };
        contentHistory.unshift(historyItem);
        const maxHistory = (window.CONFIG && window.CONFIG.MAX_HISTORY_ITEMS) || 100;
        if (contentHistory.length > maxHistory) contentHistory = contentHistory.slice(0, maxHistory);
        localStorage.setItem('knsContentHistory', JSON.stringify(contentHistory));
    }

    function loadHistory() {
        historyList.innerHTML = '';
        if (contentHistory.length === 0) {
            historyList.innerHTML = '<p class="text-slate-400 text-center py-8">아직 생성된 콘텐츠가 없습니다.</p>';
            return;
        }
        contentHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'bg-slate-700 p-4 rounded-lg border border-slate-600';
            historyItem.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-sm font-medium text-emerald-400">${item.mode === 'post' ? '📝' : '💬'} ${item.persona}</span>
                        <span class="text-xs text-sky-400">👤 ${item.author}</span>
                        <span class="text-xs text-slate-400">${item.timestamp}</span>
                    </div>
                    <div class="flex gap-1">
                        <button onclick="useAsReference(${item.id})" class="text-xs bg-sky-500 text-white px-2 py-1 rounded hover:bg-sky-600 transition">참조</button>
                        <button onclick="copyHistoryItem(${item.id})" class="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded hover:bg-slate-500 transition">복사</button>
                    </div>
                </div>
                <div class="text-sm">
                    <div class="font-medium text-slate-200 mb-1">${item.title}</div>
                    <div class="text-slate-400 line-clamp-2">${item.body.substring(0, 100)}${item.body.length > 100 ? '...' : ''}</div>
                </div>`;
            historyList.appendChild(historyItem);
        });
    }

    window.useAsReference = function(id) {
        const item = contentHistory.find(h => h.id == id);
        if (item) {
            switchMode('comment');
            referencePostInput.value = item.mode === 'comment' ? (item.referencePost || `제목: ${item.title}\n\n${item.body}`) : `제목: ${item.title}\n\n${item.body}`;
            historyModal.classList.add('hidden');
            advancedControls.classList.remove('hidden');
            toggleAdvanced.textContent = '⚙️ 전문가 모드 닫기';
            referencePostInput.focus();
        }
    };

    window.copyHistoryItem = function(id) {
        const item = contentHistory.find(h => h.id == id);
        if (item) {
            const fullText = item.mode === 'comment' ? item.body : `제목: ${item.title}\n\n${item.body}`;
            navigator.clipboard.writeText(fullText).then(() => alert('클립보드에 복사되었습니다!'));
        }
    };

    function loadStatistics() {
        const overallStatsEl = document.getElementById('overallStats');
        const userStatsEl = document.getElementById('userStats');
        const categoryStatsEl = document.getElementById('categoryStats');
        const personaStatsEl = document.getElementById('personaStats');
        const recentActivityEl = document.getElementById('recentActivity');

        if (!overallStatsEl || !userStatsEl || !categoryStatsEl || !personaStatsEl || !recentActivityEl) return;

        const totalContent = contentHistory.length;
        const totalPosts = contentHistory.filter(item => item.mode === 'post').length;
        const totalComments = contentHistory.length - totalPosts;
        const uniqueAuthors = [...new Set(contentHistory.map(item => item.author))].length;
        overallStatsEl.innerHTML = `
            <div class="flex justify-between"><span>총 콘텐츠:</span><span class="font-bold text-emerald-400">${totalContent}개</span></div>
            <div class="flex justify-between"><span>글 / 댓글:</span><span>${totalPosts}개 / ${totalComments}개</span></div>
            <div class="flex justify-between"><span>참여 작성자:</span><span class="font-bold text-yellow-400">${uniqueAuthors}명</span></div>
        `;

        const authorStats = {};
        contentHistory.forEach(item => { authorStats[item.author] = (authorStats[item.author] || 0) + 1; });
        userStatsEl.innerHTML = Object.entries(authorStats).sort((a, b) => b[1] - a[1]).map(([author, count]) => `<div class="flex justify-between"><span>${author}</span><span class="font-bold text-emerald-400">${count}개</span></div>`).join('') || '<p class="text-slate-400 text-sm">데이터가 없습니다.</p>';

        const categoryStats = {};
        contentHistory.forEach(item => { categoryStats[item.category] = (categoryStats[item.category] || 0) + 1; });
        categoryStatsEl.innerHTML = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).map(([category, count]) => `<div class="flex justify-between"><span>${category}</span><span class="font-bold text-emerald-400">${count}개</span></div>`).join('') || '<p class="text-slate-400 text-sm">데이터가 없습니다.</p>';

        const personaStats = {};
        contentHistory.forEach(item => { personaStats[item.persona] = (personaStats[item.persona] || 0) + 1; });
        personaStatsEl.innerHTML = Object.entries(personaStats).sort((a, b) => b[1] - a[1]).map(([persona, count]) => `<div class="flex justify-between"><span>${persona}</span><span class="font-bold text-emerald-400">${count}개</span></div>`).join('') || '<p class="text-slate-400 text-sm">데이터가 없습니다.</p>';
        
        recentActivityEl.innerHTML = contentHistory.slice(0, 5).map(item => `
            <div class="text-sm">
                <span>${item.mode === 'post' ? '📝' : '💬'}</span>
                <span class="font-semibold text-slate-300">${item.author}</span>님이
                <span class="text-emerald-400/80">'${item.persona}'</span> 페르소나로 콘텐츠를 생성했습니다.
                <span class="text-xs text-slate-500 ml-2">${new Date(item.id).toLocaleTimeString('ko-KR')}</span>
            </div>
        `).join('') || '<p class="text-slate-400 text-sm">최근 활동이 없습니다.</p>';
    }

    async function rewrite(type) {
        const originalBody = resultBody.innerText;
        if (!originalBody) return;
        
        try {
            const persona = resultPersonaName.textContent;
            const title = resultTitle.textContent;
            
            const prompt = type === 'hook' 
                ? `아래 글의 첫 문장(후킹 문장)만 더 강렬하고 자연스럽게 1문장으로 바꿔주세요. 같은 의미를 다른 표현으로:\n제목: ${title}\n본문: ${originalBody}` 
                : `아래 글에서 가장 핵심적인 문장이나 어색한 문장 하나를 골라, 같은 의미를 유지하되 표현을 더 매력적으로 바꿔 1문장으로 제시하세요. (원문 반환 X)\n제목: ${title}\n본문: ${originalBody}`;
            
            const response = await fetch(getFunctionUrl('generate'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: { parts: [{ text: `당신은 '${persona}' 페르소나의 말투와 톤을 유지합니다. 다른 부연설명 없이, 오직 결과물인 1개의 문장만 생성해주세요.` }] },
                    generationConfig: { temperature: 0.9, stopSequences: ["\n"] }
                })
            });

            if (!response.ok) throw new Error('Rewrite API 요청 실패');
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            const { value } = await reader.read();
            let newText = decoder.decode(value);

            if (newText.startsWith('data: ')) {
                 const jsonString = newText.substring(6, newText.lastIndexOf('}') + 1);
                 const json = JSON.parse(jsonString);
                 newText = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            }

            if (!newText) throw new Error('새로운 문장을 생성하지 못했습니다.');

            let newBody = "";
            if (type === 'hook') {
                const lines = originalBody.split('\n');
                lines[0] = newText;
                newBody = lines.join('\n');
            } else {
                 newBody = originalBody.replace(/[^.!?\n]+[.!?\n]?/, newText);
            }
            resultBody.innerText = newBody;

        } catch (e) {
            alert(e.message || '문장 교체 중 오류가 발생했습니다.');
        }
    }

    function init() {
        let currentName = localStorage.getItem('knsContentGeneratorUserName');
        if (!currentName) {
            currentName = generateRandomName();
            localStorage.setItem('knsContentGeneratorUserName', currentName);
        }
        userNameInput.value = currentName;

        userNameInput.addEventListener('change', () => {
            const newName = userNameInput.value.trim();
            if (newName) {
                localStorage.setItem('knsContentGeneratorUserName', newName);
            } else {
                const randomName = generateRandomName();
                userNameInput.value = randomName;
                localStorage.setItem('knsContentGeneratorUserName', randomName);
            }
        });

        regenNameBtn.addEventListener('click', () => {
            const newName = generateRandomName();
            userNameInput.value = newName;
            localStorage.setItem('knsContentGeneratorUserName', newName);
        });
        
        ocrUploadBtn.addEventListener('click', () => ocrImageUpload.click());
        ocrImageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if(file) processImageFile(file);
        });
        
        referencePostInput.addEventListener('paste', (event) => {
            const items = (event.clipboardData || window.clipboardData).items;
            for (let index in items) {
                const item = items[index];
                if (item.kind === 'file') {
                    event.preventDefault();
                    const blob = item.getAsFile();
                    processImageFile(blob);
                    break;
                }
            }
        });

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            referencePostSection.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            referencePostSection.addEventListener(eventName, () => {
                referencePostSection.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            referencePostSection.addEventListener(eventName, () => {
                referencePostSection.classList.remove('drag-over');
            }, false);
        });

        referencePostSection.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length > 0) {
                processImageFile(files[0]);
            }
        }, false);


        toggleAdvanced.addEventListener('click', () => {
            const isHidden = advancedControls.classList.toggle('hidden');
            toggleAdvanced.textContent = isHidden ? '⚙️ 전문가 모드 열기' : '⚙️ 전문가 모드 닫기';
        });
        
        goalBtnConcern.addEventListener('click', () => generateGoalBasedContent('concern'));
        goalBtnInfo.addEventListener('click', () => generateGoalBasedContent('info'));
        goalBtnDaily.addEventListener('click', () => generateGoalBasedContent('daily'));
        goalBtnComment.addEventListener('click', () => generateGoalBasedContent('comment'));
        
        generateBtn.addEventListener('click', generateContent);
        
        postModeBtn.addEventListener('click', () => switchMode('post'));
        commentModeBtn.addEventListener('click', () => switchMode('comment'));
        
        copyBtn.addEventListener('click', () => {
            const title = resultTitle.textContent;
            const body = resultBody.innerText;
            const fullText = title === '(댓글)' ? body : `제목: ${title}\n\n${body}`;
            navigator.clipboard.writeText(fullText).then(() => {
                copyBtn.textContent = '복사 완료!';
                setTimeout(() => { copyBtn.textContent = '수정 완료 & 복사'; }, 2000);
            });
        });
        
        historyBtn.addEventListener('click', () => { loadHistory(); historyModal.classList.remove('hidden'); });
        statsBtn.addEventListener('click', () => { loadStatistics(); statsModal.classList.remove('hidden'); });
        helpBtn.addEventListener('click', () => { helpModal.classList.remove('hidden'); });
        
        closeHistoryBtn.addEventListener('click', () => { historyModal.classList.add('hidden'); });
        closeStatsBtn.addEventListener('click', () => { statsModal.classList.add('hidden'); });
        closeHelpBtn.addEventListener('click', () => { helpModal.classList.add('hidden'); });
        
        rewriteHookBtn.addEventListener('click', () => rewrite('hook'));
        rewriteLineBtn.addEventListener('click', () => rewrite('line'));
    }

    init();
});

