// FocusTree.js — Дерево фокусов Германии (из JSON)

export const GERMANY_FOCUS_TREE = {
    // ═══════════════════════════ КОРОНА ═══════════════════════════
    versailles:         { id: 'versailles',         name: 'Отрицание Версаля',           desc: '+20 полит. власти',    icon: '📜', country: 'germany', branch: 'root', tier: 0, prereqs: [], effect: { equipment: 500 } },

    // ═══════════════════════════ ВЕТКА СЛЕВА (военная) ═══════════════════════════
    rhineland:          { id: 'rhineland',          name: 'Ремилитаризация Рейнланда',  desc: '+30 полит. власти',    icon: '🏰', country: 'germany', branch: 'military', tier: 1, prereqs: ['versailles'], effect: { ports: 1, equipment: 500 } },
    rearm:              { id: 'rearm',              name: 'Перевооружение Рейха',        desc: '+2 слота заводов',      icon: '🔫', country: 'germany', branch: 'military', tier: 1, prereqs: ['versailles'], effect: { factories: 3 } },

    // ТIER 2 — левая ветка
    anschluss:          { id: 'anschluss',          name: 'Аншлюс Австрии',              desc: 'Аннексия Австрии',      icon: '🤝', country: 'germany', branch: 'diplomacy', tier: 2, prereqs: ['rhineland'], effect: { annex: ['austria'] } },
    mediterranean:     { id: 'mediterranean',      name: 'Средиземноморские амбиции',   desc: 'Альянс с Италией',      icon: '⚓', country: 'germany', branch: 'diplomacy', tier: 2, prereqs: ['rhineland'], effect: { allies: ['italy'] } },

    // ТIER 2 — правая ветка
    four_year_plan:     { id: 'four_year_plan',     name: 'Четырёхлетний план',          desc: '+5 заводов',            icon: '🏭', country: 'germany', branch: 'economy', tier: 2, prereqs: ['rearm'], effect: { factories: 5, equipment: 1000 } },
    panzerwaffe:        { id: 'panzerwaffe',        name: 'Организация Панцерваффе',     desc: '+3 танка',              icon: '🚜', country: 'germany', branch: 'military', tier: 2, prereqs: ['rearm'], effect: { tanks: 3 } },

    // ТIER 3 — левая
    sudeten:           { id: 'sudeten',            name: 'Судетский кризис',            desc: 'Аннексия Судет',        icon: '⚔️', country: 'germany', branch: 'diplomacy', tier: 3, prereqs: ['anschluss'], effect: { annex: ['czechoslovakia'], equipment: 2000 } },
    steel_pact:        { id: 'steel_pact',         name: 'Стальной пакт',               desc: 'Союз с Италией',        icon: '🤝', country: 'germany', branch: 'diplomacy', tier: 3, prereqs: ['mediterranean'], effect: { allies: ['italy'] } },

    // ТIER 3 — центр
    autarky:           { id: 'autarky',            name: 'Автаркия',                    desc: '+3 завода',             icon: '⚙️', country: 'germany', branch: 'economy', tier: 3, prereqs: ['four_year_plan'], effect: { factories: 3, equipment: 1500 } },
    panzer_shk:        { id: 'panzer_shk',         name: 'Маневренные штабы',           desc: '+15% прорыв танков',    icon: '📋', country: 'germany', branch: 'military', tier: 3, prereqs: ['panzerwaffe'], effect: { tanks: 2, equipment: 500 } },
    storm_guns:        { id: 'storm_guns',         name: 'Штурмовая артиллерия',        desc: '+20% атака пехоты',     icon: '💥', country: 'germany', branch: 'military', tier: 3, prereqs: ['panzerwaffe'], effect: { infantry: 2, equipment: 500 } },

    // ТIER 4 — левая ветка (дипломатия)
    czech_partition:   { id: 'czech_partition',    name: 'Раздел Чехословакии',         desc: '+8 заводов',            icon: '🗺️', country: 'germany', branch: 'diplomacy', tier: 4, prereqs: ['sudeten'], effect: { factories: 8 } },
    steel_pact_2:      { id: 'steel_pact_2',       name: 'Ось Рим-Берлин',             desc: 'Союз с Италией',        icon: '🤝', country: 'germany', branch: 'diplomacy', tier: 4, prereqs: ['steel_pact'], effect: { allies: ['italy'] } },

    // ТIER 4 — центр (экономика)
    buna:              { id: 'buna',               name: 'Синтетический бензин',        desc: '+4 завода',             icon: '⛽', country: 'germany', branch: 'economy', tier: 4, prereqs: ['autarky'], effect: { factories: 4, equipment: 2000 } },
    tiger_tank:        { id: 'tiger_tank',         name: 'Танк Тигр',                   desc: '+3 танка',              icon: '💀', country: 'germany', branch: 'military', tier: 4, prereqs: ['panzer_shk'], effect: { tanks: 3, equipment: 1000 } },
    stug:              { id: 'stug',               name: 'Штурмовая артиллерия',        desc: '+2 танка',              icon: '🔥', country: 'germany', branch: 'military', tier: 4, prereqs: ['storm_guns'], effect: { tanks: 2, equipment: 500 } },

    // TIER 5
    memel:             { id: 'memel',              name: 'Мемельский ультиматум',       desc: 'Аннексия Мемеля',       icon: '🗺️', country: 'germany', branch: 'diplomacy', tier: 5, prereqs: ['czech_partition'], effect: { annex: ['lithuania'] } },
    romania_pact:      { id: 'romania_pact',       name: 'Плоештский договор',          desc: '+30% нефти из Румынии', icon: '⛽', country: 'germany', branch: 'economy', tier: 5, prereqs: ['buna'], effect: { allies: ['romania'], equipment: 2000 } },
    panther:           { id: 'panther',            name: 'Танк Пантера',                desc: '+4 танка',              icon: '🛡️', country: 'germany', branch: 'military', tier: 5, prereqs: ['tiger_tank'], effect: { tanks: 4, equipment: 1500 } },

    // TIER 6
    molotov_ribbentrop:{ id: 'molotov_ribbentrop', name: 'Пакт Молотова-Риббентропа',   desc: 'Временный союз с СССР', icon: '🤝', country: 'germany', branch: 'diplomacy', tier: 6, prereqs: ['memel'], effect: { allies: ['ussr'] } },
    oil_caucasus:      { id: 'oil_caucasus',       name: 'Кавказская нефть',            desc: '+5 заводов',            icon: '🛢️', country: 'germany', branch: 'economy', tier: 6, prereqs: ['romania_pact'], effect: { factories: 5, equipment: 3000 } },
    tiger_2:           { id: 'tiger_2',            name: 'Королевский Тигр',            desc: '+3 танка',              icon: '💀', country: 'germany', branch: 'military', tier: 6, prereqs: ['panther'], effect: { tanks: 3, equipment: 2000 } },

    // TIER 7 — военные операции
    poland_campaign:   { id: 'poland_campaign',    name: 'Польская кампания',            desc: 'Война с Польшей',       icon: '⚔️', country: 'germany', branch: 'war', tier: 7, prereqs: ['molotov_ribbentrop'], effect: { war: 'poland' } },
    blitz_france:      { id: 'blitz_france',       name: 'Блицкриг во Франции',          desc: 'Война с Францией',      icon: '🗺️', country: 'germany', branch: 'war', tier: 8, prereqs: ['poland_campaign'], effect: { war: 'france' } },
    Barbarossa:        { id: 'barbarossa',         name: 'Удар по СССР',                 desc: 'Война с СССР',          icon: '💀', country: 'germany', branch: 'war', tier: 9, prereqs: ['blitz_france'], effect: { war: 'ussr' } },
    total_war:         { id: 'total_war',          name: 'Тотальная война',              desc: '+5 заводов, +10 юнитов', icon: '🔥', country: 'germany', branch: 'economy', tier: 10, prereqs: ['barbarossa'], effect: { factories: 5, infantry: 5, tanks: 3 } },
    wunderwaffe:       { id: 'wunderwaffe',        name: 'Вундерваффе',                 desc: '+3 танка',              icon: '🚀', country: 'germany', branch: 'military', tier: 11, prereqs: ['total_war'], effect: { tanks: 3, equipment: 5000 } },
    fall_of_reich:     { id: 'fall_of_reich',      name: 'Падение Рейха',               desc: 'Конец',                 icon: '🏳️', country: 'germany', branch: 'end', tier: 12, prereqs: ['wunderwaffe'], effect: { equipment: -5000 } },
};
