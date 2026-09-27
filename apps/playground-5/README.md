# `apps/playground-5`

Стенд подключения через **granum**: CSS собирает плагин `@feugene/granum/vite` из
`granum.manifest.json` пакета, JS приезжает subpath-импортом. Механика пакета —
в `packages/granularity/docs/unocss.md`, сценарии подключения CSS —
в `packages/granularity/docs/styling.md`.

## Что показывает приложение

- JS для `GrButton` остаётся гранулярным за счёт subpath-импорта;
- `granum()` читает манифест пакета и по селекции отдаёт один `virtual:granum.css`:
  токены, база, тема `light`, CSS выбранного компонента и утилиты — пятью слоями каскада;
- `node_modules` никто не сканирует: классы компонента и потребляемые токены
  посчитаны на сборке пакета и лежат в манифесте;
- классы разметки самого приложения granum извлекает из `appSources`;
- движок утилит выбирает приложение и передаёт инстансом: granum своей
  реализации не содержит. Словарь движка совпадает с объявленным у пакета,
  поэтому классы компонента берутся из манифеста без пересчёта — это видно в
  `dist/granum-report.json` полем `providers[].classes: "manifest"`.

## Как работает

```ts
import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: [{ provider: '@feugene/granularity', names: ['GrButton'] }],
  appSources: { dirs: ['src'] },
})
```

## Что ожидать в `dist`

- `assets/index-*.js` — код demo-приложения;
- `assets/vue-*.js` — runtime `vue`;
- `assets/reset-*.css` — CSS из `@unocss/reset/tailwind-compat.css`;
- `assets/granularity-*.js` — гранулярный JS-код `GrButton`;
- `assets/granularity-*.css` — весь CSS granum: слои `tokens`, `base`, `themes`,
  `components`, `utilities`;
- `dist/granum-report.json` — отчёт сборки: селекция, темы, классы без правила,
  размеры слоёв по собранному ассету.

Отдельного `app-*.css` больше нет: утилиты разметки приложения лежат в слое
`utilities` того же файла.

## Замер (production build)

```
слой          raw     gzip
tokens       3 878    1 105
base           558      305
themes       6 383    1 364
components       0       20
utilities   23 926    3 457
всего       34 770    5 907
```

Числа берутся из `dist/granum-report.json` — он считается из той же эмиссии,
что и CSS, а размеры меряются по собранному ассету после минификации.

## Команды

```bash
yarn workspace @feugene/granularity-playground-5 build
yarn workspace @feugene/granularity-playground-5 dev
yarn workspace @feugene/granularity-playground-5 test:run
```
