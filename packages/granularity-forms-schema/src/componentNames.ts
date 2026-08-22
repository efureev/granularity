/**
 * Имена компонентов пакета — одним списком без единого импорта.
 *
 * Модуль читают и `resolver.ts` (whitelist авто-импорта), и `vite.config.ts`
 * (раскладка чанков и ассетов). Отдельным файлом именно поэтому: конфиг сборки
 * исполняется до сборки, и тянуть в него `resolver.ts` значило бы грузить
 * `unplugin-vue-components` на этапе чтения конфига.
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
