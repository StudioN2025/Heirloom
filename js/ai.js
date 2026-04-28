// ========== HEIRLOOM - ИИ ЛОГИКА С ПЛАНИРОВАНИЕМ ==========

window.aiRequestQueue = [];
window.isProcessingAI = false;

// Планы для ИИ на несколько ходов вперед
const aiStrategies = {
    ai1: {
        name: "Красная Империя",
        personality: "агрессивный экспансионист",
        focus: "conquer", // conquest, economy, defense
        targetRegion: null,
        priority: []
    },
    ai2: {
        name: "Синее Королевство",
        personality: "сбалансированный стратег",
        focus: "balanced",
        targetRegion: null,
        priority: []
    }
};

async function aiTurn() {
    if (!window.gameState || window.isAIThinking) return;
    
    window.isAIThinking = true;
    addLog(`🌍 Ход ИИ - Империи принимают решения...`, "system");
    
    for (const [aiId, ai] of Object.entries(window.gameState.ais)) {
        if (!ai.regions.length) continue;
        
        addLog(`🏰 ${ai.name} анализирует ситуацию...`, "system");
        
        // Доход ИИ
        const aiIncome = ai.regions.reduce((sum, id) => 
            sum + (window.gameState.allRegions[id]?.gold || 0), 0);
        ai.treasury += aiIncome;
        
        // Обновляем стратегию ИИ
        await updateAIStrategy(aiId, ai);
        
        // Планируем действия на этот ход
        await executeAIPlan(aiId, ai);
        
        await delay(800); // Пауза между ИИ для читаемости
    }
    
    window.isAIThinking = false;
    addLog(`✅ Ход ИИ завершен`, "system");
}

async function updateAIStrategy(aiId, ai) {
    const strategy = aiStrategies[aiId];
    
    // Анализируем окружение
    const neighbors = [];
    const ourRegions = new Set(ai.regions);
    
    for (const regionId of ai.regions) {
        const region = window.gameState.allRegions[regionId];
        if (!region) continue;
        
        for (const neighborId of region.neighbors) {
            const neighbor = window.gameState.allRegions[neighborId];
            if (!neighbor) continue;
            
            if (neighbor.owner === null) {
                neighbors.push({
                    id: neighborId,
                    type: 'neutral',
                    area: getRegionArea(neighborId),
                    defense: neighbor.defense,
                    gold: neighbor.gold,
                    name: neighbor.name
                });
            } else if (neighbor.owner === "player" && window.gameState.wars[aiId]) {
                neighbors.push({
                    id: neighborId,
                    type: 'enemy',
                    area: getRegionArea(neighborId),
                    defense: neighbor.defense,
                    gold: neighbor.gold,
                    name: neighbor.name
                });
            }
        }
    }
    
    // Оценка целей
    const neutralTargets = neighbors.filter(n => n.type === 'neutral');
    const enemyTargets = neighbors.filter(n => n.type === 'enemy');
    
    // Выбираем лучшую цель
    let bestTarget = null;
    let bestScore = -Infinity;
    
    for (const target of neutralTargets) {
        // Для нейтралов: выгода / стоимость
        const cost = target.defense * 2;
        const value = target.gold + (target.area / 100);
        const score = value / cost;
        
        if (score > bestScore && ai.treasury >= cost) {
            bestScore = score;
            bestTarget = target;
        }
    }
    
    // В войне - атакуем врага
    if (window.gameState.wars[aiId] && enemyTargets.length > 0) {
        for (const target of enemyTargets) {
            const cost = target.defense * 3;
            const value = target.gold + (target.area / 50) + 200; // Враг ценнее
            const score = value / cost;
            
            if (score > bestScore && ai.treasury >= cost) {
                bestScore = score;
                bestTarget = target;
                strategy.focus = 'war';
            }
        }
    }
    
    strategy.targetRegion = bestTarget;
    
    if (bestTarget) {
        addLog(`🎯 ${ai.name} выбрал цель: ${bestTarget.name} (оценка: ${bestScore.toFixed(1)})`, "system");
    } else {
        addLog(`⏸️ ${ai.name} не нашел подходящих целей`, "system");
    }
}

async function executeAIPlan(aiId, ai) {
    const strategy = aiStrategies[aiId];
    const target = strategy.targetRegion;
    
    if (!target) return;
    
    const cost = target.type === 'neutral' ? target.defense * 2 : target.defense * 3;
    
    if (ai.treasury >= cost) {
        addLog(`⚔️ ${ai.name} атакует ${target.name}...`, "war");
        await delay(500);
        
        ai.treasury -= cost;
        const region = window.gameState.allRegions[target.id];
        const oldOwner = region.owner;
        
        // Захват
        region.owner = aiId;
        ai.regions.push(target.id);
        
        // Удаляем у старого владельца
        if (oldOwner === "player") {
            const index = window.gameState.player.regions.indexOf(target.id);
            if (index !== -1) window.gameState.player.regions.splice(index, 1);
            addLog(`⚠️ ${ai.name} захватил ВАШ регион ${target.name}!`, "war");
            if (typeof updateUI === 'function') updateUI();
        } else if (oldOwner && oldOwner !== aiId && window.gameState.ais[oldOwner]) {
            const index = window.gameState.ais[oldOwner].regions.indexOf(target.id);
            if (index !== -1) window.gameState.ais[oldOwner].regions.splice(index, 1);
            addLog(`⚔️ ${ai.name} захватил ${target.name} у ${window.gameState.ais[oldOwner]?.name || 'нейтралов'}!`, "war");
        } else {
            addLog(`🏆 ${ai.name} аннексировал ${target.name}!`, "conquer");
        }
        
        if (typeof updateRegionColor === 'function') {
            updateRegionColor(target.id);
        }
        
        await delay(300);
    } else {
        addLog(`💰 ${ai.name} копит ресурсы (нужно ${cost}, есть ${ai.treasury})`, "system");
    }
}

// Функция для повторных запросов с экспоненциальной задержкой
async function fetchWithRetry(url, options, maxRetries = 5, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);
            
            if (response.status === 429) {
                // Rate limit - ждем с экспоненциальной задержкой
                const delayMs = baseDelay * Math.pow(2, attempt - 1);
                console.log(`⏳ Rate limit (429), попытка ${attempt}/${maxRetries}, ждем ${delayMs}ms...`);
                addLog(`⏳ OpenRouter перегружен, повтор через ${Math.floor(delayMs/1000)}с...`, "system");
                await delay(delayMs);
                continue;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            lastError = error;
            if (attempt === maxRetries) throw error;
            
            const delayMs = baseDelay * Math.pow(2, attempt - 1);
            console.log(`⚠️ Ошибка, попытка ${attempt}/${maxRetries}, ждем ${delayMs}ms...`, error);
            await delay(delayMs);
        }
    }
    
    throw lastError;
}

// Обновленная функция askAIForTurn с повторными попытками
async function askAIForTurn(aiId, gameContext) {
    const isDemoMode = localStorage.getItem('heirloom_demo_mode') === 'true';
    
    if (!OPENROUTER_CONFIG.apiKey && !isDemoMode) return null;
    
    const ai = gameContext.ais[aiId];
    const strategy = aiStrategies[aiId];
    
    // Анализируем доступные цели
    const nearbyTargets = [];
    for (const regionId of ai.regions) {
        const region = gameContext.allRegions[regionId];
        if (!region) continue;
        
        for (const neighborId of region.neighbors) {
            const neighbor = gameContext.allRegions[neighborId];
            if (!neighbor) continue;
            
            if (neighbor.owner === null) {
                nearbyTargets.push({
                    id: neighborId,
                    name: neighbor.name,
                    gold: neighbor.gold,
                    defense: neighbor.defense,
                    area: getRegionArea(neighborId),
                    type: 'neutral'
                });
            } else if (neighbor.owner === "player" && gameContext.wars[aiId]) {
                nearbyTargets.push({
                    id: neighborId,
                    name: neighbor.name,
                    gold: neighbor.gold,
                    defense: neighbor.defense,
                    area: getRegionArea(neighborId),
                    type: 'enemy',
                    owner: neighbor.owner
                });
            }
        }
    }
    
    if (isDemoMode) {
        if (nearbyTargets.length > 0 && ai.treasury > 50) {
            const bestTarget = nearbyTargets.sort((a, b) => (b.gold / b.defense) - (a.gold / a.defense))[0];
            return {
                action: bestTarget.type === 'enemy' ? 'war' : 'conquer',
                target: bestTarget.id,
                reason: `Стратегический захват ${bestTarget.name}`
            };
        }
        return { action: "defense", target: null, reason: "Нет целей" };
    }
    
    const systemPrompt = `Ты — ${ai.name}, ${strategy.personality}.
Твоя империя: ${ai.regions.length} регионов, ${ai.treasury} золота.
Доступные цели для захвата:
${nearbyTargets.map(t => `- ${t.name}: защита ${t.defense}, золото ${t.gold}, площадь ${t.area.toFixed(0)} км², тип: ${t.type}`).join('\n') || 'нет целей'}

Ответь ТОЛЬКО JSON (без лишнего текста):
{
    "action": "conquer/war/defense",
    "target_id": "id региона или null",
    "reason": "почему именно этот регион (2-3 предложения стратегического обоснования)"
}

Правила стратегии:
- Атакуй врага, если ты в войне (war)
- Иначе захватывай нейтральные регионы (conquer)
- Учитывай соотношение ценности к стоимости`;

    try {
        const response = await fetchWithRetry("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_CONFIG.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: OPENROUTER_CONFIG.model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Какой регион захватить в этом ходу? У меня ${ai.treasury} золота.` }
                ],
                temperature: 0.8,
                max_tokens: 300
            })
        });
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const decision = JSON.parse(jsonMatch[0]);
            console.log(`🤖 ${ai.name} решил:`, decision);
            
            // Обновляем долгосрочную стратегию
            if (decision.action === 'conquer') {
                strategy.focus = 'conquest';
            } else if (decision.action === 'war') {
                strategy.focus = 'war';
            }
            
            if (decision.target_id && gameContext.allRegions[decision.target_id]) {
                return {
                    action: decision.action,
                    target: decision.target_id,
                    reason: decision.reason
                };
            }
        }
        return null;
    } catch (error) {
        console.error("OpenRouter error:", error);
        addLog(`⚠️ ${ai.name} переходит к стандартной стратегии (ошибка API)`, "system");
        
        // Fallback: захват лучшего нейтрального
        const bestNeutral = nearbyTargets.filter(t => t.type === 'neutral').sort((a, b) => 
            (b.gold / b.defense) - (a.gold / a.defense))[0];
        
        if (bestNeutral && ai.treasury > bestNeutral.defense * 2) {
            return {
                action: "conquer",
                target: bestNeutral.id,
                reason: "Стандартная стратегия (API временно недоступен)"
            };
        }
        return null;
    }
}

// Обновленная askAIForDiplomacy с повторными попытками
async function askAIForDiplomacy(aiId, playerAction, gameContext) {
    const isDemoMode = localStorage.getItem('heirloom_demo_mode') === 'true';
    
    if (!OPENROUTER_CONFIG.apiKey && !isDemoMode) {
        return { success: false, error: "API ключ не настроен" };
    }
    
    if (isDemoMode) {
        const decisions = ['accept', 'decline', 'counter'];
        const decision = decisions[Math.floor(Math.random() * decisions.length)];
        const messages = {
            accept: "Мы принимаем ваше предложение.",
            decline: "К сожалению, мы вынуждены отказаться.",
            counter: "Предлагаем обсудить другие условия."
        };
        return { success: true, decision: decision, message: messages[decision] };
    }
    
    const ai = gameContext.ais[aiId];
    const player = gameContext.player;
    const strategy = aiStrategies[aiId];
    
    const systemPrompt = `Ты — ${ai.name}, ${strategy.personality}.
Твоя империя: ${ai.regions.length} регионов, ${ai.treasury} золота.
У игрока: ${player.regions.length} регионов, ${player.treasury} золота.

Игрок совершил действие: "${playerAction}"

Ответь КРАТКО и в конце укажи решение в формате:
===DECISION===
[accept/decline/counter]
===MESSAGE===
[твой ответ]`;

    try {
        const response = await fetchWithRetry("https://openrouter.ai/api/v1/chat/completions", {
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
        
        // Fallback
        const decisions = ['accept', 'decline', 'counter'];
        const decision = decisions[Math.floor(Math.random() * decisions.length)];
        return {
            success: true,
            decision: decision,
            message: `(Оффлайн) ${decision === 'accept' ? 'Мы согласны' : decision === 'decline' ? 'Мы отказываемся' : 'Предлагаем обсудить'}`
        };
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Экспорт
window.aiTurn = aiTurn;
window.askAIForTurn = askAIForTurn;
window.askAIForDiplomacy = askAIForDiplomacy;
window.fetchWithRetry = fetchWithRetry;
window.aiStrategies = aiStrategies;
