// ========== ОТРИСОВКА КАРТЫ И ЦВЕТА РЕГИОНОВ ==========

function updateRegionColor(regionId) {
    const region = window.gameState?.allRegions[regionId];
    const element = document.getElementById(regionId);
    
    if (!region || !element) {
        if (regionId) console.warn(`Регион ${regionId} не найден для обновления цвета`);
        return;
    }
    
    // Определяем цвет в зависимости от владельца
    let newColor;
    if (region.owner === 'player') {
        newColor = '#3a86ff';
    } else if (region.owner === 'ai1') {
        newColor = '#e63946';
    } else if (region.owner === 'ai2') {
        newColor = '#4895ef';
    } else {
        newColor = region.originalFill || '#c0c0c0';
    }
    
    // Меняем цвет через style (приоритет выше, чем класс st0)
    element.style.fill = newColor;
    element.setAttribute('fill', newColor);
    
    // Обновляем классы для стилизации
    element.classList.remove('owner-player', 'owner-ai1', 'owner-ai2', 'neutral');
    if (region.owner === 'player') {
        element.classList.add('owner-player');
    } else if (region.owner === 'ai1') {
        element.classList.add('owner-ai1');
    } else if (region.owner === 'ai2') {
        element.classList.add('owner-ai2');
    } else {
        element.classList.add('neutral');
    }
    
    // Обводка
    element.setAttribute('stroke', '#2c2b1f');
    element.setAttribute('stroke-width', '1');
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
    
    // Удаляем старые обработчики, чтобы избежать дублирования
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
    
    newElement.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Убираем выделение со всех регионов
        document.querySelectorAll('.region').forEach(r => {
            r.classList.remove('selected');
            r.setAttribute('stroke', '#2c2b1f');
            r.setAttribute('stroke-width', '1');
        });
        
        // Выделяем текущий
        newElement.classList.add('selected');
        newElement.setAttribute('stroke', '#ffd700');
        newElement.setAttribute('stroke-width', '3');
        
        if (window.selectRegion) {
            window.selectRegion(regionId);
        }
    });
    
    // Эффекты наведения
    newElement.addEventListener('mouseenter', () => {
        if (!newElement.classList.contains('selected')) {
            newElement.setAttribute('stroke', '#ffd700');
            newElement.setAttribute('stroke-width', '2');
        }
    });
    
    newElement.addEventListener('mouseleave', () => {
        if (!newElement.classList.contains('selected')) {
            newElement.setAttribute('stroke', '#2c2b1f');
            newElement.setAttribute('stroke-width', '1');
        }
    });
}

function setupMapInteractivity(regions) {
    for (const regionId of Object.keys(regions)) {
        bindRegionClick(regionId);
    }
    console.log('🖱️ Интерактивность карты настроена');
}

// Экспорт
window.updateRegionColor = updateRegionColor;
window.updateAllRegionColors = updateAllRegionColors;
window.bindRegionClick = bindRegionClick;
window.setupMapInteractivity = setupMapInteractivity;
