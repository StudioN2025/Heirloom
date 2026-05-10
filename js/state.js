import { CONFIG } from './config.js';

export const state = {
    gridData: {},
    cellStats: {},
    units: [],
    wars: [],
    alliances: [],
    myCountryId: null,
    gameSpeed: 0,
    lastSavedSpeed: 1,
    gameDate: new Date(CONFIG.INITIAL_DATE),
    playerResources: { equipment: 1000, manpower: 500000, factories: 0 },
    activeResearch: null,
    activeFocus: null,
    completedFocuses: new Set(),
    buildingQueue: [],
    tech: { industry: 1, tank: 1, infantry: 1, construction: 1 },
    selectedUnitId: null,
    camera: { x: 0, y: 0, zoom: 0.8 },
    isGameMode: false,
    brushMode: 'draw',
    selectedCountry: 'germany',
    diplomaticModeTarget: null,
    buildModeType: null,
    recruitMode: null,
    activeBattles: [],
    alerts: [],
    hoverCell: null,
    isMouseDown: false,
    keys: {}
};

export const months = ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"];
