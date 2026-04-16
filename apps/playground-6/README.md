# `apps/playground-6`

Демо для **способа 6** из `packages/granularity/README.md`: pure/browser-safe preset через `@feugene/granularity/uno`.

## Что показывает приложение

- JS для `DsButton` остаётся granular;
- preset подключается через `@feugene/granularity/uno`, без node-only API;
- необходимые theme/base значения передаются вручную через `createGranularityCssPreflights()` как CSS-строка.

## Как работает

```ts
import {
  createGranularityCssPreflights,
  presetGranularity,
} from '@feugene/granularity/uno'

presetGranularity({
  components: ['DsButton'],
  preflights: createGranularityCssPreflights([playground6PreflightCss]),
})
```

## Что ожидать в `dist`

- `assets/index-*.js` — код demo-приложения;
- `assets/vue-*.js` — runtime `vue`;
- `assets/granularity-*.js` — granular JS-код `DsButton`;
- `assets/index-*.css` — CSS, сгенерированный `UnoCSS`, включая safelist/rules preset-а и вручную переданные preflight-строки.