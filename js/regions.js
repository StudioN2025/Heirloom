// ========== ЗАГРУЗКА РЕГИОНОВ ИЗ SVG ==========

function loadRegionsFromSVG() {
    const svg = document.getElementById('gameMap');
    if (!svg) {
        console.error('❌ SVG не найден');
        return {};
    }
    
    // Ждем, пока SVG полностью загрузится
    const elements = svg.querySelectorAll('polygon, path');
    
    if (elements.length === 0) {
        console.error('❌ Нет элементов для регионов');
        return {};
    }
    
    console.log(`✅ Найдено ${elements.length} элементов`);
    
    const regions = {};
    let counter = 0;
    
    elements.forEach((el, index) => {
        let id = el.id;
        if (!id) {
            id = `region_${counter++}`;
            el.id = id;
        }
        
        let name = el.getAttribute('data-name') || 
                   el.getAttribute('title') || 
                   `Регион ${index + 1}`;
        
        regions[id] = {
            id: id,
            name: name,
            owner: null,
            population: Math.floor(Math.random() * 12) + 2,
            gold: Math.floor(Math.random() * 100) + 30,
            defense: Math.floor(Math.random() * 30) + 8,
            neighbors: []
        };
        
        el.classList.add('region');
        el.setAttribute('title', name);
        el.style.fill = '#c0c0c0';
        el.style.stroke = '#2c2b1f';
        el.style.strokeWidth = '1';
        el.style.cursor = 'pointer';
    });
    
    // Находим соседей
    findNeighborsByDistance(regions);
    
    console.log(`✅ Загружено ${Object.keys(regions).length} регионов`);
    return regions;
}

function findNeighborsByDistance(regions) {
    const elements = Array.from(document.querySelectorAll('.region'));
    const centers = {};
    
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
        } catch(e) {}
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
    
    console.log(`🔗 Установлено ${connections} связей`);
}

window.loadRegionsFromSVG = loadRegionsFromSVG;
