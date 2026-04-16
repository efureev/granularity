# `apps/playground-4`

Демо для **способа 4** из `packages/granularity/README.md`: granular JS + общий `styles.css` пакета.

## Что показывает приложение

- `DsButton` и `DsInput` импортируются через subpath export-ы;
- CSS подключается одним общим `@feugene/granularity/styles.css`;
- сценарий полезен, когда JS хочется держать granular, а CSS — подключать просто и единым файлом.

## Как работает

```ts
import { DsButton } from '@feugene/granularity/components/DsButton'
import { DsInput } from '@feugene/granularity/components/DsInput'
import '@feugene/granularity/styles.css'
```

## Что ожидать в `dist`

- `assets/index-*.js` — код demo-приложения;
- `assets/vue-*.js` — runtime `vue`;
- `assets/granularity-*.js` — granular JS для реально импортированных subpath entrypoint-ов;
- `assets/granularity-*.css` — полный CSS bundle пакета: foundation-слой и стили всех зарегистрированных компонентов;
- `assets/index-*.css` — локальный shell CSS приложения.
