# `apps/playground-empty`

Базовая точка отсчёта для замеров веса: приложение на голом Vue, **без единого импорта
из `@feugene/granularity`**.

## Зачем нужен

Чтобы утверждение «компонент добавляет N килобайт» имело знаменатель. `dist` этого
стенда — это стоимость пустого Vue-приложения с той же сборочной обвязкой, что и у
остальных playground'ов (тот же `vue`-чанк, тот же visualizer). Разница с
`apps/playground` или `apps/playground-5` и есть цена подключения библиотеки.

```
dist/assets/vue-*.js     ~58 KB   runtime vue
dist/assets/index-*.js   ~2 KB    само приложение
```

`src/App.vue` — статическая разметка, все импорты компонентов оставлены
закомментированными намеренно: как только раскомментируешь, стенд перестанет быть
нулевой отметкой.

## Команды

```bash
yarn build:playground-empty
yarn workspace @feugene/granularity-playground-empty dev
yarn workspace @feugene/granularity-playground-empty build:analyze   # treemap в dist/stats.html
yarn workspace @feugene/granularity-playground-empty test:run        # охраняет инварианты стенда
```

## Тест

`src/__tests__/config.test.ts` держит стенд нулевым: проверяет, что в зависимостях нет
ничего кроме `vue`, что `vue` уезжает в отдельный чанк (иначе runtime не отделить от
кода приложения) и что `base` не совпадает с соседними стендами.
