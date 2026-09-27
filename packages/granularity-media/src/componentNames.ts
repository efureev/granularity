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
export const GRANULARITY_MEDIA_COMPONENTS = [
  // <granularity:components> — блок генерируется `yarn generate:registry`
  'GrCameraCapture',
  'GrCodeScanner',
  'GrImageCrop',
  'GrVideoPlayer',
  // </granularity:components>
] as const

export type GranularityMediaComponentName = typeof GRANULARITY_MEDIA_COMPONENTS[number]
