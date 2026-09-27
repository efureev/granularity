/**
 * Имена компонентов пакета — одним списком без единого импорта.
 *
 * Модуль читает `resolver.ts` (whitelist авто-импорта). Отдельным файлом
 * именно поэтому: тянуть в конфиг сборки `resolver.ts` значило бы грузить
 * `unplugin-vue-components` на этапе чтения конфига. Раскладку `dist` список
 * больше не задаёт — её ведёт `granumProvider()` по реестру провайдера.
 *
 * Список генерируется `yarn generate:registry` — руками не писать.
 */
export const GRANULARITY_EDITOR_COMPONENTS = [
  // <granularity:components> — блок генерируется `yarn generate:registry`
  'GrMarkdown',
  'GrRichText',
  // </granularity:components>
] as const

export type GranularityEditorComponentName = typeof GRANULARITY_EDITOR_COMPONENTS[number]
