// ========== ДАННЫЕ РЕГИОНОВ ==========

function loadRegionsFromSVG() {
    const svg = document.getElementById('gameMap');
    if (!svg) {
        console.error('❌ SVG элемент не найден');
        return {};
    }
    
    // Ищем все графические элементы
    const elements = svg.querySelectorAll('path, polygon, rect, circle, ellipse');
    
    if (elements.length === 0) {
        console.error('❌ В SVG нет элементов для регионов');
        return {};
    }
    
    console.log(`✅ Найдено ${elements.length} элементов для обработки`);
    
    const regions = {};
    
    elements.forEach((element, index) => {
        let id = element.id;
        if (!id || id === '') {
            id = `region_${index}`;
            element.id = id;
        }
        
        const name = element.getAttribute('data-name') || 
                     element.getAttribute('title') || 
                     element.getAttribute('name') ||
                     `Регион ${index + 1}`;
        
        const originalFill = element.getAttribute('fill') || '#c0c0c0';
        
        regions[id] = {
            id: id,
            name: name,
            originalFill: originalFill,
            owner: null,
            population: Math.floor(Math.random() * 10) + 1,
            gold: Math.floor(Math.random() * 150) + 50,
            defense: Math.floor(Math.random() * 40) + 15,
            neighbors: []
        };
        
        // Добавляем классы и атрибуты
        element.classList.add('region');
        element.setAttribute('title', name);
        
        // Устанавливаем начальный цвет (нейтральный)
        if (!element.getAttribute('fill') || element.getAttribute('fill') === '#000000') {
            element.setAttribute('fill', '#c0c0c0');
        }
        element.setAttribute('stroke', '#2c2b1f');
        element.setAttribute('stroke-width', '1');
    });
    
    // Находим соседей
    findNeighborsByProximity(regions);
    
    console.log(`✅ Загружено ${Object.keys(regions).length} регионов`);
    return regions;
}

function findNeighborsByProximity(regions) {
    const svg = document.getElementById('gameMap');
    if (!svg) return;
    
    const elements = Array.from(svg.querySelectorAll('.region'));
    
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const id = el.id;
        if (!regions[id]) continue;
        
        try {
            const bbox = el.getBBox();
            const buffer = 20; // Буфер для определения соседства
            
            for (let j = 0; j < elements.length; j++) {
                if (i === j) continue;
                const otherEl = elements[j];
                const otherId = otherEl.id;
                if (!regions[otherId]) continue;
                
                const otherBBox = otherEl.getBBox();
                
                // Проверяем пересечение или близость
                if (bbox.x + bbox.width + buffer > otherBBox.x &&
                    otherBBox.x + otherBBox.width + buffer > bbox.x &&
                    bbox.y + bbox.height + buffer > otherBBox.y &&
                    otherBBox.y + otherBBox.height + buffer > bbox.y) {
                    if (!regions[id].neighbors.includes(otherId)) {
                        regions[id].neighbors.push(otherId);
                    }
                }
            }
        } catch(e) {
            console.warn(`Ошибка при расчете соседей для ${id}:`, e);
        }
    }
    
    console.log('✅ Соседи рассчитаны');
}

window.loadRegionsFromSVG = loadRegionsFromSVG;
window.findNeighborsByProximity = findNeighborsByProximity;
