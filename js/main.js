// ========== ГЛАВНЫЙ ФАЙЛ ИНИЦИАЛИЗАЦИИ ==========

let currentZoom = 1;

async function startNewGame() {
    console.log('🚀 startNewGame вызван');
    showGameUI();
    
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'flex';
    
    // Инициализируем gameState
    if (typeof initGameState === 'function') {
        initGameState();
        console.log('✅ gameState инициализирован');
    } else {
        console.error('❌ initGameState не определена');
    }
    
    await loadSVG();
    
    setTimeout(() => {
        // Загружаем регионы
        if (typeof loadRegionsFromSVG === 'function') {
            const regions = loadRegionsFromSVG();
            if (window.gameState) {
                window.gameState.allRegions = regions;
                console.log(`✅ Загружено ${Object.keys(regions).length} регионов`);
            } else {
                console.error('❌ gameState не существует');
            }
        }
        
        if (!window.gameState || !window.gameState.allRegions || Object.keys(window.gameState.allRegions).length === 0) {
            console.error('❌ Нет регионов!');
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
        
        // Обновляем цвета
        if (typeof updateAllRegionColors === 'function') {
            updateAllRegionColors();
        }
        
        // Обновляем UI
        if (typeof updateUI === 'function') {
            updateUI();
        }
        
        initZoomControls();
        
        if (typeof initOpenRouter === 'function') {
            initOpenRouter();
        }
        
        if (spinner) spinner.style.display = 'none';
        
        if (typeof addLog === 'function') {
            addLog("👑 Добро пожаловать в Heirloom!", "system");
            addLog(`📜 На карте ${Object.keys(window.gameState.allRegions).length} регионов`, "system");
        }
        
    }, 100);
}

function continueGame() {
    console.log('📂 continueGame вызван');
    const saveData = localStorage.getItem('heirloom_save');
    if (!saveData) {
        alert('Нет сохраненной игры! Начните новую.');
        return;
    }
    
    showGameUI();
    loadGame();
}

async function loadSVG() {
    const svgContainer = document.getElementById('gameMap');
    if (!svgContainer) {
        console.error('❌ Контейнер карты не найден');
        return false;
    }
    
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
        // Создаем тестовую карту
        createTestMap(svgContainer);
        return false;
    }
}

function createTestMap(container) {
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
        rect.id = `test_region_${i}`;
        rect.setAttribute('data-name', `${names[i % names.length]} ${Math.floor(i / names.length) + 1}`);
        svg.appendChild(rect);
    }
    
    container.innerHTML = '';
    container.appendChild(svg);
    console.log('🔧 Создана тестовая карта');
}

function showGameUI() {
    const menu = document.getElementById('mainMenu');
    const game = document.getElementById('gameUI');
    if (menu) menu.style.display = 'none';
    if (game) game.style.display = 'block';
    console.log('🎮 Показан игровой интерфейс');
}

function showMainMenu() {
    const menu = document.getElementById('mainMenu');
    const game = document.getElementById('gameUI');
    if (menu) menu.style.display = 'flex';
    if (game) game.style.display = 'none';
    console.log('🏠 Показано главное меню');
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

function setupGameButtons() {
    console.log('🔘 Настройка кнопок игры...');
    
    const conquerBtn = document.getElementById('conquerBtn');
    const endTurnBtn = document.getElementById('endTurnBtn');
    const saveBtn = document.getElementById('saveGameBtn');
    const loadBtn = document.getElementById('loadGameBtn');
    const resetBtn = document.getElementById('resetGameBtn');
    const declareWarBtn = document.getElementById('declareWarBtn');
    const peaceBtn = document.getElementById('peaceBtn');
    const menuExitBtn = document.getElementById('menuExitBtn');
    
    if (conquerBtn) conquerBtn.onclick = () => { if (typeof conquerRegion === 'function') conquerRegion(); };
    if (endTurnBtn) endTurnBtn.onclick = () => { if (typeof endTurn === 'function') endTurn(); };
    if (saveBtn) saveBtn.onclick = () => { if (typeof saveGame === 'function') saveGame(); };
    if (loadBtn) loadBtn.onclick = () => { if (typeof loadGame === 'function') loadGame(); };
    if (resetBtn) resetBtn.onclick = () => { if (typeof resetGame === 'function') resetGame(); };
    if (declareWarBtn) declareWarBtn.onclick = () => { if (typeof declareWar === 'function') declareWar(); };
    if (peaceBtn) peaceBtn.onclick = () => { if (typeof makePeace === 'function') makePeace(); };
    if (menuExitBtn) menuExitBtn.onclick = () => showMainMenu();
    
    console.log('✅ Кнопки игры настроены');
}

function setupMenuButtons() {
    console.log('🔘 Настройка кнопок меню...');
    
    const newGameBtn = document.getElementById('newGameBtn');
    const continueGameBtn = document.getElementById('continueGameBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const creditsBtn = document.getElementById('creditsBtn');
    
    if (newGameBtn) {
        newGameBtn.onclick = (e) => {
            e.preventDefault();
            console.log('🆕 Новая игра нажата');
            startNewGame();
        };
    }
    
    if (continueGameBtn) {
        continueGameBtn.onclick = (e) => {
            e.preventDefault();
            console.log('📂 Продолжить нажата');
            continueGame();
        };
    }
    
    if (settingsBtn) {
        settingsBtn.onclick = (e) => {
            e.preventDefault();
            console.log('⚙️ Настройки нажаты');
            const modal = document.getElementById('settingsModal');
            if (modal) modal.style.display = 'flex';
        };
    }
    
    if (creditsBtn) {
        creditsBtn.onclick = (e) => {
            e.preventDefault();
            console.log('📜 Об игре нажата');
            const modal = document.getElementById('creditsModal');
            if (modal) modal.style.display = 'flex';
        };
    }
    
    // Закрытие модальных окон
    const closeSettings = document.getElementById('closeSettingsBtn');
    const closeCredits = document.getElementById('closeCreditsBtn');
    
    if (closeSettings) {
        closeSettings.onclick = () => {
            const modal = document.getElementById('settingsModal');
            if (modal) modal.style.display = 'none';
        };
    }
    
    if (closeCredits) {
        closeCredits.onclick = () => {
            const modal = document.getElementById('creditsModal');
            if (modal) modal.style.display = 'none';
        };
    }
    
    // Сохранение API ключа
    const saveApiKey = document.getElementById('saveApiKeyBtn');
    if (saveApiKey) {
        saveApiKey.onclick = () => {
            const apiInput = document.getElementById('apiKeyInput');
            const key = apiInput?.value.trim();
            if (key && key.startsWith('sk-or-v1-')) {
                localStorage.setItem('heirloom_api_key', key);
                alert('Ключ сохранен!');
                const modal = document.getElementById('settingsModal');
                if (modal) modal.style.display = 'none';
                if (typeof initOpenRouter === 'function') initOpenRouter();
            } else if (key) {
                alert('Неверный формат ключа');
            } else {
                alert('Введите API ключ');
            }
        };
    }
    
    console.log('✅ Кнопки меню настроены');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM загружен');
    setupMenuButtons();
    setupGameButtons();
    
    // Проверяем наличие сохранения
    const hasSave = localStorage.getItem('heirloom_save');
    const continueBtn = document.getElementById('continueGameBtn');
    if (continueBtn && hasSave) {
        continueBtn.style.opacity = '1';
    } else if (continueBtn) {
        continueBtn.style.opacity = '0.5';
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

// Экспорт
window.startNewGame = startNewGame;
window.continueGame = continueGame;
window.showMainMenu = showMainMenu;
window.showGameUI = showGameUI;
