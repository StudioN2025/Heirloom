// ========== ИНИЦИАЛИЗАЦИЯ ==========
function initGame() {
    console.log('🎮 Heirloom инициализация...');
    
    // Ждем загрузки SVG
    const checkSVG = setInterval(() => {
        const svg = document.getElementById('gameMap');
        const paths = svg ? svg.querySelectorAll('path, polygon') : [];
        
        if (paths.length > 0) {
            clearInterval(checkSVG);
            console.log(`✅ Найдено ${paths.length} регионов, запускаем игру...`);
            
            // Загружаем регионы
            if (typeof loadRegionsFromSVG === 'function') {
                gameState.allRegions = loadRegionsFromSVG();
            } else {
                console.error('❌ loadRegionsFromSVG не определена!');
                // Ручная загрузка
                const allPaths = svg.querySelectorAll('path, polygon');
                allPaths.forEach((el, i) => {
                    const id = el.id || `region_${i}`;
                    if (!el.id) el.id = id;
                    gameState.allRegions[id] = {
                        id: id,
                        name: `Регион ${i}`,
                        originalFill: el.getAttribute('fill') || '#8aad7a',
                        owner: null,
                        population: 1,
                        gold: 50,
                        defense: 10,
                        neighbors: []
                    };
                    el.classList.add('region');
                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (window.selectRegion) window.selectRegion(id);
                    });
                });
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
            addLog(`📜 На карте ${Object.keys(gameState.allRegions).length} регионов`, "system");
            addLog("📌 Кликни на любой регион, чтобы начать завоевание", "system");
            
        } else {
            console.log('⏳ Ожидание загрузки SVG...', paths.length);
        }
    }, 500);
    
    // Таймаут на случай если SVG не загрузился
    setTimeout(() => {
        const svg = document.getElementById('gameMap');
        const paths = svg ? svg.querySelectorAll('path, polygon') : [];
        if (paths.length === 0) {
            console.error('❌ SVG не загрузился после 5 секунд!');
            addLog("⚠️ Ошибка: карта не загрузилась. Проверьте файл data/map.svg", "war");
        }
    }, 5000);
}
