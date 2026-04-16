# `src` structure

- `__tests__/` — пакетные unit/integration тесты для публичного и build-time API.
- `components/` — Vue-компоненты и их локальные конфиги/стили/тестовые артефакты.
- `directives/` — отдельные Vue-директивы, не связанные с конкретным компонентом.
- `i18n/` — словари и публичные i18n-ресурсы пакета.
- `internal/` — внутренние утилиты и адаптеры, которые не должны становиться публичным API.
- `registry/` — реестры компонентов, safelist и служебные маппинги для генерации granular-артефактов.
- `styles/` — только статические CSS-ассеты пакета: base, tokens и theme-файлы.
- `theming/` — TypeScript-логика для тем: имена тем, резолв css-источников и node-only preflight helpers.
- `unocss/` — browser-safe preset core, node adapter и правила для интеграции с UnoCSS.