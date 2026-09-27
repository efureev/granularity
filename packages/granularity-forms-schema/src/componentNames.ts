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
export const GRANULARITY_FORMS_SCHEMA_COMPONENTS = [
  // <granularity:components> — блок генерируется `yarn generate:registry`
  'GrSchemaForm',
  // </granularity:components>
] as const

export type GranularityFormsSchemaComponentName = typeof GRANULARITY_FORMS_SCHEMA_COMPONENTS[number]

/**
 * Части составного компонента: живут в каталоге `GrSchemaForm`, своей entry и
 * своего CSS-ассета не имеют — поэтому в списке выше их нет, его читает конфиг
 * сборки. Резолверу авто-импорта они нужны: в шаблоне пишутся такими же
 * именами, и без whitelist их перехватил бы жадный `Gr*`-резолвер ядра, уводя
 * в subpath, которого у ядра нет.
 *
 * Список генерируется `yarn generate:registry` — руками не писать.
 */
export const GRANULARITY_FORMS_SCHEMA_SUBCOMPONENTS = [
  // <granularity:components:subcomponents> — блок генерируется `yarn generate:registry`
  'GrSchemaAdditionalFields',
  'GrSchemaArrayField',
  'GrSchemaField',
  'GrSchemaUnionField',
  // </granularity:components:subcomponents>
] as const
