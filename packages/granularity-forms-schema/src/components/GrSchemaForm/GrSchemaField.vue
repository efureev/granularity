<script setup lang="ts">
/**
 * Одно поле по узлу схемы.
 *
 * Это и есть механизм «почти всё сгенерировано, а два поля свои»: потребитель
 * раскладывает форму сам и вставляет сгенерированные поля точечно. Заодно —
 * единица рекурсии: объектный узел и повторитель рисуют свои поля им же.
 *
 * Обвязку даёт `GrFormField` ядра: `id`, `aria-describedby`, `aria-invalid`,
 * `aria-required`, красная рамка и связь с `GrForm` по `name` приезжают оттуда,
 * и пакет про ARIA не знает вовсе.
 */
import { computed, ref } from 'vue'

import GrFormField from '@feugene/granularity/components/GrFormField'

import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import type { GrSchemaNode } from '../../model'
import type { GrSchemaRendererRegistry } from '../../renderers'
import { coreRenderers, createSchemaRendererRegistry } from '../../renderers'
import type { GrUiFieldOptions } from '../../ui-schema'
import { resolveFieldUi } from '../../ui-schema'

import { useSchemaForm } from './context'
import { spanToClass } from './grSchemaFormStyles'

export interface GrSchemaFieldProps {
  /** Узел схемы. Не задан — берётся из контекста формы по `path`. */
  node?: GrSchemaNode
  /** Шаблонный путь — ключ в `uiSchema` и реестре. */
  path?: string
  /** Инстанс-путь. Не задан — равен `path`: вне массива они совпадают. */
  name?: string
  /** Индексы массивов на пути — нужны условиям с относительными путями. */
  indices?: number[]

  /** Значение. Не задано — читается из модели формы по `name`. */
  modelValue?: unknown
  ui?: GrUiFieldOptions
  renderers?: GrSchemaRendererRegistry

  disabled?: boolean
  readonly?: boolean
  /** Явные ошибки. Сильнее ошибки формы — правило `GrFormField`. */
  error?: string | string[]

  /** Не рисовать обвязку — только контрол. Для поля в ячейке таблицы. */
  bare?: boolean

  /**
   * Доступное имя контрола там, где видимой подписи нет и быть не должно:
   * строка свободного ключа, ячейка таблицы. Слабее `ui.controlProps`, чтобы
   * потребитель мог назвать поле по-своему.
   */
  ariaLabel?: string

  label?: string
  hint?: string
  labelPosition?: 'top' | 'start'
  labelWidth?: string | number
  showMessage?: boolean
}

export interface GrSchemaFieldEmits {
  (e: 'update:modelValue', value: unknown): void
  (e: 'change', value: unknown): void
  (e: 'unresolved', node: GrSchemaNode, name: string): void
}

const props = withDefaults(defineProps<GrSchemaFieldProps>(), {
  node: undefined,
  path: undefined,
  name: undefined,
  indices: undefined,
  modelValue: undefined,
  ui: undefined,
  renderers: undefined,
  disabled: undefined,
  readonly: undefined,
  error: undefined,
  bare: false,
  ariaLabel: undefined,
  label: undefined,
  hint: undefined,
  labelPosition: undefined,
  labelWidth: undefined,
  showMessage: undefined,
})

const emit = defineEmits<GrSchemaFieldEmits>()

const form = useSchemaForm()
const { t } = useGranularityTranslations()

const fallbackRegistry = createSchemaRendererRegistry(coreRenderers)
const registry = computed(() => props.renderers ?? form?.renderers.value ?? fallbackRegistry)

const templatePath = computed(() => props.path ?? props.name ?? '')
const instanceName = computed(() => props.name ?? props.path ?? '')
const node = computed(() => props.node ?? form?.nodeAt(templatePath.value))

const ui = computed(() => {
  if (!node.value)
    return undefined

  const own = props.ui ? { [templatePath.value]: props.ui } : {}
  const merged = form
    ? { ...form.ui.value, fields: { ...form.ui.value.fields, ...own } }
    : { fields: own }

  return resolveFieldUi(
    {
      node: node.value,
      name: instanceName.value,
      templatePath: templatePath.value,
      indices: props.indices ?? [],
      parent: '',
      depth: 0,
      leaf: true,
    },
    merged,
    form?.model.value ?? {},
  )
})

const value = computed(() =>
  props.modelValue !== undefined ? props.modelValue : form?.valueAt(instanceName.value))

const renderer = computed(() => {
  if (!node.value)
    return undefined

  const found = registry.value.resolve(node.value, ui.value?.widget)
  if (!found)
    emit('unresolved', node.value, instanceName.value)

  return found
})

const component = computed(() => ui.value?.component ?? renderer.value?.component)

const control = computed(() => {
  if (!node.value || !renderer.value)
    return {}

  const fromRenderer = renderer.value.props?.({
    node: node.value,
    name: instanceName.value,
    templatePath: templatePath.value,
    t,
  }) ?? {}

  return {
    ...(props.ariaLabel === undefined ? {} : { ariaLabel: props.ariaLabel }),
    ...fromRenderer,
    ...(ui.value?.options ? { options: ui.value.options } : {}),
    ...(ui.value?.placeholder ? { placeholder: ui.value.placeholder } : {}),
    ...ui.value?.controlProps,
  }
})

const isDisabled = computed(() => props.disabled ?? ui.value?.disabled ?? form?.disabled.value ?? false)
const isReadonly = computed(() => props.readonly ?? ui.value?.readonly ?? form?.readonly.value ?? false)

/** Серверная ошибка сильнее клиентской: она о том, что бэкенд уже отклонил. */
const errors = computed<string | string[] | undefined>(() => {
  if (props.error !== undefined)
    return props.error

  const fromServer = form?.serverErrorAt(instanceName.value)
  return fromServer && fromServer.length > 0 ? fromServer : undefined
})

const spanClass = computed(() => spanToClass(ui.value?.span))

const controlValue = computed(() => {
  const codec = renderer.value?.codec
  return codec && node.value ? codec.toControl(value.value, node.value) : value.value
})

function onUpdate(next: unknown): void {
  const codec = renderer.value?.codec
  const modelValue = codec && node.value ? codec.toModel(next, node.value) : next

  form?.dismissServerError(instanceName.value)
  form?.setValueAt(instanceName.value, modelValue)
  emit('update:modelValue', modelValue)
  emit('change', modelValue)
}

const controlRef = ref<{ focus?: () => void, blur?: () => void } | null>(null)

const fieldProps = computed(() => ({
  name: instanceName.value,
  label: props.label ?? ui.value?.label,
  hint: props.hint ?? ui.value?.hint,
  required: ui.value?.required,
  readonly: isReadonly.value,
  disabled: isDisabled.value,
  error: errors.value,
  labelPosition: props.labelPosition ?? ui.value?.labelPosition,
  labelWidth: props.labelWidth ?? ui.value?.labelWidth,
  showMessage: props.showMessage ?? ui.value?.showMessage,
}))

defineExpose({
  focus: () => controlRef.value?.focus?.(),
  blur: () => controlRef.value?.blur?.(),
  node,
  name: instanceName,
  control,
})
</script>

<template>
  <div v-if="node && ui?.visible !== false" data-gr-schema-field :data-path="instanceName" :class="spanClass">
    <GrFormField v-if="!bare" v-bind="fieldProps">
      <slot
        :node="node"
        :name="instanceName"
        :template-path="templatePath"
        :model-value="controlValue"
        :control="control"
        :disabled="isDisabled"
        :readonly="isReadonly"
      >
        <component
          :is="component"
          v-if="component"
          ref="controlRef"
          v-bind="control"
          :model-value="controlValue"
          :disabled="isDisabled"
          :readonly="isReadonly"
          @update:model-value="onUpdate"
        />
      </slot>
    </GrFormField>

    <slot
      v-else
      :node="node"
      :name="instanceName"
      :template-path="templatePath"
      :model-value="controlValue"
      :control="control"
      :disabled="isDisabled"
      :readonly="isReadonly"
    >
      <component
        :is="component"
        v-if="component"
        ref="controlRef"
        v-bind="control"
        :model-value="controlValue"
        :disabled="isDisabled"
        :readonly="isReadonly"
        @update:model-value="onUpdate"
      />
    </slot>
  </div>
</template>
