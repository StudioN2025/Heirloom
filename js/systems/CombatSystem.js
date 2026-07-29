// CombatSystem.js — Улучшенная система боёв v2.0
// Особенности:
// - 6 типов юнитов: пехота, танки, артиллерия, ПТО, авиация, флот
// - Разделение soft/hard attack с пробитием брони
// - Система окопов и укреплений
// - Бонусы местности (леса, горы, реки, города, болота)
// - Снабжение влияет на эффективность
// - Опыт и мораль юнитов
// - Поддержка артиллерией и авиацией (off-map)
// - Отступление вместо мгновенной смерти
// - Механика окружений
// - Подробный лог боёв

import { addNotification } from '../utils/helpers.js';

const FRONT_WIDTH = 4;
const SUPPORT_WIDTH = 3;

// Типы юнитов
const UNIT_TYPE = {
    INFANTRY: 0,      // Пехота
    TANK: 1,          // Танки
    ARTILLERY: 2,     // Артиллерия
    ANTI_TANK: 3,     // Противотанковые средства
    AIR: 4,           // Авиация (поддержка)
    SHIP: 5           // Флот
};

// Характеристики юнитов
const UNIT_STATS = {
    [UNIT_TYPE.INFANTRY]: {
        name: 'Пехота', icon: '💂',
        softAttack: 35, hardAttack: 8,
        defense: 30, breakthrough: 10,
        hardness: 5, armor: 0,
        maxOrg: 100, orgRecovery: 3,
        maxHp: 100, hpPerDay: 1,
        supplyUse: 1.0,
        experience: 0
    },
    [UNIT_TYPE.TANK]: {
        name: 'Танки', icon: '🚜',
        softAttack: 75, hardAttack: 55,
        defense: 18, breakthrough: 45,
        hardness: 75, armor: 40,
        maxOrg: 80, orgRecovery: 2,
        maxHp: 100, hpPerDay: 1,
        supplyUse: 2.5,
        experience: 0
    },
    [UNIT_TYPE.ARTILLERY]: {
        name: 'Артиллерия', icon: '🎯',
        softAttack: 60, hardAttack: 15,
        defense: 8, breakthrough: 5,
        hardness: 10, armor: 0,
        maxOrg: 60, orgRecovery: 2,
        maxHp: 60, hpPerDay: 0.5,
        supplyUse: 1.8,
        experience: 0,
        support: true
    },
    [UNIT_TYPE.ANTI_TANK]: {
        name: 'ПТО', icon: '🔫',
        softAttack: 15, hardAttack: 70,
        defense: 20, breakthrough: 8,
        hardness: 15, armor: 5,
        maxOrg: 70, orgRecovery: 2.5,
        maxHp: 80, hpPerDay: 0.8,
        supplyUse: 1.2,
        experience: 0,
        support: true
    },
    [UNIT_TYPE.AIR]: {
        name: 'Авиация', icon: '✈️',
        softAttack: 50, hardAttack: 30,
        defense: 10, breakthrough: 0,
        hardness: 0, armor: 0,
        maxOrg: 100, orgRecovery: 5,
        maxHp: 50, hpPerDay: 2,
        supplyUse: 3.0,
        experience: 0,
        support: true,
        offMap: true
    },
    [UNIT_TYPE.SHIP]: {
        name: 'Флот', icon: '🚢',
        softAttack: 40, hardAttack: 50,
        defense: 25, breakthrough: 20,
        hardness: 50, armor: 30,
        maxOrg: 120, orgRecovery: 4,
        maxHp: 150, hpPerDay: 0.5,
        supplyUse: 4.0,
        experience: 0
    }
};

// Бонусы местности
const TERRAIN_BONUS = {
    plain: { defense: 1.0, attack: 1.0, movement: 1.0 },
    forest: { defense: 1.35, attack: 0.85, movement: 0.7 },
    mountain: { defense: 1.5, attack: 0.7, movement: 0.5 },
    desert: { defense: 0.9, attack: 0.95, movement: 0.9 },
    urban: { defense: 1.4, attack: 0.8, movement: 0.8 },
    swamp: { defense: 1.2, attack: 0.75, movement: 0.4 },
    river: { defense: 1.25, attack: 0.85, movement: 0.6 },
    hills: { defense: 1.25, attack: 0.9, movement: 0.75 },
    snow: { defense: 1.0, attack: 0.85, movement: 0.6 }
};

export class CombatSystem {
    constructor(world, entities, gameState) {
        this.world = world;
        this.entities = entities;
        this.gs = gameState;
        this.tech = null;
        this.battles = new Map();
        
        // Данные юнитов
        this.org = new Float32Array(entities.maxEntities || 50000);
        this.experience = new Float32Array(entities.maxEntities || 50000);
        this.trenchLevel = new Map(); // "x,y" -> уровень окопов (0-5)
        this.supplyStatus = new Map(); // uid -> коэффициент снабжения (0-1)
        
        // Логи боёв
        this.combatLogs = [];
        this.maxLogs = 50;
        
        // Статистика
        this.stats = {
            battlesWon: 0,
            battlesLost: 0,
            unitsDestroyed: 0,
            encirclements: 0
        };
    }

    initUnit(uid) {
        const type = this.entities.type[uid];
        const s = UNIT_STATS[type] || UNIT_STATS[UNIT_TYPE.INFANTRY];
        this.org[uid] = s.maxOrg;
        this.experience[uid] = 0;
    }

    getOrg(uid) { return Math.round(this.org[uid] || 0); }
    
    getExperience(uid) { return Math.round(this.experience[uid] || 0); }
    
    getTrenchLevel(x, y) { return this.trenchLevel.get(`${x},${y}`) || 0; }

    logCombat(message, type = 'info') {
        this.combatLogs.unshift({ day: this.gs.day, message, type });
        if (this.combatLogs.length > this.maxLogs) {
            this.combatLogs.pop();
        }
    }

    update() {
        this._updateSupply();
        this._updateTrenches();
        this._formBattles();
        this._resolveBattles();
        this._recoverOrg();
        this._gainExperience();
    }

    // ── Снабжение ────────────────────────────────────────────────────────────

    _updateSupply() {
        const e = this.entities;
        for (let i = 1; i < e.nextId; i++) {
            if (!e.active[i]) continue;
            
            // Проверка связи со столицей (упрощённо — расстояние)
            let supplyMult = 1.0;
            const ownerCountry = e.owner[i];
            
            // Если есть система снабжения — используем её
            if (this.gs.supplySystem) {
                supplyMult = this.gs.supplySystem.getSupplyAt(e.x[i], e.y[i], ownerCountry);
            } else {
                // Упрощённая версия — штраф за расстояние
                const capital = this.world.capitals?.[ownerCountry];
                if (capital) {
                    const dist = Math.abs(e.x[i] - capital.x) + Math.abs(e.y[i] - capital.y);
                    supplyMult = Math.max(0.3, 1 - dist * 0.02);
                }
            }
            
            this.supplyStatus.set(i, supplyMult);
        }
    }

    // ── Окопы ────────────────────────────────────────────────────────────────

    _updateTrenches() {
        const e = this.entities;
        
        // Увеличиваем уровень окопов где стоят защитники
        for (const [cellKey, battle] of this.battles) {
            const [cx, cy] = cellKey.split(',').map(Number);
            
            // Защитники копают окопы
            if (battle.defenders.length > 0) {
                const current = this.trenchLevel.get(cellKey) || 0;
                if (current < 5) {
                    this.trenchLevel.set(cellKey, current + 0.3);
                }
            }
        }
        
        // Окопы постепенно разрушаются в мирное время
        for (const [cellKey, level] of this.trenchLevel) {
            if (level > 0 && !this.battles.has(cellKey)) {
                const newLevel = level - 0.1;
                if (newLevel <= 0) {
                    this.trenchLevel.delete(cellKey);
                } else {
                    this.trenchLevel.set(cellKey, newLevel);
                }
            }
        }
    }

    // ── Формирование боёв ────────────────────────────────────────────────────

    _formBattles() {
        const e = this.entities;

        for (let i = 1; i < e.nextId; i++) {
            if (!e.active[i]) continue;
            const ownerI = e.owner[i];
            const iIsShip = e.isShip?.[i] || this.entities.type[i] === UNIT_TYPE.SHIP;

            for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[0,0]]) {
                const nx = e.x[i] + dx, ny = e.y[i] + dy;
                const j = e.getUnitAt(nx, ny);
                if (!j || !e.active[j] || i === j) continue;
                if (ownerI === e.owner[j]) continue;
                if (!this.gs.isAtWar(ownerI, e.owner[j])) continue;

                const jIsShip = e.isShip?.[j] || this.entities.type[j] === UNIT_TYPE.SHIP;

                // Пехота/танки не атакуют корабли и наоборот
                if (iIsShip !== jIsShip) continue;

                const attacker = i;
                const defender = j;

                const battleCell = `${e.x[defender]},${e.y[defender]}`;

                if (this.battles.has(battleCell)) {
                    const b = this.battles.get(battleCell);
                    if (e.owner[attacker] === b.attackerCountry && 
                        !b.attackers.includes(attacker) && 
                        b.attackers.length < FRONT_WIDTH) {
                        b.attackers.push(attacker);
                        e.inCombat[attacker] = 1;
                    }
                    if (e.owner[defender] === b.defenderCountry && 
                        !b.defenders.includes(defender) && 
                        b.defenders.length < FRONT_WIDTH) {
                        b.defenders.push(defender);
                        e.inCombat[defender] = 1;
                    }
                    
                    // Добавляем поддержку (артиллерия, авиация)
                    this._addSupportUnits(b, attacker, defender);
                } else {
                    if (this.org[attacker] === 0) this.initUnit(attacker);
                    if (this.org[defender] === 0) this.initUnit(defender);
                    e.inCombat[attacker] = 1;
                    e.inCombat[defender] = 1;

                    this.battles.set(battleCell, {
                        attackerCountry: e.owner[attacker],
                        defenderCountry: e.owner[defender],
                        attackers: [attacker],
                        defenders: [defender],
                        attackerSupport: [],
                        defenderSupport: [],
                        cell: battleCell,
                        day: 0,
                        encircled: false
                    });

                    const my = this.gs.myCountryId;
                    if (e.owner[attacker] === my || e.owner[defender] === my) {
                        const t = iIsShip ? '🚢' : '⚔️';
                        this.logCombat(`${t} Бой начался: ${e.owner[attacker]} атакует ${e.owner[defender]}`, 'battle_start');
                        addNotification(`${t} Бой: ${e.owner[attacker]} атакует ${e.owner[defender]}!`, 'war');
                    }

                    // Битва на клетке столицы?
                    if (this.world.capitals) {
                        for (const [cid, cap] of Object.entries(this.world.capitals)) {
                            if (cap.x === e.x[defender] && cap.y === e.y[defender]) {
                                this.logCombat(`🔥 Бой за столицу ${cap.name}!`, 'capital_battle');
                                addNotification(`🔥 Бой за столицу ${cap.name}!`, 'war');
                                break;
                            }
                        }
                    }
                    
                    // Проверка на окружение
                    this._checkEncirclement(battleCell, b);
                }
            }
        }
        this._sendReinforcements();
    }
    
    _addSupportUnits(battle, attacker, defender) {
        const e = this.entities;
        const [cx, cy] = battle.cell.split(',').map(Number);
        
        // Ищем поддерживающие юниты в радиусе 3 клеток
        const nearby = e.getEntitiesInRadius(cx, cy, 3);
        
        for (const uid of nearby) {
            if (!e.active[uid] || e.inCombat[uid]) continue;
            const type = e.type[uid];
            const stats = UNIT_STATS[type];
            
            if (!stats?.support) continue;
            
            // Авиация может поддерживать с любого расстояния (off-map)
            if (stats.offMap || Math.abs(e.x[uid] - cx) + Math.abs(e.y[uid] - cy) <= 3) {
                if (e.owner[uid] === battle.attackerCountry && 
                    battle.attackerSupport.length < SUPPORT_WIDTH &&
                    !battle.attackerSupport.includes(uid)) {
                    battle.attackerSupport.push(uid);
                    e.inCombat[uid] = 1;
                } else if (e.owner[uid] === battle.defenderCountry && 
                    battle.defenderSupport.length < SUPPORT_WIDTH &&
                    !battle.defenderSupport.includes(uid)) {
                    battle.defenderSupport.push(uid);
                    e.inCombat[uid] = 1;
                }
            }
        }
    }
    
    _checkEncirclement(cellKey, battle) {
        const [cx, cy] = cellKey.split(',').map(Number);
        const defenderCountry = battle.defenderCountry;
        
        // Проверяем все клетки вокруг
        const neighbors = [[1,0],[-1,0],[0,1],[0,-1]];
        let surrounded = true;
        
        for (const [dx, dy] of neighbors) {
            const nx = cx + dx, ny = cy + dy;
            const cellOwner = this.world.getCell(nx, ny);
            
            // Если соседняя клетка не под контролем атакующего или его союзников
            if (cellOwner === defenderCountry) {
                surrounded = false;
                break;
            }
        }
        
        if (surrounded) {
            battle.encircled = true;
            this.stats.encirclements++;
            this.logCombat(`🔴 Окружение! Юниты ${defenderCountry} окружены!`, 'encirclement');
        }
    }

    _sendReinforcements() {
        const e = this.entities;
        for (const [, b] of this.battles) {
            if (b.attackers.length >= FRONT_WIDTH && b.defenders.length >= FRONT_WIDTH) continue;
            const [cx, cy] = b.cell.split(',').map(Number);
            const nearby = e.getEntitiesInRadius(cx, cy, 2);
            for (const uid of nearby) {
                if (!e.active[uid] || e.inCombat[uid]) continue;
                if (b.attackers.length < FRONT_WIDTH && 
                    e.owner[uid] === b.attackerCountry && 
                    !b.attackers.includes(uid)) {
                    b.attackers.push(uid);
                    e.inCombat[uid] = 1;
                } else if (b.defenders.length < FRONT_WIDTH && 
                    e.owner[uid] === b.defenderCountry && 
                    !b.defenders.includes(uid)) {
                    b.defenders.push(uid);
                    e.inCombat[uid] = 1;
                }
            }
        }
    }

    // ── Разрешение боёв ──────────────────────────────────────────────────────

    _resolveBattles() {
        const e = this.entities;
        const toDelete = [];

        for (const [cellKey, b] of this.battles) {
            b.attackers = b.attackers.filter(id => e.active[id]);
            b.defenders = b.defenders.filter(id => e.active[id]);
            b.attackerSupport = b.attackerSupport.filter(id => e.active[id]);
            b.defenderSupport = b.defenderSupport.filter(id => e.active[id]);
            
            if (!b.attackers.length || !b.defenders.length) { 
                this._endBattle(b); 
                toDelete.push(cellKey); 
                continue; 
            }

            b.day++;
            const [bx, by] = cellKey.split(',').map(Number);
            
            // Бонус местности
            const terrainType = this.world.getTerrain ? this.world.getTerrain(bx, by) : 'plain';
            const terrainBonus = TERRAIN_BONUS[terrainType] || TERRAIN_BONUS.plain;
            
            // Бонус окопов
            const trenchBonus = 1 + (this.getTrenchLevel(bx, by) * 0.15);

            const aOrgAvg = this._avgOrg(b.attackers);
            const dOrgAvg = this._avgOrg(b.defenders);

            // Прорыв при преимуществе org
            const breakthroughBonus = aOrgAvg > dOrgAvg * 1.3 ? 1.25 : 1.0;

            // Численное превосходство
            const numAdvA = Math.min(2.0, 1 + (b.attackers.length - b.defenders.length) * 0.2);
            const numAdvD = Math.min(2.0, 1 + (b.defenders.length - b.attackers.length) * 0.2);

            const rng = () => 0.85 + Math.random() * 0.3;
            const aPenalty = this._getCapitulationPenalty(b.attackerCountry);
            const dPenalty = this._getCapitulationPenalty(b.defenderCountry);

            // Бонус столицы
            let capitalBonus = 1.0;
            if (this.world.capitals) {
                for (const [cid, cap] of Object.entries(this.world.capitals)) {
                    if (cap.x === bx && cap.y === by) {
                        if (cid === b.defenderCountry) {
                            capitalBonus = 1.5;
                            this.logCombat(`🏛️ Защита столицы даёт бонус +50%!`, 'bonus');
                        } else if (cid === b.attackerCountry) {
                            capitalBonus = 0.8;
                        }
                        break;
                    }
                }
            }
            
            // Бонус за окружение
            const encirclementBonus = b.encircled ? 0.5 : 1.0;
            if (b.encircled) {
                this.logCombat(`⭕ Окруженные получают -50% к боеспособности!`, 'penalty');
            }

            // === УРОН ЗАЩИТНИКАМ ===
            const aRawAttack = this._calculateAttack(b.attackers, b.defenders, b.attackerSupport);
            const avgDefDefense = this._avgStat(b.defenders, 'defense');
            const avgDefArmor = this._avgStat(b.defenders, 'armor');
            const avgDefHardness = this._avgStat(b.defenders, 'hardness');
            
            let defTechMult = 1.0;
            if (this.tech) defTechMult += this.tech.getEffect(b.defenderCountry, 'infantryDefense');

            // Расчёт пробития брони
            const avgAtkHardAttack = this._avgStat([...b.attackers, ...b.attackerSupport], 'hardAttack');
            const penetrationRatio = Math.min(2.0, avgAtkHardAttack / Math.max(1, avgDefArmor));

            for (const uid of b.defenders) {
                const supplyMult = this.supplyStatus.get(uid) || 1.0;
                const expMult = 1 + (this.experience[uid] || 0) * 0.02;
                
                const reduction = avgDefDefense * terrainBonus.defense * trenchBonus * capitalBonus * encirclementBonus * 0.12 * defTechMult;
                const baseDmg = (aRawAttack / Math.max(1, b.defenders.length)) * breakthroughBonus * numAdvA * aPenalty;
                
                // Штраф за плохое снабжение
                const supplyPenalty = supplyMult < 0.5 ? 0.6 : 1.0;
                
                const netDmg = Math.max(2, (baseDmg - reduction) * rng() * supplyPenalty / expMult);
                this.org[uid] = Math.max(0, this.org[uid] - netDmg);
                
                const hpDmg = Math.max(1, Math.ceil(netDmg * 0.18 * rng()));
                e.damage(uid, hpDmg);
            }

            // === УРОН АТАКУЮЩИМ ===
            const dRawAttack = this._calculateAttack(b.defenders, b.attackers, b.defenderSupport) * capitalBonus;
            const avgAtkBreakthrough = this._avgStat(b.attackers, 'breakthrough');
            const avgAtkHardness = this._avgStat(b.attackers, 'hardness');
            
            let atkTechMult = 1.0;
            if (this.tech) atkTechMult += this.tech.getEffect(b.attackerCountry, 'infantryAttack');

            // Защитники используют soft attack против атакующих в окопах
            const effectiveDefAttack = dRawAttack * terrainBonus.attack;

            for (const uid of b.attackers) {
                const supplyMult = this.supplyStatus.get(uid) || 1.0;
                const expMult = 1 + (this.experience[uid] || 0) * 0.02;
                
                const reduction = avgAtkBreakthrough * 0.12 * atkTechMult;
                const baseDmg = (effectiveDefAttack / Math.max(1, b.attackers.length)) * numAdvD * dPenalty;
                
                const supplyPenalty = supplyMult < 0.5 ? 0.6 : 1.0;
                
                const netDmg = Math.max(2, (baseDmg - reduction) * rng() * supplyPenalty / expMult);
                this.org[uid] = Math.max(0, this.org[uid] - netDmg);
                
                const hpDmg = Math.max(1, Math.ceil(netDmg * 0.15 * rng()));
                e.damage(uid, hpDmg);
            }

            // Чистим мёртвых
            b.attackers = b.attackers.filter(id => e.active[id]);
            b.defenders = b.defenders.filter(id => e.active[id]);
            b.attackerSupport = b.attackerSupport.filter(id => e.active[id]);
            b.defenderSupport = b.defenderSupport.filter(id => e.active[id]);

            if (!b.attackers.length || !b.defenders.length) {
                this._endBattle(b);
                toDelete.push(cellKey);
                continue;
            }

            const newAOrg = this._avgOrg(b.attackers);
            const newDOrg = this._avgOrg(b.defenders);

            if (newDOrg <= 0 && newAOrg > 0) {
                this._defenderRouted(b, cellKey);
                toDelete.push(cellKey);
            } else if (newAOrg <= 0 && newDOrg > 0) {
                this._attackerRouted(b, cellKey);
                toDelete.push(cellKey);
            } else if (newAOrg <= 0 && newDOrg <= 0) {
                // Оба проиграли — отступление
                this._mutualRetreat(b, cellKey);
                toDelete.push(cellKey);
            } else if (b.day >= 30) {
                // Затяжной бой — проверка на истощение
                this._checkAttrition(b, cellKey);
                if (!this.battles.has(cellKey)) {
                    toDelete.push(cellKey);
                }
            }
        }
        for (const k of toDelete) this.battles.delete(k);
    }
    
    _calculateAttack(attackers, defenders, support) {
        const e = this.entities;
        const avgHardness = defenders.reduce((s, d) => {
            const ds = UNIT_STATS[e.type[d]] || UNIT_STATS[UNIT_TYPE.INFANTRY];
            return s + ds.hardness;
        }, 0) / (defenders.length || 1);

        const avgArmor = defenders.reduce((s, d) => {
            const ds = UNIT_STATS[e.type[d]] || UNIT_STATS[UNIT_TYPE.INFANTRY];
            return s + ds.armor;
        }, 0) / (defenders.length || 1);

        let total = 0;
        const allAttackers = [...attackers, ...support];
        
        for (const uid of allAttackers) {
            if (!e.active[uid]) continue;
            const aStats = UNIT_STATS[e.type[uid]] || UNIT_STATS[UNIT_TYPE.INFANTRY];
            
            let techMult = 1.0;
            if (this.tech) {
                if (e.type[uid] === UNIT_TYPE.INFANTRY) 
                    techMult += this.tech.getEffect(e.owner[uid], 'infantryAttack') || 0;
                else if (e.type[uid] === UNIT_TYPE.TANK) 
                    techMult += this.tech.getEffect(e.owner[uid], 'tankAttack') || 0;
            }
            
            const supplyMult = this.supplyStatus.get(uid) || 1.0;
            const expMult = 1 + (this.experience[uid] || 0) * 0.02;
            
            // Расчёт эффективного урона с учётом твёрдости цели
            const hardnessRatio = avgHardness / 100;
            let effectiveAttack;
            
            if (avgArmor > 10) {
                // Если есть броня — учитываем пробитие
                const penetrationMult = Math.min(1.5, aStats.hardAttack / Math.max(1, avgArmor));
                effectiveAttack = aStats.softAttack * (1 - hardnessRatio * 0.7) + 
                                 aStats.hardAttack * hardnessRatio * penetrationMult;
            } else {
                effectiveAttack = aStats.softAttack * (1 - hardnessRatio * 0.85) + 
                                 aStats.hardAttack * hardnessRatio;
            }
            
            effectiveAttack *= techMult * supplyMult * expMult;
            
            const orgMult = Math.max(0.3, (this.org[uid] || 1) / aStats.maxOrg);
            total += effectiveAttack * orgMult;
        }
        return total;
    }

    _checkAttrition(battle, cellKey) {
        // После 30 дней боя проверяем снабжение
        const aSupply = battle.attackers.reduce((sum, uid) => sum + (this.supplyStatus.get(uid) || 1), 0) / battle.attackers.length;
        const dSupply = battle.defenders.reduce((sum, uid) => sum + (this.supplyStatus.get(uid) || 1), 0) / battle.defenders.length;
        
        if (aSupply < 0.4) {
            this.logCombat(`⚠️ Атакующие страдают от нехватки снабжения!`, 'attrition');
            this._attackerRouted(battle, cellKey);
        } else if (dSupply < 0.4) {
            this.logCombat(`⚠️ Защитники страдают от нехватки снабжения!`, 'attrition');
            this._defenderRouted(battle, cellKey);
        }
    }

    // ── Восстановление org + HP ─────────────────────────────────────────────

    _recoverOrg() {
        const e = this.entities;
        for (let i = 1; i < e.nextId; i++) {
            if (!e.active[i] || e.inCombat[i]) continue;
            const s = UNIT_STATS[e.type[i]] || UNIT_STATS[UNIT_TYPE.INFANTRY];
            
            const supplyMult = this.supplyStatus.get(i) || 1.0;
            const recoveryRate = s.orgRecovery * supplyMult;
            
            if (this.org[i] < s.maxOrg) {
                this.org[i] = Math.min(s.maxOrg, (this.org[i] || s.maxOrg) + recoveryRate);
            } else if (this.org[i] === 0) {
                this.org[i] = s.maxOrg;
            }
            
            // HP восстанавливается медленнее
            if (e.hp[i] < s.maxHp && supplyMult > 0.5) {
                e.hp[i] = Math.min(s.maxHp, e.hp[i] + (s.hpPerDay || 1) * supplyMult);
            }
        }
    }
    
    _gainExperience() {
        const e = this.entities;
        for (const [, battle] of this.battles) {
            // Все участники получают опыт
            for (const uid of [...battle.attackers, ...battle.defenders, ...battle.attackerSupport, ...battle.defenderSupport]) {
                if (e.active[uid] && this.experience[uid] < 100) {
                    this.experience[uid] = Math.min(100, this.experience[uid] + 0.5);
                }
            }
        }
    }

    // ── Вспомогательные функции ─────────────────────────────────────────────

    _avgOrg(units) {
        if (!units.length) return 0;
        return units.reduce((s, uid) => s + (this.org[uid] || 0), 0) / units.length;
    }

    _avgStat(units, stat) {
        if (!units.length) return 0;
        const e = this.entities;
        return units.reduce((s, uid) => s + ((UNIT_STATS[e.type[uid]] || {})[stat] || 0), 0) / units.length;
    }

    _getCapitulationPenalty(countryId) {
        if (!countryId) return 1.0;
        const size = this.world.getCountryCells?.(countryId)?.size || 50;
        if (size <= 10) return 0.3;
        if (size <= 20) return 0.6;
        if (size <= 35) return 0.8;
        return 1.0;
    }

    // ── Результаты боя ──────────────────────────────────────────────────────

    _defenderRouted(b, cellKey) {
        const e = this.entities;
        const [cx, cy] = cellKey.split(',').map(Number);
        
        // Защитники отступают (не все умирают)
        let survivors = 0;
        for (const uid of b.defenders) {
            if (!e.active[uid]) continue;
            if (Math.random() > 0.6) {
                // 40% шанс выжить и отступить
                e.removeEntity(uid);
                this.stats.unitsDestroyed++;
            } else {
                survivors++;
                // Отступление на случайную соседнюю клетку
                const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
                const dir = dirs[Math.floor(Math.random() * dirs.length)];
                const newX = cx + dir[0], newY = cy + dir[1];
                if (this.world.isValidCell?.(newX, newY) !== false) {
                    e.moveTo(uid, newX, newY);
                }
            }
        }
        
        e.inCombat[uid] = 0;

        // Захват территории
        this.world.setCell(cx, cy, b.attackerCountry);
        
        // Очищаем окопы
        this.trenchLevel.delete(cellKey);

        const leader = b.attackers.reduce((best, uid) =>
            (this.org[uid] || 0) > (this.org[best] || 0) ? uid : best, b.attackers[0]);
        if (e.active[leader] && !e.getUnitAt(cx, cy)) {
            e.moveTo(leader, cx, cy);
        }
        
        this._endBattle(b);
        
        this.stats.battlesWon++;
        
        if (b.attackerCountry === this.gs.myCountryId || b.defenderCountry === this.gs.myCountryId) {
            const msg = `💀 ${b.defenderCountry} отступил! ${b.attackerCountry} захватывает территорию.`;
            this.logCombat(msg, 'victory');
            addNotification(msg, 'war');
        }
        
        this._checkCapitulation(b.defenderCountry, b.attackerCountry);
    }

    _attackerRouted(b, cellKey) {
        const e = this.entities;
        const [cx, cy] = cellKey.split(',').map(Number);
        
        // Атакующие отступают
        for (const uid of b.attackers) {
            if (!e.active[uid]) continue;
            if (Math.random() > 0.5) {
                e.removeEntity(uid);
                this.stats.unitsDestroyed++;
            } else {
                // Отступление назад
                const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
                const dir = dirs[Math.floor(Math.random() * dirs.length)];
                const newX = cx - dir[0], newY = cy - dir[1];
                if (this.world.isValidCell?.(newX, newY) !== false && !e.getUnitAt(newX, newY)) {
                    e.moveTo(uid, newX, newY);
                }
            }
            e.inCombat[uid] = 0;
        }
        
        for (const uid of b.attackerSupport) {
            if (e.active[uid]) e.inCombat[uid] = 0;
        }
        
        this._endBattle(b);
        
        this.stats.battlesLost++;
        
        if (b.attackerCountry === this.gs.myCountryId || b.defenderCountry === this.gs.myCountryId) {
            const msg = `💀 Атака ${b.attackerCountry} провалилась!`;
            this.logCombat(msg, 'defeat');
            addNotification(msg, 'war');
        }
    }
    
    _mutualRetreat(b, cellKey) {
        const e = this.entities;
        this.logCombat(`🤝 Взаимное отступление в секторе ${cellKey}`, 'retreat');
        
        for (const uid of [...b.attackers, ...b.defenders]) {
            if (e.active[uid]) {
                if (Math.random() > 0.7) {
                    e.removeEntity(uid);
                    this.stats.unitsDestroyed++;
                }
                e.inCombat[uid] = 0;
            }
        }
        
        this._endBattle(b);
    }

    _endBattle(b) {
        const e = this.entities;
        for (const uid of [...b.attackers, ...b.defenders, ...b.attackerSupport, ...b.defenderSupport]) {
            if (e.active[uid]) e.inCombat[uid] = 0;
        }
    }

    _checkCapitulation(loser, winner) {
        const cells = this.world.getCountryCells?.(loser);
        if (!cells || cells.size > 20) return;
        
        for (const c of [...cells]) {
            const [x, y] = c.split(',').map(Number);
            this.world.setCell(x, y, winner);
        }
        
        for (const uid of this.entities.getEntitiesByOwner(loser)) {
            this.entities.removeEntity(uid);
        }
        
        this.gs.wars = this.gs.wars.filter(w => w.a !== loser && w.b !== loser);
        this.gs.alliances = (this.gs.alliances || []).map(a => { 
            const s = new Set(a); 
            s.delete(loser); 
            return s; 
        }).filter(a => a.size > 1);
        
        const msg = `💀 ${loser} капитулировал перед ${winner}!`;
        this.logCombat(msg, 'capitulation');
        addNotification(msg, 'war');
        
        if (loser === this.gs.myCountryId) {
            addNotification('💀 Игра окончена!', 'war');
            this.gs.setGameSpeed(0);
            this.gs.isGameActive = false;
        }
    }
    
    // Публичные методы для UI
    getBattleInfo() {
        const info = [];
        for (const [cell, battle] of this.battles) {
            info.push({
                cell,
                attacker: battle.attackerCountry,
                defender: battle.defenderCountry,
                attackerOrg: Math.round(this._avgOrg(battle.attackers)),
                defenderOrg: Math.round(this._avgOrg(battle.defenders)),
                attackers: battle.attackers.length,
                defenders: battle.defenders.length,
                day: battle.day,
                encircled: battle.encircled
            });
        }
        return info;
    }
    
    getCombatLogs() {
        return [...this.combatLogs];
    }
    
    getStats() {
        return { ...this.stats };
    }
}
