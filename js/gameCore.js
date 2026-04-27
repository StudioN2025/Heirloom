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

function canConquerRegion(regionId) {
    if (!window.gameState) return false;
    const region = window.gameState.allRegions[regionId];
    if (!region || region.owner === "player") return false;
    
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

function conquerRegion() {
    if (!window.selectedRegionId || window.isProcessing || !window.gameState) return;
    
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
    
    if (region.owner && region.owner !== "player") {
        const oldOwner = window.gameState.ais[region.owner];
        if (oldOwner) {
            const index = oldOwner.regions.indexOf(window.selectedRegionId);
            if (index !== -1) oldOwner.regions.splice(index, 1);
        }
    }
    
    region.owner = "player";
    window.gameState.player.regions.push(window.selectedRegionId);
    
    if (typeof updateRegionColor === 'function') {
        updateRegionColor(window.selectedRegionId);
    }
    
    addLog(`✅ Захвачен ${region.name}! Потрачено ${cost}💰`, "conquer");
    
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
    
    const income = window.gameState.player.regions.reduce((sum, id) => 
        sum + (window.gameState.allRegions[id]?.gold || 0), 0);
    window.gameState.player.treasury += income;
    
    addLog(`📅 Ход ${window.gameState.turn} завершен. Доход: +${income}💰 (${window.gameState.player.regions.length} регионов)`, "system");
    
    if (typeof aiTurn === 'function') {
        aiTurn();
    }
    
    updateUI();
    if (window.selectedRegionId && typeof selectRegion === 'function') {
        selectRegion(window.selectedRegionId);
    }
    
    window.isProcessing = false;
}

function saveGame() {
    if (!window.gameState) return;
    
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
        
        for (const id in window.gameState.allRegions) {
            window.gameState.allRegions[id].owner = null;
        }
        window.gameState.player.regions = [];
        for (const ai of Object.values(window.gameState.ais)) {
            ai.regions = [];
        }
        
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
    if (panel) panel.innerHTML = '<p class="placeholder">Кликните на карту</p>';
    
    addLog("🔄 Игра сброшена! Начинаем новую эпоху.", "system");
}

function selectRegion(regionId) {
    if (!window.gameState) return;
    
    window.selectedRegionId = regionId;
    const region = window.gameState.allRegions[regionId];
    if (!region) return;
    
    const panel = document.getElementById('selectedRegionPanel');
    const conquerBtn = document.getElementById('conquerBtn');
    
    if (region.owner === "player") {
        panel.innerHTML = `
            <p><strong>🏰 ${region.name}</strong> <span style="color:#3a86ff">(ваш)</span></p>
            <p>👥 Население: ${region.population}M</p>
            <p>💰 Золото: ${region.gold} (+${region.gold}/ход)</p>
            <p>🛡️ Оборона: ${region.defense}</p>
            <p>🔗 Соседей: ${region.neighbors.length}</p>
        `;
        if (conquerBtn) {
            conquerBtn.disabled = true;
            conquerBtn.textContent = "✓ Уже ваш";
        }
    } else {
        const canConquer = canConquerRegion(regionId);
        const ownerName = getOwnerName(region.owner);
        const cost = region.defense * 3;
        
        panel.innerHTML = `
            <p><strong>🏰 ${region.name}</strong></p>
            <p>👥 Население: ${region.population}M</p>
            <p>💰 Золото: ${region.gold}</p>
            <p>🛡️ Оборона: ${region.defense}</p>
            <p>👑 Владелец: ${ownerName}</p>
            <p>💰 Стоимость: ${cost}</p>
            <p>🔗 Соседей: ${region.neighbors.length}</p>
        `;
        if (conquerBtn) {
            conquerBtn.disabled = !canConquer;
            conquerBtn.textContent = canConquer ? `⚔️ Захватить (${cost}💰)` : "❌ Нет соседнего региона";
        }
    }
}

function assignStartingRegions() {
    if (!window.gameState) return;
    
    const allIds = Object.keys(window.gameState.allRegions);
    if (allIds.length < 9) {
        console.error('Недостаточно регионов для старта');
        return;
    }
    
    const shuffled = [...allIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    window.gameState.player.regions = [];
    window.gameState.ais.ai1.regions = [];
    window.gameState.ais.ai2.regions = [];
    
    for (const id of allIds) {
        window.gameState.allRegions[id].owner = null;
    }
    
    shuffled.slice(0, 3).forEach(id => {
        window.gameState.allRegions[id].owner = "player";
        window.gameState.player.regions.push(id);
        if (typeof updateRegionColor === 'function') updateRegionColor(id);
    });
    
    shuffled.slice(3, 6).forEach(id => {
        window.gameState.allRegions[id].owner = "ai1";
        window.gameState.ais.ai1.regions.push(id);
        if (typeof updateRegionColor === 'function') updateRegionColor(id);
    });
    
    shuffled.slice(6, 9).forEach(id => {
        window.gameState.allRegions[id].owner = "ai2";
        window.gameState.ais.ai2.regions.push(id);
        if (typeof updateRegionColor === 'function') updateRegionColor(id);
    });
    
    console.log(`Стартовые регионы: Игрок ${window.gameState.player.regions.length}, AI1 ${window.gameState.ais.ai1.regions.length}, AI2 ${window.gameState.ais.ai2.regions.length}`);
}

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
window.isProcessing = false;
window.selectedRegionId = null;
