// ========== HEIRLOOM - ИНТЕГРАЦИЯ С OPENROUTER ==========

const OPENROUTER_CONFIG = {
    apiKey: null,
    model: "minimax/minimax-m2.5:free",
    siteUrl: window.location.origin,
    siteName: "Heirloom"
};

function initOpenRouter() {
    const savedKey = localStorage.getItem('heirloom_api_key');
    if (savedKey) {
        OPENROUTER_CONFIG.apiKey = savedKey;
        updateAIStatus(true, "ИИ готов");
        return true;
    }
    showAPIKeyModal();
    return false;
}

function showAPIKeyModal() {
    const modal = document.createElement('div');
    modal.id = 'apiKeyModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: #2d2418; padding: 32px; border-radius: 24px; max-width: 400px; text-align: center; border: 2px solid #c9a03d;">
            <h2 style="color: #c9a03d; margin-bottom: 16px;">🔑 API Ключ OpenRouter</h2>
            <p style="margin-bottom: 20px; color: #ccc;">Для работы ИИ необходим бесплатный API ключ</p>
            <input type="text" id="apiKeyInput" placeholder="sk-or-v1-..." style="width: 100%; padding: 12px; background: #1a1814; border: 1px solid #c9a03d; border-radius: 12px; color: white; margin-bottom: 16px;">
            <button id="saveApiKeyBtn" style="background: #c9a03d; border: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; cursor: pointer;">Сохранить</button>
            <p style="margin-top: 16px; font-size: 12px; color: #888;">Получить ключ: <a href="https://openrouter.io/keys" target="_blank" style="color: #c9a03d;">openrouter.io/keys</a></p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('saveApiKeyBtn').onclick = () => {
        const key = document.getElementById('apiKeyInput').value.trim();
        if (key.startsWith('sk-or-v1-')) {
            OPENROUTER_CONFIG.apiKey = key;
            localStorage.setItem('heirloom_api_key', key);
            updateAIStatus(true, "ИИ готов");
            modal.remove();
        } else {
            alert('Неверный формат ключа. Должен начинаться с sk-or-v1-');
        }
    };
}

function updateAIStatus(connected, message) {
    const dot = document.getElementById('aiStatusDot');
    const text = document.getElementById('aiStatusText');
    if (dot && text) {
        dot.style.background = connected ? '#6bff6b' : '#e63946';
        dot.style.boxShadow = connected ? '0 0 8px #6bff6b' : 'none';
        text.textContent = message || (connected ? 'ИИ готов' : 'ИИ отключен');
    }
}

async function askAIForDiplomacy(aiId, playerAction, gameContext) {
    if (!OPENROUTER_CONFIG.apiKey) {
        return { response: "API ключ не настроен", success: false };
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
                temperature: 0.8,
                max_tokens: 200
            })
        });
        
        const data = await response.json();
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
        return { success: false, error: error.message };
    }
}

async function askAIForTurn(aiId, gameContext) {
    if (!OPENROUTER_CONFIG.apiKey) return null;
    
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

window.initOpenRouter = initOpenRouter;
window.askAIForDiplomacy = askAIForDiplomacy;
window.askAIForTurn = askAIForTurn;
window.updateAIStatus = updateAIStatus;
