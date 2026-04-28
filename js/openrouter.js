// ========== HEIRLOOM - ИНТЕГРАЦИЯ С OPENROUTER ==========
// Используем бесплатную модель baidu/qianfan-ocr-fast

const OPENROUTER_CONFIG = {
    apiKey: null,
    model: "baidu/qianfan-ocr-fast:free",
    siteUrl: window.location.origin,
    siteName: "Heirloom Game"
};

function initOpenRouter() {
    console.log('🤖 Инициализация OpenRouter...');
    
    const savedKey = localStorage.getItem('heirloom_api_key');
    if (savedKey && savedKey.startsWith('sk-or-v1-')) {
        OPENROUTER_CONFIG.apiKey = savedKey;
        updateAIStatus(true, "ИИ готов (qianfan-ocr-fast)");
        console.log('✅ API ключ загружен, модель:', OPENROUTER_CONFIG.model);
        return true;
    }
    
    // Проверяем demo-режим
    const demoKey = localStorage.getItem('heirloom_demo_mode');
    if (demoKey === 'true') {
        updateAIStatus(true, "ДЕМО-режим (без API)");
        return true;
    }
    
    updateAIStatus(false, "API ключ не настроен");
    showAPIKeyModal();
    return false;
}

function showAPIKeyModal() {
    // Проверяем, не открыто ли уже окно
    if (document.getElementById('apiKeyModal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'apiKeyModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.95);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #2d2418, #1a1814); padding: 32px; border-radius: 24px; max-width: 450px; text-align: center; border: 2px solid #c9a03d;">
            <h2 style="color: #c9a03d; margin-bottom: 16px;">🤖 OpenRouter AI</h2>
            <p style="margin-bottom: 20px; color: #ccc; font-size: 14px;">
                Для дипломатии ИИ нужен API ключ<br>
                <span style="color: #888;">(можно получить бесплатно на openrouter.io)</span>
            </p>
            <p style="margin-bottom: 10px; font-size: 12px; color: #c9a03d;">
                🎲 Или играйте в ДЕМО-режиме без ИИ
            </p>
            <input type="text" id="apiKeyInput" placeholder="sk-or-v1-..." style="width: 100%; padding: 12px; background: #1a1814; border: 1px solid #c9a03d; border-radius: 12px; color: white; margin-bottom: 16px; font-family: monospace;">
            <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                <button id="saveApiKeyBtn" style="flex: 1; background: #c9a03d; border: none; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer;">💾 Сохранить ключ</button>
                <button id="demoModeBtn" style="flex: 1; background: #2a4b7c; border: none; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer;">🎲 ДЕМО-режим</button>
            </div>
            <button id="closeApiModalBtn" style="background: #5a2a2a; border: none; padding: 10px; border-radius: 12px; cursor: pointer; width: 100%;">❌ Закрыть</button>
            <p style="margin-top: 16px; font-size: 11px; color: #666;">
                <a href="https://openrouter.io/keys" target="_blank" style="color: #c9a03d;">🔑 Получить ключ</a>
                &nbsp;|&nbsp;
                <a href="https://openrouter.io/models" target="_blank" style="color: #c9a03d;">📚 Доступные модели</a>
            </p>
            <p style="margin-top: 12px; font-size: 10px; color: #555;">
                Используется модель: <strong>baidu/qianfan-ocr-fast</strong> (бесплатно)
            </p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('saveApiKeyBtn').onclick = () => {
        const key = document.getElementById('apiKeyInput').value.trim();
        if (key && key.startsWith('sk-or-v1-')) {
            OPENROUTER_CONFIG.apiKey = key;
            localStorage.setItem('heirloom_api_key', key);
            localStorage.removeItem('heirloom_demo_mode');
            updateAIStatus(true, "ИИ готов");
            modal.remove();
            addLog("🤖 OpenRouter AI активирован!", "system");
        } else if (key) {
            alert('❌ Неверный формат ключа. Должен начинаться с sk-or-v1-');
        } else {
            alert('❌ Введите API ключ');
        }
    };
    
    document.getElementById('demoModeBtn').onclick = () => {
        localStorage.setItem('heirloom_demo_mode', 'true');
        localStorage.removeItem('heirloom_api_key');
        updateAIStatus(true, "ДЕМО-режим");
        modal.remove();
        addLog("🎲 ДЕМО-режим: ИИ будет принимать случайные решения", "system");
    };
    
    document.getElementById('closeApiModalBtn').onclick = () => {
        modal.remove();
        updateAIStatus(false, "API отключен");
    };
}

function updateAIStatus(connected, message) {
    const dot = document.getElementById('aiStatusDot');
    const text = document.getElementById('aiStatusText');
    const menuDot = document.getElementById('menuApiDot');
    const menuText = document.getElementById('menuApiText');
    
    if (dot && text) {
        dot.style.backgroundColor = connected ? '#6bff6b' : '#e63946';
        dot.style.boxShadow = connected ? '0 0 8px #6bff6b' : 'none';
        text.textContent = message || (connected ? 'ИИ готов' : 'ИИ отключен');
    }
    
    if (menuDot && menuText) {
        menuDot.style.backgroundColor = connected ? '#6bff6b' : '#e63946';
        menuText.textContent = message || (connected ? 'API активирован' : 'API не настроен');
    }
}

async function askAIForDiplomacy(aiId, playerAction, gameContext) {
    // ДЕМО-режим: случайные ответы
    const isDemoMode = localStorage.getItem('heirloom_demo_mode') === 'true';
    
    if (!OPENROUTER_CONFIG.apiKey && !isDemoMode) {
        return { success: false, error: "API ключ не настроен" };
    }
    
    if (isDemoMode) {
        // Демо-режим: случайные решения
        const decisions = ['accept', 'decline', 'counter'];
        const decision = decisions[Math.floor(Math.random() * decisions.length)];
        const messages = {
            accept: "Мы принимаем ваше предложение.",
            decline: "К сожалению, мы вынуждены отказаться.",
            counter: "Предлагаем обсудить другие условия."
        };
        return {
            success: true,
            decision: decision,
            message: messages[decision]
        };
    }
    
    const ai = gameContext.ais[aiId];
    const player = gameContext.player;
    
    const systemPrompt = `Ты — правитель ${ai.name} в стратегической игре Heirloom.
Твоя задача — принимать дипломатические решения.

Текущее состояние:
- Твоя казна: ${ai.treasury}
- У тебя ${ai.regions.length} регионов
- У игрока ${player.regions.length} регионов, казна ${player.treasury}

Игрок совершил действие: "${playerAction}"

Ответь КРАТКО и в конце укажи решение в формате:
===DECISION===
[accept/decline/counter]
===MESSAGE===
[твой ответ]`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_CONFIG.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: OPENROUTER_CONFIG.model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: playerAction }
                ],
                temperature: 0.7,
                max_tokens: 200
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('OpenRouter API error:', data);
            throw new Error(data.error?.message || 'API error');
        }
        
        const content = data.choices[0].message.content;
        
        const decisionMatch = content.match(/===DECISION===\n(\w+)/);
        const messageMatch = content.match(/===MESSAGE===\n([\s\S]+?)(?=\n===|$)/);
        
        return {
            success: true,
            decision: decisionMatch ? decisionMatch[1] : 'decline',
            message: messageMatch ? messageMatch[1].trim() : content
        };
    } catch (error) {
        console.error("OpenRouter error:", error);
        updateAIStatus(false, "Ошибка связи");
        
        // Fallback: случайное решение при ошибке
        const decisions = ['accept', 'decline', 'counter'];
        const decision = decisions[Math.floor(Math.random() * decisions.length)];
        return {
            success: true,
            decision: decision,
            message: `(Оффлайн режим) ${decision === 'accept' ? 'Мы согласны' : decision === 'decline' ? 'Мы отказываемся' : 'Предлагаем обсудить'}`
        };
    }
}

async function askAIForTurn(aiId, gameContext) {
    const isDemoMode = localStorage.getItem('heirloom_demo_mode') === 'true';
    
    if (!OPENROUTER_CONFIG.apiKey && !isDemoMode) return null;
    
    if (isDemoMode) {
        const actions = ['conquer', 'defense', 'build'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        return { action: action, target: null, reason: "Случайное решение" };
    }
    
    const ai = gameContext.ais[aiId];
    const neutralRegions = Object.values(gameContext.allRegions).filter(r => r.owner === null);
    
    const systemPrompt = `Ты — правитель ${ai.name}. Прими решение на этот ход.
Ответь ТОЛЬКО JSON:
{"action": "conquer/defense/build", "target": "region_id или null", "reason": "кратко"}

Нейтральные регионы рядом: ${neutralRegions.slice(0,5).map(r => r.name).join(', ')}`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_CONFIG.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: OPENROUTER_CONFIG.model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: "Что мне делать в этом ходу?" }
                ],
                temperature: 0.7,
                max_tokens: 150
            })
        });
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return null;
    } catch (error) {
        console.error("OpenRouter AI turn error:", error);
        return null;
    }
}

// Экспорт
window.initOpenRouter = initOpenRouter;
window.askAIForDiplomacy = askAIForDiplomacy;
window.askAIForTurn = askAIForTurn;
window.updateAIStatus = updateAIStatus;
