// ========== ОТРИСОВКА КАРТЫ И ЦВЕТА РЕГИОНОВ ==========

function updateRegionColor(regionId) {
    console.log('🎨 updateRegionColor вызван для', regionId);
    
    if (!window.gameState) {
        console.warn('gameState не инициализирован');
        return;
    }
    
    const region = window.gameState.allRegions[regionId];
    const element = document.getElementById(regionId);
    
    if (!region) {
        console.warn('Регион не найден в gameState:', regionId);
        return;
    }
    
    if (!element) {
        console.warn('Элемент SVG не найден:', regionId);
        return;
    }
    
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
    
    console.log(`   ${region.name} → ${region.owner || 'neutral'} → ${newColor}`);
    
    element.style.fill = newColor;
    element.setAttribute('fill', newColor);
}

function updateAllRegionColors() {
    console.log('🎨 Обновление цветов всех регионов');
    if (!window.gameState?.allRegions) return;
    
    for (const id of Object.keys(window.gameState.allRegions)) {
        updateRegionColor(id);
    }
}

function setupMapInteractivity(regions) {
    console.log('🖱️ Настройка интерактивности для', Object.keys(regions).length, 'регионов');
    
    let clickableCount = 0;
    
    for (const regionId of Object.keys(regions)) {
        const element = document.getElementById(regionId);
        
        if (!element) {
            console.warn(`Элемент ${regionId} не найден в DOM`);
            continue;
        }
        
        // Удаляем старые обработчики
        const oldHandler = element._clickHandler;
        if (oldHandler) {
            element.removeEventListener('click', oldHandler);
        }
        
        // Создаем новый обработчик клика
        const clickHandler = function(e) {
            e.stopPropagation();
            e.preventDefault();
            console.log('🔘 КЛИК по региону:', regionId, regions[regionId]?.name);
            
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
            } else {
                console.error('selectRegion не определена!');
            }
        };
        
        element._clickHandler = clickHandler;
        element.addEventListener('click', clickHandler);
        
        // Делаем курсор указателем
        element.style.cursor = 'pointer';
        
        // Добавляем эффекты наведения
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
        
        clickableCount++;
    }
    
    console.log(`✅ Настроено ${clickableCount} кликабельных регионов`);
    
    if (clickableCount === 0) {
        console.error('❌ НЕТ КЛИКАБЕЛЬНЫХ РЕГИОНОВ! Проверьте SVG и ID элементов.');
    }
}

// Экспорт
window.updateRegionColor = updateRegionColor;
window.updateAllRegionColors = updateAllRegionColors;
window.setupMapInteractivity = setupMapInteractivity;
