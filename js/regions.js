// ========== HEIRLOOM - ДАННЫЕ РЕГИОНОВ ==========
// Этот файл будет сгенерирован автоматически из твоего SVG
// Пока создаем заглушку, которую потом заменим

const ALL_REGIONS = {};

// Функция для загрузки регионов из SVG
function loadRegionsFromSVG() {
    const svg = document.getElementById('gameMap');
    const paths = svg.querySelectorAll('path');
    
    paths.forEach((path, index) => {
        const id = path.id || `region_${index}`;
        
        // Добавляем ID если нет
        if (!path.id) path.id = id;
        
        // Добавляем класс
        path.classList.add('region');
        
        // Сохраняем данные
        ALL_REGIONS[id] = {
            id: id,
            name: path.getAttribute('data-name') || `Регион ${index}`,
            originalFill: path.getAttribute('fill') || '#8aad7a',
            owner: null,
            population: Math.floor(Math.random() * 10) + 1,
            gold: Math.floor(Math.random() * 200) + 50,
            defense: Math.floor(Math.random() * 50) + 10,
            neighbors: []
        };
        
        // Добавляем обработчик клика
        path.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.selectRegion) window.selectRegion(id);
        });
        
        // Тултип
        path.setAttribute('title', ALL_REGIONS[id].name);
    });
    
    // Находим соседей (упрощенно через bounding box)
    findNeighborsByProximity();
    
    console.log(`✅ Загружено ${Object.keys(ALL_REGIONS).length} регионов`);
    return ALL_REGIONS;
}

// Поиск соседей по пересечению bounding box'ов
function findNeighborsByProximity() {
    const svg = document.getElementById('gameMap');
    const paths = Array.from(svg.querySelectorAll('path'));
    
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const id = path.id;
        const bbox = path.getBBox();
        
        for (let j = 0; j < paths.length; j++) {
            if (i === j) continue;
            const otherPath = paths[j];
            const otherBBox = otherPath.getBBox();
            
            // Проверка пересечения
            if (bbox.x + bbox.width > otherBBox.x &&
                otherBBox.x + otherBBox.width > bbox.x &&
                bbox.y + bbox.height > otherBBox.y &&
                otherBBox.y + otherBBox.height > bbox.y) {
                if (!ALL_REGIONS[id].neighbors.includes(otherPath.id)) {
                    ALL_REGIONS[id].neighbors.push(otherPath.id);
                }
            }
        }
        
        // Ограничиваем количество соседей
        if (ALL_REGIONS[id].neighbors.length > 12) {
            ALL_REGIONS[id].neighbors = ALL_REGIONS[id].neighbors.slice(0, 12);
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
    if (!element) return;
    
    if (region.owner === 'player') {
        element.setAttribute('fill', '#3a86ff');
        element.classList.add('player');
    } else if (region.owner === 'ai1') {
        element.setAttribute('fill', '#e63946');
        element.classList.remove('player');
    } else if (region.owner === 'ai2') {
        element.setAttribute('fill', '#4895ef');
        element.classList.remove('player');
    } else {
        element.setAttribute('fill', region.originalFill);
        element.classList.remove('player');
    }
}

// Экспорт для браузера
window.ALL_REGIONS = ALL_REGIONS;
window.getRegion = getRegion;
window.setRegionOwner = setRegionOwner;
window.loadRegionsFromSVG = loadRegionsFromSVG;
