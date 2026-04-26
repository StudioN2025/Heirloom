// ========== ГЛАВНЫЙ ФАЙЛ ИНИЦИАЛИЗАЦИИ ==========

let currentZoom = 1;
let soundEnabled = true;

// Переключение между меню и игрой
function showMainMenu() {
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('gameUI').style.display = 'none';
}

function showGameUI() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameUI').style.display = 'block';
}

// Инициализация игры
async function startNewGame() {
    showGameUI();
    
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'flex';
    
    // Инициализируем состояние
    if (typeof initGameState === 'function') {
        initGameState();
    }
    
    // Загружаем SVG
    await loadSVG();
    
    setTimeout(() => {
        // Загружаем регионы
        if (typeof loadRegionsFromSVG === 'function') {
            window.gameState.allRegions = loadRegionsFromSVG();
            console.log(`✅ Загружено ${Object.keys(window.gameState.allRegions).length} регионов`);
        }
        
        if (Object.keys(window.gameState.allRegions).length === 0) {
            console.error('Нет регионов!');
            if (spinner) spinner.style.display = 'none';
            return;
        }
        
        // Настраиваем карту
        if (typeof setupMapInteractivity === 'function') {
            setupMapInteractivity(window.gameState.allRegions);
        }
        
        // Распределяем стартовые регионы
        if (typeof assignStartingRegions === 'function') {
            assignStartingRegions();
        }
        
        // Обновляем цвета всех регионов
        if (typeof updateAllRegionColors === 'function') {
            updateAllRegionColors();
        }
        
        // Обновляем UI
        if (typeof updateUI === 'function') {
            updateUI();
        }
        
        // Настраиваем Zoom
        initZoomControls();
        
        // Инициализируем OpenRouter
        if (typeof initOpenRouter === 'function') {
            initOpenRouter();
        }
        
        if (spinner) spinner.style.display = 'none';
        
        addLog("👑 Добро пожаловать в Heirloom!", "system");
        addLog(`📜 На карте ${Object.keys(window.gameState.allRegions).length} регионов`, "system");
        
    }, 100);
}

async function continueGame() {
    const saveData = localStorage.getItem('heirloom_save');
    if (!saveData) {
        alert('Нет сохраненной игры! Начните новую.');
        return;
    }
    
    showGameUI();
    
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'flex';
    
    await loadSVG();
    
    setTimeout(() => {
        if (typeof loadRegionsFromSVG === 'function') {
            window.gameState.allRegions = loadRegionsFromSVG();
        }
        
        if (typeof setupMapInteractivity === 'function') {
            setupMapInteractivity(window.gameState.allRegions);
        }
        
        const loaded = loadGame();
        
        if (typeof updateAllRegionColors === 'function') {
            updateAllRegionColors();
        }
        
        if (typeof updateUI === 'function') {
            updateUI();
        }
        
        initZoomControls();
        
        if (typeof initOpenRouter === 'function') {
            initOpenRouter();
        }
        
        if (spinner) spinner.style.display = 'none';
        
        if (loaded) {
            addLog("📂 Загружена сохраненная игра", "system");
        }
    }, 100);
}

async function loadSVG() {
    const svgContainer = document.getElementById('gameMap');
    
    try {
        const response = await fetch('data/map.svg');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const svgText = await response.text();
        svgContainer.innerHTML = svgText;
        console.log('✅ SVG загружен');
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка загрузки SVG:', error);
        createFallbackMap(svgContainer);
        return false;
    }
}

function createFallbackMap(container) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 600');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    
    const names = ["Север", "Восток", "Юг", "Запад", "Центр", "Побережье"];
    
    for (let i = 0; i < 12; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', 50 + col * 160);
        rect.setAttribute('y', 50 + row * 120);
        rect.setAttribute('width', '140');
        rect.setAttribute('height', '100');
        rect.setAttribute('fill', '#c0c0c0');
        rect.setAttribute('stroke', '#2c2b1f');
        rect.setAttribute('stroke-width', '1.5');
        rect.setAttribute('rx', '8');
        rect.id = `fallback_region_${i}`;
        rect.setAttribute('data-name', `${names[i % names.length]} ${Math.floor(i / names.length) + 1}`);
        svg.appendChild(rect);
    }
    
    container.innerHTML = '';
    container.appendChild(svg);
}

function initZoomControls() {
    const svg = document.getElementById('gameMap');
    const container = document.querySelector('.map-container');
    
    const zoomIn = document.getElementById('zoomInBtn');
    const zoomOut = document.getElementById('zoomOutBtn');
    const reset = document.getElementById('resetViewBtn');
    
    if (zoomIn) {
        zoomIn.addEventListener('click', () => {
            currentZoom = Math.min(2.5, currentZoom + 0.1);
            if (svg) svg.style.transform = `scale(${currentZoom})`;
            if (svg) svg.style.transformOrigin = '0 0';
        });
    }
    
    if (zoomOut) {
        zoomOut.addEventListener('click', () => {
            currentZoom = Math.max(0.5, currentZoom - 0.1);
            if (svg) svg.style.transform = `scale(${currentZoom})`;
            if (svg) svg.style.transformOrigin = '0 0';
        });
    }
    
    if (reset) {
        reset.addEventListener('click', () => {
            currentZoom = 1;
            if (svg) svg.style.transform = 'scale(1)';
            if (container) container.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
        });
    }
}

function selectRegion(regionId) {
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

// Настройки
function setupSettingsModal() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettingsBtn');
    const saveApiKey = document.getElementById('saveApiKeyBtn');
    const soundToggle = document.getElementById('soundToggleBtn');
    const apiInput = document.getElementById('apiKeyInput');
    
    if (settingsBtn) {
        settingsBtn.onclick = () => {
            if (settingsModal) settingsModal.style.display = 'flex';
            if (apiInput) {
                const savedKey = localStorage.getItem('heirloom_api_key');
                if (savedKey) apiInput.value = savedKey;
            }
        };
    }
    
    if (closeSettings) {
        closeSettings.onclick = () => {
            if (settingsModal) settingsModal.style.display = 'none';
        };
    }
    
    if (saveApiKey) {
        saveApiKey.onclick = () => {
            const key = apiInput?.value.trim();
            if (key && key.startsWith('sk-or-v1-')) {
                localStorage.setItem('heirloom_api_key', key);
                alert('Ключ сохранен!');
                if (typeof initOpenRouter === 'function') initOpenRouter();
                settingsModal.style.display = 'none';
            } else if (key) {
                alert('Неверный формат ключа. Должен начинаться с sk-or-v1-');
            } else {
                alert('Введите API ключ');
            }
        };
    }
    
    if (soundToggle) {
        const savedSound = localStorage.getItem('heirloom_sound');
        soundEnabled = savedSound !== 'false';
        soundToggle.textContent = soundEnabled ? '🔊 Включен' : '🔇 Выключен';
        
        soundToggle.onclick = () => {
            soundEnabled = !soundEnabled;
            soundToggle.textContent = soundEnabled ? '🔊 Включен' : '🔇 Выключен';
            localStorage.setItem('heirloom_sound', soundEnabled);
        };
    }
}

function setupCreditsModal() {
    const creditsBtn = document.getElementById('creditsBtn');
    const creditsModal = document.getElementById('creditsModal');
    const closeCredits = document.getElementById('closeCreditsBtn');
    
    if (creditsBtn) {
        creditsBtn.onclick = () => {
            if (creditsModal) creditsModal.style.display = 'flex';
        };
    }
    
    if (closeCredits) {
        closeCredits.onclick = () => {
            if (creditsModal) creditsModal.style.display = 'none';
        };
    }
}

// Игровые кнопки
function setupGameButtons() {
    const conquerBtn = document.getElementById('conquerBtn');
    const endTurnBtn = document.getElementById('endTurnBtn');
    const saveBtn = document.getElementById('saveGameBtn');
    const loadBtn = document.getElementById('loadGameBtn');
    const resetBtn = document.getElementById('resetGameBtn');
    const declareWarBtn = document.getElementById('declareWarBtn');
    const peaceBtn = document.getElementById('peaceBtn');
    const menuExitBtn = document.getElementById('menuExitBtn');
    
    if (conquerBtn) conquerBtn.onclick = () => conquerRegion();
    if (endTurnBtn) endTurnBtn.onclick = () => endTurn();
    if (saveBtn) saveBtn.onclick = () => saveGame();
    if (loadBtn) loadBtn.onclick = () => loadGame();
    if (resetBtn) resetBtn.onclick = () => resetGame();
    if (declareWarBtn) declareWarBtn.onclick = () => declareWar();
    if (peaceBtn) peaceBtn.onclick = () => makePeace();
    if (menuExitBtn) menuExitBtn.onclick = () => showMainMenu();
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    setupSettingsModal();
    setupCreditsModal();
    setupGameButtons();
    
    // Кнопки главного меню
    const newGame = document.getElementById('newGameBtn');
    const continueGame = document.getElementById('continueGameBtn');
    
    if (newGame) newGame.onclick = () => startNewGame();
    if (continueGame) continueGame.onclick = () => continueGame();
    
    // Проверяем наличие сохранения
    const hasSave = localStorage.getItem('heirloom_save');
    if (continueGame && hasSave) {
        continueGame.style.opacity = '1';
    } else if (continueGame) {
        continueGame.style.opacity = '0.5';
    }
    
    // Статус API в меню
    const savedKey = localStorage.getItem('heirloom_api_key');
    const menuApiDot = document.getElementById('menuApiDot');
    const menuApiText = document.getElementById('menuApiText');
    
    if (menuApiDot && menuApiText) {
        if (savedKey && savedKey.startsWith('sk-or-v1-')) {
            menuApiDot.style.background = '#6bff6b';
            menuApiText.textContent = 'API активирован';
        } else {
            menuApiDot.style.background = '#e63946';
            menuApiText.textContent = 'API не настроен';
        }
    }
});

// Экспорт глобальных функций
window.selectRegion = selectRegion;
window.startNewGame = startNewGame;
window.showMainMenu = showMainMenu;
window.showGameUI = showGameUI;
window.currentZoom = currentZoom;
