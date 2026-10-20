# Переезд с 1.x на 2.0

Ядро 2.0 — это темы и режимы. Тема (`slate`, «Сланец») стала данными пакета
`@feugene/granularity-tokens`, светлый и тёмный — её **режимы**, а режим включается
парой `data-theme="<тема>-<режим>"`. Сборка — granum 3. Компоненты, их пропсы и
внешний вид «Сланца» не меняются: значения токенов совпадают с 1.x, кроме двух
исправленных дефектов тёмного острова (см. CHANGELOG).

Что почитать после: [`modes.md`](./modes.md) — режимы в приложении,
[`themes.md`](../../granularity-tokens/docs/themes.md) пакета токенов — темы и свой режим.

## Зависимости

Ядро — мажор 2, `@feugene/granum` и `@feugene/granum-engine-wind` в `devDependencies` — мажор 3
(актуальные диапазоны — [`installation.md`](./installation.md)).

`@feugene/granularity-tokens` ставить отдельно не нужно — он приезжает зависимостью
ядра. Спутники (`granularity-chrono`, `-charts` и остальные) переходят на ядро 2 своими
мажорами: смешивать ядро 2 со спутником, собранным под ядро 1, нельзя — манифесты
granum 2 и 3 несовместимы.

## Конфиг granum

Ключ `themes` поменял смысл: в 1.x это были режимы, теперь — список тем сборки, и режимы у
каждой темы свои. Конфиг со старой формой падает `InvalidConfigError` с подсказкой.

```ts
// 1.x
defineGranumConfig({
  providers: ['@feugene/granularity'],
  themes: { names: ['light', 'dark'] },
})

// 2.x на granum 3.8
defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  themes: [{ theme: 'slate', modes: ['light', 'dark'] }],
})
```

Свой режим — `modes: { names, define }` записи темы, `define` с `extends` и `tokens`;
точечные значения — `modes.tokenOverrides` по имени режима
([`modes.md`](./modes.md#свои-режимы-в-конфиге)). Полная карта ключей — `MIGRATION.md`
granum, разделы «From 2.x to 3.0» и «From 3.7 to 3.8».

## Переключение режима

`useTheme()` переключает тему и режим поверх контроллера granum. Темы сборки, их режимы и
пары — манифест `virtual:granum/themes`; его нужно отдать один раз, там, где
создаётся состояние:

```ts
import { initThemeEarly } from '@feugene/granularity'
import manifest from 'virtual:granum/themes'

initThemeEarly({ manifest }) // или app.use(granularityThemePlugin, { manifest })
```

| 1.x | 2.0 |
| --- | --- |
| `theme` — `'light' \| 'dark'` | `theme` — id текущей темы сборки, режим — `mode` |
| `setTheme('dark')` | `setMode('dark')`; `setTheme(id)` переключает **тему** сборки, имя режима ему не передают |
| `toggleTheme()` | `toggleMode()` — между первым светлым и первым тёмным режимом |
| тип `ThemeName` | `GrModeName`, `GrThemeId`; режимы с `colorScheme` — `modes` |
| `isDark` по имени | `isDark` по `colorScheme` режима: свой `ocean` с `colorScheme: 'dark'` тёмный |
| `document.documentElement.dataset.theme = 'dark'` | `useTheme().setMode('dark')` — атрибут ставит контроллер |

**Ключ хранилища прежний** — `gr-theme`, и у основной темы в нём по-прежнему имя режима:
выбор пользователя переживает обновление. Сохранённый `dark` поднимается как режим. Выбор
дополнительной темы хранится как `<тема>-<режим>`.

## CSS приложения

Атрибут теперь несёт пару, а не имя режима, и класса `.dark` нет:

| 1.x | 2.0 |
| --- | --- |
| `[data-theme='dark'] .x` | `[data-theme$='-dark'] .x` — тёмные режимы любой темы; или `[data-theme='slate-dark']` |
| `.dark .x` | то же — классов `.light`/`.dark` granum не выводит |
| `dark:` в утилитах | работает без правок: granum строит вариант по парам тёмных режимов |

Без атрибута действует режим по умолчанию основной темы — его блок висит ещё и на `:root`.

## Остров режима и остров темы

`GrConfigProvider` развёл два смысла `theme`:

| 1.x | 2.0 |
| --- | --- |
| `<GrConfigProvider theme="dark">` | `<GrConfigProvider mode="dark">` — остров режима |
| — | `<GrConfigProvider theme="clay" mode="dark">` — остров другой темы из `themes` конфига granum |

`theme="dark"` больше не остров: в dev-сборке провайдер предупредит, что это режим.
`useGrThemeAttrs()` отдаёт `Record<string, string>` с атрибутом активации манифеста —
спредьте его на свой телепорт как прежде.

## CSS без granum

| 1.x | 2.0 |
| --- | --- |
| `@feugene/granularity/styles/tokens.css` | `@feugene/granularity/themes/slate.css` — примитивы, режимы, токены компонентов и фолбэки в порядке слоёв |
| `@feugene/granularity/styles/themes/light.css`, `…/dark.css` | там же — оба режима одной темы |
| `@feugene/granularity/styles.css` | прежний путь: `themes/slate.css` + `styles/base.css` |

## Импорты

| 1.x | 2.0 |
| --- | --- |
| `@feugene/granularity/theme` (`extendTheme`, `createTheme`, `tone`, `validateTheme`) | `@feugene/granularity-tokens/theme` (`extendMode`, `createMode`, `tone`, `validateTheme`, `defineTheme`) |
| `@feugene/granularity/theme/apply` | `@feugene/granularity-tokens/theme/apply` |
| `grThemeTokens`, `grFoundationTokens`, `grDerivedTokens` из `@feugene/granularity/tokens` | `grRoleTokens`, `grFoundationTokens`, `grDerivedTokens` из `@feugene/granularity-tokens`; значения — в данных темы |
| `granularityThemeNames`, `granularityDefaultThemes` из `granular-provider` | нет: темы — каталог `grThemeCatalog` пакета токенов |

У ядра в `@feugene/granularity/tokens` остался реестр покомпонентных токенов
`grComponentTokens`.

## Своя тема

| 1.x | 2.0 |
| --- | --- |
| `extendTheme({ name: 'ocean', base: 'dark', … })` — «тема» | `extendMode(…)` — **режим** темы; в конфиг — `modes.define.ocean = ocean.definition` |
| `createTheme(…)` | `createMode(…)` |
| — | своя тема целиком: папка `themes/<id>/` и `loadTheme`, в конфиг — `themes: [{ theme: brand }]` |

Значения своего режима больше не нужно класть в CSS руками: `definition` — готовый вход
`modes.define`, а токены компонентов режим берёт у своей базы.

## SSR

Выбор запроса сервер берёт из cookie (`createCookieStorage()` granum на клиенте,
`themeFromCookie` на сервере) и ставит пару на `<html>`; без cookie пару ставит ранний
скрипт `granum(config, { themeScript: … })`. Состояние режима на сервере — только через
`granularityThemePlugin`, иначе режим одного запроса уедет в следующий. Подробности —
[`ssr.md`](./ssr.md#режим-без-мигания).
