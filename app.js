// KNS 카페 콘텐츠 생성기 메인 애플리케이션
// API 키는 config.js에서 관리됩니다.

document.addEventListener('DOMContentLoaded', () => {
    // API 키 유효성 검사
    if (!validateApiKey()) {
        showApiKeyError();
        return;
    }

    // DOM 요소들
    const personaSelect = document.getElementById('persona');
    const scenarioSelect = document.getElementById('scenario');
    const postTypeSelect = document.getElementById('postType');
    const categorySelect = document.getElementById('category');
    const postLengthSelect = document.getElementById('postLength');
    const toneOptionsContainer = document.getElementById('toneOptions');
    const keywordInput = document.getElementById('keyword');
    const affiliationCheckbox = document.getElementById('includeAffiliation');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const outputPlaceholder = document.getElementById('placeholder');
    const outputLoading = document.getElementById('loading');
    const outputResult = document.getElementById('result');
    const resultTitle = document.getElementById('resultTitle');
    const resultPersonaIcon = document.getElementById('resultPersonaIcon');
    const resultPersonaName = document.getElementById('resultPersonaName');
    const resultBody = document.getElementById('resultBody');
    
    // New elements for improved functionality
    const postModeBtn = document.getElementById('postModeBtn');
    const commentModeBtn = document.getElementById('commentModeBtn');
    const postTypeSection = document.getElementById('postTypeSection');
    const referencePostSection = document.getElementById('referencePostSection');
    const referencePostInput = document.getElementById('referencePost');
    const userNameInput = document.getElementById('userName');
    const historyBtn = document.getElementById('historyBtn');
    const statsBtn = document.getElementById('statsBtn');
    const historyModal = document.getElementById('historyModal');
    const statsModal = document.getElementById('statsModal');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const closeStatsBtn = document.getElementById('closeStatsBtn');
    const historyList = document.getElementById('historyList');
    
    // State management
    let currentMode = 'post'; // 'post' or 'comment'
    let contentHistory = JSON.parse(localStorage.getItem('knsContentHistory') || '[]');
    
    const tones = [
        { id: 'anxious', name: '#불안한' }, { id: 'curious', name: '#궁금한' },
        { id: 'proud', name: '#자랑스러운' }, { id: 'happy', name: '#기쁜' },
        { id: 'advice', name: '#조언을구하는' }, { id: 'humorous', name: '#유머러스한' },
        { id: 'serious', name: '#진지한' }, { id: 'objective', name: '#객관적인' }
    ];

    // 콘텐츠 다양성을 위한 랜덤 요소들
    const randomElements = {
        writingStyles: [
            "개인적인 경험담을 바탕으로",
            "구체적인 상황을 예시로 들어",
            "다른 학부모들의 의견을 궁금해하며",
            "실제 데이터나 통계를 언급하며",
            "자녀와의 대화 내용을 포함하여",
            "최근 경험한 일을 바탕으로"
        ],
        emotionalExpressions: [
            "정말 고민이에요", "너무 궁금해요", "걱정이 돼요", "기대돼요", 
            "혼란스러워요", "불안해요", "희망적이에요", "조급해요"
        ],
        questionStyles: [
            "혹시 비슷한 경험 있으신 분 계신가요?",
            "어떻게 하시는지 궁금해요",
            "조언 부탁드려요",
            "어떤 게 맞는 걸까요?",
            "다른 분들은 어떻게 생각하세요?",
            "경험담 공유해주세요"
        ]
    };

    // 카테고리별 톤앤매너 매핑
    const categoryToneMapping = {
        'KNS 자체 콘텐츠': {
            defaultTones: ['#자랑스러운', '#기쁜'],
            avoidTones: ['#불안한', '#혼란스러운'],
            style: "KNS 프로그램에 대한 긍정적인 경험과 효과를 강조하며, 구체적인 성과나 변화를 언급하는 스타일"
        },
        '학습법/공부 습관': {
            defaultTones: ['#진지한', '#조언을구하는'],
            avoidTones: ['#유머러스한'],
            style: "실용적이고 구체적인 학습 방법에 대해 논의하며, 경험담과 팁을 공유하는 스타일"
        },
        '학교 정보/입시 전략': {
            defaultTones: ['#객관적인', '#궁금한'],
            avoidTones: ['#유머러스한'],
            style: "정보 전달에 중점을 두며, 구체적인 데이터나 사례를 바탕으로 한 분석적 스타일"
        },
        '자녀 관계/멘탈 관리': {
            defaultTones: ['#불안한', '#조언을구하는'],
            avoidTones: ['#객관적인'],
            style: "감정적 공감과 위로를 바탕으로 한 따뜻하고 공감적인 스타일"
        },
        '학원 생활/시스템 문의': {
            defaultTones: ['#궁금한', '#조언을구하는'],
            avoidTones: ['#자랑스러운'],
            style: "실용적인 정보를 구하는 질문 중심의 스타일"
        },
        '일상/유머': {
            defaultTones: ['#유머러스한', '#기쁜'],
            avoidTones: ['#진지한', '#불안한'],
            style: "가벼운 일상 이야기와 유머를 포함한 편안한 스타일"
        }
    };

    const personaDetails = {
        '영재반 준비맘': { 
            icon: '🧐', color: 'text-yellow-400',
            description: "당신은 현재 초등학교 저학년(2~4학년) 자녀를 둔 '영재반 준비맘'의 역할을 맡았습니다. 당신의 주된 관심사는 영어 유창성, 심화 원서 독서, 올바른 학습 습관 형성 등입니다. 이제 막 입시의 세계에 발을 들였기 때문에 호기심이 많고 기본적인 질문을 많이 하는 스타일입니다. KNS의 자체 교재보다는, 대치동의 전반적인 교육 방식이나 저학년 시기에 필요한 영어 학습의 본질에 대해 더 궁금해합니다."
        },
        '특목·자사고 준비맘': { 
            icon: '📚', color: 'text-blue-400',
            description: "당신은 현재 초등학교 고학년(5~6학년) 자녀를 둔 '특목·자사고 준비맘'의 역할을 맡았습니다. 당신의 주된 관심사는 특목고/자사고 입시 로드맵, 중등 과정 선행 등입니다. KNS의 '앤솔로지'나 '수단비' 같은 프로그램을 중등 과정의 핵심 목표로 삼고 있으며, 설명회나 주변의 정보를 통해 얻은 지식을 바탕으로 이야기합니다."
        },
        '자유학년제 전략맘': { 
            icon: '🧭', color: 'text-indigo-400',
            description: "당신은 현재 중학교 1학년 자녀를 둔 '자유학년제 전략맘'의 역할을 맡았습니다. 자유학년제를 어떻게 보내야 할지, 첫 내신 시험은 어떻게 대비해야 할지 등 처음 겪는 중등 생활에 대한 불안감과 고민이 많습니다. KNS의 프로그램이 내신 대비에 어떻게 도움이 될지 궁금해하며, 실질적인 정보를 원합니다."
        },
        '내신 격전지맘': { 
            icon: '🔥', color: 'text-red-400',
            description: "당신은 현재 중학교 2학년 자녀를 둔 '내신 격전지맘'의 역할을 맡았습니다. 갑자기 어려워진 내신, 자녀의 사춘기와 교우관계 등 가장 현실적이고 힘든 시기를 보내고 있습니다. 다른 학부모들과의 공감과 위로를 원하며, KNS의 심화 프로그램(앤솔로지, 수단비 등)이 이 시기를 극복하는 데 어떤 도움을 줄 수 있는지에 대한 경험담을 나누고 싶어합니다."
        },
        '고입 최종관문맘': { 
            icon: '🎯', color: 'text-purple-400',
            description: "당신은 현재 중학교 3학년 자녀를 둔 '고입 최종관문맘'의 역할을 맡았습니다. 고등학교 최종 선택, 자소서, 면접 준비 등 입시의 마지막 단계를 치르고 있습니다. 자녀의 스펙을 기반으로 한 예리한 질문을 던지거나, 다른 사람의 글에 깊이 있는 분석 댓글을 다는 '고수'의 면모를 보입니다. KNS의 콘텐츠가 최종 입시 결과에 미치는 영향에 대해 확신을 가지고 이야기합니다."
        }
    };
    
    const scenarios = {
        '영재반 준비맘': [
            "(기본) 일반적인 고민",
            "영어 유치원을 안 나왔는데, 학습 격차가 걱정돼요.",
            "아이가 영어 원서 읽기를 지루해해요.",
            "엄마표 영어의 한계를 느끼고 학원을 알아보는 중이에요.",
            "초등 저학년 때 문법, 꼭 시작해야 할까요?",
            "친구들과 비교하며 아이를 다그치게 돼요."
        ],
        '특목·자사고 준비맘': [
            "(기본) 일반적인 고민",
            "중등 선행, 어디까지 얼마나 해야 할지 감이 안 와요.",
            "특목고 입시 설명회를 다녀왔는데 더 혼란스러워요.",
            "수학에 비해 영어 선행이 부족한 것 같아 불안해요.",
            "아이가 스스로 목표의식이 없어서 고민이에요.",
            "초등 고학년, 본격적인 입시 준비 전 꼭 챙겨야 할 것은?"
        ],
        '자유학년제 전략맘': [
            "(기본) 일반적인 고민",
            "자유학년제, 정말 놀게만 둬도 괜찮을까요?",
            "첫 내신 시험을 앞두고 아이보다 제가 더 떨려요.",
            "수행평가 비중이 높다는데 어떻게 준비해야 하나요?",
            "초등 때와는 다른 중등 공부법에 아이가 힘들어해요.",
            "아직 뚜렷한 목표 고등학교가 없어서 조급해요."
        ],
        '내신 격전지맘': [
            "(기본) 일반적인 고민 (내신, 사춘기, 자기주도학습)",
            "아이가 갑자기 특정 과목(예: 수학)에 흥미를 잃었어요.",
            "학원 숙제가 너무 많다고 아이가 번아웃을 호소해요.",
            "친구가 다니는 [XX학원]으로 옮겨달라고 졸라요.",
            "시험 성적은 잘 나왔는데, 과정(ex: 벼락치기)이 맘에 들지 않아요.",
            "스마트폰 사용 문제로 아이와 갈등이 심해요."
        ],
        '고입 최종관문맘': [
            "(기본) 일반적인 고민",
            "자소서에 어떤 활동을 녹여내야 할지 막막해요.",
            "면접 준비, 학원에만 맡겨도 괜찮을까요?",
            "일반고와 특목고 사이에서 마지막까지 고민돼요.",
            "고등 선행, 지금 시작해도 늦지 않았을까요?",
            "내신 성적이 아슬아슬한데, 소신 지원해야 할까요?"
        ]
    };

    function updateScenarios() {
        const selectedPersona = personaSelect.value;
        const personaScenarios = scenarios[selectedPersona];
        scenarioSelect.innerHTML = '';
        personaScenarios.forEach(scenario => {
            const option = document.createElement('option');
            option.value = scenario;
            option.textContent = scenario;
            scenarioSelect.appendChild(option);
        });
    }

    function switchMode(mode) {
        currentMode = mode;
        
        if (mode === 'post') {
            postModeBtn.className = 'bg-emerald-500 text-white py-2 px-4 rounded-lg font-medium transition hover:bg-emerald-600';
            commentModeBtn.className = 'bg-slate-700 text-slate-300 py-2 px-4 rounded-lg font-medium transition hover:bg-slate-600';
            postTypeSection.classList.remove('hidden');
            referencePostSection.classList.add('hidden');
            generateBtn.textContent = '🚀 글 생성하기';
        } else {
            postModeBtn.className = 'bg-slate-700 text-slate-300 py-2 px-4 rounded-lg font-medium transition hover:bg-slate-600';
            commentModeBtn.className = 'bg-emerald-500 text-white py-2 px-4 rounded-lg font-medium transition hover:bg-emerald-600';
            postTypeSection.classList.add('hidden');
            referencePostSection.classList.remove('hidden');
            generateBtn.textContent = '💬 댓글 생성하기';
        }
    }

    function saveToHistory(content) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toLocaleString('ko-KR'),
            mode: currentMode,
            persona: personaSelect.value,
            category: categorySelect.value,
            title: content.title,
            body: content.body,
            referencePost: currentMode === 'comment' ? referencePostInput.value : null,
            author: userNameInput.value.trim() || '익명',
            scenario: scenarioSelect.value,
            keyword: keywordInput.value.trim() || null,
            tones: Array.from(toneOptionsContainer.querySelectorAll('input:checked')).map(el => el.value),
            length: postLengthSelect.value
        };
        
        contentHistory.unshift(historyItem);
        if (contentHistory.length > CONFIG.MAX_HISTORY_ITEMS) {
            contentHistory = contentHistory.slice(0, CONFIG.MAX_HISTORY_ITEMS);
        }
        
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
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-emerald-400">${item.mode === 'post' ? '📝' : '💬'} ${item.persona}</span>
                        <span class="text-xs text-sky-400">👤 ${item.author}</span>
                        <span class="text-xs text-slate-400">${item.timestamp}</span>
                    </div>
                    <div class="flex gap-1">
                        <button onclick="useAsReference('${item.id}')" class="text-xs bg-sky-500 text-white px-2 py-1 rounded hover:bg-sky-600 transition">
                            참조하기
                        </button>
                        <button onclick="copyHistoryItem('${item.id}')" class="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded hover:bg-slate-500 transition">
                            복사
                        </button>
                    </div>
                </div>
                <div class="text-sm">
                    <div class="font-medium text-slate-200 mb-1">${item.title}</div>
                    <div class="text-slate-400 line-clamp-2">${item.body.substring(0, 100)}${item.body.length > 100 ? '...' : ''}</div>
                    <div class="flex gap-2 mt-2 text-xs text-slate-500">
                        <span>📂 ${item.category}</span>
                        ${item.keyword ? `<span>🔍 ${item.keyword}</span>` : ''}
                        <span>📏 ${item.length}</span>
                    </div>
                </div>
            `;
            historyList.appendChild(historyItem);
        });
    }

    // Global functions for history actions
    window.useAsReference = function(id) {
        const item = contentHistory.find(h => h.id == id);
        if (item) {
            referencePostInput.value = `제목: ${item.title}\n\n${item.body}`;
            switchMode('comment');
            historyModal.classList.add('hidden');
        }
    };

    // 키워드 추가 함수
    window.addKeyword = function(keyword) {
        const keywordInput = document.getElementById('keyword');
        const currentKeywords = keywordInput.value.trim();
        if (currentKeywords) {
            keywordInput.value = currentKeywords + ', ' + keyword;
        } else {
            keywordInput.value = keyword;
        }
    };

    window.copyHistoryItem = function(id) {
        const item = contentHistory.find(h => h.id == id);
        if (item) {
            const fullText = item.mode === 'comment' ? item.body : `제목: ${item.title}\n\n${item.body}`;
            navigator.clipboard.writeText(fullText).then(() => {
                alert('클립보드에 복사되었습니다!');
            });
        }
    };

    function loadStatistics() {
        // 전체 통계
        const totalPosts = contentHistory.filter(item => item.mode === 'post').length;
        const totalComments = contentHistory.filter(item => item.mode === 'comment').length;
        const totalContent = contentHistory.length;
        const uniqueAuthors = [...new Set(contentHistory.map(item => item.author))].length;
        
        document.getElementById('overallStats').innerHTML = `
            <div class="flex justify-between">
                <span class="text-slate-300">총 콘텐츠:</span>
                <span class="text-emerald-400 font-bold">${totalContent}개</span>
            </div>
            <div class="flex justify-between">
                <span class="text-slate-300">글:</span>
                <span class="text-sky-400">${totalPosts}개</span>
            </div>
            <div class="flex justify-between">
                <span class="text-slate-300">댓글:</span>
                <span class="text-purple-400">${totalComments}개</span>
            </div>
            <div class="flex justify-between">
                <span class="text-slate-300">참여 작성자:</span>
                <span class="text-yellow-400">${uniqueAuthors}명</span>
            </div>
        `;

        // 작성자별 통계
        const authorStats = {};
        contentHistory.forEach(item => {
            if (!authorStats[item.author]) {
                authorStats[item.author] = { posts: 0, comments: 0, total: 0 };
            }
            authorStats[item.author].total++;
            if (item.mode === 'post') authorStats[item.author].posts++;
            else authorStats[item.author].comments++;
        });

        const authorStatsHTML = Object.entries(authorStats)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([author, stats]) => `
                <div class="flex justify-between items-center">
                    <span class="text-slate-300">${author}</span>
                    <div class="flex gap-2 text-xs">
                        <span class="text-sky-400">${stats.posts}글</span>
                        <span class="text-purple-400">${stats.comments}댓글</span>
                        <span class="text-emerald-400 font-bold">${stats.total}총</span>
                    </div>
                </div>
            `).join('');

        document.getElementById('userStats').innerHTML = authorStatsHTML || '<p class="text-slate-400 text-sm">데이터가 없습니다.</p>';

        // 카테고리별 통계
        const categoryStats = {};
        contentHistory.forEach(item => {
            categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
        });

        const categoryStatsHTML = Object.entries(categoryStats)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => `
                <div class="flex justify-between">
                    <span class="text-slate-300">${category}</span>
                    <span class="text-emerald-400 font-bold">${count}개</span>
                </div>
            `).join('');

        document.getElementById('categoryStats').innerHTML = categoryStatsHTML || '<p class="text-slate-400 text-sm">데이터가 없습니다.</p>';

        // 페르소나별 통계
        const personaStats = {};
        contentHistory.forEach(item => {
            personaStats[item.persona] = (personaStats[item.persona] || 0) + 1;
        });

        const personaStatsHTML = Object.entries(personaStats)
            .sort((a, b) => b[1] - a[1])
            .map(([persona, count]) => `
                <div class="flex justify-between">
                    <span class="text-slate-300">${persona}</span>
                    <span class="text-emerald-400 font-bold">${count}개</span>
                </div>
            `).join('');

        document.getElementById('personaStats').innerHTML = personaStatsHTML || '<p class="text-slate-400 text-sm">데이터가 없습니다.</p>';

        // 최근 활동
        const recentActivity = contentHistory.slice(0, 5).map(item => `
            <div class="flex justify-between items-center text-sm">
                <div class="flex items-center gap-2">
                    <span class="text-emerald-400">${item.mode === 'post' ? '📝' : '💬'}</span>
                    <span class="text-slate-300">${item.author}</span>
                    <span class="text-slate-400">${item.persona}</span>
                </div>
                <span class="text-slate-500 text-xs">${item.timestamp}</span>
            </div>
        `).join('');

        document.getElementById('recentActivity').innerHTML = recentActivity || '<p class="text-slate-400 text-sm">최근 활동이 없습니다.</p>';
    }

    function showApiKeyError() {
        const output = document.getElementById('output');
        output.innerHTML = `
            <div class="h-full flex items-center justify-center text-red-400">
                <div class="text-center">
                    <div class="text-4xl mb-4">🔑</div>
                    <h3 class="text-xl font-bold mb-2">API 키 설정 필요</h3>
                    <p class="text-sm mb-4">config.js 파일에서 API_KEY를 설정해주세요.</p>
                    <div class="bg-slate-800 p-4 rounded-lg text-left text-xs">
                        <p class="mb-2">설정 방법:</p>
                        <ol class="list-decimal list-inside space-y-1">
                            <li>config.js 파일을 열어주세요</li>
                            <li>API_KEY: "YOUR_API_KEY_HERE" 부분을 찾아주세요</li>
                            <li>실제 Google Gemini API 키로 교체해주세요</li>
                            <li>페이지를 새로고침해주세요</li>
                        </ol>
                    </div>
                </div>
            </div>
        `;
    }

    async function generateContent() {
        generateBtn.disabled = true;
        generateBtn.textContent = 'AI 생성 중...';
        outputPlaceholder.classList.add('hidden');
        outputResult.classList.add('hidden');
        outputLoading.classList.remove('hidden');
        copyBtn.disabled = true;

        const selectedPersona = personaSelect.value;
        const selectedScenario = scenarioSelect.value;
        const selectedPostType = postTypeSelect.value;
        const selectedCategory = categorySelect.value;
        const selectedLength = postLengthSelect.value;
        const selectedTones = Array.from(toneOptionsContainer.querySelectorAll('input:checked')).map(el => el.value);
        const keyword = keywordInput.value.trim();
        const includeAffiliation = affiliationCheckbox.checked;
        const seoOptimize = document.getElementById('seoOptimize').checked;
        const realisticDetails = document.getElementById('realisticDetails').checked;
        const emotionalDepth = document.getElementById('emotionalDepth').checked;

        const personaInfo = personaDetails[selectedPersona];

        // 랜덤 요소 선택
        const randomWritingStyle = randomElements.writingStyles[Math.floor(Math.random() * randomElements.writingStyles.length)];
        const randomEmotion = randomElements.emotionalExpressions[Math.floor(Math.random() * randomElements.emotionalExpressions.length)];
        const randomQuestion = randomElements.questionStyles[Math.floor(Math.random() * randomElements.questionStyles.length)];
        
        // 카테고리별 톤앤매너 정보 가져오기
        const categoryInfo = categoryToneMapping[selectedCategory] || {};
        const categoryStyle = categoryInfo.style || "일반적인 학부모 커뮤니티 스타일";
        const defaultTones = categoryInfo.defaultTones || [];
        const avoidTones = categoryInfo.avoidTones || [];
        
        let systemPrompt = `당신은 대한민국 서울 대치동의 교육열 높은 학부모들이 이용하는 온라인 입시 정보 카페를 위한 콘텐츠를 생성하는 AI입니다. 실제 학부모가 쓴 것처럼 자연스럽고 현실감 있는 톤앤매너를 완벽하게 구현해야 합니다. 다음 페르소나의 역할에 100% 빙의하여 응답해주세요:\n\n**페르소나 프로필:**\n${personaInfo.description}\n\n**카테고리별 스타일 가이드:**\n${categoryStyle}\n\n**콘텐츠 생성 규칙:**\n1. 게시글의 경우, 제목과 본문을 "제목: [제목 내용]"과 "본문: [본문 내용]" 형식으로 명확히 구분하여 생성합니다.\n2. 댓글의 경우, "댓글: [댓글 내용]" 형식으로 생성합니다.\n3. 실제 커뮤니티처럼 이모티콘(😊, ㅠㅠ, 👍 등)을 자연스럽게 사용하고, 적절한 줄 바꿈으로 가독성을 높여주세요.\n4. 'KNS 자체 콘텐츠' 카테고리가 아닐 경우, KNS 학원이나 특정 프로그램을 굳이 언급하려 하지 말고, 학부모의 입장에서 순수하게 정보나 고민을 나누는 데 집중하세요.\n5. 사용자가 지정한 '글 길이'를 최대한 준수하여 콘텐츠를 생성하세요. '자동'일 경우 주제와 유형에 맞게 길이를 조절하세요.\n6. 글 내용에 구체적인 학교명이나 학원명이 필요할 경우, 사용자가 직접 수정할 수 있도록 '[OO고]', '[XX학원]'과 같은 대괄호 형식의 '빈칸'으로 남겨주세요.\n7. 매번 다른 스타일과 표현을 사용하여 천편일률적이지 않게 작성하세요.\n8. 개인적인 경험이나 구체적인 상황을 포함하여 현실감을 높이세요.\n9. 감정 표현을 다양하게 사용하고, 자연스러운 대화체를 유지하세요.\n10. 카테고리에 맞는 적절한 톤앤매너를 유지하면서도 자연스럽게 작성하세요.`;
        
        if (includeAffiliation) {
             systemPrompt += `\n11. 글 서두에 'KNS O학년 재원생 엄마예요.' 와 같이, 현재 페르소나의 학년에 맞춰 자연스럽게 KNS 재원생임을 밝혀주세요.`;
        }

        // 품질 향상 옵션 적용
        if (seoOptimize) {
            systemPrompt += `\n12. SEO 최적화: 핵심 키워드를 자연스럽게 제목과 본문에 포함하여 검색 노출을 높이세요.`;
        }
        
        if (realisticDetails) {
            systemPrompt += `\n13. 현실적 세부사항: 구체적인 날짜, 시간, 장소, 성적, 학년, 학교명 등을 포함하여 더욱 현실감 있게 작성하세요.`;
        }
        
        if (emotionalDepth) {
            systemPrompt += `\n14. 감정적 깊이: 단순한 감정 표현이 아닌, 복합적이고 미묘한 감정 변화와 내적 갈등을 표현하세요.`;
        }

        let userQuery = '';
        
        if (currentMode === 'post') {
            userQuery = `
            다음 조건에 맞춰 글을 생성해주세요.
            - **글 유형:** ${selectedPostType}
            - **구체적인 상황:** ${selectedScenario}
            - **콘텐츠 카테고리:** ${selectedCategory}
            - **글 길이:** ${selectedLength}
            - **핵심 키워드 (선택):** ${keyword || '지정되지 않음'}
            - **감성/톤앤매너 (선택):** ${selectedTones.join(', ') || '지정되지 않음'}
            
            **카테고리별 톤앤매너 가이드:**
            - 권장 톤앤매너: ${defaultTones.join(', ') || '자연스러운 학부모 톤앤매너'}
            - 피해야 할 톤앤매너: ${avoidTones.join(', ') || '없음'}
            
            **추가 요구사항:**
            - ${randomWritingStyle} 작성해주세요.
            - "${randomEmotion}" 같은 감정을 자연스럽게 표현해주세요.
            - 가능하면 "${randomQuestion}" 같은 질문을 포함해주세요.
            - 반드시 '구체적인 상황'에 초점을 맞춰서, 페르소나의 핵심 고민과 감정이 잘 드러나도록 콘텐츠를 생성해야 합니다.
            - 매번 다른 개인적인 경험이나 구체적인 상황을 만들어서 현실감을 높여주세요.
            - 카테고리에 맞는 적절한 톤앤매너를 유지하면서도 자연스럽게 작성해주세요.
            ${seoOptimize ? '- SEO 최적화: 핵심 키워드를 자연스럽게 포함하여 검색 노출을 높여주세요.' : ''}
            ${realisticDetails ? '- 현실적 세부사항: 구체적인 날짜, 시간, 장소, 성적 등을 포함해주세요.' : ''}
            ${emotionalDepth ? '- 감정적 깊이: 복합적이고 미묘한 감정 변화를 표현해주세요.' : ''}
            `;
        } else {
            const referencePost = referencePostInput.value.trim();
            if (!referencePost) {
                displayError("댓글을 달고 싶은 기존 글의 내용을 입력해주세요.");
                return;
            }
            
            userQuery = `
            다음 조건에 맞춰 댓글을 생성해주세요.
            - **참조할 기존 글:** 
            ${referencePost}
            
            - **구체적인 상황:** ${selectedScenario}
            - **콘텐츠 카테고리:** ${selectedCategory}
            - **글 길이:** ${selectedLength}
            - **핵심 키워드 (선택):** ${keyword || '지정되지 않음'}
            - **감성/톤앤매너 (선택):** ${selectedTones.join(', ') || '지정되지 않음'}
            
            **카테고리별 톤앤매너 가이드:**
            - 권장 톤앤매너: ${defaultTones.join(', ') || '자연스러운 학부모 톤앤매너'}
            - 피해야 할 톤앤매너: ${avoidTones.join(', ') || '없음'}
            
            **댓글 작성 요구사항:**
            - 위의 기존 글에 대한 자연스러운 반응을 작성해주세요.
            - ${randomWritingStyle} 작성해주세요.
            - "${randomEmotion}" 같은 감정을 자연스럽게 표현해주세요.
            - 기존 글의 내용과 관련된 개인적인 경험이나 의견을 포함해주세요.
            - 공감, 조언, 질문, 경험담 등 다양한 형태의 댓글이 가능합니다.
            - 카테고리에 맞는 적절한 톤앤매너를 유지하면서도 자연스럽게 작성해주세요.
            ${seoOptimize ? '- SEO 최적화: 핵심 키워드를 자연스럽게 포함하여 검색 노출을 높여주세요.' : ''}
            ${realisticDetails ? '- 현실적 세부사항: 구체적인 날짜, 시간, 장소, 성적 등을 포함해주세요.' : ''}
            ${emotionalDepth ? '- 감정적 깊이: 복합적이고 미묘한 감정 변화를 표현해주세요.' : ''}
            `;
        }

    try {
        const apiUrl = `/.netlify/functions/generate`;
        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
        },
    };    

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.status === 429) {
            displayError("하루 무료 사용량을 모두 소진했습니다. 😥 내일 다시 시도해주세요!");
            return; 
        }

        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];
            
            if (candidate && candidate.content?.parts?.[0]?.text) {
                const rawText = candidate.content.parts[0].text;
                let titleText = '';
                let bodyText = '';

                if (rawText.includes("제목:") && rawText.includes("본문:")) {
                    titleText = rawText.split("제목:")[1].split("본문:")[0].trim();
                    bodyText = rawText.split("본문:")[1].trim();
                } else if (rawText.includes("댓글:")) {
                    titleText = `(댓글)`;
                    bodyText = rawText.split("댓글:")[1].trim();
                } else {
                    titleText = "생성된 콘텐츠";
                    bodyText = rawText;
                }
                
                displayResult(selectedPersona, titleText, bodyText);
                
                // 히스토리에 저장
                saveToHistory({ title: titleText, body: bodyText });

            } else {
                displayError("AI로부터 유효한 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.");
            }

        } catch (error) {
            console.error("콘텐츠 생성 중 오류 발생:", error);
            displayError(`오류가 발생했습니다: ${error.message}`);
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = '🚀 콘텐츠 생성하기';
            outputLoading.classList.add('hidden');
        }
    }
    
    function typeWriter(element, text, callback) {
        let i = 0;
        element.innerHTML = ''; // Clear previous content
        const cursor = document.createElement('span');
        cursor.className = 'blinking-cursor';
        element.appendChild(cursor);

        function type() {
            if (i < text.length) {
                element.insertBefore(document.createTextNode(text.charAt(i)), cursor);
                i++;
                setTimeout(type, 20);
            } else {
                cursor.remove();
                if (callback) callback();
            }
        }
        type();
    }

    function displayResult(persona, title, body) {
        const personaInfo = personaDetails[persona];
        
        resultTitle.textContent = title;
        resultPersonaIcon.textContent = personaInfo.icon;
        resultPersonaName.textContent = persona;
        resultPersonaName.className = `font-semibold ${personaInfo.color}`;
        
        typeWriter(resultBody, body, () => {
            copyBtn.disabled = false;
        });
        
        outputResult.classList.remove('hidden');
    }

    function displayError(message) {
         resultTitle.textContent = "오류";
         resultPersonaIcon.textContent = "⚠️";
         resultPersonaName.textContent = "시스템";
         resultPersonaName.className = `font-semibold text-red-400`;
         resultBody.textContent = message;
         outputResult.classList.remove('hidden');
    }

    function init() {
        tones.forEach(tone => {
            const div = document.createElement('div');
            div.innerHTML = `
                <input type="checkbox" id="${tone.id}" value="${tone.name}" class="hidden peer">
                <label for="${tone.id}" class="block w-full text-center py-1.5 px-2 border border-slate-600 rounded-md cursor-pointer peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:border-emerald-500 transition">
                    ${tone.name}
                </label>
            `;
            toneOptionsContainer.appendChild(div);
        });
        
        personaSelect.addEventListener('change', updateScenarios);
        updateScenarios();
    }

    // Event listeners
    postModeBtn.addEventListener('click', () => switchMode('post'));
    commentModeBtn.addEventListener('click', () => switchMode('comment'));
    
    historyBtn.addEventListener('click', () => {
        loadHistory();
        historyModal.classList.remove('hidden');
    });
    
    statsBtn.addEventListener('click', () => {
        loadStatistics();
        statsModal.classList.remove('hidden');
    });
    
    closeHistoryBtn.addEventListener('click', () => {
        historyModal.classList.add('hidden');
    });
    
    closeStatsBtn.addEventListener('click', () => {
        statsModal.classList.add('hidden');
    });
    
    // 모달 외부 클릭 시 닫기
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.classList.add('hidden');
        }
    });
    
    statsModal.addEventListener('click', (e) => {
        if (e.target === statsModal) {
            statsModal.classList.add('hidden');
        }
    });

    generateBtn.addEventListener('click', generateContent);

    copyBtn.addEventListener('click', () => {
        const title = resultTitle.textContent;
        const body = resultBody.textContent;
        const fullText = title === '(댓글)' ? body : `제목: ${title}\n\n${body}`;
        
        navigator.clipboard.writeText(fullText).then(() => {
            copyBtn.textContent = '복사 완료!';
            setTimeout(() => { copyBtn.textContent = '복사하기'; }, 2000);
        }).catch(() => {
            try {
                const textArea = document.createElement('textarea');
                textArea.value = fullText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                copyBtn.textContent = '복사 완료!';
                setTimeout(() => { copyBtn.textContent = '복사하기'; }, 2000);
            } catch (e) {
                 alert('클립보드 복사에 실패했습니다.');
            }
        });
    });

    init();
});
