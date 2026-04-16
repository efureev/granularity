# `apps/playground-5`

Демо для **способа 5** из `packages/granularity/README.md`: генерация CSS через `UnoCSS` и `@feugene/granularity/uno-node`.

## Что показывает приложение

- JS для `DsButton` остаётся granular за счёт subpath import;
- reset, CSS слоя `granularity` и app CSS грузятся через отдельные ленивые entry;
- `presetGranularityNode()` сам подмешивает `tokens`, `base`, встроенную тему `light` и стили выбранного компонента.

## Как работает

```ts
import { presetGranularityNode } from '@feugene/granularity/uno-node'

presetGranularityNode({
  components: ['DsButton'],
})
```

## Что ожидать в `dist`

- `assets/index-*.js` — код demo-приложения;
- `assets/vue-*.js` — runtime `vue`;
- `assets/reset-*.css` — CSS из `@unocss/reset/tailwind-compat.css`;
- `assets/granularity-*.js` — granular JS-код `DsButton`;
- `assets/granularity-*.css` — слой `granularity` из `presetGranularityNode` c foundation + стилями `DsButton`;
- `assets/app-*.css` или `assets/index-*.css` — оставшийся app CSS из `virtual:uno.css`.
