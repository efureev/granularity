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
```

## Заметки

- В `package.json` есть скрипты `test`/`test:run`, но `vitest.config.ts` в приложении
  нет — запустить их сейчас нельзя. Либо завести конфиг, либо убрать скрипты.
- `base` в `vite.config.ts` — `/playground/`, как у `apps/playground`. Локально это
  безвредно (деплоится только витрина), но при публикации стенды столкнулись бы.
