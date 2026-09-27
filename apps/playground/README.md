# `apps/playground`

Стенд для сценариев подключения CSS пакета. Проверяет, что все документированные способы
(`packages/granularity/docs/styling.md` → «Сценарии подключения CSS») реально работают на собранном `dist`, а не только
на бумаге.

## Панель Granularity DevTools

Стенд подключает `@feugene/granularity-devtools` (`src/main.ts`, за гардом
`import.meta.env.DEV`) и `vite-plugin-vue-devtools`, поэтому панель открывается прямо в странице — расширение браузера
не нужно:

```bash
yarn dev:playground        # http://localhost:5173/playground/
```

Дальше в открытой странице — **⌥⇧D** (`Option`+`Shift`+`D`), и в колонке плагинов появляются разделы «Granularity
overlays», «Granularity app» и «Granularity issues». Панель можно открыть и отдельным окном:
`http://localhost:5173/playground/__devtools__/`.

Что смотреть на этом стенде: откройте модалку — в «Granularity overlays» появится слой с именем открывшего компонента,
тем, кому адресован `Esc`, и судьбой фокуса. Секции пропов и токенов живут в штатном инспекторе компонентов, на
выбранном `Gr*`.

Стенд удобен и для проверки секции «tokens · consumed but empty». Тот же вопрос granum отвечает без devtools:
`granum doctor` называет токены, которые компоненты селекции потребляют, а ни один слой не объявляет, и
`dist/granum-report.json` держит тот же список в поле `tokens.undefined`. Со штатным конфигом секция пуста.

Лента событий пишется, **только когда включена запись** — кнопка в правом верхнем углу вкладки Timeline. Пустая лента
чаще всего значит именно это.

## Что здесь проверяется

`src/main.ts` держит четыре варианта закомментированными — раскомментировать нужный:

| Вариант | Импорт                    | Что подключает                                                                                                         |
|---------|---------------------------|------------------------------------------------------------------------------------------------------------------------|
| 1       | `@granularity-foundation` | только foundation-слой пакета                                                                                          |
| 2       | `@granularity-styles`     | весь пакетный CSS целиком                                                                                              |
| 3       | `@granularity-button-css` | bundle одного компонента (`GrButton`) — внутри уже foundation, utility-стили кнопки и темы `light`/`dark`              |
| 4       | `granum.config.ts`        | сборка через granum: токены, база, встроенные темы, CSS выбранных компонентов и утилиты разметки — пятью каскадными слоями |

Алиасы `@granularity-*` объявлены в `vite.config.ts` и целят прямо в артефакты
`packages/granularity/dist/**` — стенд намеренно работает с опубликованными файлами.

Вариант 4 дополнительно показывает override токенов: `src/styles/light-app.css` подключается импортом в
`main.ts` и перекрывает токены пакета. Это нелейерный CSS, поэтому по правилам каскада он выигрывает у любого
слоя granum, и порядок импортов на результат не влияет.

`src/App.vue` — набор компонентов через корневой импорт (`GrButton`, `GrModal`,
`GrPromptDialog`, `GrSelect`). `src/AppSubpath.vue` — та же кнопка, но subpath-импортом, для сравнения гранулярности.

## Тест

`src/__tests__/distPlaygroundConfig.test.ts` проверяет саму обвязку: что `granum.config.ts`
выбирает компоненты, которые стенд рендерит, задаёт движок объявленного пакетом словаря и
сканирует исходники приложения, а `vite.config.ts` разводит `vue` и `granularity` по отдельным
чанкам. То есть ломается при поломке конфигов, а не вёрстки.

## Команды

```bash
yarn dev:playground
yarn build:playground
yarn workspace @feugene/granularity-playground build:analyze   # treemap в dist/stats.html
yarn test:playground
```

Стенд смотрит в собранный `dist`, поэтому после правок библиотеки — `yarn build:granularity`.
