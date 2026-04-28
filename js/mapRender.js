// ========== ОТРИСОВКА КАРТЫ И ЦВЕТА РЕГИОНОВ ==========
// Если функции уже определены в других файлах, этот файл просто заглушка

(function() {
    // Проверяем, определены ли функции
    if (typeof window.updateRegionColor !== 'function') {
        window.updateRegionColor = function(regionId) {
            if (!window.gameState) return;
            const region = window.gameState.allRegions[regionId];
            const element = document.getElementById(regionId);
            if (!region || !element) return;
            
            let newColor;
            if (region.owner === 'player') newColor = '#3a86ff';
            else if (region.owner === 'ai1') newColor = '#e63946';
            else if (region.owner === 'ai2') newColor = '#4895ef';
            else newColor = '#c0c0c0';
            
            element.style.fill = newColor;
            element.setAttribute('fill', newColor);
        };
    }
    
    if (typeof window.updateAllRegionColors !== 'function') {
        window.updateAllRegionColors = function() {
            if (!window.gameState?.allRegions) return;
            for (const id of Object.keys(window.gameState.allRegions)) {
                window.updateRegionColor(id);
            }
        };
    }
    
    if (typeof window.setupMapInteractivity !== 'function') {
        window.setupMapInteractivity = function(regions) {
            for (const regionId of Object.keys(regions)) {
                const element = document.getElementById(regionId);
                if (!element) continue;
                
                element.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.region').forEach(r => {
                        r.classList.remove('selected');
                        r.style.stroke = '#2c2b1f';
                        r.style.strokeWidth = '1';
                    });
                    element.classList.add('selected');
                    element.style.stroke = '#ffd700';
                    element.style.strokeWidth = '3';
                    if (window.selectRegion) window.selectRegion(regionId);
                });
            }
            console.log('🖱️ Интерактивность карты настроена');
        };
    }
    
    console.log('✅ mapRenderer.js загружен');
})();
