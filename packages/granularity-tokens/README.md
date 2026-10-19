# `@feugene/granularity-tokens`

Словарь токенов и темы дизайн-системы `@feugene/granularity`: какие токены есть, какие значения у
них в каждой теме и режиме, и чем собрать свою тему так, чтобы она не развалилась при следующем
выпуске пакета.

Тема здесь — дизайн-язык целиком: примитивы, роли и производные состояния. Светлый и тёмный — её
режимы. Пакет не знает о компонентах: его читают ядро, спутники, портал, инструменты и автор своей
темы, и никому из них не нужен UI-кит, чтобы узнать цвет роли.

```bash
yarn add @feugene/granularity-tokens
```

Приложению на ядре ставить его отдельно не нужно — он приходит зависимостью
`@feugene/granularity`. Явно он нужен, когда вы собираете свою тему или читаете токены как данные.

## Что внутри

| Что | Где | Подпуть |
| --- | --- | --- |
| Реестр без значений: примитивы, роли, формулы производных | `tokens/*.json` | `@feugene/granularity-tokens` |
| Каталог тем: id, название, режимы, ссылка на дизайн-систему | `themes/*/theme.json` | `@feugene/granularity-tokens` (`grThemeCatalog`) |
| Данные темы со значениями и фолбэками | `themes/<slug>/` | `@feugene/granularity-tokens/themes/<slug>/theme.json` |
| Сборка темы: `defineTheme`, `extendTheme`, `tone`, проверки | `src/theme/` | `@feugene/granularity-tokens/theme` |
| Тема из папки: `loadTheme` | `src/theme/node.ts` | `@feugene/granularity-tokens/theme/node` |
| Подключение готового CSS в браузере | `src/theme/apply.ts` | `@feugene/granularity-tokens/theme/apply` |

Темы и правила их использования — [`themes/README.md`](./themes/README.md). Справочник всех
токенов со значениями каждой пары «тема × режим» — [`docs/tokens.md`](./docs/tokens.md).

## Реестр и значения

Реестр не тащит значений: каталог тем растёт, а бандл того, кто читает имена, — нет. Значения
подключаются по требованию.

```ts
import { grRoleTokens, type GrThemeData, resolveModes } from '@feugene/granularity-tokens'
import slateData from '@feugene/granularity-tokens/themes/slate/theme.json'

// JSON типизируется по содержимому: `colorScheme` в нём просто строка.
const slate = slateData as GrThemeData
const dark = resolveModes(slate).get('dark')!
const surfaces = grRoleTokens
  .filter(token => token.section === 'Surface roles')
  .map(token => ({ name: token.name, value: dark[token.name.slice(2)] }))
```

Ключи в данных темы — без `--` (`gr-bg`), как их ждёт granum; в реестре имя полное (`--gr-bg`).

## Своя тема

Папка темы — та же раскладка, что у встроенных: `theme.json`, `root.json`, `modes/<режим>.json`.
С `"extends": "slate"` объявляются только отличия, остальное дотягивается из базы.

```ts
import { loadTheme } from '@feugene/granularity-tokens/theme/node'

const brand = loadTheme(new URL('./src/themes/brand/', import.meta.url))
```

`loadTheme` проверяет полноту по реестру, контраст по WCAG и различимость тонов в каждом режиме и
падает с именем токена и режима — неполная или нечитаемая тема не доезжает до пользователя. В
`sources` он отдаёт прочитанные файлы: правка любого из них обязана пересобрать тему.

Режим поверх встроенного — `extendTheme`, семья ролей тона из одного цвета — `tone`:

```ts
import { extendTheme, tone } from '@feugene/granularity-tokens/theme'

const surfaces = { '--gr-bg': '#041e2b', '--gr-fg': '#e8f4fa', '--gr-card': '#0a2f42' }

export const ocean = extendTheme({
  name: 'ocean',
  base: 'dark',
  tokens: { ...surfaces, ...tone('azure', '#38bdf8', { base: surfaces }) },
})
```

## Как подключить

Пакет — провайдер granum без компонентов, владелец каталога тем: ядро
`@feugene/granularity` объявляет его зависимостью, и приложению достаточно
провайдера ядра. Тема выбирается на сборке — `theme: '<slug>'` в конфиге granum
(по умолчанию `slate`), режимы — `modes`; режим включается парой
`data-theme="<slug>-<режим>"`. Без granum ядро отдаёт готовый CSS темы —
`@feugene/granularity/themes/<slug>.css`.

## Лицензия

[LicenseRef-Granularity-EUC-1.1](./LICENSE).
