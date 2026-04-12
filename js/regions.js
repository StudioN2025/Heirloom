// ========== HEIRLOOM - ДАННЫЕ РЕГИОНОВ ==========

const ALL_REGIONS = {};

// Функция для загрузки регионов из SVG
function loadRegionsFromSVG() {
    const svg = document.getElementById('gameMap');
    if (!svg) {
        console.error('❌ SVG элемент не найден');
        return {};
    }
    
    // Ищем все path и polygon элементы
    let elements = svg.querySelectorAll('path, polygon, rect, circle');
    
    if (elements.length === 0) {
        console.error('❌ В SVG нет элементов path/polygon/rect');
        return {};
    }
    
    console.log(`✅ Найдено ${elements.length} элементов для обработки`);
    
    const regions = {};
    
    elements.forEach((element, index) => {
        // Генерируем ID
        let id = element.id;
        if (!id || id === '') {
            id = `region_${index}`;
            element.id = id;
        }
        
        // Получаем имя
        let name = element.getAttribute('data-name') || 
                   element.getAttribute('title') || 
                   element.getAttribute('name') ||
                   `Регион ${index + 1}`;
        
        // Сохраняем оригинальный цвет
        let originalFill = element.getAttribute('fill');
        if (!originalFill || originalFill === 'none' || originalFill === '#000000' || originalFill === 'black') {
            originalFill = '#c0c0c0';
        }
        
        // Сохраняем данные
        regions[id] = {
            id: id,
            name: name,
            originalFill: originalFill,
            owner: null,
            population: Math.floor(Math.random() * 10) + 1,
            gold: Math.floor(Math.random() * 200) + 50,
            defense: Math.floor(Math.random() * 50) + 10,
            neighbors: []
        };
        
        // Добавляем классы и атрибуты
        element.classList.add('region');
        element.classList.add('neutral');
        element.setAttribute('title', name);
        
        // Устанавливаем начальный цвет (светло-серый)
        element.setAttribute('fill', '#c0c0c0');
        element.setAttribute('stroke', '#2c2b1f');
        element.setAttribute('stroke-width', '0.8');
        
        // Добавляем обработчик клика
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.region').forEach(r => r.classList.remove('selected'));
            element.classList.add('selected');
            if (window.selectRegion) {
                window.selectRegion(id);
            }
        });
        
        // Стилизация при наведении
        element.addEventListener('mouseenter', () => {
            if (!element.classList.contains('selected')) {
                element.setAttribute('stroke', '#ffd700');
                element.setAttribute('stroke-width', '2');
            }
        });
        element.addEventListener('mouseleave', () => {
            if (!element.classList.contains('selected')) {
                element.setAttribute('stroke', '#2c2b1f');
                element.setAttribute('stroke-width', '0.8');
            }
        });
    });
    
    // Находим соседей
    findNeighborsByProximity(regions);
    
    console.log(`✅ Загружено ${Object.keys(regions).length} регионов`);
    return regions;
}

// Поиск соседей по пересечению bounding box'ов
function findNeighborsByProximity(regions) {
    const svg = document.getElementById('gameMap');
    const elements = Array.from(svg.querySelectorAll('.region'));
    
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const id = el.id;
        const bbox = el.getBBox();
        
        for (let j = 0; j < elements.length; j++) {
            if (i === j) continue;
            const otherEl = elements[j];
            const otherBBox = otherEl.getBBox();
            
            if (bbox.x + bbox.width > otherBBox.x &&
                otherBBox.x + otherBBox.width > bbox.x &&
                bbox.y + bbox.height > otherBBox.y &&
                otherBBox.y + otherBBox.height > bbox.y) {
                if (!regions[id].neighbors.includes(otherEl.id)) {
                    regions[id].neighbors.push(otherEl.id);
                }
            }
        }
        
        if (regions[id].neighbors.length > 12) {
            regions[id].neighbors = regions[id].neighbors.slice(0, 12);
        }
    }
}

// Функции для работы с регионами
function getRegion(id) {
    return ALL_REGIONS[id];
}

function setRegionOwner(regionId, newOwner) {
    if (ALL_REGIONS[regionId]) {
        ALL_REGIONS[regionId].owner = newOwner;
        updateRegionColor(regionId);
        return true;
    }
    return false;
}

function updateRegionColor(regionId) {
    const region = ALL_REGIONS[regionId];
    const element = document.getElementById(regionId);
    
    // Добавляем проверку на существование
    if (!region || !element) {
        console.warn(`Регион ${regionId} не найден для обновления цвета`);
        return;
    }
    
    element.classList.remove('owner-player', 'owner-ai1', 'owner-ai2', 'neutral');
    
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
        element.setAttribute('fill', '#c0c0c0');
        element.classList.add('neutral');
    }
}

// Экспорт
window.ALL_REGIONS = ALL_REGIONS;
window.getRegion = getRegion;
window.setRegionOwner = setRegionOwner;
window.loadRegionsFromSVG = loadRegionsFromSVG;
window.updateRegionColor = updateRegionColor;
