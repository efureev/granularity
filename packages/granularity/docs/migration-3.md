# Переезд с 2.x на 3.0

Ядро 3.0 — значения у темы. Имена токенов компонентов — контракт пакета компонентов, значения даёт
тема: и роли, и значения компонентов (`--gr-button-primary-bg`, `--gr-badge-semi-radius-md`) живут
в темах пакета `@feugene/granularity-tokens`. Компонент читает токен темы без запасного значения:
нехватку называет `granum doctor`, а не молча подставленный фолбэк. Внешний вид «Сланца» и «Глины»
не меняется — значения, которые видят компоненты, совпадают с 2.x в каждом режиме и острове.

Что почитать после: [`themes.md`](../../granularity-tokens/docs/themes.md) пакета токенов —
наследование или копия, тема отдельным пакетом; [`modes.md`](./modes.md) — виды токенов
компонента.

## Зависимости

Ядро — мажор 3, пакет токенов — мажор 2, `@feugene/granum` и `@feugene/granum-engine-wind` —
`^3.10.0`: раздел `components` данных темы, `version` и `targets` темы и новые находки `doctor` —
механизм granum 3.10.

## `themes` в конфиге granum обязателен

Темы по умолчанию у каталога больше нет: основную тему выбирает приложение. Сборка без `themes` —
ошибка granum со списком тем каталога.

```ts
defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  themes: [{ theme: 'slate', modes: ['light', 'dark'] }],
})
```

`GR_DEFAULT_THEME_ID` → `GR_BASE_THEME_ID`: константа называет базовую тему пакета — ту, с которой
компоненты выпускаются, — а не основную тему чьей-то сборки.

## Своя тема

**Формат исходника — раскладка granum.** `theme.json` объявляет режимы объектом, а не массивом;
пропсы по умолчанию переезжают в `extensions.granularity`; файл режима — плоские значения, его
`extends` — в `theme.json`.

```json
// 2.x
{ "id": "brand", "extends": "slate", "modes": [{ "name": "dim", "colorScheme": "dark" }],
  "componentDefaults": { "GrButton": { "loadingIndicator": "shimmer" } } }
// modes/dim.json: { "extends": "dark", "tokens": { "gr-bg": "#1e293b" } }

// 3.0
{ "id": "brand", "extends": "slate", "modes": { "dim": { "colorScheme": "dark", "extends": "dark" } },
  "extensions": { "granularity": { "componentDefaults": { "GrButton": { "loadingIndicator": "shimmer" } } } } }
// modes/dim.json: { "gr-bg": "#1e293b" }
```

Папку читает загрузчик granum строго: посторонний файл — ошибка, а не пропуск (пояснения кладите в
`notes.json` или `*.md`); фолбэки `@supports` в исходнике — ошибка, их считает сборка темы.

**Тема с `extends: 'slate'`** работает как прежде и теперь получает от «Сланца» и значения
компонентов.

**Тема без `extends`, опиравшаяся на фолбэки компонентов**, неполна: `doctor` назовёт токены
поимённо (`theme-incomplete`). Значения — своими, в разделе
`components/@feugene/granularity/<GrX>/` темы, либо `extends` от темы каталога. Начать с копии
удобно командой `gr-theme-copy slate <id>`.

## Хуки и токены компонентов

- **Тема хук не задаёт.** Хук (`kind: "hook"`) — ручка приложения: его значение в теме — находка
  `doctor` `theme-token-foreign`. Своё значение приложения — `modes.tokenOverrides` записи темы
  или свой CSS.
- **Токены, ставшие видом `theme`.** Значение задаёт каждая тема; приложение по-прежнему
  переопределяет их `tokenOverrides` или CSS:
  - `--gr-button-neutral-bg`, `-neutral-bg-hover`, `-neutral-bg-active`, `-neutral-fg`;
  - радиусы `--gr-button-radius-{xs,sm,md,lg}` (один радиус на все ступени — ручка приложения
    `--gr-button-radius`), `--gr-avatar-square-radius`, `--gr-badge-semi-radius-{xs,sm,md,lg}`,
    `--gr-command-item-radius`;
  - тени `--gr-datatable-pinned-shadow`, `-pinned-shadow-end`, `--gr-table-sticky-column-shadow`;
  - цвета `--gr-command-active-bg`, `--gr-command-match-bg`, `--gr-rating-void-color`,
    `--gr-transfer-selected-bg`, `-drop-bg`, `-arrived-bg`, `--gr-color-picker-area-thumb-border`,
    `-area-thumb-ring`;
  - линии `--gr-divider-thickness`, `--gr-steps-connector-size`, `--gr-timeline-axis-width`,
    `-dash`, `-marker-ring`, `--gr-sortable-indicator-width`, `--gr-transfer-indicator-width`,
    `--gr-datatable-drag-indicator-width`, `--gr-carousel-dot-ring-width`, `-dot-ring-offset`;
  - анимация `--gr-button-shimmer-duration`, `--gr-progress-indeterminate-duration`,
    `--gr-progress-circle-cap`; кегль `--gr-command-input-font-size`.
- **Подложка прозрачных весов кнопки — по тону.** Тема задаёт
  `--gr-button-<тон>-ghost-bg-hover` и `-ghost-bg-active`; хук `--gr-button-ghost-bg-hover` /
  `-active` остаётся ручкой приложения — одна подложка на все тоны поверх темы.
- **Нижняя тень `GrAffix`** (`placement="bottom"`) — токен темы `--gr-affix-shadow-bottom`; хук
  `--gr-affix-shadow` по-прежнему перекрывает обе.
- **Хук с литералом по умолчанию** несёт причину — поле `literal` записи `tokens.json` и
  `grComponentTokens`: литерал — механика компонента (ступень `size`, геометрия раскладки, слой).

## Пакеты тем и тест-кит

- Тему для granularity можно выпустить отдельным пакетом: раскладка, `version`, `targets` и
  `peerDependencies` — в [`themes.md`](../../granularity-tokens/docs/themes.md#тема-отдельным-пакетом)
  пакета токенов, гейт — `defineThemeGate` тест-кита.
- Допуск хуков в файлах тем компонента (тест-кит 2.1.0) снимается флагом `themeKindOnly` гейта
  `componentTokens`; новые флаги `themeTokenFallback`, `hookLiterals`, `themesDirAbsent` и
  `themeSources` включаются пакетом по мере его перевода.
