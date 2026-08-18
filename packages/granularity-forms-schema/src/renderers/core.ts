import GrCheckbox from '@feugene/granularity/components/GrCheckbox'
import GrCheckboxGroup from '@feugene/granularity/components/GrCheckboxGroup'
import GrFormFile from '@feugene/granularity/components/GrFormFile'
import GrInput from '@feugene/granularity/components/GrInput'
import GrInputTag from '@feugene/granularity/components/GrInputTag'
import GrNumberInput from '@feugene/granularity/components/GrNumberInput'
import GrRadioGroup from '@feugene/granularity/components/GrRadioGroup'
import GrSelect from '@feugene/granularity/components/GrSelect'
import GrTextarea from '@feugene/granularity/components/GrTextarea'

import type { GrSchemaRenderer } from './registry'

/**
 * Дефолтный набор: узел модели → контрол ядра.
 *
 * Импорт точечными subpath, а не из корневого барреля: реестр читается целиком
 * при первом же поле, и корневой импорт затянул бы в граф все 78 компонентов.
 *
 * Набор намеренно узкий. Каждая запись — это компонент в `dependencies`
 * дескриптора, то есть его CSS и safelist в бандле **каждого** потребителя
 * формы. Слайдеры, рейтинги и палитры выразительны, но нужны единицам —
 * они живут в `extendedRenderers` и подключаются явно.
 */

/** Строка длиннее этого порога — уже абзац, а не однострочное поле. */
const MULTILINE_THRESHOLD = 160

/** Выше этого числа вариантов список из радиокнопок перестаёт читаться. */
const RADIO_LIMIT = 5

/** С этого числа опций выбор без поиска становится мучением. */
const FILTERABLE_FROM = 10

export const coreRenderers: readonly GrSchemaRenderer[] = [
  {
    name: 'gr:boolean',
    component: GrCheckbox,
    when: { kind: 'boolean' },
    priority: 60,
    components: ['GrCheckbox'],
  },
  {
    name: 'gr:enum-radio',
    component: GrRadioGroup,
    when: { enum: true, kind: ['string', 'number'], optionsAtMost: RADIO_LIMIT },
    priority: 70,
    props: ({ node }) => ({ options: node.options }),
    components: ['GrRadioGroup'],
  },
  {
    name: 'gr:enum-select',
    component: GrSelect,
    when: { enum: true, kind: ['string', 'number'] },
    priority: 65,
    props: ({ node }) => ({
      options: node.options,
      placeholder: node.placeholder,
      clearable: !node.required,
      filterable: (node.options?.length ?? 0) >= FILTERABLE_FROM,
    }),
    components: ['GrSelect'],
  },
  {
    name: 'gr:enum-multi-checkbox',
    component: GrCheckboxGroup,
    when: { kind: 'array', itemEnum: true, optionsAtMost: 8 },
    priority: 72,
    match: node => (node.kind === 'array' ? (node.item.options?.length ?? 0) <= 8 : false),
    props: ({ node }) => ({ options: node.kind === 'array' ? node.item.options : undefined }),
    components: ['GrCheckboxGroup'],
  },
  {
    name: 'gr:enum-multi-select',
    component: GrSelect,
    when: { kind: 'array', itemEnum: true },
    priority: 68,
    props: ({ node }) => ({
      options: node.kind === 'array' ? node.item.options : undefined,
      multiple: true,
      clearable: !node.required,
    }),
    components: ['GrSelect'],
  },
  {
    name: 'gr:array-tags',
    component: GrInputTag,
    when: { kind: 'array', itemKind: 'string', itemEnum: false },
    priority: 55,
    props: ({ node }) => ({
      max: node.constraints.max,
      allowDuplicates: node.constraints.uniqueItems !== true,
    }),
    components: ['GrInputTag'],
  },
  {
    name: 'gr:file',
    component: GrFormFile,
    when: { kind: 'file' },
    priority: 60,
    props: ({ node }) => ({ accept: node.constraints.accept?.join(',') }),
    components: ['GrFormFile'],
  },
  {
    name: 'gr:file-multi',
    component: GrFormFile,
    when: { kind: 'array', itemKind: 'file' },
    priority: 62,
    props: ({ node }) => ({
      accept: node.constraints.accept?.join(','),
      multiple: true,
      limit: node.constraints.maxFiles,
    }),
    components: ['GrFormFile'],
  },
  {
    name: 'gr:number',
    component: GrNumberInput,
    when: { kind: 'number' },
    priority: 50,
    props: ({ node }) => ({
      min: node.constraints.min ?? node.constraints.exclusiveMin,
      max: node.constraints.max ?? node.constraints.exclusiveMax,
      step: node.constraints.step,
      precision: node.constraints.integer ? 0 : undefined,
    }),
    components: ['GrNumberInput'],
  },
  {
    name: 'gr:email',
    component: GrInput,
    when: { kind: 'string', format: 'email' },
    priority: 45,
    props: () => ({ type: 'email', inputmode: 'email', autocomplete: 'email' }),
    components: ['GrInput'],
  },
  {
    name: 'gr:url',
    component: GrInput,
    when: { kind: 'string', format: ['url', 'uri'] },
    priority: 45,
    props: () => ({ type: 'url', inputmode: 'url' }),
    components: ['GrInput'],
  },
  {
    name: 'gr:tel',
    component: GrInput,
    when: { kind: 'string', format: 'tel' },
    priority: 45,
    props: () => ({ type: 'tel', inputmode: 'tel', autocomplete: 'tel' }),
    components: ['GrInput'],
  },
  {
    name: 'gr:password',
    component: GrInput,
    when: { kind: 'string', format: 'password' },
    priority: 45,
    props: () => ({ type: 'password', autocomplete: 'new-password' }),
    components: ['GrInput'],
  },
  {
    name: 'gr:textarea',
    component: GrTextarea,
    when: { kind: 'string', format: 'multiline' },
    priority: 40,
    props: ({ node }) => ({ maxlength: node.constraints.max, autosize: true }),
    components: ['GrTextarea'],
  },
  {
    name: 'gr:textarea-long',
    component: GrTextarea,
    when: { kind: 'string', maxAbove: MULTILINE_THRESHOLD },
    priority: 35,
    props: ({ node }) => ({ maxlength: node.constraints.max, showCount: true, autosize: true }),
    components: ['GrTextarea'],
  },
  {
    name: 'gr:string',
    component: GrInput,
    when: { kind: 'string' },
    priority: 10,
    props: ({ node }) => ({ maxlength: node.constraints.max, placeholder: node.placeholder }),
    components: ['GrInput'],
  },
  {
    /**
     * Последний рубеж: узел, который не разобрал адаптер.
     *
     * Показывается только на чтение — редактируемое поле без единой известной
     * проверки создаёт видимость работы и молча отправляет что угодно.
     */
    name: 'gr:unknown',
    component: GrInput,
    when: { kind: 'unknown' },
    priority: 0,
    props: () => ({ readonly: true }),
    components: ['GrInput'],
  },
]

/** Компоненты, которые дефолтный набор действительно рендерит. */
export const coreRendererComponents: readonly string[] = [
  ...new Set(coreRenderers.flatMap(renderer => renderer.components ?? [])),
].sort()
