// KNS 카페 콘텐츠 생성기 v3.5 - Ultimate Edition (Complete Functions)
document.addEventListener('DOMContentLoaded', () => {
    // config.js가 없거나 validateApiKey 함수가 없을 경우를 대비한 더미 함수
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
    const historyModal = document.getElementById('historyModal');
    const statsModal = document.getElementById('statsModal');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const closeStatsBtn = document.getElementById('closeStatsBtn');
    const historyList = document.getElementById('historyList');
    
    // --- 상태 관리 ---
    let currentMode = 'post';
    let contentHistory = JSON.parse(localStorage.getItem('knsContentHistory') || '[]');
    
    // --- Dynamic Persona 재료 ---
    const personaModifiers = {
        personalities: ['정보력이 뛰어나고 꼼꼼한', '다른 엄마들과 교류를 즐기는 사교적인', '아이의 의견을 존중하는 민주적인', '목표 지향적이고 계획적인', '다소 불안감이 높고 예민한', '긍정적이고 낙천적인', '데이터와 통계를 신뢰하는 분석적인', '감성적이고 공감 능력이 뛰어난', '자녀 교육에 대한 주관이 뚜렷한', '유머 감각이 있고 위트있는'],
        situations: ['최근 아이가 성적이 올라 기분이 좋은 상태', '아이의 사춘기 때문에 골머리를 앓고 있는 상태', 'KNS 설명회에서 좋은 정보를 얻어 신이 난 상태', '다른 엄마와의 교육관 차이로 스트레스를 받은 상태', '자녀의 장래희망 때문에 진지하게 고민 중인 상태', '겨울방학 특강을 뭘 들을지 행복한 고민에 빠진 상태', '아이의 스마트폰 사용 문제로 크게 다툰 상태', '시험 결과에 실망했지만, 아이를 다독여주려는 상태', '새로운 입시 정책 발표로 마음이 복잡한 상태', '아이의 학습 태도가 좋아져 뿌듯함을 느끼는 상태', '주변의 기대 때문에 부담감을 느끼는 상태', '자녀의 친구 관계 때문에 걱정이 많은 상태'],
        styles: ['이모티콘(😂, 👍, ㅠㅠ)을 많이 사용하는', '핵심만 간단하게 전달하는', '질문을 던져 다른 사람의 의견을 구하는', '자신의 경험을 상세하게 공유하는', '다소 직설적이고 솔직한 화법을 구사하는', '객관적인 정보를 바탕으로 이야기하는', '따뜻하고 다정한 말투를 사용하는', '유머와 농담을 섞어 분위기를 부드럽게 만드는']
    };
    const personaDetails = {
        '영재반 준비맘': { icon: '🧐', color: 'text-yellow-400' }, '특목·자사고 준비맘': { icon: '📚', color: 'text-blue-400' }, '자유학년제 전략맘': { icon: '🧭', color: 'text-indigo-400' }, '내신 격전지맘': { icon: '🔥', color: 'text-red-400' }, '고입 최종관문맘': { icon: '🎯', color: 'text-purple-400' }
    };

    function switchMode(mode) {
        currentMode = mode;
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
                alert('댓글을 작성할 기존 글의 내용을 "참조할 글 내용"에 붙여넣고 [전문가 모드로 생성하기] 버튼을 눌러주세요.');
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
    
    function getSmartInstruction(category) {
        let instruction = "";
        switch(category) {
            case 'KNS 자체 콘텐츠':
            case '학원 생활/시스템 문의':
                instruction = "6. **[주제 집중!] 당신은 지금 KNS 학원과 직접 관련된 글을 쓰고 있습니다. KNS의 프로그램, 시스템, 영어 교육 방식에 대해 집중적으로 이야기해주세요.**";
                break;
            case '학습법/공부 습관':
            case '학교 정보/입시 전략':
                instruction = "6. **[주제 유연성] 다른 과목(수학, 국어 등)에 대한 고민을 자유롭게 이야기해도 좋습니다. 하지만 만약 자연스러운 기회가 생긴다면, 영어 실력이 다른 과목에 미치는 긍정적인 영향에 대해 살짝 언급해줄 수 있습니다. 억지로 연결하지는 마세요.**";
                break;
            case '자녀 관계/멘탈 관리':
            case '일상/유머':
                instruction = "6. **[공감 집중!] 지금은 공부나 학원 이야기는 잠시 접어두세요. 아이와의 관계, 엄마의 감정, 소소한 일상 등 순수하게 감성적이고 인간적인 부분에 100% 집중하여 공감과 위로를 주는 글을 작성해주세요.**";
                break;
            default:
                instruction = "6. KNS는 영어가 중심인 학원이라는 점을 기억해주세요.";
        }
        
        const selectedLength = postLengthSelect.value;
        if (selectedLength === "짧게") {
            instruction += "\n7. **[글 길이 절대 규칙!] 당신은 '짧게' 쓰라는 명령을 받았습니다. 반드시 1~3개의 문장으로 글을 마무리해야 합니다. 이 규칙은 선택이 아닌 필수입니다.**";
        } else if (selectedLength === "보통") {
            instruction += "\n7. **[글 길이 절대 규칙!] 당신은 '보통' 길이로 쓰라는 명령을 받았습니다. 반드시 4~7개의 문장으로 글을 작성해야 합니다. 이 규칙은 선택이 아닌 필수입니다.**";
        } else if (selectedLength === "길게") {
            instruction += "\n7. **[글 길이 절대 규칙!] 당신은 '길게' 쓰라는 명령을 받았습니다. 반드시 8개 이상의 문장과 여러 문단으로 글을 작성해야 합니다. 이 규칙은 선택이 아닌 필수입니다.**";
        }
        return instruction;
    }

    async function generateContent() {
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(b => b.disabled = true);
        outputPlaceholder.classList.add('hidden');
        outputResult.classList.add('hidden');
        outputLoading.classList.remove('hidden');

        const selectedPersona = personaSelect.value;
        const selectedCategory = categorySelect.value;
        
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
        
        const smartInstruction = getSmartInstruction(selectedCategory);

        let systemPrompt = `당신은 대한민국 서울 대치동의 학부모들이 이용하는 온라인 입시 정보 카페를 위한 콘텐츠를 생성하는 AI입니다. 실제 학부모가 쓴 것처럼 자연스럽고 현실감 있는 톤앤매너를 완벽하게 구현해야 합니다. 다음 페르소나의 역할에 100% 빙의하여 응답해주세요:\n\n**페르소나 프로필:**\n${dynamicPersonaDescription}\n\n**콘텐츠 생성 규칙:**\n1. 게시글의 경우, 제목과 본문을 "제목: [제목 내용]"과 "본문: [본문 내용]" 형식으로 명확히 구분하여 생성합니다.\n2. 댓글의 경우, "댓글: [댓글 내용]" 형식으로 생성합니다.\n3. 실제 커뮤니티처럼 이모티콘(😊, ㅠㅠ, 👍 등)을 자연스럽게 사용하고, 적절한 줄 바꿈으로 가독성을 높여주세요.\n4. 매번 다른 스타일과 표현을 사용하여 천편일률적이지 않게 작성하세요.\n5. 개인적인 경험이나 구체적인 상황을 포함하여 현실감을 높이세요.\n${smartInstruction}`;

        let userQuery = '';
        if (currentMode === 'post') {
            userQuery = `다음 조건에 맞춰 글을 생성해주세요.\n- 글 유형: ${postTypeSelect.value}\n- 콘텐츠 카테고리: ${selectedCategory}`;
        } else {
            const referencePost = referencePostInput.value.trim();
            if (!referencePost) {
                displayError("댓글을 달고 싶은 기존 글의 내용을 입력해주세요.");
                allButtons.forEach(b => b.disabled = false);
                return;
            }
            userQuery = `다음 조건에 맞춰 댓글을 생성해주세요.\n- 참조할 기존 글: \n${referencePost}\n- 콘텐츠 카테고리: ${selectedCategory}`;
        }

        try {
            const response = await fetch(`/.netlify/functions/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userQuery }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: { temperature: 1.1, topP: 0.95, topK: 40 }
                })
            });
            if (!response.ok) throw new Error(`API 요청 실패: ${response.status}`);
            const result = await response.json();
            const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
                let titleText = "생성된 콘텐츠", bodyText = rawText;
                if (rawText.includes("제목:") && rawText.includes("본문:")) {
                    titleText = rawText.split("제목:")[1].split("본문:")[0].trim();
                    bodyText = rawText.split("본문:")[1].trim();
                } else if (rawText.includes("댓글:")) {
                    titleText = `(댓글)`;
                    bodyText = rawText.split("댓글:")[1].trim();
                }
                displayResult(selectedPersona, titleText, bodyText);
                saveToHistory({ title: titleText, body: bodyText });
            } else {
                displayError("AI로부터 유효한 응답을 받지 못했습니다.");
            }
        } catch (error) {
            console.error("Content generation error:", error);
            displayError(`오류가 발생했습니다: ${error.message}`);
        } finally {
            allButtons.forEach(b => b.disabled = false);
            outputLoading.classList.add('hidden');
        }
    }
    
    function typeWriter(element, text, callback) {
        let i = 0;
        element.innerHTML = '';
        const cursor = document.createElement('span');
        cursor.className = 'blinking-cursor';
        element.appendChild(cursor);
    
        function type() {
            if (i < text.length) {
                element.insertBefore(document.createTextNode(text.charAt(i)), cursor);
                i++;
                setTimeout(type, 15);
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
    
    function saveToHistory(content) {
        const historyItem = { id: Date.now(), timestamp: new Date().toLocaleString('ko-KR'), mode: currentMode, persona: personaSelect.value, category: categorySelect.value, title: content.title, body: content.body, author: userNameInput.value.trim() || '익명' };
        contentHistory.unshift(historyItem);
        const maxHistory = (window.CONFIG && window.CONFIG.MAX_HISTORY_ITEMS) || 100;
        if (contentHistory.length > maxHistory) contentHistory = contentHistory.slice(0, maxHistory);
        localStorage.setItem('knsContentHistory', JSON.stringify(contentHistory));
    }
    
    // --- 아래부터 비어있던 함수들을 모두 채웁니다 ---

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
            referencePostInput.value = item.mode === 'comment' ? item.referencePost : `제목: ${item.title}\n\n${item.body}`;
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

        // Overall Stats
        const totalContent = contentHistory.length;
        const totalPosts = contentHistory.filter(item => item.mode === 'post').length;
        const totalComments = contentHistory.length - totalPosts;
        const uniqueAuthors = [...new Set(contentHistory.map(item => item.author).filter(Boolean))].length;
        overallStatsEl.innerHTML = `
            <div class="flex justify-between"><span>총 콘텐츠:</span><span class="font-bold text-emerald-400">${totalContent}개</span></div>
            <div class="flex justify-between"><span>글 / 댓글:</span><span>${totalPosts}개 / ${totalComments}개</span></div>
            <div class="flex justify-between"><span>참여 작성자:</span><span class="font-bold text-yellow-400">${uniqueAuthors}명</span></div>
        `;

        // User Stats
        const authorStats = {};
        contentHistory.forEach(item => { authorStats[item.author] = (authorStats[item.author] || 0) + 1; });
        userStatsEl.innerHTML = Object.entries(authorStats).sort((a, b) => b[1] - a[1]).map(([author, count]) => `<div class="flex justify-between"><span>${author}</span><span class="font-bold text-emerald-400">${count}개</span></div>`).join('') || '<p class="text-slate-400 text-sm">데이터가 없습니다.</p>';

        // Category Stats
        const categoryStats = {};
        contentHistory.forEach(item => { categoryStats[item.category] = (categoryStats[item.category] || 0) + 1; });
        categoryStatsEl.innerHTML = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).map(([category, count]) => `<div class="flex justify-between"><span>${category}</span><span class="font-bold text-emerald-400">${count}개</span></div>`).join('') || '<p class="text-slate-400 text-sm">데이터가 없습니다.</p>';

        // Persona Stats
        const personaStats = {};
        contentHistory.forEach(item => { personaStats[item.persona] = (personaStats[item.persona] || 0) + 1; });
        personaStatsEl.innerHTML = Object.entries(personaStats).sort((a, b) => b[1] - a[1]).map(([persona, count]) => `<div class="flex justify-between"><span>${persona}</span><span class="font-bold text-emerald-400">${count}개</span></div>`).join('') || '<p class="text-slate-400 text-sm">데이터가 없습니다.</p>';
        
        // Recent Activity
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
            
            const response = await fetch('/.netlify/functions/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: { parts: [{ text: `당신은 '${persona}' 페르소나의 말투와 톤을 유지합니다. 다른 부연설명 없이, 오직 결과물인 1개의 문장만 생성해주세요.` }] },
                    generationConfig: { temperature: 0.9 }
                })
            });

            if (!response.ok) throw new Error('Rewrite API 요청 실패');
            
            const data = await response.json();
            const newText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (!newText) throw new Error('새로운 문장을 생성하지 못했습니다.');

            let newBody = "";
            if (type === 'hook') {
                const parts = originalBody.split('\n');
                parts[0] = newText;
                newBody = parts.join('\n');
            } else {
                // 가장 긴 문장을 교체하는 로직
                const sentences = originalBody.split(/([.!?\n]+)/);
                if (sentences.length <= 1) {
                    newBody = newText;
                } else {
                    let longestIndex = -1;
                    let maxLength = 0;
                    sentences.forEach((s, i) => {
                        if (s.length > maxLength) {
                            maxLength = s.length;
                            longestIndex = i;
                        }
                    });
                    if (longestIndex !== -1) {
                        sentences[longestIndex] = newText;
                    }
                    newBody = sentences.join('');
                }
            }
            typeWriter(resultBody, newBody);

        } catch (e) {
            alert(e.message || '문장 교체 중 오류가 발생했습니다.');
        }
    }


    function init() {
        userNameInput.value = localStorage.getItem('knsContentGeneratorUserName') || '';
        userNameInput.addEventListener('change', () => localStorage.setItem('knsContentGeneratorUserName', userNameInput.value.trim()));
        
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
            const body = resultBody.innerText; // 수정된 내용을 가져오기 위해 innerText 사용
            const fullText = title === '(댓글)' ? body : `제목: ${title}\n\n${body}`;
            navigator.clipboard.writeText(fullText).then(() => {
                copyBtn.textContent = '복사 완료!';
                setTimeout(() => { copyBtn.textContent = '수정 완료 & 복사'; }, 2000);
            });
        });
        
        historyBtn.addEventListener('click', () => { loadHistory(); historyModal.classList.remove('hidden'); });
        statsBtn.addEventListener('click', () => { loadStatistics(); statsModal.classList.remove('hidden'); });
        closeHistoryBtn.addEventListener('click', () => { historyModal.classList.add('hidden'); });
        closeStatsBtn.addEventListener('click', () => { statsModal.classList.add('hidden'); });
        
        rewriteHookBtn.addEventListener('click', () => rewrite('hook'));
        rewriteLineBtn.addEventListener('click', () => rewrite('line'));
    }

    init();
});

