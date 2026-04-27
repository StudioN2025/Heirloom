// ========== ИИ ЛОГИКА ==========

function aiTurn() {
    if (!window.gameState) return;
    
    for (const [aiId, ai] of Object.entries(window.gameState.ais)) {
        if (!ai.regions.length) continue;
        
        const aiIncome = ai.regions.reduce((sum, id) => 
            sum + (window.gameState.allRegions[id]?.gold || 0), 0);
        ai.treasury += aiIncome;
        
        const possibleTargets = [];
        
        for (const regionId of ai.regions) {
            const region = window.gameState.allRegions[regionId];
            if (!region) continue;
            
            for (const neighborId of region.neighbors) {
                const neighbor = window.gameState.allRegions[neighborId];
                if (neighbor && neighbor.owner === null) {
                    possibleTargets.push({
                        id: neighborId,
                        cost: neighbor.defense * 2,
                        value: neighbor.gold,
                        name: neighbor.name
                    });
                }
            }
        }
        
        possibleTargets.sort((a, b) => (b.value / b.cost) - (a.value / a.cost));
        
        for (const target of possibleTargets) {
            if (ai.treasury >= target.cost) {
                ai.treasury -= target.cost;
                const region = window.gameState.allRegions[target.id];
                region.owner = aiId;
                ai.regions.push(target.id);
                if (typeof updateRegionColor === 'function') {
                    updateRegionColor(target.id);
                }
                addLog(`⚔️ ${ai.name} захватил ${target.name}!`, "war");
                break;
            }
        }
        
        if (window.gameState.wars[aiId]) {
            performWarAction(aiId, ai);
        }
    }
}

function performWarAction(aiId, ai) {
    const enemyRegions = [];
    
    for (const regionId of ai.regions) {
        const region = window.gameState.allRegions[regionId];
        if (!region) continue;
        
        for (const neighborId of region.neighbors) {
            const neighbor = window.gameState.allRegions[neighborId];
            if (!neighbor) continue;
            
            if (neighbor.owner === "player") {
                enemyRegions.push({ id: neighborId, owner: "player", name: neighbor.name });
            } else if (neighbor.owner === "ai2" && aiId === "ai1" && window.gameState.wars.ai2) {
                enemyRegions.push({ id: neighborId, owner: "ai2", name: neighbor.name });
            } else if (neighbor.owner === "ai1" && aiId === "ai2" && window.gameState.wars.ai1) {
                enemyRegions.push({ id: neighborId, owner: "ai1", name: neighbor.name });
            }
        }
    }
    
    const uniqueTargets = [...new Map(enemyRegions.map(r => [r.id, r])).values()];
    
    if (uniqueTargets.length > 0 && ai.treasury >= 100) {
        const target = uniqueTargets[0];
        const targetRegion = window.gameState.allRegions[target.id];
        const cost = targetRegion.defense * 3;
        
        if (ai.treasury >= cost) {
            ai.treasury -= cost;
            const oldOwner = target.owner;
            
            if (oldOwner === "player") {
                const index = window.gameState.player.regions.indexOf(target.id);
                if (index !== -1) window.gameState.player.regions.splice(index, 1);
            } else if (window.gameState.ais[oldOwner]) {
                const index = window.gameState.ais[oldOwner].regions.indexOf(target.id);
                if (index !== -1) window.gameState.ais[oldOwner].regions.splice(index, 1);
            }
            
            targetRegion.owner = aiId;
            ai.regions.push(target.id);
            if (typeof updateRegionColor === 'function') {
                updateRegionColor(target.id);
            }
            
            addLog(`⚔️ ВОЙНА: ${ai.name} захватил ${target.name} у ${getOwnerName(oldOwner)}!`, "war");
            
            if (oldOwner === "player") {
                addLog(`⚠️ Вы потеряли регион!`, "war");
                if (typeof updateUI === 'function') updateUI();
            }
        }
    }
}

window.aiTurn = aiTurn;
