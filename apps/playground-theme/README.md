# playground-theme

Рабочий пример из [`modes.md`](../../packages/granularity/docs/modes.md) ядра и [`themes.md`](../../packages/granularity-tokens/docs/themes.md) пакета токенов:
свои режимы поверх темы пакета и своя тема приложения — в одной сборке granum.

```bash
yarn build:tokens && yarn build:granularity   # стенды работают с собранным dist
yarn workspace @feugene/granularity-playground-theme dev
yarn workspace @feugene/granularity-playground-theme test:run
```

## Что показано

| Файл | Что в нём смотреть |
| --- | --- |
| `theme.config.ts` | режимы данными: `ocean` поверх тёмного (`extendMode`), высококонтрастный `contrast` с нуля (`createMode`) |
| `granum.config.ts` | режимы — в `modes.define` (`ocean.definition`), своя тема — в `previews` (`loadTheme`) |
| `src/themes/brand/` | своя тема приложения: `theme.json` с `"extends": "slate"`, `root.json` и `modes/*.json` — только отличия |
| `src/main.ts` | `granularityThemePlugin` с манифестом сборки `virtual:granum/themes` |
| `vite.config.ts` | ранний скрипт режима в `<head>` — опция `themeScript` плагина granum |
| `src/App.vue` | переключатель режимов из манифеста и острова превью `<GrConfigProvider theme="brand" mode="…">` |
| `src/__tests__/theme.test.ts` | автопроверка: полнота ролей, контраст по WCAG, что granum положил режимы и превью под их пары |
| `src/__tests__/themeRecipes.test.ts` | рецепты раздела «Свои режимы в конфиге» `modes.md` и «Своя тема приложения» `themes.md` на настоящем granum |

## Режим или тема

Режим — вариант активной темы: он встаёт под свою пару `slate-ocean` и берёт
токены компонентов у режима `extends`. Так делаются тёмная, высококонтрастная или
сезонная версия той же дизайн-системы.

Тема — другой дизайн-язык: свои примитивы (здесь — скругления), свои режимы.
Активная тема у сборки одна; `brand` здесь едет превью — полными блоками пар
`brand-light` и `brand-dark`, которые включает `GrConfigProvider`. Сделать её
активной — `theme: loadTheme(…)` вместо `theme: 'slate'`.

Правка файлов `src/themes/brand/` в dev перезапускает конфиг: `loadTheme`
перечисляет их в `sources`, и плагин granum за ними следит.

## Проверка — не глазами

`src/__tests__/theme.test.ts` — чек-лист из документации, доведённый до
исполняемого вида:

- **полнота**: список ролей берётся из `@feugene/granularity-tokens`, поэтому
  проверка не устареет, когда в пакете появится новая роль;
- **отличия**: в `modes.define` уходят только роли, отличные от базы;
- **контраст**: основной и вторичный текст на всех поверхностях, `-fg` на своей
  заливке **включая hover/active** (формула `color-mix` повторена в тесте),
  `-text` на `-light` и на фоне, заливка как индикатор (3:1), видимость
  focus-ring, различимость `primary` и `info`;
- **сборка**: блоки пар режимов и превью в CSS granum, токены кнопки «Сланца» у
  превью — по цепочке `extends`.
