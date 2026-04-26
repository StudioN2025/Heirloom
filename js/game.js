// ========== HEIRLOOM - ОСНОВНАЯ ИГРОВАЯ ЛОГИКА ==========

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

// ========== ЗАГРУЗКА SVG ==========
async function loadSVGFromFile() {
    const svgContainer = document.getElementById('gameMap');
    const spinner = document.getElementById('loadingSpinner');
    
    try {
        // Пытаемся загрузить SVG из папки data
        const response = await fetch('data/map.svg');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const svgText = await response.text();
        svgContainer.innerHTML = svgText;
        
        if (spinner) spinner.style.display = 'none';
        
        console.log('✅ SVG загружен из data/map.svg');
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка загрузки SVG:', error);
        
        // Если файл не найден, используем встроенную тестовую карту
        if (spinner) {
            spinner.innerHTML = `
                <div style="color: #ffd700; text-align: center;">
                    <p>⚠️ Файл data/map.svg не найден</p>
                    <p style="font-size: 11px;">Создаю тестовую карту...</p>
                </div>
            `;
            setTimeout(() => { spinner.style.display = 'none'; }, 2000);
        }
        
        createTestMap(svgContainer);
        return false;
    }
}

function createTestMap(svgContainer) {
    console.log('🔧 Создаю тестовую карту...');
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 600');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    
    // Создаем 24 тестовых региона для демонстрации
    const regionNames = [
        "Северные Земли", "Восточные Степи", "Южные Пустоши", "Западный Лес",
        "Центральная Равнина", "Прибрежные Территории", "Горные Кряжи", "Болотные Угодья",
        "Золотые Поля", "Серебряные Холмы", "Медные Рудники", "Железные Копи",
        "Алмазные Пещеры", "Изумрудные Луга", "Сапфировые Воды", "Рубиновые Скалы",
        "Янтарный Берег", "Жемчужный Залив", "Коралловый Риф", "Лазурное Побережье",
        "Тёмный Лес", "Туманные Топи", "Скалистые Вершины", "Долина Ветров"
    ];
    
    for (let i = 0; i < 24; i++) {
        const row = Math.floor(i / 6);
        const col = i % 6;
        const x = 30 + col * 120;
        const y = 40 + row * 100;
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', '100');
        rect.setAttribute('height', '80');
        rect.setAttribute('fill', '#c0c0c0');
        rect.setAttribute('stroke', '#2c2b1f');
        rect.setAttribute('stroke-width', '1.5');
        rect.setAttribute('rx', '8');
        rect.setAttribute('ry', '8');
        rect.id = `test_region_${i}`;
        rect.setAttribute('data-name', regionNames[i % regionNames.length]);
        
        // Добавляем текст с названием
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + 50);
        text.setAttribute('y', y + 45);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#2c2b1f');
        text.setAttribute('font-size', '9');
        text.setAttribute('font-weight', 'bold');
        text.textContent = regionNames[i % regionNames.length].substring(0, 12);
        
        svg.appendChild(rect);
        svg.appendChild(text);
    }
    
    svgContainer.innerHTML = '';
    svgContainer.appendChild(svg);
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
async function initGame() {
    console.log('🎮 Heirloom инициализация...');
    addLog("🚀 Запуск Heirloom...", "system");
    addLog("🏛️ Строй империю, которая переживет века", "system");
    
    await loadSVGFromFile();
    
    setTimeout(() => {
        // Загружаем регионы из SVG
        if (typeof loadRegionsFromSVG === 'function') {
            gameState.allRegions = loadRegionsFromSVG();
            console.log(`✅ Загружено ${Object.keys(gameState.allRegions).length} регионов из SVG`);
        } else {
            console.error('❌ loadRegionsFromSVG не определена');
            gameState.allRegions = manualLoadRegions();
        }
        
        if (Object.keys(gameState.allRegions).length === 0) {
            addLog("❌ Ошибка: не найдено ни одного региона!", "war");
            return;
        }
        
        // Распределяем стартовые регионы
        assignStartingRegions();
        updateUI();
        
        // Инициализируем OpenRouter
        if (typeof initOpenRouter === 'function') {
            initOpenRouter();
        } else {
            console.warn('OpenRouter не инициализирован');
            updateAIStatus(false, "ИИ недоступен");
        }
        
        // Настраиваем zoom
        initZoomControls();
        
        addLog(`👑 Добро пожаловать в Heirloom!`, "system");
        addLog(`📜 На карте ${Object.keys(gameState.allRegions).length} регионов`, "system");
        addLog(`📌 Кликни на любой регион, чтобы начать`, "system");
        addLog(`💡 Совет: захватывай соседние регионы для расширения`, "system");
        
    }, 100);
}

function manualLoadRegions() {
    const svg = document.getElementById('gameMap');
    if (!svg) return {};
    
    const elements = svg.querySelectorAll('path, polygon, rect, circle');
    const regions = {};
    
    elements.forEach((el, i) => {
        const id = el.id || `region_${i}`;
        if (!el.id) el.id = id;
        
        const name = el.getAttribute('data-name') || 
                     el.getAttribute('title') || 
                     `Регион ${i+1}`;
        
        regions[id] = {
            id: id, 
            name: name, 
            originalFill: '#c0c0c0',
            owner: null, 
            population: Math.floor(Math.random() * 8) + 2,
            gold: Math.floor(Math.random() * 150) + 50,
            defense: Math.floor(Math.random() * 40) + 15,
            neighbors: []
        };
        
        el.classList.add('region');
        el.setAttribute('fill', '#c0c0c0');
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.region').forEach(r => r.classList.remove('selected'));
            el.classList.add('selected');
            if (window.selectRegion) window.selectRegion(id);
        });
    });
    
    // Находим соседей
    findNeighborsByProximity(regions);
    
    return regions;
}

function findNeighborsByProximity(regions) {
    const svg = document.getElementById('gameMap');
    if (!svg) return;
    
    const elements = Array.from(svg.querySelectorAll('.region'));
    
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const id = el.id;
        if (!regions[id]) continue;
        
        try {
            const bbox = el.getBBox();
            
            for (let j = 0; j < elements.length; j++) {
                if (i === j) continue;
                const otherEl = elements[j];
                const otherId = otherEl.id;
                if (!regions[otherId]) continue;
                
                const otherBBox = otherEl.getBBox();
                
                // Проверяем пересечение bounding box'ов с буфером
                const buffer = 15;
                if (bbox.x + bbox.width + buffer > otherBBox.x &&
                    otherBBox.x + otherBBox.width + buffer > bbox.x &&
                    bbox.y + bbox.height + buffer > otherBBox.y &&
                    otherBBox.y + otherBBox.height + buffer > bbox.y) {
                    if (!regions[id].neighbors.includes(otherId)) {
                        regions[id].neighbors.push(otherId);
                    }
                }
            }
        } catch(e) {
            console.warn(`Ошибка при расчете соседей для ${id}:`, e);
        }
        
        // Ограничиваем количество соседей для производительности
        if (regions[id].neighbors.length > 15) {
            regions[id].neighbors = regions[id].neighbors.slice(0, 15);
        }
    }
}

function assignStartingRegions() {
    const allIds = Object.keys(gameState.allRegions);
    if (allIds.length < 9) {
        console.error('Недостаточно регионов для старта');
        return;
    }
    
    // Перемешиваем регионы
    const shuffled = [...allIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Очищаем старые данные
    gameState.player.regions = [];
    gameState.ais.ai1.regions = [];
    gameState.ais.ai2.regions = [];
    
    // Сбрасываем владельцев
    for (const id of allIds) {
        gameState.allRegions[id].owner = null;
    }
    
    // Игрок получает 3 региона
    const playerRegions = shuffled.slice(0, 3);
    playerRegions.forEach(id => {
        if (gameState.allRegions[id]) {
            gameState.allRegions[id].owner = "player";
            gameState.player.regions.push(id);
            if (typeof updateRegionColor === 'function') {
                updateRegionColor(id);
            }
        }
    });
    
    // AI1 получает 3 региона
    const ai1Regions = shuffled.slice(3, 6);
    ai1Regions.forEach(id => {
        if (gameState.allRegions[id]) {
            gameState.allRegions[id].owner = "ai1";
            gameState.ais.ai1.regions.push(id);
            if (typeof updateRegionColor === 'function') {
                updateRegionColor(id);
            }
        }
    });
    
    // AI2 получает 3 региона
    const ai2Regions = shuffled.slice(6, 9);
    ai2Regions.forEach(id => {
        if (gameState.allRegions[id]) {
            gameState.allRegions[id].owner = "ai2";
            gameState.ais.ai2.regions.push(id);
            if (typeof updateRegionColor === 'function') {
                updateRegionColor(id);
            }
        }
    });
    
    console.log(`Стартовые регионы: Игрок ${gameState.player.regions.length}, AI1 ${gameState.ais.ai1.regions.length}, AI2 ${gameState.ais.ai2.regions.length}`);
}

function updateUI() {
    const playerRegions = gameState.player.regions;
    const totalPop = playerRegions.reduce((sum, id) => sum + (gameState.allRegions[id]?.population || 0), 0);
    
    document.getElementById('regionCount').textContent = playerRegions.length;
    document.getElementById('treasury').textContent = gameState.player.treasury;
    document.getElementById('totalPop').textContent = totalPop.toFixed(1);
    document.getElementById('turnCount').textContent = gameState.turn;
}

function selectRegion(regionId) {
    selectedRegionId = regionId;
    const region = gameState.allRegions[regionId];
    if (!region) return;
    
    const panel = document.getElementById('selectedRegionPanel');
    const conquerBtn = document.getElementById('conquerBtn');
    
    if (region.owner === "player") {
        // Расчет дохода от региона
        const income = region.gold;
        panel.innerHTML = `
            <p><strong>🏰 ${region.name}</strong> <span style="color:#3a86ff">(ваш)</span></p>
            <p>👥 Население: ${region.population}M</p>
            <p>💰 Золото: ${region.gold} (доход +${income}/ход)</p>
            <p>🛡️ Оборона: ${region.defense}</p>
            <p>🔗 Соседей: ${region.neighbors.length}</p>
            <p class="neighbor-list">Соседи: ${region.neighbors.slice(0,5).map(n => gameState.allRegions[n]?.name || n).join(', ')}${region.neighbors.length > 5 ? '...' : ''}</p>
        `;
        conquerBtn.disabled = true;
        conquerBtn.textContent = "✓ Уже ваш";
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
            <p>💰 Стоимость захвата: ${cost}</p>
            <p>🔗 Соседей: ${region.neighbors.length}</p>
            <p class="neighbor-list">Соседи: ${region.neighbors.slice(0,5).map(n => gameState.allRegions[n]?.name || n).join(', ')}${region.neighbors.length > 5 ? '...' : ''}</p>
        `;
        conquerBtn.disabled = !canConquer;
        conquerBtn.textContent = canConquer ? `⚔️ Захватить (${cost}💰)` : "❌ Нет соседнего региона";
    }
}

function canConquerRegion(regionId) {
    const region = gameState.allRegions[regionId];
    if (region.owner === "player") return false;
    
    // Проверяем, есть ли у игрока соседний регион
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

function conquerRegion() {
    if (!selectedRegionId || isProcessing) return;
    
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
    
    // Удаляем регион у старого владельца
    if (region.owner && region.owner !== "player") {
        const oldOwner = gameState.ais[region.owner];
        if (oldOwner) {
            const index = oldOwner.regions.indexOf(selectedRegionId);
            if (index !== -1) oldOwner.regions.splice(index, 1);
        }
    }
    
    // Передаем регион игроку
    region.owner = "player";
    gameState.player.regions.push(selectedRegionId);
    
    if (typeof updateRegionColor === 'function') {
        updateRegionColor(selectedRegionId);
    }
    
    // Обновляем выделение на карте
    const element = document.getElementById(selectedRegionId);
    if (element) {
        document.querySelectorAll('.region').forEach(r => r.classList.remove('selected'));
        element.classList.add('selected');
    }
    
    // Проверяем, не закончилась ли игра
    checkVictory();
    
    addLog(`✅ Захвачен ${region.name}! Потрачено ${cost}💰`, "conquer");
    
    updateUI();
    selectRegion(selectedRegionId);
    isProcessing = false;
}

function checkVictory() {
    const allIds = Object.keys(gameState.allRegions);
    const playerCount = gameState.player.regions.length;
    const totalCount = allIds.length;
    
    if (playerCount >= totalCount) {
        addLog(`🏆 ПОБЕДА! Вы захватили все ${totalCount} регионов! 🏆`, "system");
        setTimeout(() => {
            alert(`🏆 ПОБЕДА! 🏆\n\nВы захватили все ${totalCount} регионов и создали вечную империю!`);
        }, 100);
    } else if (playerCount >= Math.floor(totalCount * 0.66)) {
        addLog(`👑 Вы контролируете ${playerCount} из ${totalCount} регионов (${Math.round(playerCount/totalCount*100)}%). Еще немного до полной победы!`, "system");
    }
}

function endTurn() {
    if (isProcessing) return;
    isProcessing = true;
    
    gameState.turn++;
    
    // Расчет дохода игрока
    const playerRegions = gameState.player.regions;
    const income = playerRegions.reduce((sum, id) => sum + (gameState.allRegions[id]?.gold || 0), 0);
    gameState.player.treasury += income;
    
    // Восстановление стабильности
    if (gameState.player.stability < 100) {
        gameState.player.stability = Math.min(100, gameState.player.stability + 2);
    }
    
    addLog(`📅 Ход ${gameState.turn} завершен. Доход: +${income}💰 (${playerRegions.length} регионов)`, "system");
    addLog(`📈 Стабильность: ${gameState.player.stability}%`, "system");
    
    // Ход ИИ
    aiTurn();
    
    updateUI();
    if (selectedRegionId) selectRegion(selectedRegionId);
    
    // Автосохранение каждые 5 ходов
    if (gameState.turn % 5 === 0) {
        saveGame();
        addLog("💾 Автосохранение выполнено", "system");
    }
    
    isProcessing = false;
}

function aiTurn() {
    for (const [aiId, ai] of Object.entries(gameState.ais)) {
        if (!ai.regions.length) continue;
        
        // Доход AI
        const aiIncome = ai.regions.reduce((sum, id) => sum + (gameState.allRegions[id]?.gold || 0), 0);
        ai.treasury += aiIncome;
        
        // Сбор возможных целей для захвата
        const possibleTargets = [];
        const ownedSet = new Set(ai.regions);
        
        for (const regionId of ai.regions) {
            const region = gameState.allRegions[regionId];
            if (!region) continue;
            
            for (const neighborId of region.neighbors) {
                const neighbor = gameState.allRegions[neighborId];
                if (neighbor && neighbor.owner === null) {
                    possibleTargets.push({
                        id: neighborId,
                        cost: neighbor.defense * 2,
                        value: neighbor.gold,
                        defense: neighbor.defense
                    });
                }
            }
        }
        
        // Сортируем по соотношению ценности к стоимости
        possibleTargets.sort((a, b) => (b.value / b.cost) - (a.value / a.cost));
        
        // AI пытается захватить
        let conquered = false;
        for (const target of possibleTargets) {
            if (ai.treasury >= target.cost) {
                ai.treasury -= target.cost;
                const region = gameState.allRegions[target.id];
                region.owner = aiId;
                ai.regions.push(target.id);
                if (typeof updateRegionColor === 'function') {
                    updateRegionColor(target.id);
                }
                addLog(`⚔️ ${ai.name} захватил ${region.name}!`, "war");
                conquered = true;
                break;
            }
        }
        
        if (!conquered && possibleTargets.length > 0) {
            addLog(`ℹ️ ${ai.name} не хватило ресурсов для захвата`, "system");
        }
        
        // Военные действия, если в войне
        if (gameState.wars[aiId]) {
            performWarAction(aiId, ai);
        }
    }
}

function performWarAction(aiId, ai) {
    // Ищем вражеские регионы (игрока или другого AI, с которым в войне)
    const enemyRegions = [];
    
    for (const regionId of ai.regions) {
        const region = gameState.allRegions[regionId];
        if (!region) continue;
        
        for (const neighborId of region.neighbors) {
            const neighbor = gameState.allRegions[neighborId];
            if (neighbor && neighbor.owner === "player") {
                enemyRegions.push({ id: neighborId, owner: "player" });
            } else if (neighbor && neighbor.owner === "ai2" && aiId === "ai1" && gameState.wars.ai2) {
                enemyRegions.push({ id: neighborId, owner: "ai2" });
            } else if (neighbor && neighbor.owner === "ai1" && aiId === "ai2" && gameState.wars.ai1) {
                enemyRegions.push({ id: neighborId, owner: "ai1" });
            }
        }
    }
    
    // Уникальные цели
    const uniqueTargets = [...new Map(enemyRegions.map(r => [r.id, r])).values()];
    
    if (uniqueTargets.length > 0 && ai.treasury >= 100) {
        const target = uniqueTargets[0];
        const cost = gameState.allRegions[target.id].defense * 3;
        
        if (ai.treasury >= cost) {
            ai.treasury -= cost;
            const oldOwner = target.owner;
            
            // Удаляем у старого владельца
            if (oldOwner === "player") {
                const index = gameState.player.regions.indexOf(target.id);
                if (index !== -1) gameState.player.regions.splice(index, 1);
            } else if (gameState.ais[oldOwner]) {
                const index = gameState.ais[oldOwner].regions.indexOf(target.id);
                if (index !== -1) gameState.ais[oldOwner].regions.splice(index, 1);
            }
            
            // Передаем AI
            gameState.allRegions[target.id].owner = aiId;
            ai.regions.push(target.id);
            if (typeof updateRegionColor === 'function') {
                updateRegionColor(target.id);
            }
            
            addLog(`⚔️ ВОЙНА: ${ai.name} захватил ${gameState.allRegions[target.id].name} у ${getOwnerName(oldOwner)}!`, "war");
            
            if (oldOwner === "player") {
                addLog(`⚠️ Вы потеряли регион!`, "war");
                updateUI();
                if (selectedRegionId === target.id) selectRegion(target.id);
            }
        }
    }
}

function declareWar() {
    const select = document.getElementById('aiSelect');
    const target = select.value;
    
    if (gameState.wars[target]) {
        addLog(`⚠️ Уже в войне с ${gameState.ais[target].name}!`, "war");
        return;
    }
    
    gameState.wars[target] = true;
    addLog(`⚔️ ${gameState.player.name} объявляет войну ${gameState.ais[target].name}!`, "war");
    addLog(`⚔️ Отныне ваши армии будут сражаться за контроль над землями!`, "war");
}

function makePeace() {
    const select = document.getElementById('aiSelect');
    const target = select.value;
    
    if (!gameState.wars[target]) {
        addLog(`ℹ️ Нет войны с ${gameState.ais[target].name}`, "system");
        return;
    }
    
    gameState.wars[target] = false;
    addLog(`🕊️ Заключен мир с ${gameState.ais[target].name}`, "peace");
    addLog(`🕊️ Границы стабилизированы`, "peace");
}

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
        if (region.owner) saveData.regionsOwners[id] = region.owner;
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
        
        // Сбрасываем владельцев
        for (const id in gameState.allRegions) {
            gameState.allRegions[id].owner = null;
        }
        gameState.player.regions = [];
        for (const [aiId, ai] of Object.entries(gameState.ais)) {
            ai.regions = [];
        }
        
        // Восстанавливаем владельцев
        for (const [id, owner] of Object.entries(loaded.regionsOwners)) {
            if (gameState.allRegions[id]) {
                gameState.allRegions[id].owner = owner;
                if (owner === "player") {
                    gameState.player.regions.push(id);
                } else if (gameState.ais[owner]) {
                    gameState.ais[owner].regions.push(id);
                }
                if (typeof updateRegionColor === 'function') {
                    updateRegionColor(id);
                }
            }
        }
        
        updateUI();
        if (selectedRegionId) selectRegion(selectedRegionId);
        addLog("📂 Игра загружена!", "system");
        
    } catch (e) {
        console.error('Ошибка загрузки:', e);
        addLog("❌ Ошибка загрузки сохранения!", "war");
    }
}

function resetGame() {
    if (confirm("Сбросить игру? Весь прогресс будет потерян!")) {
        // Сбрасываем владельцев
        for (const id in gameState.allRegions) {
            gameState.allRegions[id].owner = null;
            if (typeof updateRegionColor === 'function') {
                updateRegionColor(id);
            }
        }
        
        // Сбрасываем состояние
        gameState.player = { 
            name: "Heirloom Empire", 
            treasury: 500, 
            stability: 70, 
            regions: [] 
        };
        gameState.ais = {
            ai1: { name: "Красная Империя", color: "#e63946", treasury: 400, stability: 65, regions: [] },
            ai2: { name: "Синее Королевство", color: "#4895ef", treasury: 450, stability: 70, regions: [] }
        };
        gameState.turn = 0;
        gameState.wars = { ai1: false, ai2: false };
        
        // Заново распределяем регионы
        assignStartingRegions();
        
        updateUI();
        selectedRegionId = null;
        document.getElementById('selectedRegionPanel').innerHTML = '<p class="placeholder">Кликните на карту</p>';
        addLog("🔄 Игра сброшена! Начинаем новую эпоху.", "system");
    }
}

let currentZoom = 1;

function initZoomControls() {
    const svg = document.getElementById('gameMap');
    const container = document.querySelector('.map-container');
    
    if (!svg || !container) return;
    
    document.getElementById('zoomInBtn')?.addEventListener('click', () => {
        currentZoom = Math.min(2.5, currentZoom + 0.1);
        svg.style.transform = `scale(${currentZoom})`;
        svg.style.transformOrigin = '0 0';
    });
    
    document.getElementById('zoomOutBtn')?.addEventListener('click', () => {
        currentZoom = Math.max(0.5, currentZoom - 0.1);
        svg.style.transform = `scale(${currentZoom})`;
        svg.style.transformOrigin = '0 0';
    });
    
    document.getElementById('resetViewBtn')?.addEventListener('click', () => {
        currentZoom = 1;
        svg.style.transform = 'scale(1)';
        if (container) container.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    });
}

function addLog(message, type = "system") {
    const logContainer = document.getElementById('logContainer');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `[Ход ${gameState.turn}] ${message}`;
    logContainer.insertBefore(entry, logContainer.firstChild);
    
    // Ограничиваем количество логов
    while (logContainer.children.length > 100) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

function updateAIStatus(connected, message) {
    const dot = document.getElementById('aiStatusDot');
    const text = document.getElementById('aiStatusText');
    if (dot && text) {
        dot.style.backgroundColor = connected ? '#6bff6b' : '#e63946';
        dot.style.boxShadow = connected ? '0 0 8px #6bff6b' : 'none';
        text.textContent = message || (connected ? 'ИИ готов' : 'ИИ отключен');
    }
}

// Обработчики кнопок
document.getElementById('conquerBtn')?.addEventListener('click', conquerRegion);
document.getElementById('endTurnBtn')?.addEventListener('click', endTurn);
document.getElementById('saveGameBtn')?.addEventListener('click', saveGame);
document.getElementById('loadGameBtn')?.addEventListener('click', loadGame);
document.getElementById('resetGameBtn')?.addEventListener('click', resetGame);
document.getElementById('declareWarBtn')?.addEventListener('click', declareWar);
document.getElementById('peaceBtn')?.addEventListener('click', makePeace);

// Экспорт для использования из других файлов
window.selectRegion = selectRegion;
window.addLog = addLog;
window.updateAIStatus = updateAIStatus;
window.updateRegionColor = (window.updateRegionColor) ? window.updateRegionColor : function(id) {
    const region = gameState.allRegions[id];
    const element = document.getElementById(id);
    if (region && element) {
        if (region.owner === 'player') element.setAttribute('fill', '#3a86ff');
        else if (region.owner === 'ai1') element.setAttribute('fill', '#e63946');
        else if (region.owner === 'ai2') element.setAttribute('fill', '#4895ef');
        else element.setAttribute('fill', '#c0c0c0');
    }
};

// Запуск игры
document.addEventListener('DOMContentLoaded', initGame);
