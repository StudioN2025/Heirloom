// ========== ЗАГРУЗКА РЕГИОНОВ ИЗ SVG ==========

function loadRegionsFromSVG() {
    const svg = document.getElementById('gameMap');
    if (!svg) {
        console.error('❌ SVG не найден');
        return {};
    }
    
    console.log('🔍 Поиск элементов в SVG...');
    
    // Ищем все полигоны и пути
    const elements = svg.querySelectorAll('polygon, path');
    console.log(`📊 Найдено элементов: ${elements.length}`);
    
    if (elements.length === 0) {
        console.error('❌ Нет элементов polygon/path в SVG');
        
        // Показываем структуру SVG для отладки
        console.log('SVG innerHTML первые 500 символов:', svg.innerHTML.substring(0, 500));
        return {};
    }
    
    const regions = {};
    let counter = 0;
    
    elements.forEach((el, index) => {
        // Создаем или получаем ID
        let id = el.id;
        if (!id || id === '') {
            id = `region_${counter++}`;
            el.id = id;
            console.log(`   Создан ID ${id} для элемента ${index}`);
        }
        
        // Получаем имя
        let name = el.getAttribute('data-name') || 
                   el.getAttribute('title') || 
                   el.getAttribute('name') ||
                   `Регион ${index + 1}`;
        
        // Случайные характеристики
        const population = Math.floor(Math.random() * 12) + 2;
        const gold = Math.floor(Math.random() * 100) + 30;
        const defense = Math.floor(Math.random() * 30) + 8;
        
        regions[id] = {
            id: id,
            name: name,
            owner: null,
            population: population,
            gold: gold,
            defense: defense,
            neighbors: []
        };
        
        // Добавляем классы и стили
        el.classList.add('region');
        el.setAttribute('title', name);
        el.style.fill = '#c0c0c0';
        el.style.stroke = '#2c2b1f';
        el.style.strokeWidth = '1';
        el.style.cursor = 'pointer';
        
        console.log(`   📍 Регион ${index + 1}: ${name} (id: ${id})`);
    });
    
    console.log(`✅ Загружено ${Object.keys(regions).length} регионов`);
    
    // Находим соседей
    findNeighborsByDistance(regions);
    
    return regions;
}

function findNeighborsByDistance(regions) {
    const elements = Array.from(document.querySelectorAll('.region'));
    const centers = {};
    
    console.log('🔍 Поиск соседей...');
    
    // Получаем центры
    for (const el of elements) {
        const id = el.id;
        if (!regions[id]) continue;
        try {
            const bbox = el.getBBox();
            centers[id] = {
                x: bbox.x + bbox.width / 2,
                y: bbox.y + bbox.height / 2
            };
        } catch(e) {
            console.warn(`Не удалось получить BBox для ${id}`);
        }
    }
    
    const ids = Object.keys(regions);
    let connections = 0;
    
    for (let i = 0; i < ids.length; i++) {
        const id1 = ids[i];
        const c1 = centers[id1];
        if (!c1) continue;
        
        for (let j = i + 1; j < ids.length && j < i + 30; j++) {
            const id2 = ids[j];
            const c2 = centers[id2];
            if (!c2) continue;
            
            const dx = c1.x - c2.x;
            const dy = c1.y - c2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 70) {
                if (!regions[id1].neighbors.includes(id2)) {
                    regions[id1].neighbors.push(id2);
                    regions[id2].neighbors.push(id1);
                    connections++;
                }
            }
        }
    }
    
    console.log(`🔗 Установлено ${connections} связей между регионами`);
}

window.loadRegionsFromSVG = loadRegionsFromSVG;
