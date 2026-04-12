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

// ========== ЗАГРУЗКА SVG ИЗ ФАЙЛА ==========
async function loadSVGFromFile() {
    const svgContainer = document.getElementById('gameMap');
    const spinner = document.getElementById('loadingSpinner');
    
    try {
        // Пытаемся загрузить SVG из файла
        const response = await fetch('data/map.svg');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const svgText = await response.text();
        
        // Вставляем SVG в контейнер
        svgContainer.innerHTML = svgText;
        
        // Убираем спиннер
        if (spinner) spinner.style.display = 'none';
        
        console.log('✅ SVG загружен из data/map.svg');
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка загрузки SVG:', error);
        
        // Показываем ошибку
        if (spinner) {
            spinner.innerHTML = `
                <div style="color: #e63946; text-align: center;">
                    <p>❌ Ошибка загрузки карты</p>
                    <p style="font-size: 12px;">${error.message}</p>
                    <p style="font-size: 11px; margin-top: 10px;">Убедитесь, что файл data/map.svg существует</p>
                </div>
            `;
        }
        
        // Создаем тестовую карту
        createTestMap(svgContainer);
        return false;
    }
}

// Тестовая карта (если файл не найден)
function createTestMap(svgContainer) {
    console.log('🔧 Создаю тестовую карту...');
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 600');
    
    // Создаем 20 тестовых регионов
    for (let i = 0; i < 20; i++) {
        const x = 50 + (i % 5) * 140;
        const y = 50 + Math.floor(i / 5) * 100;
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', '100');
        rect.setAttribute('height', '70');
        rect.setAttribute('fill', '#8aad7a');
        rect.setAttribute('stroke', '#2c2b1f');
        rect.setAttribute('stroke-width', '1.5');
        rect.id = `test_region_${i}`;
        rect.setAttribute('data-name', `Тестовый регион ${i + 1}`);
        
        svg.appendChild(rect);
    }
    
    svgContainer.innerHTML = '';
    svgContainer.appendChild(svg);
    
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.innerHTML = `
            <div style="color: #ffd700; text-align: center;">
                <p>⚠️ Тестовый режим</p>
                <p style="font-size: 11px;">Файл data/map.svg не найден</p>
                <p style="font-size: 10px;">Создана тестовая карта с 20 регионами</p>
            </div>
        `;
        setTimeout(() => {
            spinner.style.display = 'none';
        }, 3000);
    }
}

// ========== ЗАГРУЗКА РЕГИОНОВ ИЗ SVG ==========
function loadRegionsFromSVG() {
    const svg = document.getElementById('gameMap');
    if (!svg) {
        console.error('❌ SVG элемент не найден');
        return {};
    }
    
    // Ищем все path и polygon элементы
    let elements = svg.querySelectorAll('path, polygon, rect, circle');
    
    if (elements.length === 0) {
        console.error('❌ В SVG нет элементов path/polygon/rect');
        return {};
    }
    
    console.log(`✅ Найдено ${elements.length} элементов для обработки`);
    
    const regions = {};
    
    elements.forEach((element, index) => {
        // Генерируем ID
        let id = element.id;
        if (!id || id === '') {
            id = `region_${index}`;
            element.id = id;
        }
        
        // Получаем имя
        let name = element.getAttribute('data-name') || 
                   element.getAttribute('title') || 
                   element.getAttribute('name') ||
                   `Регион ${index + 1}`;
        
        // Получаем цвет
        let originalFill = element.getAttribute('fill');
        if (!originalFill || originalFill === 'none') {
            originalFill = '#8aad7a';
        }
        
        // Сохраняем данные
        regions[id] = {
            id: id,
            name: name,
            originalFill: originalFill,
            owner: null,
            population: Math.floor(Math.random() * 10) + 1,
            gold: Math.floor(Math.random() * 200) + 50,
            defense: Math.floor(Math.random() * 50) + 10,
            neighbors: []
        };
        
        // Добавляем классы и атрибуты
        element.classList.add('region');
        element.setAttribute('title', name);
        
        // Добавляем обработчик клика
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.selectRegion) {
                window.selectRegion(id);
            }
        });
        
        // Стилизация при наведении
        element.style.transition = 'stroke 0.15s ease, filter 0.15s ease';
        element.addEventListener('mouseenter', () => {
            element.setAttribute('stroke', '#ffd700');
            element.setAttribute('stroke-width', '2');
        });
        element.addEventListener('mouseleave', () => {
            element.setAttribute('stroke', '#2c2b1f');
            element.setAttribute('stroke-width', '1');
        });
    });
    
    // Находим соседей
    findNeighborsByProximity(regions);
    
    console.log(`✅ Загружено ${Object.keys(regions).length} регионов`);
    return regions;
}

// Поиск соседей
function findNeighborsByProximity(regions) {
    const svg = document.getElementById('gameMap');
    const elements = Array.from(svg.querySelectorAll('.region'));
    
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const id = el.id;
        const bbox = el.getBBox();
        
        for (let j = 0; j < elements.length; j++) {
            if (i === j) continue;
            const otherEl = elements[j];
            const otherBBox = otherEl.getBBox();
            
            if (bbox.x + bbox.width > otherBBox.x &&
                otherBBox.x + otherBBox.width > bbox.x &&
                bbox.y + bbox.height > otherBBox.y &&
                otherBBox.y + otherBBox.height > bbox.y) {
                if (!regions[id].neighbors.includes(otherEl.id)) {
                    regions[id].neighbors.push(otherEl.id);
                }
            }
        }
        
        // Ограничиваем количество соседей
        if (regions[id].neighbors.length > 12) {
            regions[id].neighbors = regions[id].neighbors.slice(0, 12);
        }
    }
}

// Обновление цвета региона
function updateRegionColor(regionId) {
    const region = gameState.allRegions[regionId];
    const element = document.getElementById(regionId);
    if (!element) return;
    
    if (region.owner === 'player') {
        element.setAttribute('fill', '#3a86ff');
        element.classList.add('player');
    } else if (region.owner === 'ai1') {
        element.setAttribute('fill', '#e63946');
        element.classList.remove('player');
    } else if (region.owner === 'ai2') {
        element.setAttribute('fill', '#4895ef');
        element.classList.remove('player');
    } else {
        element.setAttribute('fill', region.originalFill);
        element.classList.remove('player');
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
async function initGame() {
    console.log('🎮 Heirloom инициализация...');
    addLog("🚀 Запуск Heirloom...", "system");
    
    // Загружаем SVG из файла
    const svgLoaded = await loadSVGFromFile();
    
    if (!svgLoaded) {
        addLog("⚠️ Используется тестовая карта", "system");
    } else {
        addLog("📁 Карта загружена из data/map.svg", "system");
    }
    
    // Немного ждем для отрисовки SVG
    setTimeout(() => {
        // Загружаем регионы
        gameState.allRegions = loadRegionsFromSVG();
        
        if (Object.keys(gameState.allRegions).length === 0) {
            addLog("❌ Ошибка: не найдено ни одного региона на карте!", "war");
            return;
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
        
        addLog(`👑 Добро пожаловать в Heirloom!`, "system");
        addLog(`📜 На карте ${Object.keys(gameState.allRegions).length} регионов`, "system");
        addLog(`📌 Кликни на любой регион, чтобы начать завоевание`, "system");
        
    }, 100);
}

// Назначение стартовых регионов
function assignStartingRegions() {
    const allIds = Object.keys(gameState.allRegions);
    if (allIds.length === 0) return;
    
    // Перемешиваем
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
        updateRegionColor(id);
    });
    
    // AI1 получает 3 региона
    const ai1Regions = shuffled.slice(3, 6);
    ai1Regions.forEach(id => {
        gameState.allRegions[id].owner = "ai1";
        gameState.ais.ai1.regions.push(id);
        updateRegionColor(id);
    });
    
    // AI2 получает 3 региона
    const ai2Regions = shuffled.slice(6, 9);
    ai2Regions.forEach(id => {
        gameState.allRegions[id].owner = "ai2";
        gameState.ais.ai2.regions.push(id);
        updateRegionColor(id);
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
    
    gameState.player.treasury -= cost;
    
    if (region.owner && region.owner !== "player") {
        const oldOwner = gameState.ais[region.owner];
        if (oldOwner) {
            const index = oldOwner.regions.indexOf(selectedRegionId);
            if (index !== -1) oldOwner.regions.splice(index, 1);
        }
    }
    
    region.owner = "player";
    gameState.player.regions.push(selectedRegionId);
    updateRegionColor(selectedRegionId);
    
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
    
    const playerRegions = gameState.player.regions;
    const income = playerRegions.reduce((sum, id) => sum + (gameState.allRegions[id]?.gold || 0), 0);
    gameState.player.treasury += income;
    
    aiTurn();
    
    addLog(`📅 Ход ${gameState.turn} завершен. Доход: +${income}💰 (${playerRegions.length} регионов)`, "system");
    
    updateUI();
    if (selectedRegionId) selectRegion(selectedRegionId);
    
    autoSave();
    
    isProcessing = false;
}

// ========== AI ЛОГИКА ==========
function aiTurn() {
    for (const [aiId, ai] of Object.entries(gameState.ais)) {
        const aiIncome = ai.regions.reduce((sum, id) => sum + (gameState.allRegions[id]?.gold || 0), 0);
        ai.treasury += aiIncome;
        
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
                updateRegionColor(targetId);
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

// ========== СОХРАНЕНИЕ ==========
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
        
        gameState.player = loaded.gameState.player;
        gameState.ais = loaded.gameState.ais;
        gameState.turn = loaded.gameState.turn;
        gameState.wars = loaded.gameState.wars;
        
        for (const id in gameState.allRegions) {
            gameState.allRegions[id].owner = null;
        }
        
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
                updateRegionColor(id);
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
        for (const id in gameState.allRegions) {
            gameState.allRegions[id].owner = null;
            updateRegionColor(id);
        }
        
        gameState.player = { name: "Heirloom Empire", treasury: 500, stability: 70, regions: [] };
        gameState.ais = {
            ai1: { name: "Красная Империя", color: "#e63946", treasury: 400, stability: 65, regions: [] },
            ai2: { name: "Синее Королевство", color: "#4895ef", treasury: 450, stability: 70, regions: [] }
        };
        gameState.turn = 0;
        gameState.wars = { ai1: false, ai2: false };
        
        assignStartingRegions();
        
        updateUI();
        selectedRegionId = null;
        document.getElementById('selectedRegionPanel').innerHTML = '<p class="placeholder">Кликните на карту</p>';
        addLog("🔄 Игра сброшена!", "system");
    }
}

// ========== ZOOM ==========
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
        if (container) container.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
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

// ========== ОБРАБОТЧИКИ ==========
document.getElementById('conquerBtn')?.addEventListener('click', conquerRegion);
document.getElementById('endTurnBtn')?.addEventListener('click', endTurn);
document.getElementById('saveGameBtn')?.addEventListener('click', saveGame);
document.getElementById('loadGameBtn')?.addEventListener('click', loadGame);
document.getElementById('resetGameBtn')?.addEventListener('click', resetGame);
document.getElementById('declareWarBtn')?.addEventListener('click', declareWar);
document.getElementById('peaceBtn')?.addEventListener('click', makePeace);

// Экспорт
window.selectRegion = selectRegion;
window.addLog = addLog;
window.updateRegionColor = updateRegionColor;

// Запуск
document.addEventListener('DOMContentLoaded', initGame);
