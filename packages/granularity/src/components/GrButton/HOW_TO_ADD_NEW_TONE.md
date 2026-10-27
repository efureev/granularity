### Задача

Добавление нового `tone` в `GrButton` — это не одна правка, а цепочка из semantic token'ов, component token'ов, правила тона в листе компонента и тестов.

Ниже перечислены только те точки, которые реально используются текущей реализацией `GrButton`.

### Куда вносить изменения

1. `packages/granularity-tokens/tokens/roles.json`
   - Зарегистрируй semantic token'ы тона: `--gr-<tone>`, `--gr-<tone>-light`,
     `--gr-<tone>-fg`, `--gr-<tone>-text`, `--gr-<tone>-solid` и соседей.
2. `packages/granularity-tokens/themes/<тема>/modes/{light,dark}.json`
   - Задай их значения в каждом режиме **каждой** темы каталога (ключи без `--`): тема без
     значения неполна, и сборка темы падает с именем токена.
3. `packages/granularity-tokens/tokens/derived.json`
   - Добавь формулы interaction state: `--gr-<tone>-hover`, `--gr-<tone>-active`.
     Фолбэки для `@supports not (color-mix)` сборка темы посчитает сама.
   - Перегенерируй: `yarn workspace @feugene/granularity-tokens generate`.
4. `packages/granularity-tokens/themes/<тема>/components/@feugene/granularity/GrButton/root.json`
   - Добавь component-level token'ы `GrButton` (ключи без `--`) в **каждую** тему каталога:
     `gr-button-<tone>-bg`, `-bg-hover`, `-bg-active`, `-fg`, `-soft-bg`, `-soft-bg-hover`,
     `-soft-bg-active`, `-ghost-bg-hover`, `-ghost-bg-active`, `-border-soft`, `-border`.
     Формулы, одинаковые во всех режимах, живут здесь: granum объявляет их на каждом
     `[data-theme]`, и остров режима считает их от своих ролей. Разное по режимам — в
     `modes/<режим>.json` того же раздела.
   - Зарегистрируй их в `GrButton/tokens.json` с `kind: "theme"`. Компонент читает их без
     запасного значения: полноту по темам проверяет `catalogThemes.test.ts`.
5. `packages/granularity/src/components/shared/tones.ts`
   - Добавь тон в `GR_TONES`: из него выводится `GrTone`, а `GrButtonTone` — это он же.
     Тон общий для пакета, поэтому его ждут и бейдж, и алерт, и остальные тонированные компоненты.
6. `packages/granularity/src/components/GrButton/GrButton.vue`, `<style>`
   - Добавь правило тона `[data-gr-button][data-gr-tone='<tone>']`: оно раскладывает
     component token'ы тона по семнадцати переменным `--gr-button-tone-*` (полный список —
     `GrButton/tokens.json`, `kind: "css"`). Правила весов (`primary`, `secondary`,
     `outline`, `ghost`, `ghost-border`) читают только эти переменные, поэтому вес про
     новый тон ничего знать не должен.
7. Тесты
   - Обнови `packages/granularity/src/components/GrButton/__tests__/GrButton.test.ts`
   - Добавь тон в список `tones` контрастных проверок там же.

### Почему нужны все эти шаги

- режимы темы `slate` задают реальные semantic-цвета;
- `tokens/derived.json` даёт общие `hover/active` формулы, на которые потом опирается компонент;
- раздел `GrButton` каждой темы — слой component token'ов. Здесь можно:
  - просто пробросить semantic token;
  - либо зафиксировать отдельный button-specific цвет, если для кнопки нужен другой контраст.
- правило тона в `<style>` `GrButton.vue` связывает тон с его component token'ами. Вид кнопки —
  лист компонента по атрибутам `data-gr-*`, а не utility-классы, поэтому safelist у тона нет.

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
// themes/slate/components/@feugene/granularity/GrButton/root.json
"gr-button-brand-alt-bg": "var(--gr-brand-alt-solid)",
"gr-button-brand-alt-bg-hover": "var(--gr-brand-alt-solid-hover)",
"gr-button-brand-alt-bg-active": "var(--gr-brand-alt-solid-active)",
"gr-button-brand-alt-fg": "var(--gr-brand-alt-solid-fg)",
"gr-button-brand-alt-soft-bg": "var(--gr-brand-alt-light)",
"gr-button-brand-alt-soft-bg-hover": "color-mix(in srgb, var(--gr-brand-alt) 10%, var(--gr-button-brand-alt-soft-bg))",
"gr-button-brand-alt-soft-bg-active": "color-mix(in srgb, var(--gr-brand-alt) 16%, var(--gr-button-brand-alt-soft-bg))",
"gr-button-brand-alt-ghost-bg-hover": "var(--gr-button-brand-alt-soft-bg-hover)",
"gr-button-brand-alt-ghost-bg-active": "var(--gr-button-brand-alt-soft-bg-active)"
```

Если filled-кнопка не проходит контраст, можно задать button-specific значения
по режимам — в `modes/<режим>.json` раздела `GrButton` темы:

```json
"gr-button-brand-alt-bg": "#0369a1",
"gr-button-brand-alt-bg-hover": "#075985",
"gr-button-brand-alt-bg-active": "#0c4a6e",
"gr-button-brand-alt-fg": "#ffffff"
```

#### 4. Тон в пакете и правило тона в листе кнопки

```ts
// packages/granularity/src/components/shared/tones.ts
export const GR_TONES = [
  // …
  'azure',
  'brand-alt',
] as const
```

```css
/* GrButton.vue, <style> — рядом с правилами остальных тонов */
[data-gr-button][data-gr-tone='brand-alt'] {
  --gr-button-tone-bg: var(--gr-button-brand-alt-bg);
  --gr-button-tone-bg-hover: var(--gr-button-brand-alt-bg-hover);
  --gr-button-tone-bg-active: var(--gr-button-brand-alt-bg-active);
  --gr-button-tone-fg: var(--gr-button-brand-alt-fg);
  --gr-button-tone-text: var(--gr-brand-alt-text);
  --gr-button-tone-soft-bg: var(--gr-button-brand-alt-soft-bg);
  --gr-button-tone-soft-bg-hover: var(--gr-button-brand-alt-soft-bg-hover);
  --gr-button-tone-soft-bg-active: var(--gr-button-brand-alt-soft-bg-active);
  --gr-button-tone-soft-fg: var(--gr-brand-alt-text);
  --gr-button-tone-ghost-bg-hover: var(--gr-button-brand-alt-ghost-bg-hover);
  --gr-button-tone-ghost-bg-active: var(--gr-button-brand-alt-ghost-bg-active);
  --gr-button-tone-border: var(--gr-button-brand-alt-border);
  --gr-button-tone-border-hover: var(--gr-button-brand-alt-border-hover);
  --gr-button-tone-border-active: var(--gr-button-brand-alt-border-active);
  --gr-button-tone-border-soft: var(--gr-button-brand-alt-border-soft);
  --gr-button-tone-border-soft-hover: var(--gr-button-brand-alt-border-soft-hover);
  --gr-button-tone-glow: var(--gr-button-brand-alt-glow);
}
```

### Что обязательно проверить

1. Новый tone доступен в пропсах кнопки и типах.
2. У тона есть правило в листе со всеми переменными `--gr-button-tone-*` — это держит
   `GrButton.test.ts` («у каждого тона пакета…»).
3. Каждый вес в каждом состоянии проходит контраст подписи в каждом режиме каждой темы
   каталога: тест читает лист компонента тем же каскадом, что браузер.

### Практическое правило

Если новый semantic цвет хорошо работает как badge/alert color, это ещё не значит, что он автоматически подходит для filled button. Для `GrButton` смотри отдельно на:

- контраст текста на filled background;
- разницу между `default`, `hover`, `active`;
- визуальную дистанцию от `primary`.