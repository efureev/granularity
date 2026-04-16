# Стилизация и темы

## Публичный CSS API пакета

Пакет `@feugene/granularity` публикует несколько уровней CSS-артефактов. Они отличаются тем, **что именно собирают** и **для какого сценария предназначены**.

- `@feugene/granularity/foundation.css`
  - foundation-only bundle пакета;
  - включает общие токены, обе встроенные темы (`light` и `dark`) и базовые правила;
  - **не** включает component utility CSS.
- `@feugene/granularity/styles.css`
  - полный CSS bundle пакета;
  - включает всё из `foundation.css` **плюс** utility/component CSS для всех зарегистрированных компонентов;
  - собирается через `UnoCSS` и `presetGranularityNode` по исходникам компонентов.
- `@feugene/granularity/components/<ComponentName>/styles.css`
  - отдельный bundle для конкретного компонента;
  - собирается тем же механизмом, что и общий `styles.css`, но только для выбранного компонента и его зарегистрированных зависимостей;
  - обычно уже содержит foundation-слой, поэтому это самостоятельный CSS-артефакт.
- `@feugene/granularity/styles/tokens.css`
  - низкоуровневый файл только с design tokens.
- `@feugene/granularity/styles/themes/light.css`
  - встроенная светлая тема с semantic tokens.
- `@feugene/granularity/styles/themes/dark.css`
  - встроенная тёмная тема с semantic tokens.
- `@feugene/granularity/styles/base.css`
  - базовые правила поверх foundation tokens/themes.

## Что объединяет эти файлы

Есть два основных группирующих слоя:

1. `packages/granularity/src/styles/index.css` — **source-группа** foundation-стилей.
2. Публичные собранные bundle-артефакты — `foundation.css`, `styles.css` и `components/*/styles.css`.

Исходный `src/styles/index.css` объединяет базовые CSS-файлы пакета:

```css
@import './tokens.css';
@import './themes/light.css';
@import './themes/dark.css';
@import './base.css';
```

Из этого source-слоя получается публичный `foundation.css`.

Дальше поверх foundation-содержимого `presetGranularityNode` достраивает:

- `styles.css` — foundation + стили всех компонентов;
- `components/<Name>/styles.css` — foundation + стили одного компонента и его зависимостей.

## Границы ответственности

### `foundation.css`

Используйте `foundation.css`, когда нужны только базовые слои дизайн-системы:

- tokens;
- встроенные темы `light` и `dark`;
- base rules.

Это хороший выбор, если:

- приложение само собирает component CSS через `presetGranularityNode`;
- вы хотите отдельно контролировать, какие component bundles попадут в приложение;
- нужно получить только foundation layer без всех компонентных utility-классов.

### `styles.css`

Используйте `styles.css`, когда нужен **полный готовый CSS пакета**.

Он объединяет:

- весь foundation-слой из `foundation.css`;
- обе встроенные темы: `light` и `dark`;
- utility/component CSS всех зарегистрированных компонентов пакета.

Это самый простой вариант для приложений, которые хотят подключить стили пакета целиком без собственной preset-сборки.

### `components/<Name>/styles.css`

Это не просто «сырой CSS-файл из папки компонента», а **собранный публичный bundle** для конкретного компонента.

Важно понимать:

- он генерируется через тот же preset-driven pipeline, что и `styles.css`;
- он может включать зависимости компонента;
- при импорте нескольких таких файлов foundation-часть будет дублироваться.

Поэтому:

- для одного-двух точечных компонентов `components/<Name>/styles.css` удобен;
- для большого набора компонентов обычно лучше брать общий `styles.css` или собирать стили через `presetGranularityNode` на стороне приложения.

### Низкоуровневые `styles/*`

Файлы в `styles/*` — это нижний уровень API для ручной композиции:

- `styles/tokens.css`;
- `styles/themes/light.css`;
- `styles/themes/dark.css`;
- `styles/base.css`.

Они полезны, если приложение хочет самостоятельно собирать foundation-слой или заменить theme layer своей реализацией.

## Встроенные темы

Пакет публикует две встроенные темы:

- `light`
- `dark`

Обе темы уже входят в:

- `foundation.css`;
- `styles.css`;
- component bundles `components/<Name>/styles.css`.

Если приложение управляет темами самостоятельно, можно не использовать встроенные theme-файлы напрямую и собрать свой theme layer поверх `tokens.css` + `base.css`.

## Граница ответственности: `tokens` vs `theme`

Практическое правило:

- если значение одинаково для разных тем — это `tokens`;
- если значение должно меняться при переключении темы — это `theme`.

Примеры:

- `--ds-space-4`, `--ds-radius-md`, `--ds-duration-fast` → `tokens`;
- `--bg`, `--primary`, `--brd`, `--ring` → `theme`;
- производные значения вроде `--primary-hover`, если они рассчитываются от semantic-переменных, логично держать рядом с токенами, а не дублировать по темам.

## Сценарии подключения CSS

### Подключить весь CSS пакета целиком

```ts
import '@feugene/granularity/styles.css'
```

Подходит, если приложение использует много компонентов и не хочет отдельно управлять CSS-сборкой.

### Подключить только foundation-слой пакета

```ts
import '@feugene/granularity/foundation.css'
```

Подходит, если component CSS будет собираться отдельно, например через `presetGranularityNode` в приложении.

### Подключить bundle конкретного компонента

```ts
import '@feugene/granularity/components/DsButton/styles.css'
```

Подходит, если нужен один конкретный компонент и не хочется подключать общий `styles.css`.

### Использовать свою тему приложения

Если у приложения есть собственный theme layer, можно вручную собрать foundation без встроенных тем:

```ts
import '@feugene/granularity/styles/tokens.css'
import './styles/app-theme.css'
import '@feugene/granularity/styles/base.css'
```

Дальше component CSS можно подключать либо через `presetGranularityNode`, либо готовыми component/full bundles.

## Что важно помнить

- `foundation.css` — это foundation-only слой: tokens + `light` + `dark` + base.
- `styles.css` — это `foundation.css` плюс стили всех компонентов пакета.
- `src/styles/index.css` — source-группа foundation-стилей, из которой собирается публичный `foundation.css`.
- `components/<Name>/styles.css` и `styles.css` собираются через preset, а не простым объединением ручных CSS-импортов.
- если приложение уже собирает стили через `presetGranularityNode`, прямой импорт `styles.css` обычно не нужен.