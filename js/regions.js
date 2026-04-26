// ========== HEIRLOOM - ДАННЫЕ РЕГИОНОВ ==========
// Адаптировано для карты с полигонами класса st0

function loadRegionsFromSVG() {
    const svg = document.getElementById('gameMap');
    if (!svg) {
        console.error('❌ SVG элемент не найден');
        return {};
    }
    
    // Ищем все полигоны с классом st0 (ваши регионы)
    let elements = svg.querySelectorAll('polygon.st0');
    
    // Если не найдены полигоны st0, ищем все path и polygon
    if (elements.length === 0) {
        elements = svg.querySelectorAll('path, polygon, rect, circle');
    }
    
    if (elements.length === 0) {
        console.error('❌ В SVG нет элементов для регионов');
        return {};
    }
    
    console.log(`✅ Найдено ${elements.length} регионов для обработки`);
    
    const regions = {};
    let regionCounter = 0;
    
    // Список названий для регионов (если в SVG нет data-name)
    const defaultNames = [
        "Северная Марка", "Восточный Предел", "Южная Провинция", "Западные Земли",
        "Центральные Равнины", "Прибрежные Территории", "Горные Кряжи", "Лесные Угодья",
        "Золотые Поля", "Серебряные Холмы", "Медные Копи", "Железные Рудники",
        "Алмазные Пещеры", "Изумрудные Луга", "Сапфировые Воды", "Рубиновые Скалы",
        "Янтарный Берег", "Жемчужный Залив", "Коралловый Риф", "Лазурное Побережье",
        "Тёмный Лес", "Туманные Топи", "Скалистые Вершины", "Долина Ветров",
        "Северные Степи", "Восточные Пустоши", "Южные Болота", "Западные Холмы",
        "Королевские Земли", "Пограничье", "Старые Владения", "Новые Территории",
        "Равнина Героев", "Долина Королей", "Плато Мудрецов", "Пустыня Забвения",
        "Озерный Край", "Речная Долина", "Морской Берег", "Островные Земли"
    ];
    
    elements.forEach((element, index) => {
        // Генерируем ID, если его нет
        let id = element.id;
        if (!id || id === '') {
            id = `region_${regionCounter++}`;
            element.id = id;
        }
        
        // Получаем имя из атрибутов
        let name = element.getAttribute('data-name') || 
                   element.getAttribute('title') || 
                   element.getAttribute('name');
        
        // Если имени нет, берем из координат для уникальности
        if (!name) {
            const points = element.getAttribute('points');
            if (points) {
                const coords = points.split(' ')[0].split(',');
                name = `Регион ${index + 1}`;
            } else {
                name = defaultNames[index % defaultNames.length];
            }
        }
        
        // Сохраняем оригинальный цвет
        let originalFill = element.getAttribute('fill');
        if (!originalFill || originalFill === 'none' || originalFill === '#000000') {
            originalFill = '#b9b8b8';
        }
        
        // Случайные, но сбалансированные характеристики
        const popBase = Math.floor(Math.random() * 15) + 2;
        const goldBase = Math.floor(Math.random() * 200) + 40;
        const defenseBase = Math.floor(Math.random() * 45) + 10;
        
        regions[id] = {
            id: id,
            name: name,
            originalFill: originalFill,
            owner: null,
            population: popBase,
            gold: goldBase,
            defense: defenseBase,
            neighbors: []
        };
        
        // Добавляем классы и атрибуты
        element.classList.add('region');
        element.setAttribute('title', name);
        
        // Устанавливаем начальный цвет (нейтральный)
        element.setAttribute('fill', '#c0c0c0');
        element.setAttribute('stroke', '#2c2b1f');
        element.setAttribute('stroke-width', '1');
        
        // Принудительно убираем стили класса st0, чтобы работала перекраска
        element.style.fill = '#c0c0c0';
    });
    
    // Находим соседей по позициям
    findNeighborsByPosition(regions);
    
    console.log(`✅ Загружено ${Object.keys(regions).length} регионов`);
    console.log(`✅ Соседние связи установлены`);
    
    return regions;
}

function findNeighborsByPosition(regions) {
    const svg = document.getElementById('gameMap');
    if (!svg) return;
    
    const elements = Array.from(svg.querySelectorAll('.region'));
    
    // Получаем центры всех регионов
    const regionCenters = {};
    
    for (const element of elements) {
        const id = element.id;
        if (!regions[id]) continue;
        
        try {
            const bbox = element.getBBox();
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;
            regionCenters[id] = { x: centerX, y: centerY, bbox: bbox };
        } catch(e) {
            console.warn(`Ошибка получения BBox для ${id}:`, e);
        }
    }
    
    // Устанавливаем связи между регионами на основе расстояния между центрами
    const regionIds = Object.keys(regionCenters);
    const DISTANCE_THRESHOLD = 80; // Порог расстояния для соседства
    
    for (let i = 0; i < regionIds.length; i++) {
        const id1 = regionIds[i];
        const center1 = regionCenters[id1];
        if (!center1) continue;
        
        for (let j = i + 1; j < regionIds.length; j++) {
            const id2 = regionIds[j];
            const center2 = regionCenters[id2];
            if (!center2) continue;
            
            // Вычисляем расстояние между центрами
            const dx = center1.x - center2.x;
            const dy = center1.y - center2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Проверяем пересечение bounding box'ов с буфером
            const bbox1 = center1.bbox;
            const bbox2 = center2.bbox;
            const buffer = 30;
            
            const boxesIntersect = (
                bbox1.x + bbox1.width + buffer > bbox2.x &&
                bbox2.x + bbox2.width + buffer > bbox1.x &&
                bbox1.y + bbox1.height + buffer > bbox2.y &&
                bbox2.y + bbox2.height + buffer > bbox1.y
            );
            
            if (boxesIntersect || distance < DISTANCE_THRESHOLD) {
                if (!regions[id1].neighbors.includes(id2)) {
                    regions[id1].neighbors.push(id2);
                }
                if (!regions[id2].neighbors.includes(id1)) {
                    regions[id2].neighbors.push(id1);
                }
            }
        }
    }
    
    // Для регионов без соседей добавляем ближайшие
    for (const id of regionIds) {
        if (regions[id].neighbors.length === 0) {
            // Находим ближайший регион
            let minDist = Infinity;
            let closest = null;
            const center1 = regionCenters[id];
            
            for (const otherId of regionIds) {
                if (otherId === id) continue;
                const center2 = regionCenters[otherId];
                if (!center2) continue;
                
                const dx = center1.x - center2.x;
                const dy = center1.y - center2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < minDist) {
                    minDist = dist;
                    closest = otherId;
                }
            }
            
            if (closest) {
                regions[id].neighbors.push(closest);
                regions[closest].neighbors.push(id);
            }
        }
    }
    
    // Логируем статистику соседей
    let totalNeighbors = 0;
    let maxNeighbors = 0;
    for (const id of regionIds) {
        totalNeighbors += regions[id].neighbors.length;
        maxNeighbors = Math.max(maxNeighbors, regions[id].neighbors.length);
    }
    console.log(`📊 Среднее кол-во соседей: ${(totalNeighbors / regionIds.length).toFixed(1)}, максимум: ${maxNeighbors}`);
}

// Экспорт функций
window.loadRegionsFromSVG = loadRegionsFromSVG;
