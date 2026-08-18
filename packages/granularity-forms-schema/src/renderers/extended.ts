import GrAutocomplete from '@feugene/granularity/components/GrAutocomplete'
import GrColorPicker from '@feugene/granularity/components/GrColorPicker'
import GrRating from '@feugene/granularity/components/GrRating'
import GrSegmented from '@feugene/granularity/components/GrSegmented'
import GrSlider from '@feugene/granularity/components/GrSlider'
import GrSwitch from '@feugene/granularity/components/GrSwitch'
import GrTreeSelect from '@feugene/granularity/components/GrTreeSelect'

import type { GrSchemaRenderer } from './registry'

/**
 * Выразительные контролы — подключаются явно.
 *
 * Не в дефолте потому, что каждая запись тянет свой CSS и safelist в бандл
 * **каждого** потребителя формы. Ползунок вместо числа и палитра вместо строки
 * хороши там, где их выбрали осознанно, а не всем по умолчанию.
 *
 * Признак — `format` или аннотация схемы: тип значения тот же, а вид ввода
 * выбирает автор схемы или `uiSchema`.
 */
export const extendedRenderers: readonly GrSchemaRenderer[] = [
  {
    name: 'gr:boolean-switch',
    component: GrSwitch,
    when: { kind: 'boolean', format: 'switch' },
    priority: 80,
    components: ['GrSwitch'],
  },
  {
    name: 'gr:enum-segmented',
    component: GrSegmented,
    when: { enum: true, optionsAtMost: 3 },
    priority: 85,
    props: ({ node }) => ({ options: node.options }),
    components: ['GrSegmented'],
  },
  {
    name: 'gr:number-slider',
    component: GrSlider,
    when: { kind: 'number', format: 'slider', bounded: true },
    priority: 85,
    props: ({ node }) => ({
      min: node.constraints.min,
      max: node.constraints.max,
      step: node.constraints.step,
    }),
    components: ['GrSlider'],
  },
  {
    name: 'gr:number-rating',
    component: GrRating,
    when: { kind: 'number', format: 'rating' },
    priority: 85,
    props: ({ node }) => ({ max: node.constraints.max }),
    components: ['GrRating'],
  },
  {
    name: 'gr:color',
    component: GrColorPicker,
    when: { kind: 'string', format: ['color', 'color-alpha'] },
    priority: 85,
    props: ({ node }) => ({ alpha: node.format === 'color-alpha' }),
    components: ['GrColorPicker'],
  },
  {
    name: 'gr:autocomplete',
    component: GrAutocomplete,
    when: { enum: true, optionsAbove: 20 },
    priority: 75,
    props: ({ node }) => ({ options: node.options, clearable: !node.required }),
    components: ['GrAutocomplete'],
  },
  {
    name: 'gr:tree-select',
    component: GrTreeSelect,
    when: { annotation: 'x-tree' },
    priority: 90,
    props: ({ node }) => ({ data: node.annotations?.['x-tree'] }),
    components: ['GrTreeSelect'],
  },
]

export const extendedRendererComponents: readonly string[] = [
  ...new Set(extendedRenderers.flatMap(renderer => renderer.components ?? [])),
]
