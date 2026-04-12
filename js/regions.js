// ========== HEIRLOOM - ДАННЫЕ РЕГИОНОВ ==========

const ALL_REGIONS = {};

// Функция для загрузки регионов из SVG
function loadRegionsFromSVG() {
    const svg = document.getElementById('gameMap');
    
    // Проверяем наличие SVG
    if (!svg) {
        console.error('❌ SVG элемент не найден!');
        alert('Ошибка: SVG карта не найдена. Проверьте файл data/map.svg');
        return {};
    }
    
    // Ищем все path элементы
    let paths = svg.querySelectorAll('path');
    
    // Если path нет, возможно это полигоны
    if (paths.length === 0) {
        paths = svg.querySelectorAll('polygon');
        console.log('🔍 Найдены полигоны:', paths.length);
    }
    
    // Если все равно 0, показываем ошибку
    if (paths.length === 0) {
        console.error('❌ В SVG не найдено ни одного path или polygon!');
        console.log('Первые 500 символов SVG:', svg.innerHTML.substring(0, 500));
        alert('Ошибка: В SVG файле нет регионов. Проверьте формат карты.');
        return {};
    }
    
    console.log(`✅ Найдено ${paths.length} регионов в SVG`);
    
    // Обрабатываем каждый регион
    paths.forEach((element, index) => {
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
        
        // Получаем цвет
        let originalFill = element.getAttribute('fill');
        if (!originalFill || originalFill === 'none') {
            originalFill = '#8aad7a';
        }
        
        // Сохраняем данные
        ALL_REGIONS[id] = {
            id: id,
            name: name,
            originalFill: originalFill,
            owner: null,
            population: Math.floor(Math.random() * 10) + 1,
            gold: Math.floor(Math.random() * 200) + 50,
            defense: Math.floor(Math.random() * 50) + 10,
            neighbors: []
        };
        
        // Добавляем класс и обработчик
        element.classList.add('region');
        element.setAttribute('title', name);
        
        // Добавляем обработчик клика
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.selectRegion) {
                window.selectRegion(id);
            } else {
                console.log('Клик по региону:', name, id);
                alert(`Выбран регион: ${name}\nПока нет обработчика, но это можно исправить!`);
            }
        });
        
        // Меняем внешний вид при наведении
        element.style.transition = 'stroke 0.15s ease';
        element.addEventListener('mouseenter', () => {
            element.setAttribute('stroke', '#ffd700');
            element.setAttribute('stroke-width', '2');
        });
        element.addEventListener('mouseleave', () => {
            element.setAttribute('stroke', '#2c2b1f');
            element.setAttribute('stroke-width', '1');
        });
    });
    
    console.log(`✅ Загружено ${Object.keys(ALL_REGIONS).length} регионов`);
    
    // Находим соседей
    findNeighborsByProximity();
    
    return ALL_REGIONS;
}

// Поиск соседей по пересечению bounding box'ов
function findNeighborsByProximity() {
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
            
            // Проверка пересечения bounding box'ов
            if (bbox.x + bbox.width > otherBBox.x &&
                otherBBox.x + otherBBox.width > bbox.x &&
                bbox.y + bbox.height > otherBBox.y &&
                otherBBox.y + otherBBox.height > bbox.y) {
                if (!ALL_REGIONS[id].neighbors.includes(otherEl.id)) {
                    ALL_REGIONS[id].neighbors.push(otherEl.id);
                }
            }
        }
        
        // Ограничиваем количество соседей
        if (ALL_REGIONS[id].neighbors.length > 12) {
            ALL_REGIONS[id].neighbors = ALL_REGIONS[id].neighbors.slice(0, 12);
        }
    }
    
    console.log('🔗 Соседи найдены для всех регионов');
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
