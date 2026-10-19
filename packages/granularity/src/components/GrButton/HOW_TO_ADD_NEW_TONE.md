### Задача

Добавление нового `tone` в `GrButton` — это не одна правка, а цепочка из semantic token'ов, component token'ов, class mapping и тестов.

Ниже перечислены только те точки, которые реально используются текущей реализацией `GrButton`.

### Куда вносить изменения

1. `packages/granularity-tokens/tokens/roles.json`
   - Зарегистрируй semantic token'ы тона: `--gr-<tone>`, `--gr-<tone>-light`,
     `--gr-<tone>-fg`, `--gr-<tone>-text`, `--gr-<tone>-solid` и соседей.
2. `packages/granularity-tokens/themes/slate/modes/{light,dark}.json`
   - Задай их значения в каждом режиме темы `slate` (ключи без `--`).
3. `packages/granularity-tokens/tokens/derived.json`
   - Добавь формулы interaction state: `--gr-<tone>-hover`, `--gr-<tone>-active`.
     Фолбэки для `@supports not (color-mix)` сборка темы посчитает сама.
   - Перегенерируй: `yarn workspace @feugene/granularity-tokens generate`.
4. `packages/granularity/src/components/GrButton/themes/slate/root.json`
   - Добавь component-level token'ы `GrButton` (ключи без `--`): `gr-button-<tone>-bg`,
     `-bg-hover`, `-bg-active`, `-fg`, `-soft-bg`, `-soft-bg-hover`, `-soft-bg-active`,
     `-border-soft`, `-border`. Формулы, одинаковые во всех режимах, живут здесь:
     granum объявляет их на каждом `[data-theme]`, и остров режима считает их от
     своих ролей. Разное по режимам — в `themes/slate/modes/<режим>.json`.
   - Зарегистрируй их в `GrButton/tokens.json` с `kind: "theme"`.
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
   - Обнови `packages/granularity/src/__tests__/presetUtilities.test.ts`

### Почему нужны все эти шаги

- режимы темы `slate` задают реальные semantic-цвета;
- `tokens/derived.json` даёт общие `hover/active` формулы, на которые потом опирается компонент;
- `GrButton/themes/slate/` — слой component token'ов. Здесь можно:
  - просто пробросить semantic token;
  - либо зафиксировать отдельный button-specific цвет, если для кнопки нужен другой контраст.
- `grButtonStyles.ts` связывает tone с конкретными utility-классами и одновременно формирует safelist через `tones`.

### Минимальный шаблон для нового tone

#### 1. Semantic token'ы в теме

```json
// packages/granularity-tokens/themes/slate/modes/light.json
"gr-brand-alt": "#0ea5e9",
"gr-brand-alt-light": "#e0f2fe",
"gr-brand-alt-fg": "#ffffff",
"gr-brand-alt-text": "#075985"
```

```json
// packages/granularity-tokens/themes/slate/modes/dark.json
"gr-brand-alt": "#38bdf8",
"gr-brand-alt-light": "#0c4a6e",
"gr-brand-alt-fg": "#0f172a",
"gr-brand-alt-text": "#bae6fd"
```

#### 2. Interaction formula token'ы

Запись в `tokens/derived.json` пакета токенов — генератор превратит её в

```css
--gr-brand-alt-hover: color-mix(in srgb, var(--gr-brand-alt) 92%, var(--gr-fg));
--gr-brand-alt-active: color-mix(in srgb, var(--gr-brand-alt) 84%, var(--gr-fg));
```

#### 3. Component token'ы для `GrButton`

```json
// GrButton/themes/slate/root.json
"gr-button-brand-alt-bg": "var(--gr-brand-alt-solid)",
"gr-button-brand-alt-bg-hover": "var(--gr-brand-alt-solid-hover)",
"gr-button-brand-alt-bg-active": "var(--gr-brand-alt-solid-active)",
"gr-button-brand-alt-fg": "var(--gr-brand-alt-solid-fg)",
"gr-button-brand-alt-soft-bg": "var(--gr-brand-alt-light)",
"gr-button-brand-alt-soft-bg-hover": "color-mix(in srgb, var(--gr-brand-alt) 10%, var(--gr-button-brand-alt-soft-bg))",
"gr-button-brand-alt-soft-bg-active": "color-mix(in srgb, var(--gr-brand-alt) 16%, var(--gr-button-brand-alt-soft-bg))"
```

Если filled-кнопка не проходит контраст, можно задать button-specific значения
по режимам — в `GrButton/themes/slate/modes/<режим>.json`:

```json
"gr-button-brand-alt-bg": "#0369a1",
"gr-button-brand-alt-bg-hover": "#075985",
"gr-button-brand-alt-bg-active": "#0c4a6e",
"gr-button-brand-alt-fg": "#ffffff"
```

#### 4. Подключение в `grButtonStyles.ts`

```ts
export type GrButtonTone
  = | 'primary'
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
5. `presetUtilities.test.ts` подтверждает, что нужные утилиты реально генерируются движком.
6. Filled variant проходит контраст для текста в обеих темах.

### Практическое правило

Если новый semantic цвет хорошо работает как badge/alert color, это ещё не значит, что он автоматически подходит для filled button. Для `GrButton` смотри отдельно на:

- контраст текста на filled background;
- разницу между `default`, `hover`, `active`;
- визуальную дистанцию от `primary`.