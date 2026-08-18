import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { CORE_RENDERER_COMPONENTS, FORM_SHELL_COMPONENTS } from '../../renderers/coreComponents'

import { grSchemaFormSafelist } from './safelist'

/**
 * Дескриптор семейства `GrSchemaForm` (`GrSchemaField`, `GrSchemaArrayField` и
 * внутренние узлы лежат в той же директории и покрываются им же).
 *
 * `dependencies` перечисляет **только дефолтный набор рендереров**. Иначе любой
 * потребитель формы оплачивал бы CSS и safelist всех контролов пакета — включая
 * те, которых в его схемах нет. Расширенные наборы и пикеры даты подключаются
 * явно, и их компоненты добавляются в селекцию потребителем — это описано в
 * `docs/renderers.md`.
 */
export const grSchemaFormConfig = defineGranularComponent(import.meta.url, {
  name: 'GrSchemaForm',
  safelist: grSchemaFormSafelist,
  dependencies: [
    {
      provider: '@feugene/granularity',
      components: [...CORE_RENDERER_COMPONENTS, ...FORM_SHELL_COMPONENTS],
    },
  ],
})
