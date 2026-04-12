// ========== HEIRLOOM - ОСНОВНАЯ ИГРОВАЯ ЛОГИКА ==========

// Игровое состояние
let gameState = {
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

let selectedRegionId = null;
let isProcessing = false;

// ========== ИНИЦИАЛИЗАЦИЯ ==========
function initGame() {
    // Загружаем регионы из SVG
    if (typeof loadRegionsFromSVG === 'function') {
        gameState.allRegions = loadRegionsFromSVG();
    }
    
    // Назначаем стартовые регионы
    assignStartingRegions();
    
    // Обновляем UI
    updateUI();
    
    // Инициализируем OpenRouter
    if (typeof initOpenRouter === 'function') {
        initOpenRouter();
    }
    
    // Добавляем обработчики зума
    initZoomControls();
    
    addLog("👑 Добро пожаловать в Heirloom!", "system");
    addLog("📜 Кликни на любой регион, чтобы начать завоевание", "system");
}

// Назначение стартовых регионов
function assignStartingRegions() {
    const allIds = Object.keys(gameState.allRegions);
    if (allIds.length === 0) return;
    
    // Перемешиваем для случайности
    const shuffled = [...allIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Игрок получает 3 региона
    const playerRegions = shuffled.slice(0, 3);
    playerRegions.forEach(id => {
        gameState.allRegions[id].owner = "player";
        gameState.player.regions.push(id);
        if (typeof updateRegionColor === 'function') updateRegionColor(id);
    });
    
    // AI1 получает 3 региона
    const ai1Regions = shuffled.slice(3, 6);
    ai1Regions.forEach(id => {
        gameState.allRegions[id].owner = "ai1";
        gameState.ais.ai1.regions.push(id);
        if (typeof updateRegionColor === 'function') updateRegionColor(id);
    });
    
    // AI2 получает 3 региона
    const ai2Regions = shuffled.slice(6, 9);
    ai2Regions.forEach(id => {
        gameState.allRegions[id].owner = "ai2";
        gameState.ais.ai2.regions.push(id);
        if (typeof updateRegionColor === 'function') updateRegionColor(id);
    });
}

// ========== UI ОБНОВЛЕНИЯ ==========
function updateUI() {
    const playerRegions = gameState.player.regions;
    const totalPop = playerRegions.reduce((sum, id) => sum + (gameState.allRegions[id]?.population || 0), 0);
    const totalPower = playerRegions.reduce((sum, id) => sum + (gameState.allRegions[id]?.defense || 0), 0);
    
    document.getElementById('regionCount').textContent = playerRegions.length;
    document.getElementById('treasury').textContent = gameState.player.treasury;
    document.getElementById('totalPop').textContent = totalPop.toFixed(1);
    document.getElementById('turnCount').textContent = gameState.turn;
}

// Выбор региона
function selectRegion(regionId) {
    selectedRegionId = regionId;
    const region = gameState.allRegions[regionId];
    if (!region) return;
    
    const panel = document.getElementById('selectedRegionPanel');
    const conquerBtn = document.getElementById('conquerBtn');
    
    if (region.owner === "player") {
        panel.innerHTML = `
            <p><strong>🏰 ${region.name}</strong> <span style="color:#3a86ff">(ваш)</span></p>
            <p>👥 Население: ${region.population}M</p>
            <p>💰 Золото: ${region.gold}</p>
            <p>🛡️ Оборона: ${region.defense}</p>
            <p>🔗 Соседей: ${region.neighbors.length}</p>
        `;
        conquerBtn.disabled = true;
        conquerBtn.textContent = "✓ Уже ваш";
    } else {
        const canConquer = canConquerRegion(regionId);
        const ownerName = getOwnerName(region.owner);
        panel.innerHTML = `
            <p><strong>🏰 ${region.name}</strong></p>
            <p>👥 Население: ${region.population}M</p>
            <p>💰 Золото: ${region.gold}</p>
            <p>🛡️ Оборона: ${region.defense}</p>
            <p>👑 Владелец: ${ownerName}</p>
            <p>🔗 Соседей: ${region.neighbors.length}</p>
        `;
        conquerBtn.disabled = !canConquer;
        conquerBtn.textContent = canConquer ? "⚔️ Захватить" : "❌ Нет соседнего региона";
    }
}

function canConquerRegion(regionId) {
    const region = gameState.allRegions[regionId];
    if (region.owner === "player") return false;
    
    // Война с владельцем?
    if (region.owner && region.owner !== "player" && !gameState.wars[region.owner]) {
        // Если не в войне, нельзя захватывать
        if (region.owner !== null) return false;
    }
    
    // Проверка соседства
    return region.neighbors.some(neighborId => {
        const neighbor = gameState.allRegions[neighborId];
        return neighbor && neighbor.owner === "player";
    });
}

function getOwnerName(owner) {
    if (owner === "player") return "Ваша Империя";
    if (owner === "ai1") return gameState.ais.ai1.name;
    if (owner === "ai2") return gameState.ais.ai2.name;
    return "🌿 Нейтральная";
}

// ========== ЗАХВАТ РЕГИОНА ==========
function conquerRegion() {
    if (!selectedRegionId) return;
    if (isProcessing) return;
    
    const region = gameState.allRegions[selectedRegionId];
    if (region.owner === "player") return;
    if (!canConquerRegion(selectedRegionId)) return;
    
    const cost = region.defense * 3;
    if (gameState.player.treasury < cost) {
        addLog(`❌ Не хватает ${cost} золота для захвата ${region.name}!`, "war");
        return;
    }
    
    isProcessing = true;
    
    // Захват
    gameState.player.treasury -= cost;
    
    // Удаляем из старого владельца
    if (region.owner && region.owner !== "player") {
        const oldOwner = gameState.ais[region.owner];
        if (oldOwner) {
            const index = oldOwner.regions.indexOf(selectedRegionId);
            if (index !== -1) oldOwner.regions.splice(index, 1);
        }
    }
    
    region.owner = "player";
    gameState.player.regions.push(selectedRegionId);
    
    if (typeof updateRegionColor === 'function') updateRegionColor(selectedRegionId);
    
    addLog(`✅ Захвачен ${region.name}! Потрачено ${cost}💰`, "conquer");
    
    updateUI();
    selectRegion(selectedRegionId);
    isProcessing = false;
}

// ========== ХОД ==========
function endTurn() {
    if (isProcessing) return;
    isProcessing = true;
    
    gameState.turn++;
    
    // Доход от регионов
    const playerRegions = gameState.player.regions;
    const income = playerRegions.reduce((sum, id) => sum + (gameState.allRegions[id]?.gold || 0), 0);
    gameState.player.treasury += income;
    
    // Ход AI
    aiTurn();
    
    addLog(`📅 Ход ${gameState.turn} завершен. Доход: +${income}💰 (${playerRegions.length} регионов)`, "system");
    
    updateUI();
    if (selectedRegionId) selectRegion(selectedRegionId);
    
    // Сохраняем автоматически
    autoSave();
    
    isProcessing = false;
}

// ========== AI ЛОГИКА ==========
async function aiTurn() {
    for (const [aiId, ai] of Object.entries(gameState.ais)) {
        // Доход AI
        const aiIncome = ai.regions.reduce((sum, id) => sum + (gameState.allRegions[id]?.gold || 0), 0);
        ai.treasury += aiIncome;
        
        // Попытка захвата нейтрального региона
        const neutralNeighbors = [];
        for (const regionId of ai.regions) {
            const region = gameState.allRegions[regionId];
            for (const neighborId of region.neighbors) {
                const neighbor = gameState.allRegions[neighborId];
                if (neighbor && neighbor.owner === null) {
                    neutralNeighbors.push(neighborId);
                }
            }
        }
        
        if (neutralNeighbors.length > 0 && ai.treasury >= 50) {
            const targetId = neutralNeighbors[0];
            const target = gameState.allRegions[targetId];
            const cost = target.defense * 2;
            
            if (ai.treasury >= cost) {
                ai.treasury -= cost;
                target.owner = aiId;
                ai.regions.push(targetId);
                if (typeof updateRegionColor === 'function') updateRegionColor(targetId);
                addLog(`⚔️ ${ai.name} захватил ${target.name}!`, "war");
            }
        }
    }
}

// ========== ДИПЛОМАТИЯ ==========
function declareWar() {
    const select = document.getElementById('aiSelect');
    const target = select.value;
    
    if (gameState.wars[target]) {
        addLog(`⚠️ Уже в состоянии войны с ${gameState.ais[target].name}!`, "war");
        return;
    }
    
    gameState.wars[target] = true;
    addLog(`⚔️ ${gameState.player.name} объявила войну ${gameState.ais[target].name}!`, "war");
}

function makePeace() {
    const select = document.getElementById('aiSelect');
    const target = select.value;
    
    if (!gameState.wars[target]) {
        addLog(`ℹ️ Нет войны с ${gameState.ais[target].name}`, "system");
        return;
    }
    
    gameState.wars[target] = false;
    addLog(`🕊️ Мир заключен с ${gameState.ais[target].name}`, "peace");
}

// ========== СОХРАНЕНИЕ И ЗАГРУЗКА ==========
function saveGame() {
    const saveData = {
        version: "1.0",
        timestamp: Date.now(),
        gameState: {
            player: gameState.player,
            ais: gameState.ais,
            turn: gameState.turn,
            wars: gameState.wars
        },
        regionsOwners: {}
    };
    
    // Сохраняем только владельцев регионов (для экономии места)
    for (const [id, region] of Object.entries(gameState.allRegions)) {
        if (region.owner) {
            saveData.regionsOwners[id] = region.owner;
        }
    }
    
    localStorage.setItem('heirloom_save', JSON.stringify(saveData));
    addLog("💾 Игра сохранена!", "system");
}

function loadGame() {
    const saveData = localStorage.getItem('heirloom_save');
    if (!saveData) {
        addLog("❌ Нет сохраненной игры!", "war");
        return;
    }
    
    try {
        const loaded = JSON.parse(saveData);
        
        // Восстанавливаем состояние
        gameState.player = loaded.gameState.player;
        gameState.ais = loaded.gameState.ais;
        gameState.turn = loaded.gameState.turn;
        gameState.wars = loaded.gameState.wars;
        
        // Сбрасываем всех владельцев
        for (const id in gameState.allRegions) {
            gameState.allRegions[id].owner = null;
        }
        
        // Восстанавливаем владельцев
        gameState.player.regions = [];
        for (const [aiId, ai] of Object.entries(gameState.ais)) {
            ai.regions = [];
        }
        
        for (const [id, owner] of Object.entries(loaded.regionsOwners)) {
            if (gameState.allRegions[id]) {
                gameState.allRegions[id].owner = owner;
                if (owner === "player") {
                    gameState.player.regions.push(id);
                } else if (gameState.ais[owner]) {
                    gameState.ais[owner].regions.push(id);
                }
                if (typeof updateRegionColor === 'function') updateRegionColor(id);
            }
        }
        
        updateUI();
        if (selectedRegionId) selectRegion(selectedRegionId);
        addLog("📂 Игра загружена!", "system");
    } catch (e) {
        addLog("❌ Ошибка загрузки!", "war");
        console.error(e);
    }
}

function autoSave() {
    if (gameState.turn % 5 === 0 && gameState.turn > 0) {
        saveGame();
    }
}

function resetGame() {
    if (confirm("Сбросить игру? Весь прогресс будет потерян!")) {
        // Сбрасываем всех владельцев
        for (const id in gameState.allRegions) {
            gameState.allRegions[id].owner = null;
            if (typeof updateRegionColor === 'function') updateRegionColor(id);
        }
        
        // Сбрасываем состояние
        gameState.player = { name: "Heirloom Empire", treasury: 500, stability: 70, regions: [] };
        gameState.ais = {
            ai1: { name: "Красная Империя", color: "#e63946", treasury: 400, stability: 65, regions: [] },
            ai2: { name: "Синее Королевство", color: "#4895ef", treasury: 450, stability: 70, regions: [] }
        };
        gameState.turn = 0;
        gameState.wars = { ai1: false, ai2: false };
        
        // Назначаем новые стартовые регионы
        assignStartingRegions();
        
        updateUI();
        selectedRegionId = null;
        document.getElementById('selectedRegionPanel').innerHTML = '<p class="placeholder">Кликните на карту</p>';
        addLog("🔄 Игра сброшена! Начинайте новую империю.", "system");
    }
}

// ========== ZOOM КОНТРОЛЫ ==========
let currentZoom = 1;
const zoomStep = 0.1;
const maxZoom = 2;
const minZoom = 0.5;

function initZoomControls() {
    const svg = document.getElementById('gameMap');
    const container = document.querySelector('.map-container');
    
    document.getElementById('zoomInBtn')?.addEventListener('click', () => {
        if (currentZoom < maxZoom) {
            currentZoom += zoomStep;
            svg.style.transform = `scale(${currentZoom})`;
            svg.style.transformOrigin = '0 0';
        }
    });
    
    document.getElementById('zoomOutBtn')?.addEventListener('click', () => {
        if (currentZoom > minZoom) {
            currentZoom -= zoomStep;
            svg.style.transform = `scale(${currentZoom})`;
            svg.style.transformOrigin = '0 0';
        }
    });
    
    document.getElementById('resetViewBtn')?.addEventListener('click', () => {
        currentZoom = 1;
        svg.style.transform = 'scale(1)';
        container.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    });
}

// ========== ЛОГ ==========
function addLog(message, type = "system") {
    const logContainer = document.getElementById('logContainer');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `[Ход ${gameState.turn}] ${message}`;
    logContainer.insertBefore(entry, logContainer.firstChild);
    
    while (logContainer.children.length > 100) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
document.getElementById('conquerBtn')?.addEventListener('click', conquerRegion);
document.getElementById('endTurnBtn')?.addEventListener('click', endTurn);
document.getElementById('saveGameBtn')?.addEventListener('click', saveGame);
document.getElementById('loadGameBtn')?.addEventListener('click', loadGame);
document.getElementById('resetGameBtn')?.addEventListener('click', resetGame);
document.getElementById('declareWarBtn')?.addEventListener('click', declareWar);
document.getElementById('peaceBtn')?.addEventListener('click', makePeace);

// Экспорт для доступа из regions.js
window.selectRegion = selectRegion;
window.addLog = addLog;

// Запуск
document.addEventListener('DOMContentLoaded', initGame);
