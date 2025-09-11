// KNS 카페 콘텐츠 생성기 v3.0 - Dynamic Persona (Full Code)
document.addEventListener('DOMContentLoaded', () => {
    if (!validateApiKey()) {
        showApiKeyError();
        return;
    }

    // --- DOM 요소 ---
    const personaSelect = document.getElementById('persona');
    const scenarioSelect = document.getElementById('scenario');
    const categorySelect = document.getElementById('category');
    const postLengthSelect = document.getElementById('postLength');
    const userNameInput = document.getElementById('userName');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const naverLoginBtn = document.getElementById('naverLoginBtn');
    const naverPostBtn = document.getElementById('naverPostBtn');
    const openPostedBtn = document.getElementById('openPostedBtn');
    const outputPlaceholder = document.getElementById('placeholder');
    const outputLoading = document.getElementById('loading');
    const outputResult = document.getElementById('result');
    const resultTitle = document.getElementById('resultTitle');
    const resultPersonaIcon = document.getElementById('resultPersonaIcon');
    const resultPersonaName = document.getElementById('resultPersonaName');
    const resultBody = document.getElementById('resultBody');
    const rewriteHookBtn = document.getElementById('rewriteHookBtn');
    const rewriteLineBtn = document.getElementById('rewriteLineBtn');
    const cafeIdInput = document.getElementById('cafeIdInput');
    const menuIdInput = document.getElementById('menuIdInput');
    
    // v3.0 UI Elements
    const goalBtnConcern = document.getElementById('goalBtnConcern');
    const goalBtnInfo = document.getElementById('goalBtnInfo');
    const goalBtnDaily = document.getElementById('goalBtnDaily');
    const goalBtnComment = document.getElementById('goalBtnComment');
    const advancedControls = document.getElementById('advancedControls');
    const toggleAdvanced = document.getElementById('toggleAdvanced');

    // 전문가 모드 UI Elements
    const postModeBtn = document.getElementById('postModeBtn');
    const commentModeBtn = document.getElementById('commentModeBtn');
    const postTypeSelect = document.getElementById('postType');
    const postTypeSection = document.getElementById('postTypeSection');
    const referencePostSection = document.getElementById('referencePostSection');
    const referencePostInput = document.getElementById('referencePost');
    
    // 모달 관련
    const historyBtn = document.getElementById('historyBtn');
    const statsBtn = document.getElementById('statsBtn');
    const historyModal = document.getElementById('historyModal');
    const statsModal = document.getElementById('statsModal');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const closeStatsBtn = document.getElementById('closeStatsBtn');
    const historyList = document.getElementById('historyList');
    
    // --- 상태 관리 ---
    let currentMode = 'post';
    let contentHistory = JSON.parse(localStorage.getItem('knsContentHistory') || '[]');
    let lastPostedUrl = null;

    // --- Dynamic Persona 재료 (핵심 기능) ---
    const personaModifiers = {
        personalities: ['정보력이 뛰어나고 꼼꼼한', '다른 엄마들과 교류를 즐기는 사교적인', '아이의 의견을 존중하는 민주적인', '목표 지향적이고 계획적인', '다소 불안감이 높고 예민한', '긍정적이고 낙천적인', '데이터와 통계를 신뢰하는 분석적인', '감성적이고 공감 능력이 뛰어난', '자녀 교육에 대한 주관이 뚜렷한', '유머 감각이 있고 위트있는'],
        situations: ['최근 아이가 성적이 올라 기분이 좋은 상태', '아이의 사춘기 때문에 골머리를 앓고 있는 상태', 'KNS 설명회에서 좋은 정보를 얻어 신이 난 상태', '다른 엄마와의 교육관 차이로 스트레스를 받은 상태', '자녀의 장래희망 때문에 진지하게 고민 중인 상태', '겨울방학 특강을 뭘 들을지 행복한 고민에 빠진 상태', '아이의 스마트폰 사용 문제로 크게 다툰 상태', '시험 결과에 실망했지만, 아이를 다독여주려는 상태', '새로운 입시 정책 발표로 마음이 복잡한 상태', '아이의 학습 태도가 좋아져 뿌듯함을 느끼는 상태', '주변의 기대 때문에 부담감을 느끼는 상태', '자녀의 친구 관계 때문에 걱정이 많은 상태'],
        styles: ['이모티콘(😂, 👍, ㅠㅠ)을 많이 사용하는', '핵심만 간단하게 전달하는', '질문을 던져 다른 사람의 의견을 구하는', '자신의 경험을 상세하게 공유하는', '다소 직설적이고 솔직한 화법을 구사하는', '객관적인 정보를 바탕으로 이야기하는', '따뜻하고 다정한 말투를 사용하는', '유머와 농담을 섞어 분위기를 부드럽게 만드는']
    };

    const personaDetails = {
        '영재반 준비맘': { icon: '🧐', color: 'text-yellow-400' },
        '특목·자사고 준비맘': { icon: '📚', color: 'text-blue-400' },
        '자유학년제 전략맘': { icon: '🧭', color: 'text-indigo-400' },
        '내신 격전지맘': { icon: '🔥', color: 'text-red-400' },
        '고입 최종관문맘': { icon: '🎯', color: 'text-purple-400' }
    };
    
    const scenarios = {
        '영재반 준비맘': ["(기본) 일반적인 고민", "영어 유치원을 안 나왔는데, 학습 격차가 걱정돼요.", "아이가 영어 원서 읽기를 지루해해요.", "엄마표 영어의 한계를 느끼고 학원을 알아보는 중이에요.", "초등 저학년 때 문법, 꼭 시작해야 할까요?", "친구들과 비교하며 아이를 다그치게 돼요."],
        '특목·자사고 준비맘': ["(기본) 일반적인 고민", "중등 선행, 어디까지 얼마나 해야 할지 감이 안 와요.", "특목고 입시 설명회를 다녀왔는데 더 혼란스러워요.", "수학에 비해 영어 선행이 부족한 것 같아 불안해요.", "아이가 스스로 목표의식이 없어서 고민이에요.", "초등 고학년, 본격적인 입시 준비 전 꼭 챙겨야 할 것은?"],
        '자유학년제 전략맘': ["(기본) 일반적인 고민", "자유학년제, 정말 놀게만 둬도 괜찮을까요?", "첫 내신 시험을 앞두고 아이보다 제가 더 떨려요.", "수행평가 비중이 높다는데 어떻게 준비해야 하나요?", "초등 때와는 다른 중등 공부법에 아이가 힘들어해요.", "아직 뚜렷한 목표 고등학교가 없어서 조급해요."],
        '내신 격전지맘': ["(기본) 일반적인 고민 (내신, 사춘기, 자기주도학습)", "아이가 갑자기 특정 과목(예: 수학)에 흥미를 잃었어요.", "학원 숙제가 너무 많다고 아이가 번아웃을 호소해요.", "친구가 다니는 [XX학원]으로 옮겨달라고 졸라요.", "시험 성적은 잘 나왔는데, 과정(ex: 벼락치기)이 맘에 들지 않아요.", "스마트폰 사용 문제로 아이와 갈등이 심해요."],
        '고입 최종관문맘': ["(기본) 일반적인 고민", "자소서에 어떤 활동을 녹여내야 할지 막막해요.", "면접 준비, 학원에만 맡겨도 괜찮을까요?", "일반고와 특목고 사이에서 마지막까지 고민돼요.", "고등 선행, 지금 시작해도 늦지 않았을까요?", "내신 성적이 아슬아슬한데, 소신 지원해야 할까요?"]
    };

    function updateScenarios() {
        const selectedPersona = personaSelect.value;
        const personaScenarios = scenarios[selectedPersona] || [];
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

    async function generateGoalBasedContent(goal) {
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
                alert('댓글을 작성할 기존 글의 내용을 "참조할 글 내용"에 붙여넣고 [콘텐츠 생성하기] 버튼을 눌러주세요.');
                return;
        }

        if (!userNameInput.value.trim()) {
            const name = prompt("콘텐츠를 생성하기 전, 작성자 이름을 입력해주세요. (예: 김마케터)");
            if (!name) return;
            userNameInput.value = name;
            localStorage.setItem('knsContentGeneratorUserName', name);
        }
        await generateContent();
    }

    async function generateContent() {
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(b => b.disabled = true);
        outputPlaceholder.classList.add('hidden');
        outputResult.classList.add('hidden');
        outputLoading.classList.remove('hidden');
        copyBtn.disabled = true;

        const selectedPersona = personaSelect.value;
        
        const randomModifier = {
            personality: personaModifiers.personalities[Math.floor(Math.random() * personaModifiers.personalities.length)],
            situation: personaModifiers.situations[Math.floor(Math.random() * personaModifiers.situations.length)],
            style: personaModifiers.styles[Math.floor(Math.random() * personaModifiers.styles.length)],
        };

        const dynamicPersonaDescription = `당신은 '${selectedPersona}' 역할을 맡았습니다. 
        - 당신의 성격은 '${randomModifier.personality}' 타입입니다.
        - 당신의 현재 상황은 '${randomModifier.situation}'입니다.
        - 당신의 주된 소통 스타일은 '${randomModifier.style}' 방식입니다.
        이 세 가지 조합에 완벽하게 몰입하여, 실제 학부모가 쓴 것처럼 자연스럽고 현실적인 콘텐츠를 생성해주세요.`;

        let systemPrompt = `당신은 대한민국 서울 대치동의 교육열 높은 학부모들이 이용하는 온라인 입시 정보 카페를 위한 콘텐츠를 생성하는 AI입니다. 실제 학부모가 쓴 것처럼 자연스럽고 현실감 있는 톤앤매너를 완벽하게 구현해야 합니다. 다음 페르소나의 역할에 100% 빙의하여 응답해주세요:\n\n**페르소나 프로필:**\n${dynamicPersonaDescription}\n\n**콘텐츠 생성 규칙:**\n1. 게시글의 경우, 제목과 본문을 "제목: [제목 내용]"과 "본문: [본문 내용]" 형식으로 명확히 구분하여 생성합니다.\n2. 댓글의 경우, "댓글: [댓글 내용]" 형식으로 생성합니다.\n3. 실제 커뮤니티처럼 이모티콘(😊, ㅠㅠ, 👍 등)을 자연스럽게 사용하고, 적절한 줄 바꿈으로 가독성을 높여주세요.\n4. 매번 다른 스타일과 표현을 사용하여 천편일률적이지 않게 작성하세요.\n5. 개인적인 경험이나 구체적인 상황을 포함하여 현실감을 높이세요.`;

        let userQuery = '';
        
        if (currentMode === 'post') {
            userQuery = `
            다음 조건에 맞춰 글을 생성해주세요.
            - **글 유형:** ${postTypeSelect.value}
            - **구체적인 상황:** ${scenarioSelect.value}
            - **콘텐츠 카테고리:** ${categorySelect.value}
            - **글 길이:** ${postLengthSelect.value}
            - **요구사항:** 페르소나 프로필에 완벽하게 빙의해서, '구체적인 상황'과 '콘텐츠 카테고리'에 맞는 글을 자연스럽게 작성해주세요.
            `;
        } else {
            const referencePost = referencePostInput.value.trim();
            if (!referencePost) {
                displayError("댓글을 달고 싶은 기존 글의 내용을 입력해주세요.");
                allButtons.forEach(b => b.disabled = false);
                return;
            }
            
            userQuery = `
            다음 조건에 맞춰 댓글을 생성해주세요.
            - **참조할 기존 글:** \n${referencePost}\n
            - **콘텐츠 카테고리:** ${categorySelect.value}
            - **글 길이:** ${postLengthSelect.value}
            - **요구사항:** 위의 '참조할 기존 글'에 대한 자연스러운 반응을 댓글로 작성해주세요. 페르소나 프로필에 완벽하게 빙의해서, 개인적인 경험이나 의견을 포함하여 현실감 있게 작성해야 합니다.
            `;
        }

    try {
        const apiUrl = `/.netlify/functions/generate`;
        const generationConfig = {
            temperature: 1.1,
            topP: 0.95,
            topK: 40,
            candidateCount: 1
        };
        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig
        };    

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);

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
            saveToHistory({ title: titleText, body: bodyText });

        } else {
            displayError("AI로부터 유효한 응답을 받지 못했습니다.");
        }

        } catch (error) {
            console.error("콘텐츠 생성 중 오류 발생:", error);
            displayError(`오류가 발생했습니다: ${error.message}`);
        } finally {
            allButtons.forEach(b => b.disabled = false);
            outputLoading.classList.add('hidden');
        }
    }
    
    function displayResult(persona, title, body) {
        const personaInfo = personaDetails[persona];
        resultTitle.textContent = title;
        resultPersonaIcon.textContent = personaInfo.icon;
        resultPersonaName.textContent = persona;
        resultPersonaName.className = `font-semibold ${personaInfo.color}`;
        resultBody.textContent = body;
        copyBtn.disabled = false;
        naverPostBtn.disabled = false;
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
                        <button onclick="useAsReference('${item.id}')" class="text-xs bg-sky-500 text-white px-2 py-1 rounded hover:bg-sky-600 transition">참조하기</button>
                        <button onclick="copyHistoryItem('${item.id}')" class="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded hover:bg-slate-500 transition">복사</button>
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
            referencePostInput.value = `제목: ${item.title}\n\n${item.body}`;
            switchMode('comment');
            historyModal.classList.add('hidden');
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
        const totalContent = contentHistory.length;
        const uniqueAuthors = [...new Set(contentHistory.map(item => item.author))].length;
        document.getElementById('overallStats').innerHTML = `<div class="flex justify-between"><span class="text-slate-300">총 콘텐츠:</span><span class="text-emerald-400 font-bold">${totalContent}개</span></div><div class="flex justify-between"><span class="text-slate-300">참여 작성자:</span><span class="text-yellow-400">${uniqueAuthors}명</span></div>`;
        
        const authorStats = {};
        contentHistory.forEach(item => {
            authorStats[item.author] = (authorStats[item.author] || 0) + 1;
        });
        document.getElementById('userStats').innerHTML = Object.entries(authorStats).sort((a, b) => b[1] - a[1]).map(([author, count]) => `<div class="flex justify-between items-center"><span class="text-slate-300">${author}</span><span class="text-emerald-400 font-bold">${count}개</span></div>`).join('') || '<p class="text-slate-400 text-sm">데이터가 없습니다.</p>';

        const categoryStats = {};
        contentHistory.forEach(item => {
            categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
        });
        document.getElementById('categoryStats').innerHTML = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).map(([category, count]) => `<div class="flex justify-between"><span class="text-slate-300">${category}</span><span class="text-emerald-400 font-bold">${count}개</span></div>`).join('') || '<p class="text-slate-400 text-sm">데이터가 없습니다.</p>';
        
        const personaStats = {};
        contentHistory.forEach(item => {
            personaStats[item.persona] = (personaStats[item.persona] || 0) + 1;
        });
        document.getElementById('personaStats').innerHTML = Object.entries(personaStats).sort((a, b) => b[1] - a[1]).map(([persona, count]) => `<div class="flex justify-between"><span class="text-slate-300">${persona}</span><span class="text-emerald-400 font-bold">${count}개</span></div>`).join('') || '<p class="text-slate-400 text-sm">데이터가 없습니다.</p>';
    }
    
    async function rewrite(type) {
        try {
            const persona = resultPersonaName.textContent;
            const title = resultTitle.textContent;
            const body = resultBody.textContent;
            const prompt = type === 'hook' ? `아래 글의 첫 문장(후킹 문장)만 더 강렬하고 자연스럽게 1문장으로 바꿔주세요. 같은 의미를 다른 표현으로:\n제목: ${title}\n본문: ${body}` : `아래 글에서 무작위 한 문장을 선택해 같은 의미를 유지하되 표현을 바꿔 1문장으로 제시하세요. (원문 반환 X)\n제목: ${title}\n본문: ${body}`;
            const apiUrl = '/.netlify/functions/generate';
            const payload = { contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: `당신은 ${persona} 페르소나의 말투와 톤을 유지합니다. 결과는 순수 텍스트 1문장만 반환하세요.` }] }, generationConfig: { temperature: 0.9 } };
            const resp = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await resp.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (!text) throw new Error('리라이트 실패');
            if (type === 'hook') {
                const split = body.split('\n');
                split[0] = text;
                resultBody.textContent = split.join('\n');
            } else {
                const sentences = body.split(/([.!?\n])/).reduce((acc, cur, idx, arr) => { if (!acc.length || /[.!?\n]/.test(arr[idx - 1])) acc.push(cur); else acc[acc.length - 1] += cur; return acc; }, []).filter(s => s.trim());
                if (sentences.length > 0) {
                    const randomIndex = Math.floor(Math.random() * sentences.length);
                    sentences[randomIndex] = text;
                    resultBody.textContent = sentences.join('');
                }
            }
        } catch (e) {
            alert(e.message || '리라이트 중 오류');
        }
    }

    function init() {
        personaSelect.addEventListener('change', updateScenarios);
        updateScenarios();
        
        userNameInput.value = localStorage.getItem('knsContentGeneratorUserName') || '';
        userNameInput.addEventListener('change', () => {
            localStorage.setItem('knsContentGeneratorUserName', userNameInput.value.trim());
        });

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
            const body = resultBody.textContent;
            const fullText = title === '(댓글)' ? body : `제목: ${title}\n\n${body}`;
            navigator.clipboard.writeText(fullText).then(() => {
                copyBtn.textContent = '복사 완료!';
                setTimeout(() => { copyBtn.textContent = '복사하기'; }, 2000);
            });
        });

        historyBtn.addEventListener('click', () => { loadHistory(); historyModal.classList.remove('hidden'); });
        statsBtn.addEventListener('click', () => { loadStatistics(); statsModal.classList.remove('hidden'); });
        closeHistoryBtn.addEventListener('click', () => { historyModal.classList.add('hidden'); });
        closeStatsBtn.addEventListener('click', () => { statsModal.classList.add('hidden'); });
        rewriteHookBtn.addEventListener('click', () => rewrite('hook'));
        rewriteLineBtn.addEventListener('click', () => rewrite('line'));

        // Naver Login/Post functions are not included here as they require backend setup.
        // Make sure to add them if you have the corresponding Netlify functions.
    }

    init();
});