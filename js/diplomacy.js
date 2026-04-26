// ========== ДИПЛОМАТИЯ ==========

function declareWar() {
    const select = document.getElementById('aiSelect');
    if (!select) return;
    
    const target = select.value;
    
    if (window.gameState.wars[target]) {
        addLog(`⚠️ Уже в войне с ${window.gameState.ais[target].name}!`, "war");
        return;
    }
    
    window.gameState.wars[target] = true;
    addLog(`⚔️ ${window.gameState.player.name} объявляет войну ${window.gameState.ais[target].name}!`, "war");
}

function makePeace() {
    const select = document.getElementById('aiSelect');
    if (!select) return;
    
    const target = select.value;
    
    if (!window.gameState.wars[target]) {
        addLog(`ℹ️ Нет войны с ${window.gameState.ais[target].name}`, "system");
        return;
    }
    
    window.gameState.wars[target] = false;
    addLog(`🕊️ Заключен мир с ${window.gameState.ais[target].name}`, "peace");
}

window.declareWar = declareWar;
window.makePeace = makePeace;
