// Countries.js — Данные всех 45 стран с идеологиями

export const COUNTRIES = {
    // === ЕВРОПА ===
    germany: {
        name: "Third Reich",
        nameEn: "Third Reich",
        ideology: "Фашизм",
        ideologies: {
            "Фашизм":     { name: "Third Reich",           nameEn: "Third Reich",           leader: "Адольф Гитлер",           leaderEn: "Adolf Hitler",            color: "#3a3a3a", flag: "germany" },
            "Демократия":  { name: "Germany",              nameEn: "Germany",              leader: "Конрад Аденауэр",         leaderEn: "Konrad Adenauer",          color: "#dd0000", flag: "germany_democratic" },
            "Коммунизм":   { name: "DKP",                  nameEn: "DKP",                  leader: "Эрнст Тельман",           leaderEn: "Ernst Thälmann",           color: "#cc0000", flag: "germany_communist" },
            "Нейтралитет": { name: "Germany Empire",       nameEn: "Germany Empire",       leader: "Пауль фон Гинденбург",   leaderEn: "Paul von Hindenburg",      color: "#808080", flag: "germany_neutral" },
        }
    },
    ussr: {
        name: "СССР",
        nameEn: "Soviet Union",
        ideology: "Коммунизм",
        ideologies: {
            "Коммунизм":  { name: "СССР",                   nameEn: "Soviet Union",          leader: "Иосиф Сталин",            leaderEn: "Joseph Stalin",           color: "#990000", flag: "ussr" },
            "Демократия": { name: "СССР",                   nameEn: "Soviet Union",          leader: "Георгий Пятаков",         leaderEn: "Georgy Pyatakov",         color: "#3b82f6", flag: "ussr" },
            "Фашизм":     { name: "СССР",                   nameEn: "Soviet Union",          leader: "Власов",                  leaderEn: "Vlasov",                  color: "#8b0000", flag: "ussr" },
            "Нейтралитет": { name: "СССР",                   nameEn: "Soviet Union",          leader: "Александр Колчак",        leaderEn: "Alexander Kolchak",        color: "#6b7280", flag: "ussr" },
        }
    },
    poland: {
        name: "Польша",
        nameEn: "Poland",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Польша",                nameEn: "Poland",                leader: "Игнаций Мосцицкий",       leaderEn: "Ignacy Mościcki",         color: "#ffc0cb", flag: "poland" },
            "Демократия":  { name: "Польша",                nameEn: "Poland",                leader: "Игнаций Мосцицкий",       leaderEn: "Ignacy Mościcki",         color: "#ffc0cb", flag: "poland" },
            "Фашизм":      { name: "Польша",                nameEn: "Poland",                leader: "Едрук Пилсудский",        leaderEn: "Józef Piłsudski",         color: "#dc2626", flag: "poland" },
            "Коммунизм":   { name: "Польша",                nameEn: "Poland",                leader: "Болеслав Берут",          leaderEn: "Bolesław Bierut",         color: "#990000", flag: "poland" },
        }
    },
    france: {
        name: "France",
        nameEn: "France",
        ideology: "Демократия",
        ideologies: {
            "Демократия":  { name: "France",               nameEn: "France",               leader: "Альбер Лебрен",           leaderEn: "Albert Lebrun",           color: "#3b82f6", flag: "france" },
            "Фашизм":      { name: "Vichy France",         nameEn: "Vichy France",         leader: "Пьер Лаваль",             leaderEn: "Pierre Laval",           color: "#1e3a5f", flag: "france_fascist" },
            "Коммунизм":   { name: "Socialist France",     nameEn: "Socialist France",     leader: "Морис Торез",             leaderEn: "Maurice Thorez",         color: "#cc0000", flag: "france_communist" },
            "Нейтралитет": { name: "France",               nameEn: "France",               leader: "Альбер Лебрен",           leaderEn: "Albert Lebrun",           color: "#6b7280", flag: "france" },
        }
    },
    uk: {
        name: "Великобритания",
        nameEn: "United Kingdom",
        ideology: "Демократия",
        ideologies: {
            "Демократия":  { name: "Великобритания",       nameEn: "United Kingdom",       leader: "Невилл Чемберлен",        leaderEn: "Neville Chamberlain",     color: "#ef4444", flag: "uk" },
            "Фашизм":      { name: "Великобритания",       nameEn: "United Kingdom",       leader: "Оswald Mosley",           leaderEn: "Oswald Mosley",           color: "#1a1a2e", flag: "uk" },
            "Коммунизм":   { name: "Великобритания",       nameEn: "United Kingdom",       leader: "Гарри Поллит",            leaderEn: "Harry Pollitt",           color: "#990000", flag: "uk" },
            "Нейтралитет": { name: "Великобритания",       nameEn: "United Kingdom",       leader: "Невилл Чемберлен",        leaderEn: "Neville Chamberlain",     color: "#6b7280", flag: "uk" },
        }
    },
    italy: {
        name: "Италия",
        nameEn: "Italy",
        ideology: "Фашизм",
        ideologies: {
            "Фашизм":      { name: "Италия",               nameEn: "Italy",                leader: "Бенито Муссолини",        leaderEn: "Benito Mussolini",        color: "#166534", flag: "italy" },
            "Демократия":  { name: "Италия",               nameEn: "Italy",                leader: "Альчиде Де Гаспери",      leaderEn: "Alcide De Gasperi",       color: "#3b82f6", flag: "italy" },
            "Коммунизм":   { name: "Италия",               nameEn: "Italy",                leader: "Пальмиро Тольятти",       leaderEn: "Palmiro Togliatti",       color: "#cc0000", flag: "italy" },
            "Нейтралитет": { name: "Италия",               nameEn: "Italy",                leader: "Виктор Эммануил III",     leaderEn: "Victor Emmanuel III",     color: "#6b7280", flag: "italy" },
        }
    },
    spain: {
        name: "Испания",
        nameEn: "Spain",
        ideology: "Фашизм",
        ideologies: {
            "Фашизм":      { name: "Испания",              nameEn: "Spain",                leader: "Франсиско Франко",        leaderEn: "Francisco Franco",        color: "#fbbf24", flag: "spain" },
            "Демократия":  { name: "Испания",              nameEn: "Spain",                leader: "Мануэль Асанья",          leaderEn: "Manuel Azaña",            color: "#3b82f6", flag: "spain" },
            "Коммунизм":   { name: "Испания",              nameEn: "Spain",                leader: "Долорес Ибаррури",        leaderEn: "Dolores Ibárruri",        color: "#990000", flag: "spain" },
            "Нейтралитет": { name: "Испания",              nameEn: "Spain",                leader: "Франсиско Франко",        leaderEn: "Francisco Franco",        color: "#6b7280", flag: "spain" },
        }
    },
    portugal: {
        name: "Португалия",
        nameEn: "Portugal",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Португалия",           nameEn: "Portugal",             leader: "Антониу Салазар",         leaderEn: "António Salazar",         color: "#105d10", flag: "portugal" },
            "Фашизм":      { name: "Португалия",           nameEn: "Portugal",             leader: "Антониу Салазар",         leaderEn: "António Salazar",         color: "#dc2626", flag: "portugal" },
            "Демократия":  { name: "Португалия",           nameEn: "Portugal",             leader: "Мариу Суареш",            leaderEn: "Mário Soares",            color: "#3b82f6", flag: "portugal" },
            "Коммунизм":   { name: "Португалия",           nameEn: "Portugal",             leader: "Алвару Куньял",           leaderEn: "Álvaro Cunhal",           color: "#990000", flag: "portugal" },
        }
    },
    netherlands: {
        name: "Нидерланды",
        nameEn: "Netherlands",
        ideology: "Демократия",
        ideologies: {
            "Демократия":  { name: "Нидерланды",           nameEn: "Netherlands",          leader: "Вильгельмина",            leaderEn: "Wilhelmina",              color: "#f97316", flag: "netherlands" },
            "Фашизм":      { name: "Нидерланды",           nameEn: "Netherlands",          leader: "Антон Муссеерт",          leaderEn: "Anton Mussert",           color: "#dc2626", flag: "netherlands" },
            "Коммунизм":   { name: "Нидерланды",           nameEn: "Netherlands",          leader: "Давид Вискерс",           leaderEn: "David Wijnkoop",          color: "#990000", flag: "netherlands" },
            "Нейтралитет": { name: "Нидерланды",           nameEn: "Netherlands",          leader: "Вильгельмина",            leaderEn: "Wilhelmina",              color: "#6b7280", flag: "netherlands" },
        }
    },
    belgium: {
        name: "Бельгия",
        nameEn: "Belgium",
        ideology: "Демократия",
        ideologies: {
            "Демократия":  { name: "Бельгия",              nameEn: "Belgium",              leader: "Леопольд III",            leaderEn: "Leopold III",             color: "#eab308", flag: "belgium" },
            "Фашизм":      { name: "Бельгия",              nameEn: "Belgium",              leader: "Леон Дегрель",            leaderEn: "Léon Degrelle",           color: "#dc2626", flag: "belgium" },
            "Коммунизм":   { name: "Бельгия",              nameEn: "Belgium",              leader: "Жак Сорель",              leaderEn: "Jacques Sorel",           color: "#990000", flag: "belgium" },
            "Нейтралитет": { name: "Бельгия",              nameEn: "Belgium",              leader: "Леопольд III",            leaderEn: "Leopold III",             color: "#6b7280", flag: "belgium" },
        }
    },
    luxembourg: {
        name: "Люксембург",
        nameEn: "Luxembourg",
        ideology: "Демократия",
        ideologies: {
            "Демократия":  { name: "Люксембург",           nameEn: "Luxembourg",           leader: "Шарлотта",                leaderEn: "Charlotte",               color: "#67e8f9", flag: "luxembourg" },
            "Фашизм":      { name: "Люксембург",           nameEn: "Luxembourg",           leader: "Леон Дегрель",            leaderEn: "Léon Degrelle",           color: "#dc2626", flag: "luxembourg" },
            "Коммунизм":   { name: "Люксембург",           nameEn: "Luxembourg",           leader: "Доминик Орбах",           leaderEn: "Dominique Urbach",        color: "#990000", flag: "luxembourg" },
            "Нейтралитет": { name: "Люксембург",           nameEn: "Luxembourg",           leader: "Шарлотта",                leaderEn: "Charlotte",               color: "#6b7280", flag: "luxembourg" },
        }
    },
    switzerland: {
        name: "Швейцария",
        nameEn: "Switzerland",
        ideology: "Демократия",
        ideologies: {
            "Демократия":  { name: "Швейцария",            nameEn: "Switzerland",          leader: "Джузеппе Мотта",          leaderEn: "Giuseppe Motta",          color: "#dc2626", flag: "switzerland" },
            "Фашизм":      { name: "Швейцария",            nameEn: "Switzerland",          leader: "Генрих Гиммлер",          leaderEn: "Heinrich Himmler",        color: "#1a1a2e", flag: "switzerland" },
            "Коммунизм":   { name: "Швейцария",            nameEn: "Switzerland",          leader: "Эрнст Нунциан",           leaderEn: "Ernst Nobs",              color: "#990000", flag: "switzerland" },
            "Нейтралитет": { name: "Швейцария",            nameEn: "Switzerland",          leader: "Джузеппе Мотта",          leaderEn: "Giuseppe Motta",          color: "#6b7280", flag: "switzerland" },
        }
    },
    romania: {
        name: "Румыния",
        nameEn: "Romania",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Румыния",              nameEn: "Romania",              leader: "Кароль II",               leaderEn: "Carol II",                color: "#f59e0b", flag: "romania" },
            "Фашизм":      { name: "Румыния",              nameEn: "Romania",              leader: "Ион Антонеску",           leaderEn: "Ion Antonescu",           color: "#dc2626", flag: "romania" },
            "Демократия":  { name: "Румыния",              nameEn: "Romania",              leader: "Петру Гроза",             leaderEn: "Petru Groza",             color: "#3b82f6", flag: "romania" },
            "Коммунизм":   { name: "Румыния",              nameEn: "Romania",              leader: "Георге Георгиу-Деж",      leaderEn: "Gheorghe Gheorghiu-Dej",  color: "#990000", flag: "romania" },
        }
    },
    hungary: {
        name: "Венгрия",
        nameEn: "Hungary",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Венгрия",              nameEn: "Hungary",              leader: "Миклош Хорти",            leaderEn: "Miklós Horthy",           color: "#16a34a", flag: "hungary" },
            "Фашизм":      { name: "Венгрия",              nameEn: "Hungary",              leader: "Ференц Салаши",           leaderEn: "Ferenc Szálasi",          color: "#dc2626", flag: "hungary" },
            "Демократия":  { name: "Венгрия",              nameEn: "Hungary",              leader: "Миклош Хорти",            leaderEn: "Miklós Horthy",           color: "#3b82f6", flag: "hungary" },
            "Коммунизм":   { name: "Венгрия",              nameEn: "Hungary",              leader: "Матьяш Ракоши",           leaderEn: "Mátyás Rákosi",          color: "#990000", flag: "hungary" },
        }
    },
    bulgaria: {
        name: "Болгария",
        nameEn: "Bulgaria",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Болгария",             nameEn: "Bulgaria",             leader: "Борис III",               leaderEn: "Boris III",               color: "#059669", flag: "bulgaria" },
            "Фашизм":      { name: "Болгария",             nameEn: "Bulgaria",             leader: "Борис III",               leaderEn: "Boris III",               color: "#dc2626", flag: "bulgaria" },
            "Демократия":  { name: "Болгария",             nameEn: "Bulgaria",             leader: "Кимон Георгиев",          leaderEn: "Kimon Georgiev",          color: "#3b82f6", flag: "bulgaria" },
            "Коммунизм":   { name: "Болгария",             nameEn: "Bulgaria",             leader: "Георгий Димитров",        leaderEn: "Georgi Dimitrov",         color: "#990000", flag: "bulgaria" },
        }
    },
    finland: {
        name: "Финляндия",
        nameEn: "Finland",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Финляндия",            nameEn: "Finland",              leader: "Кюёсти Каллио",           leaderEn: "Kyösti Kallio",           color: "#e0e7ff", flag: "finland" },
            "Демократия":  { name: "Финляндия",            nameEn: "Finland",              leader: "Ристо Рюти",              leaderEn: "Risto Ryti",              color: "#3b82f6", flag: "finland" },
            "Фашизм":      { name: "Финляндия",            nameEn: "Finland",              leader: "Ристо Рюти",              leaderEn: "Risto Ryti",              color: "#dc2626", flag: "finland" },
            "Коммунизм":   { name: "Финляндия",            nameEn: "Finland",              leader: "Отто Куусинен",           leaderEn: "Otto Wille Kuusinen",     color: "#990000", flag: "finland" },
        }
    },
    norway: {
        name: "Норвегия",
        nameEn: "Norway",
        ideology: "Демократия",
        ideologies: {
            "Демократия":  { name: "Норвегия",             nameEn: "Norway",               leader: "Хаакон VII",              leaderEn: "Haakon VII",              color: "#dc2626", flag: "norway" },
            "Фашизм":      { name: "Норвегия",             nameEn: "Norway",               leader: "Видкун Квислинг",         leaderEn: "Vidkun Quisling",         color: "#1a1a2e", flag: "norway" },
            "Коммунизм":   { name: "Норвегия",             nameEn: "Norway",               leader: "Педер Фури",              leaderEn: "Peder Furubotn",          color: "#990000", flag: "norway" },
            "Нейтралитет": { name: "Норвегия",             nameEn: "Norway",               leader: "Хаакон VII",              leaderEn: "Haakon VII",              color: "#6b7280", flag: "norway" },
        }
    },
    sweden: {
        name: "Швеция",
        nameEn: "Sweden",
        ideology: "Демократия",
        ideologies: {
            "Демократия":  { name: "Швеция",               nameEn: "Sweden",               leader: "Густав V",                leaderEn: "Gustav V",                color: "#2563eb", flag: "sweden" },
            "Фашизм":      { name: "Швеция",               nameEn: "Sweden",               leader: "Пер Эдвин Скоглунд",      leaderEn: "Per Edvin Sköglund",      color: "#dc2626", flag: "sweden" },
            "Коммунизм":   { name: "Швеция",               nameEn: "Sweden",               leader: "Зет Хоглунд",             leaderEn: "Zeth Höglund",            color: "#990000", flag: "sweden" },
            "Нейтралитет": { name: "Швеция",               nameEn: "Sweden",               leader: "Густав V",                leaderEn: "Gustav V",                color: "#6b7280", flag: "sweden" },
        }
    },
    denmark: {
        name: "Дания",
        nameEn: "Denmark",
        ideology: "Демократия",
        ideologies: {
            "Демократия":  { name: "Дания",                nameEn: "Denmark",              leader: "Кристиан X",              leaderEn: "Christian X",             color: "#c026d3", flag: "denmark" },
            "Фашизм":      { name: "Дания",                nameEn: "Denmark",              leader: "Фриц Клаузен",            leaderEn: "Fritz Clausen",           color: "#dc2626", flag: "denmark" },
            "Коммунизм":   { name: "Дания",                nameEn: "Denmark",              leader: "Аксель Ларсен",           leaderEn: "Aksel Larsen",            color: "#990000", flag: "denmark" },
            "Нейтралитет": { name: "Дания",                nameEn: "Denmark",              leader: "Кристиан X",              leaderEn: "Christian X",             color: "#6b7280", flag: "denmark" },
        }
    },
    czechoslovakia: {
        name: "Чехословакия",
        nameEn: "Czechoslovakia",
        ideology: "Демократия",
        ideologies: {
            "Демократия":  { name: "Чехословакия",         nameEn: "Czechoslovakia",       leader: "Эдвард Бенеш",            leaderEn: "Edvard Beneš",            color: "#3b82f6", flag: "czechoslovakia" },
            "Фашизм":      { name: "Чехословакия",         nameEn: "Czechoslovakia",       leader: "Конрад Генляйн",          leaderEn: "Konrad Henlein",          color: "#dc2626", flag: "czechoslovakia" },
            "Коммунизм":   { name: "Чехословакия",         nameEn: "Czechoslovakia",       leader: "Клемент Готвальд",        leaderEn: "Klement Gottwald",        color: "#990000", flag: "czechoslovakia" },
            "Нейтралитет": { name: "Чехословакия",         nameEn: "Czechoslovakia",       leader: "Эдвард Бенеш",            leaderEn: "Edvard Beneš",            color: "#6b7280", flag: "czechoslovakia" },
        }
    },
    austria: {
        name: "Австрия",
        nameEn: "Austria",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Австрия",              nameEn: "Austria",              leader: "Курт Шушниг",             leaderEn: "Kurt Schuschnigg",        color: "#ef4444", flag: "austria" },
            "Фашизм":      { name: "Австрия",              nameEn: "Austria",              leader: "Артур Зейсс-Инкварт",     leaderEn: "Arthur Seyss-Inquart",    color: "#dc2626", flag: "austria" },
            "Демократия":  { name: "Австрия",              nameEn: "Austria",              leader: "Карл Реннер",             leaderEn: "Karl Renner",             color: "#3b82f6", flag: "austria" },
            "Коммунизм":   { name: "Австрия",              nameEn: "Austria",              leader: "Эрнст Фишер",             leaderEn: "Ernst Fischer",           color: "#990000", flag: "austria" },
        }
    },
    yugoslavia: {
        name: "Югославия",
        nameEn: "Yugoslavia",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Югославия",            nameEn: "Yugoslavia",           leader: "Пётр II",                 leaderEn: "Peter II",                color: "#1e40af", flag: "yugoslavia" },
            "Фашизм":      { name: "Югославия",            nameEn: "Yugoslavia",           leader: "Милан Недич",             leaderEn: "Milan Nedić",             color: "#dc2626", flag: "yugoslavia" },
            "Демократия":  { name: "Югославия",            nameEn: "Yugoslavia",           leader: "Иосип Броз Тито",         leaderEn: "Josip Broz Tito",         color: "#3b82f6", flag: "yugoslavia" },
            "Коммунизм":   { name: "Югославия",            nameEn: "Yugoslavia",           leader: "Иосип Броз Тито",         leaderEn: "Josip Broz Tito",         color: "#990000", flag: "yugoslavia" },
        }
    },
    greece: {
        name: "Греция",
        nameEn: "Greece",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Греция",               nameEn: "Greece",               leader: "Иоаннис Метаксас",        leaderEn: "Ioannis Metaxas",         color: "#60a5fa", flag: "greece" },
            "Демократия":  { name: "Греция",               nameEn: "Greece",               leader: "Иоаннис Метаксас",        leaderEn: "Ioannis Metaxas",         color: "#3b82f6", flag: "greece" },
            "Фашизм":      { name: "Греция",               nameEn: "Greece",               leader: "Иоаннис Метаксас",        leaderEn: "Ioannis Metaxas",         color: "#dc2626", flag: "greece" },
            "Коммунизм":   { name: "Греция",               nameEn: "Greece",               leader: "Маркос Авгиерис",         leaderEn: "Markos Vafiadis",         color: "#990000", flag: "greece" },
        }
    },
    albania: {
        name: "Албания",
        nameEn: "Albania",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Албания",              nameEn: "Albania",              leader: "Зогу I",                  leaderEn: "Zog I",                   color: "#dc2626", flag: "albania" },
            "Демократия":  { name: "Албания",              nameEn: "Albania",              leader: "Фан Ноли",                leaderEn: "Fan Noli",                color: "#3b82f6", flag: "albania" },
            "Фашизм":      { name: "Албания",              nameEn: "Albania",              leader: "Мехди Фрашери",           leaderEn: "Mehdi Frashëri",          color: "#1a1a2e", flag: "albania" },
            "Коммунизм":   { name: "Албания",              nameEn: "Albania",              leader: "Энвер Ходжа",             leaderEn: "Enver Hoxha",             color: "#990000", flag: "albania" },
        }
    },
    lithuania: {
        name: "Литва",
        nameEn: "Lithuania",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Литва",                nameEn: "Lithuania",            leader: "Антанас Сметона",         leaderEn: "Antanas Smetona",         color: "#065f46", flag: "lithuania" },
            "Демократия":  { name: "Литва",                nameEn: "Lithuania",            leader: "Антанас Сметона",         leaderEn: "Antanas Smetona",         color: "#3b82f6", flag: "lithuania" },
            "Фашизм":      { name: "Литва",                nameEn: "Lithuania",            leader: "Антанас Сметона",         leaderEn: "Antanas Smetona",         color: "#dc2626", flag: "lithuania" },
            "Коммунизм":   { name: "Литва",                nameEn: "Lithuania",            leader: "Антанас Сnieckис",        leaderEn: "Antanas Sniečkus",        color: "#990000", flag: "lithuania" },
        }
    },
    latvia: {
        name: "Латвия",
        nameEn: "Latvia",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Латвия",               nameEn: "Latvia",               leader: "Карлис Улманис",          leaderEn: "Kārlis Ulmanis",          color: "#7f1d1d", flag: "latvia" },
            "Демократия":  { name: "Латвия",               nameEn: "Latvia",               leader: "Карлис Улманис",          leaderEn: "Kārlis Ulmanis",          color: "#3b82f6", flag: "latvia" },
            "Фашизм":      { name: "Латвия",               nameEn: "Latvia",               leader: "Карлис Улманис",          leaderEn: "Kārlis Ulmanis",          color: "#dc2626", flag: "latvia" },
            "Коммунизм":   { name: "Латвия",               nameEn: "Latvia",               leader: "Август Кирхенштейн",      leaderEn: "Augusts Kirhenšteins",    color: "#990000", flag: "latvia" },
        }
    },
    estonia: {
        name: "Эстония",
        nameEn: "Estonia",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Эстония",              nameEn: "Estonia",              leader: "Константин Пятс",         leaderEn: "Konstantin Päts",         color: "#1d4ed8", flag: "estonia" },
            "Демократия":  { name: "Эстония",              nameEn: "Estonia",              leader: "Константин Пятс",         leaderEn: "Konstantin Päts",         color: "#3b82f6", flag: "estonia" },
            "Фашизм":      { name: "Эстония",              nameEn: "Estonia",              leader: "Константин Пятс",         leaderEn: "Konstantin Päts",         color: "#dc2626", flag: "estonia" },
            "Коммунизм":   { name: "Эстония",              nameEn: "Estonia",              leader: "Йоханнес Варес",          leaderEn: "Johannes Vares",          color: "#990000", flag: "estonia" },
        }
    },
    slovakia: {
        name: "Словакия",
        nameEn: "Slovakia",
        ideology: "Фашизм",
        ideologies: {
            "Фашизм":      { name: "Словакия",             nameEn: "Slovakia",             leader: "Йозеф Тисо",              leaderEn: "Jozef Tiso",              color: "#2563eb", flag: "slovakia" },
            "Демократия":  { name: "Словакия",             nameEn: "Slovakia",             leader: "Йозеф Тисо",              leaderEn: "Jozef Tiso",              color: "#3b82f6", flag: "slovakia" },
            "Коммунизм":   { name: "Словакия",             nameEn: "Slovakia",             leader: "Владимир Клементис",      leaderEn: "Vladimír Clementis",      color: "#990000", flag: "slovakia" },
            "Нейтралитет": { name: "Словакия",             nameEn: "Slovakia",             leader: "Йозеф Тисо",              leaderEn: "Jozef Tiso",              color: "#6b7280", flag: "slovakia" },
        }
    },
    ireland: {
        name: "Ирландия",
        nameEn: "Ireland",
        ideology: "Демократия",
        ideologies: {
            "Демократия":  { name: "Ирландия",             nameEn: "Ireland",              leader: "Дуглас Хейд",             leaderEn: "Douglas Hyde",            color: "#16a34a", flag: "ireland" },
            "Фашизм":      { name: "Ирландия",             nameEn: "Ireland",              leader: "О'Даффи",                 leaderEn: "O'Duffy",                 color: "#dc2626", flag: "ireland" },
            "Коммунизм":   { name: "Ирландия",             nameEn: "Ireland",              leader: "Джеймс Коннолли",         leaderEn: "James Connolly",          color: "#990000", flag: "ireland" },
            "Нейтралитет": { name: "Ирландия",             nameEn: "Ireland",              leader: "Дуглас Хейд",             leaderEn: "Douglas Hyde",            color: "#6b7280", flag: "ireland" },
        }
    },
    iceland: {
        name: "Исландия",
        nameEn: "Iceland",
        ideology: "Демократия",
        ideologies: {
            "Демократия":  { name: "Исландия",             nameEn: "Iceland",              leader: "Эрлюгингур Торссон",      leaderEn: "Erlingur Thorsson",       color: "#3b82f6", flag: "uk" },
            "Нейтралитет": { name: "Исландия",             nameEn: "Iceland",              leader: "Эрлюгингур Торссон",      leaderEn: "Erlingur Thorsson",       color: "#6b7280", flag: "uk" },
        }
    },

    // === БЛИЖНИЙ ВОСТОК ===
    turkey: {
        name: "Турция",
        nameEn: "Turkey",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Турция",               nameEn: "Turkey",               leader: "Мустафа Кемаль Ататюрк",  leaderEn: "Mustafa Kemal Atatürk",   color: "#dc2626", flag: "turkey" },
            "Демократия":  { name: "Турция",               nameEn: "Turkey",               leader: "Исмет Инёню",             leaderEn: "İsmet İnönü",             color: "#3b82f6", flag: "turkey" },
            "Фашизм":      { name: "Турция",               nameEn: "Turkey",               leader: "Махмуд Эскиджи",          leaderEn: "Mahmud Es'ad",            color: "#1a1a2e", flag: "turkey" },
            "Коммунизм":   { name: "Турция",               nameEn: "Turkey",               leader: "Шевкет Сюрсель",          leaderEn: "Şevket Süreyya",          color: "#990000", flag: "turkey" },
        }
    },
    iraq: {
        name: "Ирак",
        nameEn: "Iraq",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Ирак",                 nameEn: "Iraq",                 leader: "Галиб Аль-Гаюни",         leaderEn: "Ali Jawdat",              color: "#166534", flag: "iraq" },
            "Фашизм":      { name: "Ирак",                 nameEn: "Iraq",                 leader: "Рашид Али",               leaderEn: "Rashid Ali",              color: "#dc2626", flag: "iraq" },
            "Демократия":  { name: "Ирак",                 nameEn: "Iraq",                 leader: "Нури аль-Саид",           leaderEn: "Nuri al-Said",            color: "#3b82f6", flag: "iraq" },
            "Коммунизм":   { name: "Ирак",                 nameEn: "Iraq",                 leader: "Карим Касем",             leaderEn: "Abd al-Karim Qasim",     color: "#990000", flag: "iraq" },
        }
    },
    iran: {
        name: "Иран",
        nameEn: "Iran",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Иран",                 nameEn: "Iran",                 leader: "Реза Пехлеви",            leaderEn: "Reza Shah Pahlavi",       color: "#059669", flag: "iran" },
            "Демократия":  { name: "Иран",                 nameEn: "Iran",                 leader: "Мохаммед Мосаддык",       leaderEn: "Mohammad Mosaddegh",      color: "#3b82f6", flag: "iran" },
            "Фашизм":      { name: "Иран",                 nameEn: "Iran",                 leader: "Реза Пехлеви",            leaderEn: "Reza Shah Pahlavi",       color: "#dc2626", flag: "iran" },
            "Коммунизм":   { name: "Иран",                 nameEn: "Iran",                 leader: "Нуреддин Киянури",        leaderEn: "Nureddin Kianuri",        color: "#990000", flag: "iran" },
        }
    },
    saudi_arabia: {
        name: "Саудовская Аравия",
        nameEn: "Saudi Arabia",
        ideology: "Нейтралитет",
        ideologies: {
            "Нейтралитет": { name: "Саудовская Аравия",    nameEn: "Saudi Arabia",         leader: "Абдул-Азиз Аль-Сауд",     leaderEn: "Abdulaziz Al Saud",       color: "#15803d", flag: "saudi_arabia" },
            "Демократия":  { name: "Саудовская Аравия",    nameEn: "Saudi Arabia",         leader: "Абдул-Азиз Аль-Сауд",     leaderEn: "Abdulaziz Al Saud",       color: "#3b82f6", flag: "saudi_arabia" },
            "Фашизм":      { name: "Саудовская Аравия",    nameEn: "Saudi Arabia",         leader: "Абдул-Азиз Аль-Сауд",     leaderEn: "Abdulaziz Al Saud",       color: "#dc2626", flag: "saudi_arabia" },
            "Коммунизм":   { name: "Саудовская Аравия",    nameEn: "Saudi Arabia",         leader: "Абдул-Азиз Аль-Сауд",     leaderEn: "Abdulaziz Al Saud",       color: "#990000", flag: "saudi_arabia" },
        }
    },
};

// Хелпер для получения данных по идеологии
export function getIdeologyData(countryId, ideology) {
    const c = COUNTRIES[countryId];
    if (!c) return { leader: "Неизвестно", color: "#666666", flag: countryId };
    if (c.ideologies && c.ideologies[ideology]) {
        return c.ideologies[ideology];
    }
    return { leader: c.leader || "Неизвестно", color: c.color || "#666666", flag: countryId };
}

// Для совместимости
export function getDefaultCountryInfo(id) {
    return COUNTRIES[id] || { name: id.toUpperCase(), color: "#666666", leader: "Неизвестно", ideology: "Нейтралитет" };
}
