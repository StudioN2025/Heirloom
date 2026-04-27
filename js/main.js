// ========== ГЛАВНАЯ ИНИЦИАЛИЗАЦИЯ ==========

let currentZoom = 1;

async function startNewGame() {
    showGameUI();
    
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'flex';
    
    // ВАЖНО: сначала инициализируем gameState
    if (typeof initGameState === 'function') {
        initGameState();
    }
    
    await loadSVG();
    
    setTimeout(() => {
        // Загружаем регионы в уже существующий gameState
        if (typeof loadRegionsFromSVG === 'function') {
            const regions = loadRegionsFromSVG();
            window.gameState.allRegions = regions;
            console.log(`✅ Загружено ${Object.keys(regions).length} регионов`);
        }
        
        if (!window.gameState.allRegions || Object.keys(window.gameState.allRegions).length === 0) {
            console.error('Нет регионов!');
            if (spinner) spinner.style.display = 'none';
            return;
        }
        
        if (typeof setupMapInteractivity === 'function') {
            setupMapInteractivity(window.gameState.allRegions);
        }
        
        if (typeof assignStartingRegions === 'function') {
            assignStartingRegions();
        }
        
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
        
        addLog("👑 Добро пожаловать в Heirloom!", "system");
        addLog(`📜 На карте ${Object.keys(window.gameState.allRegions).length} регионов`, "system");
        
    }, 100);
}

// Остальной код main.js без изменений...
