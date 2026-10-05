# `src` structure

- `__tests__/` — пакетные unit/integration тесты для публичного и build-time API.
- `components/` — Vue-компоненты и их локальные конфиги/стили/тестовые артефакты.
- `composables/` — публичные композаблы (`@feugene/granularity/composables/*`); внутренние — в `composables/internal/`.
- `directives/` — отдельные Vue-директивы, не связанные с конкретным компонентом.
- `fileValidation/` — валидация файлов вне конкретного компонента (`@feugene/granularity/fileValidation`).
- `granular-provider/` — провайдер granum пакета: `id`, файлы темы и реестр компонентов (`shared.ts`, блоки генерирует
  `yarn generate:registry`); `node.ts` — алиас browser-entry для subpath `granular-provider/node`.
- `i18n/` — словари и публичные i18n-ресурсы пакета.
- `internal/` — внутренние утилиты и адаптеры, которые не должны становиться публичным API.
- `styles/` — только статические CSS-ассеты пакета: base, tokens и theme-файлы.
- `testing/` — тестовые утилиты для потребителя (`@feugene/granularity/testing`), без привязки к раннеру.
- `theme/` — сборка тем из данных (`extendTheme`, `createTheme`, `tone()`) и рантайм-подключение (`theme/apply`).
- `tokens/` — справочник токенов как данные (`@feugene/granularity/tokens`), генерируется из `tokens/*.json`.
- `vue/` — `createGranularity`/`installGranularity`: единый bootstrap-вход приложения.
