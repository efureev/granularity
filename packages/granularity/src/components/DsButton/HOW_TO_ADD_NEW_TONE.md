### Задача

Добавление нового `tone` в `DsButton` — это не одна правка, а цепочка из semantic token'ов, component token'ов, class mapping и тестов.

Ниже перечислены только те точки, которые реально используются текущей реализацией `DsButton`.

### Куда вносить изменения

1. `packages/granularity/src/styles/themes/light.css`
   - Добавь semantic token'ы светлой темы:
     - `--ds-<tone>`
     - `--ds-<tone>-light`
     - `--ds-<tone>-foreground`
     - `--ds-<tone>-text`
2. `packages/granularity/src/styles/themes/dark.css`
   - Добавь те же token'ы для тёмной темы.
3. `packages/granularity/src/styles/tokens.css`
   - Добавь derived token'ы для interaction state:
     - `--ds-<tone>-hover`
     - `--ds-<tone>-active`
   - Если проект поддерживает fallback внутри `@supports not (color: color-mix(...))`, добавь и fallback-значения в theme-файлы.
4. `packages/granularity/src/components/DsButton/tokens.css`
   - Добавь component-level token'ы для `DsButton`:
     - `--ds-button-<tone>-background`
     - `--ds-button-<tone>-background-hover`
     - `--ds-button-<tone>-background-active`
     - `--ds-button-<tone>-foreground`
     - `--ds-button-<tone>-soft-background`
     - `--ds-button-<tone>-soft-background-hover`
     - `--ds-button-<tone>-soft-background-active`
   - При необходимости задай button-specific filled background, если прямое использование `--ds-<tone>` не даёт нужный контраст для белого/тёмного текста.
5. `packages/granularity/src/components/DsButton/dsButtonStyles.ts`
   - Добавь новый `tone` в тип `DsButtonTone`.
   - Добавь новую запись в объект `tones`.
   - Убедись, что для нового tone заполнены все поля `DsButtonToneTokens`:
     - `solidBackground`
     - `solidBackgroundHover`
     - `solidBackgroundActive`
     - `solidForeground`
     - `accentText`
     - `softBackground`
     - `softBackgroundHover`
     - `softBackgroundActive`
     - `softForeground`
     - `border`
     - `borderHover`
     - `borderActive`
6. Тесты
   - Обнови `packages/granularity/src/components/DsButton/__tests__/DsButton.test.ts`
   - Обнови `packages/granularity/src/__tests__/presetGranularity.test.ts`

### Почему нужны все эти шаги

- `light.css` и `dark.css` задают реальные semantic-цвета.
- `src/styles/tokens.css` генерирует общие `hover/active` formula token'ы, на которые потом опирается компонент.
- `DsButton/tokens.css` — это слой component token'ов. Здесь можно:
  - просто пробросить semantic token;
  - либо зафиксировать отдельный button-specific цвет, если для кнопки нужен другой контраст.
- `dsButtonStyles.ts` связывает tone с конкретными utility-классами и одновременно формирует safelist через `tones`.

### Минимальный шаблон для нового tone

#### 1. Semantic token'ы в теме

```css
/* light.css */
--ds-brand-alt: #0ea5e9;
--ds-brand-alt-light: #e0f2fe;
--ds-brand-alt-fg: #ffffff;
--ds-brand-alt-text: #075985;
```

```css
/* dark.css */
--ds-brand-alt: #38bdf8;
--ds-brand-alt-light: #0c4a6e;
--ds-brand-alt-fg: #0f172a;
--ds-brand-alt-text: #bae6fd;
```

#### 2. Interaction formula token'ы

```css
/* src/styles/tokens.css */
--ds-brand-alt-hover: color-mix(in srgb, var(--ds-brand-alt) 92%, var(--fg));
--ds-brand-alt-active: color-mix(in srgb, var(--ds-brand-alt) 84%, var(--fg));
```

#### 3. Component token'ы для `DsButton`

```css
/* DsButton/tokens.css */
--ds-button-brand-alt-bg: var(--ds-brand-alt);
--ds-button-brand-alt-bg-hover: var(--ds-brand-alt-hover);
--ds-button-brand-alt-bg-active: var(--ds-brand-alt-active);
--ds-button-brand-alt-fg: var(--ds-brand-alt-fg);
--ds-button-brand-alt-soft-bg: var(--ds-brand-alt-light);
--ds-button-brand-alt-soft-bg-hover: color-mix(in srgb, var(--ds-brand-alt) 20%, var(--bg));
--ds-button-brand-alt-soft-bg-active: color-mix(in srgb, var(--ds-brand-alt) 26%, var(--bg));
```

Если filled-кнопка с `var(--ds-brand-alt)` не проходит контраст, как это уже сделано для отдельных tone в `DsButton`, можно задать более тёмные button-specific значения:

```css
--ds-button-brand-alt-bg: #0369a1;
--ds-button-brand-alt-bg-hover: #075985;
--ds-button-brand-alt-bg-active: #0c4a6e;
--ds-button-brand-alt-fg: #ffffff;
```

#### 4. Подключение в `dsButtonStyles.ts`

```ts
export type DsButtonTone =
  | 'primary'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'slate'
  | 'azure'
  | 'brand-alt'
```

```ts
const tones = {
  'brand-alt': {
    solidBackground: 'var(--ds-button-brand-alt-bg,var(--ds-brand-alt))',
    solidBackgroundHover: 'var(--ds-button-brand-alt-bg-hover,var(--ds-brand-alt-hover))',
    solidBackgroundActive: 'var(--ds-button-brand-alt-bg-active,var(--ds-brand-alt-active))',
    solidForeground: 'var(--ds-button-brand-alt-fg,var(--ds-brand-alt-fg,var(--fg)))',
    accentText: 'var(--ds-brand-alt-text,var(--ds-brand-alt))',
    softBackground: 'var(--ds-button-brand-alt-soft-bg)',
    softBackgroundHover: 'var(--ds-button-brand-alt-soft-bg-hover)',
    softBackgroundActive: 'var(--ds-button-brand-alt-soft-bg-active)',
    softForeground: 'var(--ds-brand-alt-text,var(--ds-brand-alt))',
    border: 'var(--ds-brand-alt)',
    borderHover: 'var(--ds-brand-alt-hover)',
    borderActive: 'var(--ds-brand-alt-active)',
  },
}
```

### Что обязательно проверить

1. Новый tone доступен в пропсах кнопки и типах.
2. Для `primary`, `secondary`, `outline`, `ghost`, `ghost-border` строятся корректные классы.
3. Новый tone попадает в safelist через `tones`.
4. `DsButton.test.ts` покрывает новый tone хотя бы на уровне class output / token usage.
5. `presetGranularity.test.ts` подтверждает, что нужные CSS token'ы реально публикуются.
6. Filled variant проходит контраст для текста в обеих темах.

### Практическое правило

Если новый semantic цвет хорошо работает как badge/alert color, это ещё не значит, что он автоматически подходит для filled button. Для `DsButton` смотри отдельно на:

- контраст текста на filled background;
- разницу между `default`, `hover`, `active`;
- визуальную дистанцию от `primary`.