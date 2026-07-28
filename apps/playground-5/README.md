# `apps/playground-5`

Стенд для granular-подключения через `UnoCSS`: CSS генерируется пресетом `@feugene/unocss-preset-granular/node`,
JS приезжает subpath-импортом. Сценарии подключения CSS описаны в `packages/granularity/docs/styling.md`,
сам пресет — в `docs/unocss.md`.

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

## Команды

```bash
yarn workspace @feugene/granularity-playground-5 dev
yarn workspace @feugene/granularity-playground-5 build
yarn workspace @feugene/granularity-playground-5 test:run   # проверяет обвязку uno/vite-конфигов
```

Стенд собирает CSS из `dist` библиотеки (`granular-provider/node`), поэтому после правок
пакета — `yarn build:granularity`.
