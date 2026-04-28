// ========== ОТРИСОВКА КАРТЫ И ЦВЕТА РЕГИОНОВ ==========

function updateRegionColor(regionId) {
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
}

function updateAllRegionColors() {
    if (!window.gameState?.allRegions) return;
    for (const id of Object.keys(window.gameState.allRegions)) {
        updateRegionColor(id);
    }
}

function setupMapInteractivity(regions) {
    console.log('🖱️ Настройка интерактивности для', Object.keys(regions).length, 'регионов');
    
    for (const regionId of Object.keys(regions)) {
        const element = document.getElementById(regionId);
        if (!element) continue;
        
        // Очищаем старые обработчики
        element.removeEventListener('click', element._clickHandler);
        
        // Создаем новый обработчик
        const clickHandler = (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            console.log('🔘 Клик по региону:', regionId);
            
            // Убираем выделение со всех
            document.querySelectorAll('.region').forEach(r => {
                r.classList.remove('selected');
                r.style.stroke = '#2c2b1f';
                r.style.strokeWidth = '1';
            });
            
            // Выделяем текущий
            element.classList.add('selected');
            element.style.stroke = '#ffd700';
            element.style.strokeWidth = '3';
            
            // Вызываем функцию выбора
            if (window.selectRegion) {
                window.selectRegion(regionId);
            }
        };
        
        element._clickHandler = clickHandler;
        element.addEventListener('click', clickHandler);
        
        // Эффекты наведения
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
        
        // Убеждаемся, что курсор - указатель
        element.style.cursor = 'pointer';
    }
    
    console.log('✅ Интерактивность настроена');
}

window.updateRegionColor = updateRegionColor;
window.updateAllRegionColors = updateAllRegionColors;
window.setupMapInteractivity = setupMapInteractivity;
