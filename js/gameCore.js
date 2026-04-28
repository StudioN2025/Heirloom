// ========== HEIRLOOM - ОСНОВНАЯ ИГРОВАЯ ЛОГИКА ==========

window.gameState = null;

function initGameState() {
    window.gameState = {
        player: {
            name: "Heirloom Empire",
            treasury: 500,
            stability: 70,
            regions: []
        },
        ais: {
            ai1: { name: "Красная Империя", color: "#e63946", treasury: 400, stability: 65, regions: [] },
            ai2: { name: "Синее Королевство", color: "#4895ef", treasury: 450, stability: 70, regions: [] }
        },
        turn: 0,
        wars: { ai1: false, ai2: false },
        allRegions: {}
    };
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

function getRegionArea(regionId) {
    const element = document.getElementById(regionId);
    if (!element) return 100; // значение по умолчанию
    
    try {
        const bbox = element.getBBox();
        const area = bbox.width * bbox.height;
        return Math.max(50, Math.min(5000, area)); // ограничиваем от 50 до 5000
    } catch(e) {
        return 100;
    }
}

function calculateConquerCost(region) {
    // Площадь региона (чем больше, тем дороже)
    const area = getRegionArea(region.id);
    
    // Базовая стоимость от площади
    let cost = Math.floor(area / 3);
    
    // Модификатор от защиты
    cost = Math.floor(cost * (1 + region.defense / 100));
    
    // Бонус от населения
    cost = Math.floor(cost + region.population * 5);
    
    // Штраф за экспансию (чем больше у тебя регионов, тем дороже)
    const regionCount = window.gameState.player.regions.length;
    const expansionPenalty = Math.floor(regionCount * 1.5);
    cost = Math.floor(cost + expansionPenalty);
    
    // Минимальная и максимальная стоимость
    cost = Math.max(30, Math.min(800, cost));
    
    return cost;
}

function canConquerRegion(regionId) {
    if (!window.gameState) return false;
    const region = window.gameState.allRegions[regionId];
    if (!region || region.owner === "player") return false;
    
    // Нельзя захватывать союзников (если не в войне)
    if (region.owner === 'ai1' && !window.gameState.wars.ai1) return false;
    if (region.owner === 'ai2' && !window.gameState.wars.ai2) return false;
    
    return region.neighbors.some(neighborId => {
        const neighbor = window.gameState.allRegions[neighborId];
        return neighbor && neighbor.owner === "player";
    });
}

function getOwnerName(owner) {
    if (!window.gameState) return "❓";
    if (owner === "player") return "Ваша Империя";
    if (owner === "ai1") return window.gameState.ais.ai1.name;
    if (owner === "ai2") return window.gameState.ais.ai2.name;
    return "🌿 Нейтральная";
}

function addLog(message, type = "system") {
    const logContainer = document.getElementById('logContainer');
    if (!logContainer) return;
    
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const turn = window.gameState?.turn || 0;
    entry.innerHTML = `[Ход ${turn}] ${message}`;
    logContainer.insertBefore(entry, logContainer.firstChild);
    
    while (logContainer.children.length > 100) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

function updateUI() {
    if (!window.gameState) return;
    
    const playerRegions = window.gameState.player.regions;
    const totalPop = playerRegions.reduce((sum, id) => 
        sum + (window.gameState.allRegions[id]?.population || 0), 0);
    
    const turnEl = document.getElementById('turnCount');
    const treasuryEl = document.getElementById('treasury');
    const regionCountEl = document.getElementById('regionCount');
    const totalPopEl = document.getElementById('totalPop');
    
    if (turnEl) turnEl.textContent = window.gameState.turn;
    if (treasuryEl) treasuryEl.textContent = window.gameState.player.treasury;
    if (regionCountEl) regionCountEl.textContent = playerRegions.length;
    if (totalPopEl) totalPopEl.textContent = totalPop.toFixed(1);
    
    updateWarStatus();
}

function updateWarStatus() {
    const statusDiv = document.getElementById('warStatus');
    if (!statusDiv) return;
    
    const select = document.getElementById('aiSelect');
    if (!select) return;
    
    const target = select.value;
    const isAtWar = window.gameState?.wars[target];
    const aiName = window.gameState?.ais[target]?.name || '';
    
    if (isAtWar) {
        statusDiv.innerHTML = `⚔️ ВОЙНА с ${aiName}! Атакуй их регионы!`;
        statusDiv.className = 'war-status at-war';
    } else {
        statusDiv.innerHTML = `🕊️ Мир с ${aiName}. Объяви войну для атаки их регионов.`;
        statusDiv.className = 'war-status at-peace';
    }
}

// ========== ОСНОВНЫЕ ИГРОВЫЕ ДЕЙСТВИЯ ==========

function conquerRegion() {
    if (!window.selectedRegionId || window.isProcessing || !window.gameState) return;
    
    const region = window.gameState.allRegions[window.selectedRegionId];
    if (!region || region.owner === "player") return;
    if (!canConquerRegion(window.selectedRegionId)) return;
    
    // РАСЧЕТ СТОИМОСТИ ОТ ПЛОЩАДИ
    const cost = calculateConquerCost(region);
    const area = getRegionArea(region.id);
    
    if (window.gameState.player.treasury < cost) {
        addLog(`❌ Не хватает ${cost} золота для захвата ${region.name}! (${area.toFixed(0)} км², защита ${region.defense})`, "war");
        return;
    }
    
    window.isProcessing = true;
    window.gameState.player.treasury -= cost;
    
    // Запоминаем старого владельца для лога
    const oldOwner = region.owner;
    
    // Удаляем у старого владельца
    if (region.owner && region.owner !== "player") {
        const oldOwnerObj = window.gameState.ais[region.owner];
        if (oldOwnerObj) {
            const index = oldOwnerObj.regions.indexOf(window.selectedRegionId);
            if (index !== -1) oldOwnerObj.regions.splice(index, 1);
        }
    }
    
    // Передаем игроку
    region.owner = "player";
    window.gameState.player.regions.push(window.selectedRegionId);
    
    if (typeof updateRegionColor === 'function') {
        updateRegionColor(window.selectedRegionId);
    }
    
    addLog(`✅ Захвачен ${region.name}! Потрачено ${cost}💰 (${area.toFixed(0)} км²)`, "conquer");
    
    updateUI();
    if (typeof selectRegion === 'function') {
        selectRegion(window.selectedRegionId);
    }
    
    checkVictory();
    window.isProcessing = false;
}

function checkVictory() {
    if (!window.gameState) return;
    const totalRegions = Object.keys(window.gameState.allRegions).length;
    const playerRegions = window.gameState.player.regions.length;
    
    if (playerRegions >= totalRegions) {
        addLog(`🏆 ПОБЕДА! Вы захватили все ${totalRegions} регионов! 🏆`, "system");
        setTimeout(() => {
            alert(`🏆 ПОБЕДА! 🏆\n\nВы создали вечную империю, контролируя все земли!`);
        }, 100);
    }
}

function endTurn() {
    if (window.isProcessing || !window.gameState) return;
    window.isProcessing = true;
    
    window.gameState.turn++;
    
    // РАСЧЕТ ДОХОДА ОТ ПЛОЩАДИ (большие регионы приносят больше)
    let totalIncome = 0;
    let largestRegion = { name: "", area: 0 };
    
    for (const id of window.gameState.player.regions) {
        const region = window.gameState.allRegions[id];
        if (region) {
            const area = getRegionArea(id);
            // Доход зависит от площади и золота региона
            let income = Math.floor(region.gold * (area / 500));
            income = Math.max(5, Math.min(150, income));
            totalIncome += income;
            
            if (area > largestRegion.area) {
                largestRegion = { name: region.name, area: area };
            }
        }
    }
    
    // Штраф за коррупцию (чем больше регионов, тем меньше эффективность)
    const regionCount = window.gameState.player.regions.length;
    const corruption = Math.min(0.7, regionCount / 300);
    const finalIncome = Math.floor(totalIncome * (1 - corruption));
    
    window.gameState.player.treasury += finalIncome;
    
    addLog(`📅 Ход ${window.gameState.turn} завершен.`, "system");
    addLog(`   💰 Доход: +${finalIncome} (${regionCount} регионов, коррупция ${Math.floor(corruption*100)}%)`, "system");
    if (largestRegion.area > 0) {
        addLog(`   🏔️ Крупнейший регион: ${largestRegion.name} (${largestRegion.area.toFixed(0)} км²)`, "system");
    }
    
    // Ход ИИ
    if (typeof aiTurn === 'function') {
        aiTurn();
    }
    
    updateUI();
    if (window.selectedRegionId && typeof selectRegion === 'function') {
        selectRegion(window.selectedRegionId);
    }
    
    window.isProcessing = false;
}

// ========== СОХРАНЕНИЕ И ЗАГРУЗКА ==========

function saveGame() {
    if (!window.gameState) return;
    
    const saveData = {
        version: "2.0",
        timestamp: Date.now(),
        gameState: {
            player: window.gameState.player,
            ais: window.gameState.ais,
            turn: window.gameState.turn,
            wars: window.gameState.wars
        },
        regionsOwners: {}
    };
    
    for (const [id, region] of Object.entries(window.gameState.allRegions)) {
        if (region.owner) saveData.regionsOwners[id] = region.owner;
    }
    
    localStorage.setItem('heirloom_save', JSON.stringify(saveData));
    addLog("💾 Игра сохранена!", "system");
}

function loadGame() {
    const saveData = localStorage.getItem('heirloom_save');
    if (!saveData) {
        addLog("❌ Нет сохраненной игры!", "war");
        return false;
    }
    
    try {
        const loaded = JSON.parse(saveData);
        window.gameState.player = loaded.gameState.player;
        window.gameState.ais = loaded.gameState.ais;
        window.gameState.turn = loaded.gameState.turn;
        window.gameState.wars = loaded.gameState.wars;
        
        // Сбрасываем владельцев
        for (const id in window.gameState.allRegions) {
            window.gameState.allRegions[id].owner = null;
        }
        window.gameState.player.regions = [];
        for (const ai of Object.values(window.gameState.ais)) {
            ai.regions = [];
        }
        
        // Восстанавливаем владельцев
        for (const [id, owner] of Object.entries(loaded.regionsOwners)) {
            if (window.gameState.allRegions[id]) {
                window.gameState.allRegions[id].owner = owner;
                if (owner === "player") {
                    window.gameState.player.regions.push(id);
                } else if (window.gameState.ais[owner]) {
                    window.gameState.ais[owner].regions.push(id);
                }
                if (typeof updateRegionColor === 'function') {
                    updateRegionColor(id);
                }
            }
        }
        
        addLog("📂 Игра загружена!", "system");
        updateUI();
        return true;
        
    } catch (e) {
        console.error('Ошибка загрузки:', e);
        addLog("❌ Ошибка загрузки сохранения!", "war");
        return false;
    }
}

function resetGame() {
    if (!window.gameState) return;
    if (!confirm("Сбросить игру? Весь прогресс будет потерян!")) return;
    
    for (const id in window.gameState.allRegions) {
        window.gameState.allRegions[id].owner = null;
        if (typeof updateRegionColor === 'function') {
            updateRegionColor(id);
        }
    }
    
    window.gameState.player = {
        name: "Heirloom Empire",
        treasury: 500,
        stability: 70,
        regions: []
    };
    window.gameState.ais = {
        ai1: { name: "Красная Империя", color: "#e63946", treasury: 400, stability: 65, regions: [] },
        ai2: { name: "Синее Королевство", color: "#4895ef", treasury: 450, stability: 70, regions: [] }
    };
    window.gameState.turn = 0;
    window.gameState.wars = { ai1: false, ai2: false };
    
    assignStartingRegions();
    updateUI();
    window.selectedRegionId = null;
    
    const panel = document.getElementById('selectedRegionPanel');
    if (panel) panel.innerHTML = '<div class="placeholder">Кликните на карту</div>';
    
    addLog("🔄 Игра сброшена! Начинаем новую эпоху.", "system");
}

// ========== UI И ВЫБОР РЕГИОНА ==========

function selectRegion(regionId) {
    if (!window.gameState) return;
    
    window.selectedRegionId = regionId;
    const region = window.gameState.allRegions[regionId];
    if (!region) return;
    
    const panel = document.getElementById('selectedRegionPanel');
    const conquerBtn = document.getElementById('conquerBtn');
    
    if (region.owner === "player") {
        const area = getRegionArea(regionId);
        panel.innerHTML = `
            <p><strong>${region.name}</strong> <span style="color:#3a86ff">(ваш)</span></p>
            <p><span>📐 Площадь:</span> <span>${area.toFixed(0)} км²</span></p>
            <p><span>👥 Население:</span> <span>${region.population}M</span></p>
            <p><span>💰 Золото:</span> <span>+${region.gold}/ход</span></p>
            <p><span>🛡️ Оборона:</span> <span>${region.defense}</span></p>
            <p><span>🔗 Соседей:</span> <span>${region.neighbors.length}</span></p>
        `;
        if (conquerBtn) {
            conquerBtn.disabled = true;
            conquerBtn.textContent = "✓ Уже ваш";
        }
    } else {
        const canConquer = canConquerRegion(regionId);
        const ownerName = getOwnerName(region.owner);
        const cost = calculateConquerCost(region);
        const area = getRegionArea(regionId);
        
        panel.innerHTML = `
            <p><strong>${region.name}</strong></p>
            <p><span>📐 Площадь:</span> <span>${area.toFixed(0)} км²</span></p>
            <p><span>👑 Владелец:</span> <span>${ownerName}</span></p>
            <p><span>👥 Население:</span> <span>${region.population}M</span></p>
            <p><span>💰 Золото:</span> <span>${region.gold}</span></p>
            <p><span>🛡️ Оборона:</span> <span>${region.defense}</span></p>
            <p><span>💰 Стоимость:</span> <span>${cost}</span></p>
            <p><span>🔗 Соседей:</span> <span>${region.neighbors.length}</span></p>
        `;
        if (conquerBtn) {
            conquerBtn.disabled = !canConquer;
            conquerBtn.textContent = canConquer ? `⚔️ Захватить (${cost}💰)` : "❌ Нет соседнего региона";
        }
    }
}

// ========== СТАРТОВОЕ РАСПРЕДЕЛЕНИЕ ==========

function assignStartingRegions() {
    if (!window.gameState) return;
    
    const allIds = Object.keys(window.gameState.allRegions);
    if (allIds.length < 9) {
        console.error('Недостаточно регионов для старта');
        return;
    }
    
    // Сортируем по площади (большие регионы AI получает, игроку - маленькие для сложности)
    const regionsWithArea = allIds.map(id => ({
        id: id,
        area: getRegionArea(id)
    }));
    
    regionsWithArea.sort((a, b) => b.area - a.area);
    
    // AI получают самые большие регионы
    const bigRegions = regionsWithArea.slice(0, 6).map(r => r.id);
    const remainingRegions = regionsWithArea.slice(6).map(r => r.id);
    
    // Перемешиваем оставшиеся
    for (let i = remainingRegions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingRegions[i], remainingRegions[j]] = [remainingRegions[j], remainingRegions[i]];
    }
    
    // Очищаем
    window.gameState.player.regions = [];
    window.gameState.ais.ai1.regions = [];
    window.gameState.ais.ai2.regions = [];
    
    for (const id of allIds) {
        window.gameState.allRegions[id].owner = null;
    }
    
    // AI1 - 3 больших региона
    bigRegions.slice(0, 3).forEach(id => {
        window.gameState.allRegions[id].owner = "ai1";
        window.gameState.ais.ai1.regions.push(id);
        if (typeof updateRegionColor === 'function') updateRegionColor(id);
    });
    
    // AI2 - 3 больших региона
    bigRegions.slice(3, 6).forEach(id => {
        window.gameState.allRegions[id].owner = "ai2";
        window.gameState.ais.ai2.regions.push(id);
        if (typeof updateRegionColor === 'function') updateRegionColor(id);
    });
    
    // Игрок - 3 маленьких региона
    const playerRegions = remainingRegions.slice(0, 3);
    playerRegions.forEach(id => {
        window.gameState.allRegions[id].owner = "player";
        window.gameState.player.regions.push(id);
        if (typeof updateRegionColor === 'function') updateRegionColor(id);
    });
    
    console.log(`📊 Стартовые регионы:`);
    console.log(`   Игрок: ${playerRegions.map(id => `${window.gameState.allRegions[id]?.name} (${getRegionArea(id).toFixed(0)} км²)`).join(', ')}`);
    console.log(`   AI1: ${bigRegions.slice(0,3).map(id => `${window.gameState.allRegions[id]?.name} (${getRegionArea(id).toFixed(0)} км²)`).join(', ')}`);
    console.log(`   AI2: ${bigRegions.slice(3,6).map(id => `${window.gameState.allRegions[id]?.name} (${getRegionArea(id).toFixed(0)} км²)`).join(', ')}`);
}

// ========== ДИПЛОМАТИЯ ==========

function declareWar() {
    const select = document.getElementById('aiSelect');
    if (!select || !window.gameState) return;
    
    const target = select.value;
    
    if (window.gameState.wars[target]) {
        addLog(`⚠️ Уже в войне с ${window.gameState.ais[target].name}!`, "war");
        return;
    }
    
    window.gameState.wars[target] = true;
    addLog(`⚔️ ${window.gameState.player.name} объявляет войну ${window.gameState.ais[target].name}!`, "war");
    updateWarStatus();
}

function makePeace() {
    const select = document.getElementById('aiSelect');
    if (!select || !window.gameState) return;
    
    const target = select.value;
    
    if (!window.gameState.wars[target]) {
        addLog(`ℹ️ Нет войны с ${window.gameState.ais[target].name}`, "system");
        return;
    }
    
    window.gameState.wars[target] = false;
    addLog(`🕊️ Заключен мир с ${window.gameState.ais[target].name}`, "peace");
    updateWarStatus();
}

// ========== ЭКСПОРТ ==========

window.initGameState = initGameState;
window.canConquerRegion = canConquerRegion;
window.getOwnerName = getOwnerName;
window.addLog = addLog;
window.updateUI = updateUI;
window.conquerRegion = conquerRegion;
window.checkVictory = checkVictory;
window.endTurn = endTurn;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.resetGame = resetGame;
window.selectRegion = selectRegion;
window.assignStartingRegions = assignStartingRegions;
window.declareWar = declareWar;
window.makePeace = makePeace;
window.updateWarStatus = updateWarStatus;
window.getRegionArea = getRegionArea;
window.calculateConquerCost = calculateConquerCost;
window.isProcessing = false;
window.selectedRegionId = null;
