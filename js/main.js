// main.js — НОВАЯ ТОЧКА ВХОДА (исправлен дубликат gameLoopId)

import { World } from './core/World.js';
import { EntityManager } from './core/EntityManager.js';
import { RendererWebGL } from './core/RendererWebGL.js';
import { GameState } from './core/GameState.js';
import { DataLoader } from './core/DataLoader.js';
import { AIController } from './ai/AIController.js';
import { UIManager } from './ui/UIManager.js';
import { WindowsManager } from './ui/Windows.js';
import { TopBar } from './ui/TopBar.js';
import { Notifications } from './ui/Notifications.js';
import { EconomySystem } from './systems/EconomySystem.js';
import { CombatSystem } from './systems/CombatSystem.js';
import { ProductionSystem } from './systems/ProductionSystem.js';
import { MovementSystem } from './systems/MovementSystem.js';
import { ArmyManager } from './systems/ArmyManager.js';
import { SupplySystem } from './systems/SupplySystem.js';
import { DiplomacySystem } from './systems/DiplomacySystem.js';
import { TechSystem, TECH_TREE, TECH_BRANCHES } from './systems/TechSystem.js';
import { FocusSystem, FOCUS_TREE } from './systems/FocusSystem.js';
import { loadFocusTree } from './data/FocusTree.js';
import { QueueSystem, TRAIN_DEFS, BUILD_DEFS } from './systems/QueueSystem.js';
import { addNotification, getCountryInfo } from './utils/helpers.js';
import { COUNTRIES } from './data/Countries.js';
import { t, setLanguage, getCurrentLanguage } from './i18n.js';

// Глобальные экземпляры
let world = null;
let entities = null;
let renderer = null;
let gameState = null;
let aiController = null;
let uiManager = null;
let windowsManager = null;
let topBar = null;
let notifications = null;
let economy = null;
let combat = null;
let movement = null;
let armyManager = null;
let production = null;
let supply = null;
let diplomacy = null;
let tech = null;
let focus = null;
let queue = null;

let animationFrameId = null;
let lastTimestamp = 0;
let needsRender = true;

async function init() {
    // Инициализация языка
    const savedLang = getCurrentLanguage();
    setLanguage(savedLang);
    const langBtn = document.getElementById('btn-lang');
    if (langBtn) langBtn.textContent = savedLang === 'ru' ? '🇷🇺' : '🇬🇧';

    console.log('🚀 Heirloom v4.0');

    // Минимальная инициализация — показываем меню сразу
    world = new World();
    entities = new EntityManager(50000);
    renderer = new RendererWebGL('map-canvas');
    gameState = new GameState();

    economy = new EconomySystem(world, entities, gameState);
    combat = new CombatSystem(world, entities, gameState);
    production = new ProductionSystem(world, entities, gameState, combat);
    movement = new MovementSystem(world, entities, gameState);
    armyManager = new ArmyManager(entities, gameState, world);
    window._armyManager = armyManager;
    supply = new SupplySystem(world, entities, gameState);
    diplomacy = new DiplomacySystem(gameState, world, entities);
    tech = new TechSystem(gameState);
    combat.tech = tech;
    window._TECH_TREE = TECH_TREE;
    window._TECH_BRANCHES = TECH_BRANCHES;
    window._FOCUS_TREE = FOCUS_TREE;
    window._COUNTRIES_MAP = COUNTRIES;
    focus = new FocusSystem(gameState, world, entities);

    notifications = new Notifications();
    topBar = new TopBar(gameState);
    windowsManager = new WindowsManager(world, entities, gameState, tech, focus);
    uiManager = new UIManager(world, entities, gameState, windowsManager, topBar);

    // Показываем меню — пользователь сам нажимает "НАЧАТЬ"
    setupEvents();

    // Загружаем настройки
    var savedScale = localStorage.getItem('heirloom_ui_scale');
    if (savedScale) {
        document.body.style.fontSize = (parseFloat(savedScale) * 14) + 'px';
        document.querySelectorAll('button').forEach(function(b) { b.style.fontSize = (parseFloat(savedScale) * 11) + 'px'; });
    }
}

// Загружаем ресурсы по кнопке
async function loadGameData() {
    showLoadingScreen();
    updateLoadingBar(10, t('loading.map'));

    const loader = new DataLoader();
    await loader.loadMap('maps/europe.json', world);

    updateLoadingBar(50, t('loading.terrain'));
    world.generateTerrain();

    updateLoadingBar(60, t('loading.focuses'));
    const loadedFocuses = await loadFocusTree();
    window._FOCUS_TREE = loadedFocuses;

    updateLoadingBar(75, t('loading.resources'));
    await preloadResources();

    updateLoadingBar(85, t('loading.ai'));
    aiController = new AIController(world, entities, gameState);
    aiController.production = production;
    await aiController.init();

    updateLoadingBar(100, t('loading.done'));
    setTimeout(() => hideLoadingScreen(), 300);
    showCountrySelection();
}

async function preloadResources() {
    const images = [
        { src: 'assets/army/germany_soldier.png', name: 'germany_soldier' },
        { src: 'assets/army/france_soldier.png', name: 'france_soldier' },
        { src: 'assets/army/soviet_soldier.png', name: 'soviet_soldier' },
    ];
    const failed = [];
    const timeout = new Promise(resolve => setTimeout(resolve, 10000));
    const loads = Promise.all(images.map(({ src, name }) => new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => { failed.push(name); resolve(); };
        img.src = src;
    })));
    await Promise.race([loads, timeout]);

    if (failed.length > 0) {
        addNotification(t('notifications.noLoadResources') + failed.join(', ') + t('notifications.badInternet'), 'war');
    }
}

function setupEvents() {
    // Кнопки меню
    const btnPlay = document.getElementById('btn-play');
    const btnCancel = document.getElementById('btn-cancel');
    const closeWindowBtn = document.getElementById('close-window');
    const closeSidebarBtn = document.getElementById('close-sidebar');

    if (btnPlay) btnPlay.onclick = () => loadGameData();

    // Кнопка настроек
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) btnSettings.onclick = () => {
        document.getElementById('settings-overlay').classList.remove('hidden');
        updateSettingsUI();
    };

    if (btnCancel) btnCancel.onclick = () => hideCountrySelection();
    if (closeWindowBtn) closeWindowBtn.onclick = () => {
        // Если открыто окно капитуляции — не даём закрыть без выбора
        if (window._capitulationPending) return;
        uiManager.closeWindow();
    };
    if (closeSidebarBtn) closeSidebarBtn.onclick = () => uiManager.closeSidebar();

    // Кнопки скорости
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.onclick = () => {
            const speed = parseInt(btn.dataset.speed);
            if (isNaN(speed)) return;
            gameState.setGameSpeed(speed);
            updateSpeedButtons(speed);
        };
    });

    // Кнопка полноэкранного режима
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
        const el = document.documentElement;
        if (!document.fullscreenElement) {
            if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen().catch(() => {});
            else if (el.msRequestFullscreen) el.msRequestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen().catch(() => {});
        }
    });

    // Кнопка смены языка
    document.getElementById('btn-lang')?.addEventListener('click', () => {
        const current = getCurrentLanguage();
        const newLang = current === 'ru' ? 'en' : 'ru';
        setLanguage(newLang);
        const btn = document.getElementById('btn-lang');
        if (btn) btn.textContent = newLang === 'ru' ? '🇷🇺' : '🇬🇧';
    });

    // Кнопки вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            if (btn.dataset.tab === 'save') {
                uiManager.openWindow('save');
            } else {
                uiManager.openWindow(btn.dataset.tab);
            }
        };
    });

    // Клики по карте
    const canvas = document.getElementById('map-canvas');
    if (canvas) {
        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('contextmenu', handleCanvasRightClick);
        canvas.addEventListener('wheel', handleCanvasWheel);

        // Shift+drag — выделение юнитов как кистью
        let shiftDragging = false;
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0 && e.shiftKey) {
                shiftDragging = true;
                if (window._recruitMode || window._pendingBuild) return;
                const worldPos = renderer.screenToWorld(e.clientX, e.clientY);
                const unitId = entities.getUnitAt(worldPos.x, worldPos.y);
                if (unitId !== null && entities.owner[unitId] === gameState.myCountryId) {
                    const sel = gameState._selectedUnits;
                    const idx = sel.indexOf(unitId);
                    if (idx >= 0) sel.splice(idx, 1);
                    else sel.push(unitId);
                }
            }
        });
        canvas.addEventListener('mousemove', (e) => {
            if (!shiftDragging) return;
            if (window._recruitMode || window._pendingBuild) {
                const worldPos = renderer.screenToWorld(e.clientX, e.clientY);
                const cellOwner = world.getCell(worldPos.x, worldPos.y);
                if (cellOwner === gameState.myCountryId) {
                    if (window._recruitMode) {
                        production.enqueueTraining(worldPos.x, worldPos.y, window._recruitMode);
                    } else if (window._pendingBuild) {
                        production.enqueueBuilding(worldPos.x, worldPos.y, window._pendingBuild);
                    }
                }
                return;
            }
            const worldPos = renderer.screenToWorld(e.clientX, e.clientY);
            const unitId = entities.getUnitAt(worldPos.x, worldPos.y);
            if (unitId !== null && entities.owner[unitId] === gameState.myCountryId) {
                const sel = gameState._selectedUnits;
                if (sel.indexOf(unitId) === -1) sel.push(unitId);
            }
        });
        canvas.addEventListener('mouseup', () => {
            shiftDragging = false;
            if (gameState._selectedUnits.length > 0) {
                document.getElementById('order-hint').innerHTML = t('army.selectedUnits') + gameState._selectedUnits.length + t('army.createArmyHint');
                document.getElementById('order-hint').classList.remove('hidden');
            }
        });

        // ===== МОБИЛЬНОЕ УПРАВЛЕНИЕ =====
        let touchStartX = 0, touchStartY = 0;
        let touchStartTime = 0;
        let isTouchDragging = false;
        let lastPinchDist = 0;
        let touchMoved = false;
        let fullscreenRequested = false;
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

        function requestFullscreen() {
            if (fullscreenRequested) return;
            fullscreenRequested = true;
            const el = document.documentElement;
            if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen().catch(() => {});
            else if (el.msRequestFullscreen) el.msRequestFullscreen().catch(() => {});
        }

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (isMobile) requestFullscreen();
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
                isTouchDragging = true;
                touchMoved = false;
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastPinchDist = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && isTouchDragging) {
                const dx = e.touches[0].clientX - touchStartX;
                const dy = e.touches[0].clientY - touchStartY;

                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    touchMoved = true;
                }

                renderer.camera.x -= dx / renderer.camera.zoom;
                renderer.camera.y -= dy / renderer.camera.zoom;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                needsRender = true;
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (lastPinchDist > 0) {
                    const scale = dist / lastPinchDist;
                    const newZoom = renderer.camera.zoom * scale;
                    renderer.camera.zoom = Math.min(Math.max(newZoom, 0.15), 3);
                    needsRender = true;
                }
                lastPinchDist = dist;
                needsRender = true;
            }
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (e.touches.length === 0) {
                if (!touchMoved && Date.now() - touchStartTime < 300) {
                    const fakeEvent = {
                        clientX: touchStartX,
                        clientY: touchStartY,
                        shiftKey: false,
                        button: 0
                    };
                    handleCanvasClick(fakeEvent);
                } else if (touchMoved) {
                    // Свайп — ничего
                }
                if (!touchMoved && Date.now() - touchStartTime >= 500) {
                    const fakeEvent = {
                        clientX: touchStartX,
                        clientY: touchStartY,
                        preventDefault: () => {}
                    };
                    handleCanvasRightClick(fakeEvent);
                }
                isTouchDragging = false;
                lastPinchDist = 0;
            }
        }, { passive: false });
    }

    // Клавиши
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Глобальные функции для вызова из HTML
    window.recruitUnit = (type) => {
        uiManager.closeWindow();
        window._recruitMode = type;
        const hint = document.getElementById('recruit-hint');
        if (hint) {
            const costs = { infantry: t('army.costInfantry'), tank: t('army.costTank') };
            hint.innerHTML = t('army.selectProvinceHint') + ' (' + (costs[type] || type) + ')' + t('army.shiftMultiSelect');
            hint.classList.remove('hidden');
        }
        addNotification(t('notifications.recruitUnit') + type, 'info');
        setTimeout(() => {
            if (hint) hint.classList.add('hidden');
            window._recruitMode = null;
        }, 20000);
    };

    window.selectBuildType = (type) => {
        uiManager.closeWindow();
        window._pendingBuild = type;
        const hint = document.getElementById('build-hint');
        if (hint) {
            const costs = { factory: t('build.costFactory'), port: t('build.costPort') };
            hint.innerHTML = t('build.selectCell') + ' (' + (costs[type] || type) + ')' + t('army.shiftMultiSelect');
            hint.classList.remove('hidden');
        }
        addNotification(t('build.selectProvince'), 'info');
        setTimeout(() => {
            if (hint) hint.classList.add('hidden');
            window._pendingBuild = null;
        }, 20000);
    };

    window.selectUnitForMove = (unitId) => {
        gameState.selectedUnitId = unitId;
        uiManager.closeWindow();
        const hint = document.getElementById('order-hint');
        if (hint) {
            hint.innerHTML = t('army.unitSelected');
            hint.classList.remove('hidden');
        }
        addNotification(t('army.armyMoveHint'), 'info');
        setTimeout(() => {
            if (hint) hint.classList.add('hidden');
        }, 15000);
    };

    window.startResearch = (techId) => {
        tech.startResearch(gameState.myCountryId, techId);
        uiManager.openWindow('research');
    };

    window.startFocus = (focusId) => {
        focus.startFocus(focusId);
        uiManager.openWindow('focus');
    };

    window.declareWarOn = (id) => {
        diplomacy.declareWar(id);
        uiManager.openWindow('diplomacy');
    };

    window.justifyWar = (id) => {
        diplomacy.startJustification(id);
        uiManager.openWindow('diplomacy');
    };

    window.proposeAlly = (id) => {
        diplomacy.proposeAlliance(id);
        uiManager.closeSidebar();
    };

    window.callToWar = (id) => {
        diplomacy.callToWar(id);
    };

    window.kickAlly = (id) => {
        diplomacy.kickFromAlliance(id);
        uiManager.openWindow('diplomacy');
    };

    // ── ПРИЗЫВ К ОРУЖИЮ — пригласить союзника в ВАШУ войну ──
    window.callToArms = (allyId) => {
        var myId = gameState.myCountryId;
        var myWars = [];
        for (var w = 0; w < gameState.wars.length; w++) {
            var war = gameState.wars[w];
            if (war.a === myId) myWars.push({ enemy: war.b, label: war.b });
            if (war.b === myId) myWars.push({ enemy: war.a, label: war.a });
        }
        if (myWars.length === 0) {
            addNotification(t('diplomacy.noWarsToJoin'), 'info');
            return;
        }
        var toInvite = myWars.filter(function(w) { return !gameState.isAtWar(allyId, w.enemy); });
        if (toInvite.length === 0) {
            addNotification(t('diplomacy.alreadyInAllWars'), 'info');
            return;
        }
        if (toInvite.length === 1) {
            gameState.addWar(allyId, toInvite[0].enemy, world);
            var eInfo = getCountryInfo(toInvite[0].enemy);
            addNotification(ally
