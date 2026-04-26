// ========== ВСТАВЬТЕ ЭТУ ФУНКЦИЮ В КОНЕЦ gameCore.js ==========

function selectRegion(regionId) {
    window.selectedRegionId = regionId;
    const region = window.gameState.allRegions[regionId];
    if (!region) return;
    
    const panel = document.getElementById('selectedRegionPanel');
    const conquerBtn = document.getElementById('conquerBtn');
    
    if (region.owner === "player") {
        panel.innerHTML = `
            <p><strong>🏰 ${region.name}</strong> <span style="color:#3a86ff">(ваш)</span></p>
            <p>👥 Население: ${region.population}M</p>
            <p>💰 Золото: ${region.gold} (+${region.gold}/ход)</p>
            <p>🛡️ Оборона: ${region.defense}</p>
            <p>🔗 Соседей: ${region.neighbors.length}</p>
            <p class="neighbor-list">${region.neighbors.slice(0,5).map(n => window.gameState.allRegions[n]?.name || n).join(', ')}${region.neighbors.length > 5 ? '...' : ''}</p>
        `;
        if (conquerBtn) {
            conquerBtn.disabled = true;
            conquerBtn.textContent = "✓ Уже ваш";
        }
    } else {
        const canConquer = canConquerRegion(regionId);
        const ownerName = getOwnerName(region.owner);
        const cost = region.defense * 3;
        
        panel.innerHTML = `
            <p><strong>🏰 ${region.name}</strong></p>
            <p>👥 Население: ${region.population}M</p>
            <p>💰 Золото: ${region.gold}</p>
            <p>🛡️ Оборона: ${region.defense}</p>
            <p>👑 Владелец: ${ownerName}</p>
            <p>💰 Стоимость захвата: ${cost}</p>
            <p>🔗 Соседей: ${region.neighbors.length}</p>
            <p class="neighbor-list">${region.neighbors.slice(0,5).map(n => window.gameState.allRegions[n]?.name || n).join(', ')}${region.neighbors.length > 5 ? '...' : ''}</p>
        `;
        if (conquerBtn) {
            conquerBtn.disabled = !canConquer;
            conquerBtn.textContent = canConquer ? `⚔️ Захватить (${cost}💰)` : "❌ Нет соседнего региона";
        }
    }
}

// Обновите функцию assignStartingRegions, чтобы убедиться, что все ID корректны
function assignStartingRegions() {
    const allIds = Object.keys(window.gameState.allRegions);
    if (allIds.length < 9) {
        console.error('Недостаточно регионов для старта');
        return;
    }
    
    // Перемешиваем
    const shuffled = [...allIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Очищаем
    window.gameState.player.regions = [];
    window.gameState.ais.ai1.regions = [];
    window.gameState.ais.ai2.regions = [];
    
    for (const id of allIds) {
        window.gameState.allRegions[id].owner = null;
    }
    
    // Игрок (3 региона)
    shuffled.slice(0, 3).forEach(id => {
        window.gameState.allRegions[id].owner = "player";
        window.gameState.player.regions.push(id);
        if (typeof updateRegionColor === 'function') updateRegionColor(id);
    });
    
    // AI1 (3 региона)
    shuffled.slice(3, 6).forEach(id => {
        window.gameState.allRegions[id].owner = "ai1";
        window.gameState.ais.ai1.regions.push(id);
        if (typeof updateRegionColor === 'function') updateRegionColor(id);
    });
    
    // AI2 (3 региона)
    shuffled.slice(6, 9).forEach(id => {
        window.gameState.allRegions[id].owner = "ai2";
        window.gameState.ais.ai2.regions.push(id);
        if (typeof updateRegionColor === 'function') updateRegionColor(id);
    });
    
    console.log(`Стартовые регионы:`);
    console.log(`Игрок (${window.gameState.player.regions.length}): ${window.gameState.player.regions.map(id => window.gameState.allRegions[id]?.name).join(', ')}`);
    console.log(`AI1 (${window.gameState.ais.ai1.regions.length}): ${window.gameState.ais.ai1.regions.map(id => window.gameState.allRegions[id]?.name).join(', ')}`);
    console.log(`AI2 (${window.gameState.ais.ai2.regions.length}): ${window.gameState.ais.ai2.regions.map(id => window.gameState.allRegions[id]?.name).join(', ')}`);
}

// Экспорт
window.selectRegion = selectRegion;
window.assignStartingRegions = assignStartingRegions;
window.canConquerRegion = canConquerRegion;
window.getOwnerName = getOwnerName;
