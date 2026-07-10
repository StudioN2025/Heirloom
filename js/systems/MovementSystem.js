// MovementSystem.js — Движение по дням через A*

import { addNotification } from '../utils/helpers.js';

export class MovementSystem {
    constructor(world, entities, gameState) {
        this.world    = world;
        this.entities = entities;
        this.gs       = gameState;
        this.orders   = new Map(); // unitId → { path, targetX, targetY }
    }

    _areAllied(c1, c2) {
        if (c1 === c2) return true;
        if (!this.gs || !this.gs.alliances) return false;
        return this.gs.alliances.some(a => a.has && a.has(c1) && a.has(c2));
    }

    // Выдать приказ на движение
    giveOrder(unitId, targetX, targetY) {
        const e = this.entities;
        if (!e.active[unitId]) return false;
        if (e.inCombat[unitId]) {
            addNotification('Юнит в бою!', 'war');
            return false;
        }

        const sx = e.x[unitId], sy = e.y[unitId];
        if (sx === targetX && sy === targetY) return false;

        const startPort = this.world.hasBuilding(sx, sy, 'port');
        const targetIsWater = this.world.isWater(targetX, targetY);
        const targetIsLand = this.world.getCell(targetX, targetY) !== 0;
        const targetOwner = this.world.getCell(targetX, targetY);
        const sameOwner = targetOwner === e.owner[unitId]
            || this._areAllied(e.owner[unitId], targetOwner);

        // Порт → Порт (мгновенная переброска)
        const endPort = this.world.hasBuilding(targetX, targetY, 'port');
        if (startPort && endPort && sameOwner) {
            e.moveTo(unitId, targetX, targetY);
            e.isShip[unitId] = 0; // на суше
            this.orders.delete(unitId);
            addNotification('🚢 Морская переброска!', 'info');
            return true;
        }

        // Порт → вода (превращаем в корабль)
        if (startPort && targetIsWater) {
            e.moveTo(unitId, targetX, targetY);
            e.isShip[unitId] = 1; // теперь корабль
            this.orders.delete(unitId);
            addNotification('🚢 Флот выходит в море!', 'info');
            return true;
        }

        // Вода → суша (высадка десанта, возвращаем на сушу)
        const currentIsWater = this.world.isWater(sx, sy);
        if (currentIsWater && targetIsLand) {
            e.moveTo(unitId, targetX, targetY);
            e.isShip[unitId] = 0; // снова на суше
            this.orders.delete(unitId);
            addNotification('⚓ Высадка десанта!', 'info');
            return true;
        }

        // Соседняя клетка — двигаемся без поиска пути
        const dx = Math.abs(targetX - sx);
        const dy = Math.abs(targetY - sy);
        if (dx + dy === 1) {
            let targetOk = targetIsLand;
            // Корабль может ходить по воде
            if (targetIsWater && (e.isShip[unitId] || startPort)) targetOk = true;
            if (targetOk) {
                const occupant = e.getUnitAt(targetX, targetY);
                if (!occupant || occupant === unitId) {
                    e.moveTo(unitId, targetX, targetY);
                    // Корабль на суше → снова пехота
                    if (targetIsLand) e.isShip[unitId] = 0;
                    addNotification('Приказ выполнен', 'info');
                    return true;
                }
            }
        }

        const isShip = e.isShip[unitId];

        // Разрешаем воду если юнит уже корабль ИЛИ цель на воде и есть порт
        const allowWater = isShip === 1 || (targetIsWater && startPort);

        const path = this._findPath(sx, sy, targetX, targetY, e.owner[unitId], allowWater);
        if (!path || path.length === 0) {
            addNotification('Путь не найден!', 'war');
            return false;
        }

        this.orders.set(unitId, { path, targetX, targetY });
        addNotification(`Приказ выдан — ${path.length} клеток`, 'info');
        return true;
    }

    getOrderProgress(unitId) {
        return this.orders.has(unitId) ? this.orders.get(unitId) : null;
    }

    hasOrder(unitId) { return this.orders.has(unitId); }
    cancelOrder(unitId) { this.orders.delete(unitId); }

    // Вызывается раз в игровой день из main.js
    update() {
        this._moveUnits();
    }

    _moveUnits() {
        const e = this.entities;

        for (const [unitId, order] of this.orders) {
            if (!e.active[unitId]) { this.orders.delete(unitId); continue; }
            if (e.inCombat[unitId]) continue;
            if (!order.path.length) { this.orders.delete(unitId); continue; }

            const hasPort = this.world.hasBuilding(e.x[unitId], e.y[unitId], 'port');
            const isShip = e.isShip[unitId];

            // Двигаем 2 клетки за день
            for (let step = 0; step < 2; step++) {
                if (!order.path.length) { this.orders.delete(unitId); break; }

                const next = order.path[0];
                const [nx, ny] = next.split(',').map(Number);

                const isWater = this.world.isWater(nx, ny);
                const isLand = this.world.getCell(nx, ny) !== 0;

                // Корабль не может идти по суше (кроме высадки)
                if (isShip && isLand && !(nx === order.targetX && ny === order.targetY)) {
                    break;
                }

                // Пехота не может идти по воде (кроме порта)
                if (!isShip && isWater && !hasPort) {
                    this.orders.delete(unitId);
                    addNotification('Путь заблокирован водой!', 'war');
                    break;
                }

                // Проверяем вражескую территорию
                const cellOwner = isLand ? this.world.getCell(nx, ny) : 0;
                if (cellOwner !== 0 && cellOwner !== e.owner[unitId]
                    && !this._areAllied(e.owner[unitId], cellOwner)) {
                    const enemy = e.getUnitAt(nx, ny);
                    if (enemy && e.active[enemy] && e.owner[enemy] !== e.owner[unitId]) {
                        addNotification('⚔️ Встреча с врагом!', 'war');
                        this.orders.delete(unitId);
                        break;
                    }
                    // Захватываем пустую вражескую клетку
                    if (isLand) this.world.setCell(nx, ny, e.owner[unitId]);
                }

                // Занята другим юнитом — ждём
                const occupant = e.getUnitAt(nx, ny);
                if (occupant && occupant !== unitId) {
                    break;
                }

                // Делаем шаг
                e.moveTo(unitId, nx, ny);
                // Корабль выходит на сушу → снова пехота
                if (isLand) e.isShip[unitId] = 0;
                order.path.shift();
            }
        }
    }

    // A* поиск пути — по суше (пехота) или через воду (корабль)
    _findPath(sx, sy, ex, ey, ownerId, allowWater = false) {
        const MAX = 800;
        const h = (x, y) => Math.abs(x - ex) + Math.abs(y - ey);

        const open = [{ x: sx, y: sy, g: 0, f: h(sx, sy) }];
        const cameFrom = new Map();
        const best = new Map();
        const k = (x, y) => `${x},${y}`;
        best.set(k(sx, sy), 0);
        let steps = 0;

        while (open.length && steps++ < MAX) {
            let mi = 0;
            for (let i = 1; i < open.length; i++) if (open[i].f < open[mi].f) mi = i;
            const cur = open.splice(mi, 1)[0];
            const ck = k(cur.x, cur.y);

            if (cur.x === ex && cur.y === ey) {
                const path = [];
                let node = ck;
                while (cameFrom.has(node)) { path.unshift(node); node = cameFrom.get(node); }
                return path;
            }

            for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
                const nx = cur.x + dx, ny = cur.y + dy;
                const nk = k(nx, ny);
                const cellOwner = this.world.getCell(nx, ny);
                const isWater = this.world.isWater(nx, ny);

                // Вода — только для кораблей
                if (isWater && !allowWater) continue;
                // Суша с водой — пропускаем (нельзя идти через озеро)
                if (cellOwner === 0 && !isWater) continue;

                // Нейтральная территория — нельзя
                if (cellOwner !== 0 && cellOwner !== ownerId && !this._areAllied(ownerId, cellOwner)) {
                    const isEnemy = this.gs && this.gs.isAtWar && this.gs.isAtWar(ownerId, cellOwner);
                    if (!isEnemy) continue;
                }

                const ng = cur.g + 1;
                if (!best.has(nk) || ng < best.get(nk)) {
                    best.set(nk, ng);
                    cameFrom.set(nk, ck);
                    open.push({ x: nx, y: ny, g: ng, f: ng + h(nx, ny) });
                }
            }
        }
        return null;
    }
}
