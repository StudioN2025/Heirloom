// ========== ОТРИСОВКА КАРТЫ И ЦВЕТА РЕГИОНОВ ==========

function updateRegionColor(regionId) {
    if (!window.gameState) {
        console.warn('gameState не инициализирован');
        return;
    }
    
    const region = window.gameState.allRegions[regionId];
    const element = document.getElementById(regionId);
    
    if (!region || !element) return;
    
    let newColor;
    if (region.owner === 'player') {
        newColor = '#3a86ff';
    } else if (region.owner === 'ai1') {
        newColor = '#e63946';
    } else if (region.owner === 'ai2') {
        newColor = '#4895ef';
    } else {
        newColor = '#c0c0c0';
    }
    
    element.style.fill = newColor;
    element.setAttribute('fill', newColor);
}

function updateAllRegionColors() {
    if (!window.gameState?.allRegions) return;
    
    for (const regionId of Object.keys(window.gameState.allRegions)) {
        updateRegionColor(regionId);
    }
    console.log('🎨 Цвета всех регионов обновлены');
}

function bindRegionClick(regionId) {
    const element = document.getElementById(regionId);
    if (!element) return;
    
    const clickHandler = (e) => {
        e.stopPropagation();
        
        document.querySelectorAll('.region').forEach(r => {
            r.classList.remove('selected');
            r.style.stroke = '#2c2b1f';
            r.style.strokeWidth = '1';
        });
        
        element.classList.add('selected');
        element.style.stroke = '#ffd700';
        element.style.strokeWidth = '3';
        
        if (window.selectRegion) {
            window.selectRegion(regionId);
        }
    };
    
    element.removeEventListener('click', element._clickHandler);
    element._clickHandler = clickHandler;
    element.addEventListener('click', clickHandler);
    
    element.addEventListener('mouseenter', () => {
        if (!element.classList.contains('selected')) {
            element.style.stroke = '#ffd700';
            element.style.strokeWidth = '2';
        }
    });
    
    element.addEventListener('mouseleave', () => {
        if (!element.classList.contains('selected')) {
            element.style.stroke = '#2c2b1f';
            element.style.strokeWidth = '1';
        }
    });
}

function setupMapInteractivity(regions) {
    for (const regionId of Object.keys(regions)) {
        bindRegionClick(regionId);
    }
    console.log('🖱️ Интерактивность карты настроена');
}

// Экспорт в глобальную область
window.updateRegionColor = updateRegionColor;
window.updateAllRegionColors = updateAllRegionColors;
window.bindRegionClick = bindRegionClick;
window.setupMapInteractivity = setupMapInteractivity;
