# `apps/playground-3`

Демо для **способа 3** из `packages/granularity/README.md`: точечное подключение самостоятельного component CSS bundle.

## Что показывает приложение

- `DsButton` импортируется через component subpath;
- CSS подключается через `@feugene/granularity/components/DsButton/styles.css`;
- итоговый `dist` должен быть самым компактным по CSS среди вариантов с готовыми пакетными CSS-файлами.

## Как работает

```ts
import { DsButton } from '@feugene/granularity/components/DsButton'
import '@feugene/granularity/components/DsButton/styles.css'
```

## Что ожидать в `dist`

- `assets/index-*.js` — код demo-приложения;
- `assets/vue-*.js` — runtime `vue`;
- `assets/granularity-*.js` — отдельный чанк с кодом `DsButton`;
- `assets/granularity-*.css` — bundle `DsButton`, который обычно уже включает foundation-слой пакета и стили нужного компонента;
- `assets/index-*.css` — локальный shell CSS приложения.
