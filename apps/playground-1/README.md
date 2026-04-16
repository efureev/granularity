# `apps/playground-1`

Демо для **способа 1** из `packages/granularity/README.md`: root JS import + полный `styles.css` пакета.

## Что показывает приложение

- компоненты импортируются из `@feugene/granularity`;
- стили подключаются одним `@feugene/granularity/styles.css`;
- на экране есть `DsInput` и `DsButton`, чтобы проверить и JS, и CSS сценарий самого простого подключения.

## Как работает

```ts
import { DsButton, DsInput } from '@feugene/granularity'
import '@feugene/granularity/styles.css'
```

## Что ожидать в `dist`

- `assets/index-*.js` — код самого demo-приложения;
- `assets/vue-*.js` — отдельный runtime `vue`;
- `assets/granularity-*.js` — отдельный чанк `@feugene/granularity`;
- `assets/granularity-*.css` — полный CSS bundle пакета: foundation-слой (`tokens`, `base`, встроенные темы `light`/`dark`) и стили компонентов;
- `assets/index-*.css` — локальный shell CSS самого приложения.
