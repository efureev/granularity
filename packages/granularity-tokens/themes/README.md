# Темы

Тема — полный набор значений токенов дизайн-языка: примитивы (`root.json`), роли каждого режима
(`modes/<режим>.json`), значения компонентов (`components/<пакет>/<Компонент>/`) и метаданные
(`theme.json`). Режимы — варианты внутри темы: `light` главный, `dark` стандартный второй, дальше
любые. Понятия целиком — [`docs/concepts.md`](../docs/concepts.md).

| Тема | Название | Версия | Режимы | Характер | Как устроена | Дизайн-система |
| --- | --- | --- | --- | --- | --- | --- |
| `slate` | Сланец | 1.2.0 | `light`, `dark` | холодные нейтрали, индиго-акцент, контраст по AA | базовая тема пакета | [granularity.tech/themes/slate](https://granularity.tech/themes/slate) |
| `clay` | Глина | 1.2.0 | `light`, `dark` | тёплая бумага, графитовые чернила, один глиняный акцент | копия `slate` | [granularity.tech/themes/clay](https://granularity.tech/themes/clay) |
| `tactile` | Тактильная | 1.1.0 | `light`, `dark` | кнопка-предмет: свет сверху, тень цвета тона, подъём и пружина | наследник `slate` | [granularity.tech/themes/tactile](https://granularity.tech/themes/tactile) |
| `blueprint` | Чертёж | 1.1.0 | `light`, `dark` | плоская точность: без теней, линия хода, ячейка иконки | копия `slate` | [granularity.tech/themes/blueprint](https://granularity.tech/themes/blueprint) |

Каждая тема — папка с `README.md`: для чего она, правила использования, которых нет в токенах, и
ссылка на её дизайн-систему. Темы каталога выходят связкой с ядром: компонент с новым токеном вида
`theme` выходит со значением во всех темах каталога.

## Как выбрать

Темы сборки, их режимы и основную тему перечисляет `themes` в конфиге granum —
`[{ theme: '<slug>', default: true }]`. Темы по умолчанию у каталога нет: сборка без `themes` —
ошибка granum со списком тем. Основная тема едет в общем CSS приложения, остальные — своими
листами; тема и режим переключаются в рантайме парой `data-theme="<slug>-<режим>"`.

## Раскладка папки

Исходник темы granum — та же раскладка у тем каталога, у темы приложения и у темы отдельным
пакетом:

```
themes/<slug>/
  README.md                                  # описание и правила использования
  notes.json                                 # пояснения к значениям для доки — не данные темы
  theme.lock.json                            # версия и отпечаток данных — пишет generate
  theme.json                                 # id, title, description, docs, version, targets,
                                             # extends?, defaultMode, modes, extensions
  root.json                                  # примитивы: палитра, шрифты, отступы, радиусы, движение
  modes/<режим>.json                         # роли и тени режима
  components/@feugene/granularity/<GrX>/root.json         # значения компонента вне режимов
  components/@feugene/granularity/<GrX>/modes/<режим>.json
  components/@feugene/granularity/<GrX>/README.md         # почему значения такие
  components/@feugene/granularity-charts/GrChartFrame/root.json   # раздел группы: токены общего кода
```

- Имя папки — slug темы `^[a-z][a-z0-9-]*$`, оно же `id` в `theme.json`. Имя режима — без дефиса:
  на корне пара `<тема>-<режим>` разбирается по последнему дефису.
- Режимы объявляет `theme.json` объектом — `{ "light": { "title", "colorScheme" }, … }`, порядок
  ключей задаёт порядок режимов. Режим с `extends` хранит в своём файле только отличия.
- Файлы значений — `{ "<токен без -->": "<значение>" }`, без селекторов: их назначает сборка
  приложения. Ключ с `$` — пояснение, не значение.
- Раздел называет компонент, а у токенов общего кода нескольких компонентов — группу
  (`GrChartFrame` графиков): признаки и границы — [«Токены группы»](../docs/concepts.md#токены-группы).
- В разделе компонента — только токены вида `theme` этого компонента (`tokens.json` у компонента
  в ядре); у значения одно место — раздел одного компонента, `root` или режимы.
- `version` — версия темы, `targets` — пакеты компонентов и диапазоны их версий; пакет раздела
  обязан быть в `targets`. Правка данных без подъёма `version` роняет `generate`.
- Пропсы компонентов по умолчанию — `extensions.granularity.componentDefaults`.
- `docs` — абсолютный URL дизайн-системы темы, `https://granularity.tech/themes/<slug>`. Его же
  обязан называть `README.md` темы — это проверяет гейт `generated.test.ts`.
- Посторонний файл в папке — ошибка загрузчика, а не пропуск.

## Своя тема

Та же раскладка в коде приложения и `loadTheme` из `@feugene/granularity-tokens/theme/node`:
сборка проверяет полноту, контраст и различимость тонов в каждом режиме и падает с именем
токена. Тема с `"extends": "slate"` объявляет только отличия и идёт за правками «Сланца»; копия
(`theme:copy`) от него независима. Собранная тема идёт в `themes` конфига granum — основной или
дополнительной. Подробно — [`docs/themes.md`](../docs/themes.md).

## Новая встроенная тема

1. Наследник — папка `themes/<slug>/` с `"extends"` и отличиями; копия —
   `yarn workspace @feugene/granularity-tokens theme:copy <источник> <slug>` и правки поверх.
   `README.md` — по образцу `slate`, `version` — `1.0.0`, `targets` — как у `slate`.
2. `yarn workspace @feugene/granularity-tokens generate` — каталог, `theme.lock.json`, справочник
   `docs/tokens.md`.
3. `yarn workspace @feugene/granularity-tokens test:run` — гейты значений идут по всем парам
   «тема × режим» сами; полноту значений компонентов проверяет `catalogThemes.test.ts` ядра.
