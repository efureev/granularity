import GrDatePicker from '@feugene/granularity-chrono/components/GrDatePicker'
import GrDateTimePicker from '@feugene/granularity-chrono/components/GrDateTimePicker'
import GrTimePicker from '@feugene/granularity-chrono/components/GrTimePicker'

import type { GrSchemaRenderer } from './registry'

/**
 * Пикеры даты и времени из `@feugene/granularity-chrono`.
 *
 * Отдельным subpath, а не в дефолтном наборе, по одной причине: `chrono` —
 * optional peer, и его импорт внутри дефолта ломал бы **сборку** у того, кто
 * пакет не поставил. Bare-specifier резолвится бандлером, а не рантаймом, —
 * `try/catch` вокруг импорта тут не спасает.
 *
 * Без chrono дата остаётся текстовым полем с проверкой формата: форма работает,
 * просто без календаря.
 *
 * Тип значения в модели решает `valueAdapter` пикера, а не пакет: `kind: 'date'`
 * означает `Date` в рантайме, строковые форматы — ISO-строку.
 */
export const chronoRenderers: readonly GrSchemaRenderer[] = [
  {
    name: 'gr:date',
    component: GrDatePicker,
    when: { kind: ['date', 'string'], format: 'date' },
    priority: 90,
    props: ({ node }) => ({
      valueAdapter: node.kind === 'date' ? 'date' : 'isoDate',
      min: node.constraints.minDate,
      max: node.constraints.maxDate,
      clearable: !node.required,
    }),
    components: ['GrDatePicker'],
  },
  {
    name: 'gr:date-native',
    component: GrDatePicker,
    when: { kind: 'date' },
    priority: 88,
    props: ({ node }) => ({
      valueAdapter: 'date',
      min: node.constraints.minDate,
      max: node.constraints.maxDate,
      clearable: !node.required,
    }),
    components: ['GrDatePicker'],
  },
  {
    name: 'gr:date-time',
    component: GrDateTimePicker,
    when: { format: 'date-time' },
    priority: 90,
    props: ({ node }) => ({
      valueAdapter: node.kind === 'date' ? 'date' : 'isoDateTime',
      clearable: !node.required,
    }),
    components: ['GrDateTimePicker'],
  },
  {
    name: 'gr:time',
    component: GrTimePicker,
    when: { format: 'time' },
    priority: 90,
    props: ({ node }) => ({ clearable: !node.required }),
    components: ['GrTimePicker'],
  },
]

export const chronoRendererComponents: readonly string[] = [
  ...new Set(chronoRenderers.flatMap(renderer => renderer.components ?? [])),
]
