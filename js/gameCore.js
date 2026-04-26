// ========== ОСНОВНАЯ ИГРОВАЯ ЛОГИКА ==========

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

function assignStartingRegions() {
    const allIds = Object.keys(window.gameState.allRegions);
    if (allIds.length < 9) {
        console.error('Недостаточно регионов для старта');
        return;
    }
    
    // Перемешиваем
    const shuffled = [...allIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Очищаем
    window.gameState.player.regions = [];
    window.gameState.ais.ai1.regions = [];
    window.gameState.ais.ai2.regions = [];
    
    for (const id of allIds) {
        window.gameState.allRegions[id].owner = null;
    }
    
    // Игрок
    shuffled.slice(0, 3).forEach(id => {
        window.gameState.allRegions[id].owner = "player";
        window.gameState.player.regions.push(id);
        if (typeof updateRegionColor === 'function') updateRegionColor(id);
    });
    
    // AI1
    shuffled.slice(3, 6).forEach(id => {
        window.gameState.allRegions[id].owner = "ai1";
        window.gameState.ais.ai1.regions.push(id);
        if (typeof updateRegionColor === 'function') updateRegionColor(id);
    });
    
    // AI2
    shuffled.slice(6, 9).forEach(id => {
        window.gameState.allRegions[id].owner = "ai2";
        window.gameState.ais.ai2.regions.push(id);
        if (typeof updateRegionColor === 'function') updateRegionColor(id);
    });
}

function updateUI() {
    const playerRegions = window.gameState.player.regions;
    const totalPop = playerRegions.reduce((sum, id) => sum + (window.gameState.allRegions[id]?.population || 0), 0);
    
    const turnEl = document.getElementById('turnCount');
    const treasuryEl = document.getElementById('treasury');
    const regionCountEl = document.getElementById('regionCount');
    const totalPopEl = document.getElementById('totalPop');
    
    if (turnEl) turnEl.textContent = window.gameState.turn;
    if (treasuryEl) treasuryEl.textContent = window.gameState.player.treasury;
    if (regionCountEl) regionCountEl.textContent = playerRegions.length;
    if (totalPopEl) totalPopEl.textContent = totalPop.toFixed(1);
}

function addLog(message, type = "system") {
    const logContainer = document.getElementById('logContainer');
    if (!logContainer) return;
    
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `[Ход ${window.gameState?.turn || 0}] ${message}`;
    logContainer.insertBefore(entry, logContainer.firstChild);
    
    while (logContainer.children.length > 100) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

function canConquerRegion(regionId) {
    const region = window.gameState.allRegions[regionId];
    if (!region || region.owner === "player") return false;
    
    return region.neighbors.some(neighborId => {
        const neighbor = window.gameState.allRegions[neighborId];
        return neighbor && neighbor.owner === "player";
    });
}

function getOwnerName(owner) {
    if (owner === "player") return "Ваша Империя";
    if (owner === "ai1") return window.gameState.ais.ai1.name;
    if (owner === "ai2") return window.gameState.ais.ai2.name;
    return "🌿 Нейтральная";
}

function conquerRegion() {
    if (!window.selectedRegionId || window.isProcessing) return;
    
    const region = window.gameState.allRegions[window.selectedRegionId];
    if (!region || region.owner === "player") return;
    if (!canConquerRegion(window.selectedRegionId)) return;
    
    const cost = region.defense * 3;
    if (window.gameState.player.treasury < cost) {
        addLog(`❌ Не хватает ${cost} золота для захвата ${region.name}!`, "war");
        return;
    }
    
    window.isProcessing = true;
    window.gameState.player.treasury -= cost;
    
    // Удаляем у старого владельца
    if (region.owner && region.owner !== "player") {
        const oldOwner = window.gameState.ais[region.owner];
        if (oldOwner) {
            const index = oldOwner.regions.indexOf(window.selectedRegionId);
            if (index !== -1) oldOwner.regions.splice(index, 1);
        }
    }
    
    // Передаем игроку
    region.owner = "player";
    window.gameState.player.regions.push(window.selectedRegionId);
    
    if (typeof updateRegionColor === 'function') {
        updateRegionColor(window.selectedRegionId);
    }
    
    // Обновляем выделение
    const element = document.getElementById(window.selectedRegionId);
    if (element) {
        document.querySelectorAll('.region').forEach(r => r.classList.remove('selected'));
        element.classList.add('selected');
        element.setAttribute('stroke', '#ffd700');
        element.setAttribute('stroke-width', '3');
    }
    
    addLog(`✅ Захвачен ${region.name}! Потрачено ${cost}💰`, "conquer");
    
    updateUI();
    if (typeof window.selectRegion === 'function') {
        window.selectRegion(window.selectedRegionId);
    }
    
    checkVictory();
    window.isProcessing = false;
}

function checkVictory() {
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
    if (window.isProcessing) return;
    window.isProcessing = true;
    
    window.gameState.turn++;
    
    // Доход игрока
    const income = window.gameState.player.regions.reduce((sum, id) => 
        sum + (window.gameState.allRegions[id]?.gold || 0), 0);
    window.gameState.player.treasury += income;
    
    addLog(`📅 Ход ${window.gameState.turn} завершен. Доход: +${income}💰 (${window.gameState.player.regions.length} регионов)`, "system");
    
    // Ход ИИ
    if (typeof aiTurn === 'function') {
        aiTurn();
    }
    
    updateUI();
    if (window.selectedRegionId && typeof window.selectRegion === 'function') {
        window.selectRegion(window.selectedRegionId);
    }
    
    window.isProcessing = false;
}

function saveGame() {
    const saveData = {
        version: "1.0",
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
        
        // Восстанавливаем
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
    if (panel) panel.innerHTML = '<p class="placeholder">Кликните на карту</p>';
    
    addLog("🔄 Игра сброшена! Начинаем новую эпоху.", "system");
}

// Экспорт
window.canConquerRegion = canConquerRegion;
window.getOwnerName = getOwnerName;
window.conquerRegion = conquerRegion;
window.endTurn = endTurn;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.resetGame = resetGame;
window.addLog = addLog;
window.updateUI = updateUI;
window.checkVictory = checkVictory;
window.initGameState = initGameState;
window.assignStartingRegions = assignStartingRegions;
window.isProcessing = false;
window.selectedRegionId = null;
