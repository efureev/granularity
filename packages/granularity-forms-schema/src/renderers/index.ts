/**
 * Расширенный набор и пикеры даты здесь намеренно **не реэкспортируются**.
 *
 * Barrel тянется в общий чанк вместе с формой, и реэкспорт затащил бы туда
 * импорты `GrSlider`, `GrColorPicker` и прочих — то есть их CSS оплачивал бы
 * каждый потребитель, включая тех, у кого в схемах ничего подобного нет.
 * Их subpath: `./renderers/extended` и `./renderers/chrono`.
 */
export { coreRendererComponents, coreRenderers } from './core'
export { CORE_RENDERER_COMPONENTS, FORM_SHELL_COMPONENTS } from './coreComponents'
export {
  createSchemaRendererRegistry,
  GR_SCHEMA_RENDERERS,
  type GrSchemaRenderer,
  type GrSchemaRendererContext,
  type GrSchemaRendererMatch,
  type GrSchemaRendererRegistry,
  type GrSchemaValueCodec,
  provideSchemaRenderers,
  useSchemaRenderers,
} from './registry'

/** Набор по умолчанию: только контролы, которыми рисуется обычная форма. */
export { coreRenderers as defaultSchemaRenderers } from './core'
