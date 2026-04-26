// ========== ОТРИСОВКА КАРТЫ И ЦВЕТА РЕГИОНОВ ==========

function updateRegionColor(regionId) {
    const region = window.gameState?.allRegions[regionId];
    const element = document.getElementById(regionId);
    
    if (!region || !element) return;
    
    // Убираем старые классы
    element.classList.remove('owner-player', 'owner-ai1', 'owner-ai2', 'neutral');
    
    // Устанавливаем цвет в зависимости от владельца
    if (region.owner === 'player') {
        element.setAttribute('fill', '#3a86ff');
        element.classList.add('owner-player');
    } else if (region.owner === 'ai1') {
        element.setAttribute('fill', '#e63946');
        element.classList.add('owner-ai1');
    } else if (region.owner === 'ai2') {
        element.setAttribute('fill', '#4895ef');
        element.classList.add('owner-ai2');
    } else {
        element.setAttribute('fill', region.originalFill || '#c0c0c0');
        element.classList.add('neutral');
    }
    
    // Добавляем обводку
    element.setAttribute('stroke', '#2c2b1f');
    element.setAttribute('stroke-width', '1');
}

function updateAllRegionColors() {
    if (!window.gameState?.allRegions) return;
    
    for (const regionId of Object.keys(window.gameState.allRegions)) {
        updateRegionColor(regionId);
    }
}

function bindRegionClick(regionId) {
    const element = document.getElementById(regionId);
    if (!element) return;
    
    element.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Убираем выделение со всех регионов
        document.querySelectorAll('.region').forEach(r => {
            r.classList.remove('selected');
            r.setAttribute('stroke', '#2c2b1f');
            r.setAttribute('stroke-width', '1');
        });
        
        // Выделяем текущий
        element.classList.add('selected');
        element.setAttribute('stroke', '#ffd700');
        element.setAttribute('stroke-width', '3');
        
        if (window.selectRegion) {
            window.selectRegion(regionId);
        }
    });
    
    // Эффекты наведения
    element.addEventListener('mouseenter', () => {
        if (!element.classList.contains('selected')) {
            element.setAttribute('stroke', '#ffd700');
            element.setAttribute('stroke-width', '2');
        }
    });
    
    element.addEventListener('mouseleave', () => {
        if (!element.classList.contains('selected')) {
            element.setAttribute('stroke', '#2c2b1f');
            element.setAttribute('stroke-width', '1');
        }
    });
}

function setupMapInteractivity(regions) {
    for (const regionId of Object.keys(regions)) {
        bindRegionClick(regionId);
    }
}
