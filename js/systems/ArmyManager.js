// ArmyManager.js — Система армий (как в HOI4)

import { addNotification } from '../utils/helpers.js';

const ARMY_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4',
    '#f43f5e', '#14b8a6', '#a855f7', '#64748b',
];

export class ArmyManager {
    constructor(entities, gameState) {
        this.entities = entities;
        this.gs = gameState;
        this.armies = []; // { id, color, name, unitIds: Set }
        this.nextId = 1;
        this.nextColorIdx = 0;
    }

    // Создать армию из набора юнитов
    createArmy(unitIds) {
        if (!unitIds || unitIds.length < 2) {
            addNotification('Нужно минимум 2 юнита для армии!', 'war');
            return null;
        }

        const e = this.entities;
        // Проверяем что все юниты живы и принадлежат одной стране
        const valid = unitIds.filter(id => e.active[id]);
        if (valid.length < 2) {
            addNotification('Недостаточно юнитов!', 'war');
            return null;
        }

        const ownerId = e.owner[valid[0]];
        if (!valid.every(id => e.owner[id] === ownerId)) {
            addNotification('Все юниты должны быть одной страны!', 'war');
            return null;
        }

        // Убираем из старых армий
        for (const id of valid) {
            this.removeFromArmy(id);
        }

        const color = ARMY_COLORS[this.nextColorIdx % ARMY_COLORS.length];
        this.nextColorIdx++;

        const army = {
            id: this.nextId++,
            color,
            name: `Армия ${this.nextId - 1}`,
            unitIds: new Set(valid),
            ownerId,
        };
        this.armies.push(army);

        addNotification(`🎖️ ${army.name} создана (${valid.length} юнитов)`, 'info');
        return army;
    }

    // Удалить юнита из всех армий
    removeFromArmy(unitId) {
        for (const army of this.armies) {
            army.unitIds.delete(unitId);
        }
        // Удаляем пустые армии
        this.armies = this.armies.filter(a => a.unitIds.size > 0);
    }

    // Удалить армию
    disbandArmy(armyId) {
        const idx = this.armies.findIndex(a => a.id === armyId);
        if (idx === -1) return;
        addNotification(`🗑️ ${this.armies[idx].name} распущена`, 'info');
        this.armies.splice(idx, 1);
    }

    // Получить армию юнита
    getArmyForUnit(unitId) {
        return this.armies.find(a => a.unitIds.has(unitId)) || null;
    }

    // Получить все юниты армии
    getArmyUnits(armyId) {
        const army = this.armies.find(a => a.id === armyId);
        if (!army) return [];
        return [...army.unitIds].filter(id => this.entities.active[id]);
    }

    // Получить цвет армии для юнита
    getUnitArmyColor(unitId) {
        const army = this.getArmyForUnit(unitId);
        return army ? army.color : null;
    }

    // Отдать приказ всей армии
    giveArmyOrder(armyId, targetX, targetY, movementSystem) {
        const army = this.armies.find(a => a.id === armyId);
        if (!army) return false;

        let moved = 0;
        for (const uid of army.unitIds) {
            if (!this.entities.active[uid]) continue;
            if (this.entities.inCombat[uid]) continue;

            // Распределяем юнитов вокруг цели
            const angle = (moved / army.unitIds.size) * Math.PI * 2;
            const radius = Math.min(army.unitIds.size, 4);
            const tx = targetX + Math.round(Math.cos(angle) * radius);
            const ty = targetY + Math.round(Math.sin(angle) * radius);

            if (movementSystem.giveOrder(uid, tx, ty)) {
                moved++;
            }
        }

        if (moved > 0) {
            addNotification(`🎖️ ${army.name}: приказ ${moved} юнитам`, 'info');
        }
        return moved > 0;
    }

    // Обновление — чистим мёртвых юнитов из армий
    update() {
        for (const army of this.armies) {
            for (const uid of army.unitIds) {
                if (!this.entities.active[uid]) {
                    army.unitIds.delete(uid);
                }
            }
        }
        this.armies = this.armies.filter(a => a.unitIds.size > 0);
    }

    // Получить все армии страны
    getArmiesForCountry(countryId) {
        return this.armies.filter(a => a.ownerId === countryId);
    }
}
