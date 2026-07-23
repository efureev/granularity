### Задача

Добавление нового `tone` в `GrButton` — это не одна правка, а цепочка из semantic token'ов, component token'ов, class mapping и тестов.

Ниже перечислены только те точки, которые реально используются текущей реализацией `GrButton`.

### Куда вносить изменения

1. `packages/granularity/src/styles/themes/light.css`
   - Добавь semantic token'ы светлой темы:
     - `--gr-<tone>`
     - `--gr-<tone>-light`
     - `--gr-<tone>-foreground`
     - `--gr-<tone>-text`
2. `packages/granularity/src/styles/themes/dark.css`
   - Добавь те же token'ы для тёмной темы.
3. `packages/granularity/src/styles/tokens.css`
   - Добавь derived token'ы для interaction state:
     - `--gr-<tone>-hover`
     - `--gr-<tone>-active`
   - Если проект поддерживает fallback внутри `@supports not (color: color-mix(...))`, добавь и fallback-значения в theme-файлы.
4. `packages/granularity/src/components/GrButton/tokens.css`
   - Добавь component-level token'ы для `GrButton`:
     - `--gr-button-<tone>-background`
     - `--gr-button-<tone>-background-hover`
     - `--gr-button-<tone>-background-active`
     - `--gr-button-<tone>-foreground`
     - `--gr-button-<tone>-soft-background`
     - `--gr-button-<tone>-soft-background-hover`
     - `--gr-button-<tone>-soft-background-active`
   - При необходимости задай button-specific filled background, если прямое использование `--gr-<tone>` не даёт нужный контраст для белого/тёмного текста.
5. `packages/granularity/src/components/GrButton/grButtonStyles.ts`
   - Добавь новый `tone` в тип `GrButtonTone`.
   - Добавь новую запись в объект `tones`.
   - Убедись, что для нового tone заполнены все поля `GrButtonToneTokens`:
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
   - Обнови `packages/granularity/src/components/GrButton/__tests__/GrButton.test.ts`
   - Обнови `packages/granularity/src/__tests__/presetGranularity.test.ts`

### Почему нужны все эти шаги

- `light.css` и `dark.css` задают реальные semantic-цвета.
- `src/styles/tokens.css` генерирует общие `hover/active` formula token'ы, на которые потом опирается компонент.
- `GrButton/tokens.css` — это слой component token'ов. Здесь можно:
  - просто пробросить semantic token;
  - либо зафиксировать отдельный button-specific цвет, если для кнопки нужен другой контраст.
- `grButtonStyles.ts` связывает tone с конкретными utility-классами и одновременно формирует safelist через `tones`.

### Минимальный шаблон для нового tone

#### 1. Semantic token'ы в теме

```css
/* light.css */
--gr-brand-alt: #0ea5e9;
--gr-brand-alt-light: #e0f2fe;
--gr-brand-alt-fg: #ffffff;
--gr-brand-alt-text: #075985;
```

```css
/* dark.css */
--gr-brand-alt: #38bdf8;
--gr-brand-alt-light: #0c4a6e;
--gr-brand-alt-fg: #0f172a;
--gr-brand-alt-text: #bae6fd;
```

#### 2. Interaction formula token'ы

```css
/* src/styles/tokens.css */
--gr-brand-alt-hover: color-mix(in srgb, var(--gr-brand-alt) 92%, var(--gr-fg));
--gr-brand-alt-active: color-mix(in srgb, var(--gr-brand-alt) 84%, var(--gr-fg));
```

#### 3. Component token'ы для `GrButton`

```css
/* GrButton/tokens.css */
--gr-button-brand-alt-bg: var(--gr-brand-alt);
--gr-button-brand-alt-bg-hover: var(--gr-brand-alt-hover);
--gr-button-brand-alt-bg-active: var(--gr-brand-alt-active);
--gr-button-brand-alt-fg: var(--gr-brand-alt-fg);
--gr-button-brand-alt-soft-bg: var(--gr-brand-alt-light);
--gr-button-brand-alt-soft-bg-hover: color-mix(in srgb, var(--gr-brand-alt) 20%, var(--gr-bg));
--gr-button-brand-alt-soft-bg-active: color-mix(in srgb, var(--gr-brand-alt) 26%, var(--gr-bg));
```

Если filled-кнопка с `var(--gr-brand-alt)` не проходит контраст, как это уже сделано для отдельных tone в `GrButton`, можно задать более тёмные button-specific значения:

```css
--gr-button-brand-alt-bg: #0369a1;
--gr-button-brand-alt-bg-hover: #075985;
--gr-button-brand-alt-bg-active: #0c4a6e;
--gr-button-brand-alt-fg: #ffffff;
```

#### 4. Подключение в `grButtonStyles.ts`

```ts
export type GrButtonTone =
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
    solidBackground: 'var(--gr-button-brand-alt-bg,var(--gr-brand-alt))',
    solidBackgroundHover: 'var(--gr-button-brand-alt-bg-hover,var(--gr-brand-alt-hover))',
    solidBackgroundActive: 'var(--gr-button-brand-alt-bg-active,var(--gr-brand-alt-active))',
    solidForeground: 'var(--gr-button-brand-alt-fg,var(--gr-brand-alt-fg,var(--gr-fg)))',
    accentText: 'var(--gr-brand-alt-text,var(--gr-brand-alt))',
    softBackground: 'var(--gr-button-brand-alt-soft-bg)',
    softBackgroundHover: 'var(--gr-button-brand-alt-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-brand-alt-soft-bg-active)',
    softForeground: 'var(--gr-brand-alt-text,var(--gr-brand-alt))',
    border: 'var(--gr-brand-alt)',
    borderHover: 'var(--gr-brand-alt-hover)',
    borderActive: 'var(--gr-brand-alt-active)',
  },
}
```

### Что обязательно проверить

1. Новый tone доступен в пропсах кнопки и типах.
2. Для `primary`, `secondary`, `outline`, `ghost`, `ghost-border` строятся корректные классы.
3. Новый tone попадает в safelist через `tones`.
4. `GrButton.test.ts` покрывает новый tone хотя бы на уровне class output / token usage.
5. `presetGranularity.test.ts` подтверждает, что нужные CSS token'ы реально публикуются.
6. Filled variant проходит контраст для текста в обеих темах.

### Практическое правило

Если новый semantic цвет хорошо работает как badge/alert color, это ещё не значит, что он автоматически подходит для filled button. Для `GrButton` смотри отдельно на:

- контраст текста на filled background;
- разницу между `default`, `hover`, `active`;
- визуальную дистанцию от `primary`.