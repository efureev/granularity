# `apps/playground`

Стенд для сценариев подключения CSS пакета. Проверяет, что все документированные
способы (`packages/granularity/docs/styling.md` → «Сценарии подключения CSS») реально
работают на собранном `dist`, а не только на бумаге.

## Что здесь проверяется

`src/main.ts` держит четыре варианта закомментированными — раскомментировать нужный:

| Вариант | Импорт | Что подключает |
| --- | --- | --- |
| 1 | `@granularity-foundation` | только foundation-слой пакета |
| 2 | `@granularity-styles` | весь пакетный CSS целиком |
| 3 | `@granularity-button-css` | bundle одного компонента (`GrButton`) — внутри уже foundation, utility-стили кнопки и темы `light`/`dark` |
| 4 | `uno.config.ts` | granular-сборка через `presetGranularNode`: foundation, стили выбранных компонентов, встроенные темы и тема приложения |

Алиасы `@granularity-*` объявлены в `vite.config.ts` и целят прямо в артефакты
`packages/granularity/dist/**` — стенд намеренно работает с опубликованными файлами.

Вариант 4 дополнительно показывает override токенов: `uno.config.ts` передаёт
`themes.tokensFile` → `src/styles/light-app.css`, то есть тема приложения перекрывает
`tokens.css` провайдера.

`src/App.vue` — набор компонентов через корневой импорт (`GrButton`, `GrModal`,
`GrPromptDialog`, `GrSelect`). `src/AppUno.vue` — та же кнопка, но subpath-импортом,
для сравнения гранулярности.

## Тест

`src/__tests__/distPlaygroundConfig.test.ts` проверяет саму обвязку: что `uno.config.ts`
сканирует ожидаемые директории `dist`, а `vite.config.ts` разводит `vue` и `granularity`
по отдельным чанкам. То есть ломается при поломке конфигов, а не вёрстки.

## Команды

```bash
yarn dev:playground
yarn build:playground
yarn workspace @feugene/granularity-playground build:analyze   # treemap в dist/stats.html
yarn test:playground
```

Стенд смотрит в собранный `dist`, поэтому после правок библиотеки — `yarn build:granularity`.
