# `apps/playground-5`

Демо для **способа 5** из `packages/granularity/README.md`: генерация CSS через `UnoCSS` и `@feugene/unocss-preset-granular/node`.

## Что показывает приложение

- JS для `GrButton` остаётся granular за счёт subpath import;
- reset, CSS слоя `granular` и app CSS грузятся через отдельные ленивые entry (`virtual:uno:granular.css`);
- `presetGranularNode()` сам подмешивает `tokens`, `base`, встроенную тему `light` и стили выбранного компонента.

## Как работает

```ts
import { presetGranularNode } from '@feugene/unocss-preset-granular/node'

presetGranularNode({
  components: ['GrButton'],
})
```

## Что ожидать в `dist`

- `assets/index-*.js` — код demo-приложения;
- `assets/vue-*.js` — runtime `vue`;
- `assets/reset-*.css` — CSS из `@unocss/reset/tailwind-compat.css`;
- `assets/granularity-*.js` — granular JS-код `GrButton`;
- `assets/granularity-*.css` — слой `granular` из `presetGranularNode` c foundation + стилями `GrButton`;
- `assets/app-*.css` или `assets/index-*.css` — оставшийся app CSS из `virtual:uno.css`.
