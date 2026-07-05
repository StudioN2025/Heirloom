// Countries.js — Данные всех 45 стран

export const COUNTRIES = {
    // === ЕВРОПА ===
    germany:        { name: "Германия",          color: "#3a3a3a", leader: "Адольф Гитлер",            ideology: "Фашизм" },
    ussr:           { name: "СССР",              color: "#990000", leader: "Иосиф Сталин",              ideology: "Коммунизм" },
    poland:         { name: "Польша",            color: "#ffc0cb", leader: "Игнаций Мосцицкий",         ideology: "Нейтралитет" },
    france:         { name: "Франция",           color: "#3b82f6", leader: "Альбер Лебрен",             ideology: "Демократия" },
    uk:             { name: "Великобритания",    color: "#ef4444", leader: "Невилл Чемберлен",          ideology: "Демократия" },
    italy:          { name: "Италия",            color: "#166534", leader: "Бенито Муссолини",          ideology: "Фашизм" },
    spain:          { name: "Испания",           color: "#fbbf24", leader: "Франсиско Франко",          ideology: "Фашизм" },
    portugal:       { name: "Португалия",        color: "#105d10", leader: "Антониу Салазар",           ideology: "Нейтралитет" },
    netherlands:    { name: "Нидерланды",        color: "#f97316", leader: "Вильгельмина",              ideology: "Демократия" },
    belgium:        { name: "Бельгия",           color: "#eab308", leader: "Леопольд III",              ideology: "Демократия" },
    luxembourg:     { name: "Люксембург",        color: "#67e8f9", leader: "Шарлотта",                  ideology: "Демократия" },
    switzerland:    { name: "Швейцария",         color: "#dc2626", leader: "Джузеппе Мотта",            ideology: "Демократия" },
    romania:        { name: "Румыния",           color: "#f59e0b", leader: "Кароль II",                 ideology: "Нейтралитет" },
    hungary:        { name: "Венгрия",           color: "#16a34a", leader: "Миклош Хорти",              ideology: "Нейтралитет" },
    bulgaria:       { name: "Болгария",          color: "#059669", leader: "Борис III",                 ideology: "Нейтралитет" },
    finland:        { name: "Финляндия",         color: "#e0e7ff", leader: "Кюёсти Каллио",             ideology: "Нейтралитет" },
    norway:         { name: "Норвегия",          color: "#dc2626", leader: "Хаакон VII",                ideology: "Демократия" },
    sweden:         { name: "Швеция",            color: "#2563eb", leader: "Густав V",                  ideology: "Демократия" },
    denmark:        { name: "Дания",             color: "#c026d3", leader: "Кристиан X",                ideology: "Демократия" },
    czechoslovakia: { name: "Чехословакия",      color: "#3b82f6", leader: "Эдвард Бенеш",              ideology: "Демократия" },
    austria:        { name: "Австрия",           color: "#ef4444", leader: "Курт Шушниг",               ideology: "Нейтралитет" },
    yugoslavia:     { name: "Югославия",         color: "#1e40af", leader: "Пётр II",                   ideology: "Нейтралитет" },
    greece:         { name: "Греция",            color: "#60a5fa", leader: "Иоаннис Метаксас",          ideology: "Нейтралитет" },
    albania:        { name: "Албания",           color: "#dc2626", leader: "Зогу I",                    ideology: "Нейтралитет" },
    lithuania:      { name: "Литва",             color: "#065f46", leader: "Антанас Сметона",           ideology: "Нейтралитет" },
    latvia:         { name: "Латвия",            color: "#7f1d1d", leader: "Карлис Улманис",            ideology: "Нейтралитет" },
    estonia:        { name: "Эстония",           color: "#1d4ed8", leader: "Константин Пятс",           ideology: "Нейтралитет" },
    slovakia:       { name: "Словакия",          color: "#2563eb", leader: "Йозеф Тисо",                ideology: "Фашизм" },
    ireland:        { name: "Ирландия",          color: "#16a34a", leader: "Дуглас Хейд",               ideology: "Демократия" },
    iceland:        { name: "Исландия",          color: "#3b82f6", leader: "Эрлюгингур Торссон",        ideology: "Демократия" },

    // === БЛИЖНИЙ ВОСТОК ===
    turkey:         { name: "Турция",            color: "#dc2626", leader: "Мустафа Кемаль Ататюрк",    ideology: "Нейтралитет" },
    iraq:           { name: "Ирак",              color: "#166534", leader: "Галиб Аль-Гаюни",           ideology: "Нейтралитет" },
    iran:           { name: "Иран",              color: "#059669", leader: "Реза Пехлеви",              ideology: "Нейтралитет" },
    saudi_arabia:   { name: "Саудовская Аравия", color: "#15803d", leader: "Абдул-Азиз Аль-Сауд",       ideology: "Нейтралитет" },
    syria:          { name: "Сирия",             color: "#14532d", leader: "Французская мандатная зона", ideology: "Демократия" },
    jordan:         { name: "Иордания",          color: "#065f46", leader: "Абдалла I",                 ideology: "Нейтралитет" },
    palestine:      { name: "Палестина",         color: "#fbbf24", leader: "Британский мандат",          ideology: "Демократия" },

    // === СЕВЕРНАЯ АФРИКА ===
    egypt:          { name: "Египет",            color: "#f59e0b", leader: "Фарук I",                   ideology: "Нейтралитет" },
    libya:          { name: "Ливия",             color: "#7c2d12", leader: "Итальянская Ливия",          ideology: "Фашизм" },
    tunisia:        { name: "Тунис",             color: "#c2410c", leader: "Французский протекторат",    ideology: "Демократия" },
    algeria:        { name: "Алжир",             color: "#065f46", leader: "Французский Алжир",          ideology: "Демократия" },
    morocco:        { name: "Марокко",           color: "#047857", leader: "Мухаммед V",                ideology: "Нейтралитет" },
};

export function getCountryInfo(id) {
    return COUNTRIES[id] || { name: id.toUpperCase(), color: "#666666", leader: "Неизвестно", ideology: "Нейтралитет" };
}
