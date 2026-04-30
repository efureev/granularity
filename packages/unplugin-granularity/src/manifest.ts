/**
 * Статический манифест того, что умеет резолвить `@feugene/granularity`.
 *
 * Мы сознательно держим whitelist локально, а не рефлексируем `node_modules`:
 * это делает резолвер детерминированным, быстрым (ноль I/O) и защищает от
 * ложных срабатываний на одноимённых компонентах других библиотек.
 *
 * При добавлении новой директивы в `@feugene/granularity` — допишите её сюда.
 * Компоненты резолвятся по префиксу и не требуют явного перечисления.
 */

/**
 * Префикс имён компонентов `@feugene/granularity` в шаблонах.
 * Все ваши компоненты — `GrButton`, `GrInput`, …, `Gr*`.
 */
export const GRANULARITY_DEFAULT_PREFIX = 'Gr' as const

/**
 * Корневой sub-path пакета. Централизован, чтобы не мусорить строковыми
 * литералами `'@feugene/granularity/...'` по всему коду резолвера.
 */
export const GRANULARITY_PACKAGE_NAME = '@feugene/granularity' as const

/**
 * Описание одной поддерживаемой директивы.
 *
 * @property kebab — имя, под которым `unplugin-vue-components` ищет
 *   директиву в шаблоне (`v-<kebab>`). Сам плагин при поиске подставляет
 *   `PascalCase` форму в резолверы, поэтому ключ в словаре — PascalCase.
 * @property named — имя экспорта из `@feugene/granularity/directives/<module>`.
 * @property module — имя файла (без расширения) внутри `directives/`.
 */
export interface GranularityDirectiveDescriptor {
  readonly named: string
  readonly module: string
}

/**
 * Whitelist директив, которые пакет `@feugene/granularity` экспортирует
 * через `./directives/<module>`.
 *
 * Ключ — `PascalCase` (в таком виде `unplugin-vue-components` отдаёт
 * имя директивы в резолвер, например `v-hotkey` → `Hotkey`).
 */
export const GRANULARITY_DIRECTIVES: Readonly<Record<string, GranularityDirectiveDescriptor>> = Object.freeze({
  Autofocus: { named: 'vAutofocus', module: 'autofocus' },
  Autosize: { named: 'vAutosize', module: 'autosize' },
  ClickOutside: { named: 'vClickOutside', module: 'clickOutside' },
  Dropzone: { named: 'vDropzone', module: 'dropzone' },
  Hotkey: { named: 'vHotkey', module: 'hotkey' },
  Loading: { named: 'vLoading', module: 'loading' },
})

export type GranularityDirectiveName = keyof typeof GRANULARITY_DIRECTIVES
