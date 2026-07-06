// TechSystem.js — Дерево технологий как в HOI4

import { addNotification } from '../utils/helpers.js';

// Полное дерево технологий
export const TECH_TREE = {
    // ═══════════════════════════ ПРОМЫШЛЕННОСТЬ ═══════════════════════════
    industry_1: { id: 'industry_1', name: 'Базовая промышленность', desc: '+10% производство', branch: 'industry', tier: 0, cost: 80, effect: { productionBonus: 0.10 }, icon: '🏭', prereqs: [] },
    industry_2: { id: 'industry_2', name: 'Массовое производство', desc: '+15% производство', branch: 'industry', tier: 1, cost: 120, effect: { productionBonus: 0.15 }, icon: '🏭', prereqs: ['industry_1'] },
    industry_3: { id: 'industry_3', name: 'Сборочные линии', desc: '+20% производство, -20% стоимость', branch: 'industry', tier: 2, cost: 160, effect: { productionBonus: 0.20, costReduction: 0.20 }, icon: '⚙️', prereqs: ['industry_2'] },
    industry_4: { id: 'industry_4', name: 'Автоматизация', desc: '+25% производство', branch: 'industry', tier: 3, cost: 200, effect: { productionBonus: 0.25 }, icon: '🤖', prereqs: ['industry_3'] },
    industry_5: { id: 'industry_5', name: 'Нанотехнологии', desc: '+30% производство, -30% стоимость', branch: 'industry', tier: 4, cost: 250, effect: { productionBonus: 0.30, costReduction: 0.30 }, icon: '🔬', prereqs: ['industry_4'] },

    mining_1: { id: 'mining_1', name: 'Шахтёрство', desc: '+5% людских', branch: 'industry', tier: 1, cost: 80, effect: { manpowerBonus: 0.05 }, icon: '⛏️', prereqs: ['industry_1'] },
    mining_2: { id: 'mining_2', name: 'Глубокие шахты', desc: '+10% людских', branch: 'industry', tier: 2, cost: 120, effect: { manpowerBonus: 0.10 }, icon: '⛏️', prereqs: ['mining_1'] },

    // ═══════════════════════════ ПЕХОТА ═══════════════════════════════════
    infantry_1: { id: 'infantry_1', name: 'Стандартное оружие', desc: '+10% атака/защита', branch: 'infantry', tier: 0, cost: 80, effect: { infantryAttack: 0.10, infantryDefense: 0.10 }, icon: '🔫', prereqs: [] },
    infantry_2: { id: 'infantry_2', name: 'Автоматическое оружие', desc: '+15% атака', branch: 'infantry', tier: 1, cost: 100, effect: { infantryAttack: 0.15 }, icon: '🔫', prereqs: ['infantry_1'] },
    infantry_3: { id: 'infantry_3', name: 'Мотопехота', desc: '+20% атака, +10% защита', branch: 'infantry', tier: 2, cost: 140, effect: { infantryAttack: 0.20, infantryDefense: 0.10 }, icon: '🛻', prereqs: ['infantry_2'] },
    infantry_4: { id: 'infantry_4', name: 'Десант', desc: '+25% атака, +15% защита', branch: 'infantry', tier: 3, cost: 180, effect: { infantryAttack: 0.25, infantryDefense: 0.15 }, icon: '🪂', prereqs: ['infantry_3'] },
    infantry_5: { id: 'infantry_5', name: 'Элитные части', desc: '+30% атака, +20% защита, +20 HP', branch: 'infantry', tier: 4, cost: 220, effect: { infantryAttack: 0.30, infantryDefense: 0.20, infantryHp: 20 }, icon: '⭐', prereqs: ['infantry_4'] },

    mountain_1: { id: 'mountain_1', name: 'Горная подготовка', desc: '+15% защита в горах', branch: 'infantry', tier: 1, cost: 80, effect: { terrainBonus_mountain: 0.15 }, icon: '🏔️', prereqs: ['infantry_1'] },
    special_1: { id: 'special_1', name: 'Спецназ', desc: '+20% атака, +30 org', branch: 'infantry', tier: 2, cost: 140, effect: { infantryAttack: 0.20, infantryOrg: 30 }, icon: '🎖️', prereqs: ['infantry_2'] },

    // ═══════════════════════════ ТАНКИ ═══════════════════════════════════
    tank_1: { id: 'tank_1', name: 'Лёгкие танки', desc: '+10% атака/защита', branch: 'tank', tier: 0, cost: 100, effect: { tankAttack: 0.10, tankDefense: 0.10 }, icon: 'Light Tank', prereqs: [] },
    tank_2: { id: 'tank_2', name: 'Средние танки', desc: '+20% атака, +10% броня', branch: 'tank', tier: 1, cost: 140, effect: { tankAttack: 0.20, tankArmor: 10 }, icon: 'Medium Tank', prereqs: ['tank_1'] },
    tank_3: { id: 'tank_3', name: 'Тяжёлые танки', desc: '+30% атака, +20% броня', branch: 'tank', tier: 2, cost: 180, effect: { tankAttack: 0.30, tankArmor: 20 }, icon: 'Heavy Tank', prereqs: ['tank_2'] },
    tank_4: { id: 'tank_4', name: 'САУ', desc: '+40% атака', branch: 'tank', tier: 3, cost: 220, effect: { tankAttack: 0.40 }, icon: '🔥', prereqs: ['tank_3'] },
    tank_5: { id: 'tank_5', name: 'Супертанки', desc: '+50% атака, +30% броня', branch: 'tank', tier: 4, cost: 280, effect: { tankAttack: 0.50, tankArmor: 30 }, icon: '💀', prereqs: ['tank_4'] },

    armor_1: { id: 'armor_1', name: 'Улучшенная броня', desc: '+15% броня', branch: 'tank', tier: 1, cost: 100, effect: { tankArmor: 15 }, icon: '🛡️', prereqs: ['tank_1'] },
    engine_1: { id: 'engine_1', name: 'Мощные двигатели', desc: '+20% org танков', branch: 'tank', tier: 2, cost: 120, effect: { tankOrg: 12 }, icon: '🔧', prereqs: ['tank_2'] },

    // ═══════════════════════════ АВИАЦИЯ ═════════════════════════════════
    air_1: { id: 'air_1', name: 'Разведка', desc: '+10% к разведке', branch: 'air', tier: 0, cost: 80, effect: { reconBonus: 0.10 }, icon: '🛩️', prereqs: [] },
    air_2: { id: 'air_2', name: 'Истребители', desc: '+15% воздушная поддержка', branch: 'air', tier: 1, cost: 120, effect: { airSupport: 0.15 }, icon: '✈️', prereqs: ['air_1'] },
    air_3: { id: 'air_3', name: 'Бомбардировщики', desc: '+20% урон по земле', branch: 'air', tier: 2, cost: 160, effect: { groundDamage: 0.20 }, icon: '💣', prereqs: ['air_2'] },
    air_4: { id: 'air_4', name: 'Ракеты', desc: '+25% урон', branch: 'air', tier: 3, cost: 200, effect: { groundDamage: 0.25 }, icon: '🚀', prereqs: ['air_3'] },

    // ═══════════════════════════ ФЛОТ ═══════════════════════════════════
    navy_1: { id: 'navy_1', name: 'Эсминцы', desc: '+10% морской бой', branch: 'navy', tier: 0, cost: 80, effect: { navalBonus: 0.10 }, icon: '🚢', prereqs: [] },
    navy_2: { id: 'navy_2', name: 'Крейсера', desc: '+15% морской бой', branch: 'navy', tier: 1, cost: 120, effect: { navalBonus: 0.15 }, icon: '🚢', prereqs: ['navy_1'] },
    navy_3: { id: 'navy_3', name: 'Линкоры', desc: '+20% морской бой', branch: 'navy', tier: 2, cost: 160, effect: { navalBonus: 0.20 }, icon: '⚓', prereqs: ['navy_2'] },
    navy_4: { id: 'navy_4', name: 'Подлодки', desc: '+25% морской бой', branch: 'navy', tier: 3, cost: 200, effect: { navalBonus: 0.25 }, icon: '🔱', prereqs: ['navy_3'] },
};

// Ветки для отображения
export const TECH_BRANCHES = {
    industry: { name: 'Промышленность', color: '#3b82f6', icon: '🏭' },
    infantry: { name: 'Пехота', color: '#22c55e', icon: '💂' },
    tank:     { name: 'Танки', color: '#eab308', icon: '🚜' },
    air:      { name: 'Авиация', color: '#8b5cf6', icon: '✈️' },
    navy:     { name: 'Флот', color: '#06b6d4', icon: '⚓' },
};

export class TechSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.RESEARCH_DURATION = 80;

        if (!this.gameState.countryTech) {
            this.gameState.countryTech = new Map();
        }
        if (!this.gameState.countryResearch) {
            this.gameState.countryResearch = new Map();
        }
    }

    getUnlocked(countryId) {
        if (!this.gameState.countryTech.has(countryId)) {
            this.gameState.countryTech.set(countryId, new Set(['industry_1', 'infantry_1', 'tank_1']));
        }
        return this.gameState.countryTech.get(countryId);
    }

    unlock(countryId, techId) {
        const unlocked = this.getUnlocked(countryId);
        unlocked.add(techId);
        this.gameState.countryTech.set(countryId, unlocked);
    }

    isUnlocked(countryId, techId) {
        return this.getUnlocked(countryId).has(techId);
    }

    canResearch(countryId, techId) {
        if (this.isUnlocked(countryId, techId)) return false;
        if (this.getResearchForCountry(countryId) !== null) return false;
        const tech = TECH_TREE[techId];
        if (!tech) return false;
        return tech.prereqs.every(p => this.isUnlocked(countryId, p));
    }

    getResearchForCountry(countryId) {
        return this.gameState.countryResearch.get(countryId) || null;
    }

    setResearchForCountry(countryId, research) {
        this.gameState.countryResearch.set(countryId, research);
    }

    startResearch(countryId, techId) {
        if (!this.canResearch(countryId, techId)) return false;

        const tech = TECH_TREE[techId];
        this.setResearchForCountry(countryId, {
            techId: techId,
            daysLeft: tech.cost || this.RESEARCH_DURATION
        });

        if (countryId === this.gameState.myCountryId) {
            addNotification(`🔬 Исследование: ${tech.name}`, 'info');
        }
        return true;
    }

    update() {
        const allCountries = Array.from(this.gameState.countryResearch.keys());

        for (const countryId of allCountries) {
            const active = this.getResearchForCountry(countryId);
            if (!active) continue;

            active.daysLeft--;

            if (active.daysLeft <= 0) {
                this.unlock(countryId, active.techId);
                this.setResearchForCountry(countryId, null);

                if (countryId === this.gameState.myCountryId) {
                    const tech = TECH_TREE[active.techId];
                    addNotification(`✅ Изучено: ${tech.name}!`, 'info');
                }
            }
        }
    }

    getEffect(countryId, effectKey) {
        let total = 0;
        const unlocked = this.getUnlocked(countryId);
        for (const techId of unlocked) {
            const tech = TECH_TREE[techId];
            if (tech && tech.effect && tech.effect[effectKey] !== undefined) {
                total += tech.effect[effectKey];
            }
        }
        return total;
    }

    getPlayerTech() { return this.getUnlocked(this.gameState.myCountryId); }
    getPlayerResearch() { return this.getResearchForCountry(this.gameState.myCountryId); }
}
