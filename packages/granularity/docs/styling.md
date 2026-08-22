# Стилизация и темы

## Публичный CSS API пакета

Пакет `@feugene/granularity` публикует два уровня CSS-артефактов: общий бандл и
слои, из которых он собран.

- `@feugene/granularity/styles.css`
  - токены, обе встроенные темы (`light` и `dark`), базовые правила и preflight —
    одним файлом;
  - для потребителя, который не подключает UnoCSS-пресет;
  - **utility-классов компонентов в нём нет**: их генерирует пресет по тем
    компонентам, которые выбраны. Без пресета компонент отрисуется со своим
    собственным CSS, но без раскладочных утилит.
- `@feugene/granularity/styles/tokens.css` — только design tokens.
- `@feugene/granularity/styles/themes/light.css`, `.../dark.css` — встроенные темы
  с семантическими токенами.
- `@feugene/granularity/styles/base.css` — базовые правила поверх токенов и тем:
  reset и кламп движения по `prefers-reduced-motion`.
- `@feugene/granularity/styles/preflight.css` — preflight-слой.

**Своего CSS-файла у компонента подключать не нужно.** У большинства компонентов
собственного CSS нет вовсе, а у тех, у кого есть (`GrIcon`, `GrToaster`,
`GrSplitter` и ещё пятнадцать), он вписан прямо в чанк компонента: гранулярный
импорт уже тянет всё, что нужно. Subpath вида
`@feugene/granularity/components/<Name>/styles.css` пакет не публикует —
такой файл был бы кусочком без токенов и тем, и подключать его отдельно
бессмысленно.

## Токены — генерируются, а не пишутся руками

`src/styles/tokens.css` и `src/styles/themes/*.css` **сгенерированы** из
`tokens/*.json` пакета. Правка CSS напрямую бессмысленна: следующий
`yarn generate:tokens` её затрёт, а тест `src/__tests__/tokens.generated.test.ts`
уронит сборку раньше.

```bash
yarn workspace @feugene/granularity generate:tokens          # перегенерировать
yarn workspace @feugene/granularity generate:tokens --check  # проверить расхождение
```

Что откуда берётся:

| Источник | Что в нём | Что из него генерируется |
| --- | --- | --- |
| `tokens/foundation.json` | примитивы: палитра, типографика, spacing, радиусы, тени, motion, z-index | `styles/tokens.css` |
| `tokens/themes/{light,dark}.json` | семантические роли темы | `styles/themes/*.css` |
| `tokens/derived.json` | формулы hover/active (`base` + `amount` + `mixWith`) | `color-mix`-объявления **и** вычисленные фолбэки в `@supports not (color-mix)` |

Фолбэки считаются той же формулой, что стоит в CSS, — раньше это были 40 хексов,
поддерживаемых вручную, и часть из них разошлась с реальными значениями ролей.

Те же данные доступны как TS-справочник — `@feugene/granularity/tokens`
(`grFoundationTokens`, `grThemeTokens`, `grDerivedTokens`). Он не входит в
корневой бандл: это данные для доков и инструментов. Человекочитаемая таблица —
[`docs/tokens.md`](./tokens.md), тоже генерируемая.

## Что объединяет эти файлы

`packages/granularity/src/styles/index.css` — source-группа foundation-стилей:

```css
@import './tokens.css';
@import './themes/light.css';
@import './themes/dark.css';
@import './base.css';
```

Она и уезжает в `dist/styles/index.css`, то есть в публичный
`@feugene/granularity/styles.css`. Ничего поверх неё пакет не досбирает:
utility-классы компонентов — работа UnoCSS-пресета **на стороне приложения**, по
списку выбранных компонентов.

## Границы ответственности

### `styles.css`

Готовый foundation: токены, обе встроенные темы, base и preflight. Берите его,
если приложение не подключает UnoCSS-пресет, — тогда компоненты получат токены,
темы и собственный CSS, но не раскладочные утилиты.

Приложение с пресетом в этом файле обычно не нуждается: пресет соберёт и
foundation, и утилиты выбранных компонентов.

### CSS самого компонента

Подключать нечего и не нужно. Собственный CSS есть у восемнадцати компонентов
(`GrIcon`, `GrToaster`, `GrSplitter`, …), и он вписан прямо в их чанк: импорт
компонента тянет его сам. У остальных своего CSS нет вовсе — они целиком
собираются из утилит пресета.

Поэтому subpath `components/<Name>/styles.css` пакет не публикует: такой файл был
бы куском без токенов и тем, и подключать его отдельно бессмысленно.

### Низкоуровневые `styles/*`

Нижний уровень API для ручной композиции:

- `styles/tokens.css`;
- `styles/themes/light.css`;
- `styles/themes/dark.css`;
- `styles/base.css`;
- `styles/preflight.css`.

Полезны, если приложение собирает foundation само или заменяет theme layer своей
реализацией.

## Встроенные темы

Пакет публикует две встроенные темы — `light` и `dark`, — и обе входят в
`styles.css`. Если приложение управляет темами само, встроенные файлы можно не
подключать и собрать свой theme layer поверх `tokens.css` + `base.css`.

## Граница ответственности: `tokens` vs `theme`

Практическое правило:

- если значение одинаково для разных тем — это `tokens`;
- если значение должно меняться при переключении темы — это `theme`.

Примеры:

- `--gr-space-4`, `--gr-radius-md`, `--gr-duration-fast` → `tokens`;
- `--bg`, `--primary`, `--brd`, `--ring` → `theme`;
- производные значения вроде `--primary-hover`, если они рассчитываются от semantic-переменных, логично держать рядом с токенами, а не дублировать по темам.

## Сценарии подключения CSS

### Подключить весь CSS пакета целиком

```ts
import '@feugene/granularity/styles.css'
```

Подходит, если приложение использует много компонентов и не хочет отдельно управлять CSS-сборкой.

### Использовать свою тему приложения

Если у приложения есть собственный theme layer, можно вручную собрать foundation без встроенных тем:

```ts
import '@feugene/granularity/styles/tokens.css'
import './styles/app-theme.css'
import '@feugene/granularity/styles/base.css'
```

Дальше component CSS можно подключать либо через `presetGranularityNode`, либо готовыми component/full bundles.

## Что важно помнить

- `styles.css` — foundation целиком: tokens + `light` + `dark` + base + preflight. Utility-классов
  компонентов в нём нет.
- `src/styles/index.css` — source-группа, из которой он собирается.
- CSS компонента приезжает вместе с его чанком; отдельного subpath на него нет.
- если приложение уже собирает стили пресетом, прямой импорт `styles.css` обычно не нужен.

## RTL не поддерживается

Компоненты раскладываются физическими направлениями (`pl-`/`pr-`, `ml-`/`mr-`, `left-`/`right-`),
логических утилит (`ps-`/`pe-`, `ms-`/`me-`, `start-`/`end-`) в пакете почти нет, а атрибут `dir` не
читается нигде. В документе с `dir="rtl"` отступы, смещения и плавающие панели окажутся зеркальными:
пакет их не перевернёт.

Это решение, а не недоделка. Перевод на логические свойства меняет вид **каждого** компонента —
визуально ломающее изменение, которому место в мажоре, а не в патче. До тех пор поддержка
right-to-left остаётся за приложением.

## Темизация: канон

Тёмную тему можно активировать несколькими селекторами, но **канон один** —
атрибут `[data-theme]` на `<html>`:

- **`[data-theme="dark"]` / `[data-theme="light"]`** — единственный рекомендуемый
  механизм. Его выставляют `useTheme()` / `initThemeEarly()`.
- **`.dark`** — дополнительный селектор в `themes/dark.css` для интеропа с
  class-стратегией Tailwind/UnoCSS: если приложение уже переключает тему этим
  классом, токены подхватятся. Класс `.theme-dark` снят.

Единственный рантайм-API переключения темы — `useTheme()` (реактивное состояние,
persistence, синхронизация между вкладками и с `prefers-color-scheme`) и
`initThemeEarly()` (ранний вызов до монтирования Vue, чтобы избежать «мигания»).
`defaultThemes` у granular-provider — это build-time настройка активных тем в
собранном CSS, а не рантайм-переключение; не путайте её с `useTheme`.

```ts
import { initThemeEarly, useTheme } from '@feugene/granularity'

initThemeEarly() // до app.mount()

const { theme, isDark, setTheme, toggleTheme } = useTheme()
```

Выбор темы хранится в `localStorage` под ключом `gr-theme`.
