<script setup lang="ts">
/**
 * Развилка по виду узла: массив объектов, объединение, вложенный объект, поле.
 *
 * Одна на все места, где перебираются поля, — корень формы, объектный узел,
 * строка повторителя. Копий было четыре, и каждый новый структурный вид
 * приходилось вписывать в каждую; пропуск давал не ошибку, а молча не
 * нарисованное поле — так дважды подряд терялось объединение. Полноту копий
 * держит гейт `structuralKinds`.
 *
 * Массив объектов идёт повторителем, а массив чего угодно ещё — обычным
 * контролом: у строки со своими полями есть поверхность (добавить, удалить,
 * переставить), а у списка строк её нет.
 */
import { computed } from 'vue'

import type { GrSchemaFieldInstance, GrSchemaNode } from '../../model'
import type { GrUiColumns } from '../../ui-schema'

import { useSchemaForm } from './context'
import GrSchemaArrayField from './GrSchemaArrayField.vue'
import GrSchemaField from './GrSchemaField.vue'
import GrSchemaUnionField from './GrSchemaUnionField.vue'
import SchemaObjectNode from './SchemaObjectNode.vue'

const props = withDefaults(defineProps<{
  field: GrSchemaFieldInstance
  columns?: GrUiColumns
  headingLevel?: 2 | 3 | 4 | 5 | 6
  labelPosition?: 'top' | 'start'
  labelWidth?: string | number
  disabled?: boolean
  readonly?: boolean
}>(), {
  columns: undefined,
  headingLevel: 3,
  labelPosition: undefined,
  labelWidth: undefined,
  disabled: undefined,
  readonly: undefined,
})

defineEmits<{ (e: 'unresolved', node: GrSchemaNode, name: string): void }>()

const form = useSchemaForm()

/**
 * Настройки повторителя живут в `uiSchema` под шаблонным путём массива.
 *
 * Сетку строк повторитель берёт **оттуда же**, а не от родителя: колонки
 * объекта описывают его собственные поля, и навязать их строке значит
 * перебить `ui.array.columns`, ради которого её и настраивали.
 */
const arrayUi = computed(() => form?.ui.value.fields?.[props.field.templatePath]?.array)

/**
 * Вниз уезжает только `true`.
 *
 * `GrSchemaField` резолвит `props.disabled ?? uiSchema ?? форма`, и литеральное
 * `false` короткозамкнуло бы оба нижних яруса: поле, выключенное через
 * `uiSchema`, оставалось бы доступным. Здесь `false` значит «мнения нет», а не
 * «включено».
 */
const forcedDisabled = computed(() => props.disabled || undefined)
const forcedReadonly = computed(() => props.readonly || undefined)

const isRepeater = computed(() => props.field.node.kind === 'array' && props.field.node.item.kind === 'object')
</script>

<template>
  <GrSchemaArrayField
    v-if="isRepeater"
    :node="(field.node as never)"
    :path="field.templatePath"
    :name="field.name"
    :indices="field.indices"
    :ui="arrayUi"
    :heading-level="headingLevel"
    :disabled="forcedDisabled"
    :readonly="forcedReadonly"
    class="col-span-full"
  />
  <GrSchemaUnionField
    v-else-if="field.node.kind === 'union'"
    :node="field.node"
    :path="field.templatePath"
    :name="field.name"
    :indices="field.indices"
    :columns="columns"
    :heading-level="headingLevel"
    class="col-span-full"
  />
  <SchemaObjectNode
    v-else-if="field.node.kind === 'object'"
    :node="field.node"
    :path="field.templatePath"
    :name="field.name"
    :indices="field.indices"
    :columns="columns"
    :heading-level="headingLevel"
    class="col-span-full"
  />
  <GrSchemaField
    v-else
    :node="field.node"
    :path="field.templatePath"
    :name="field.name"
    :indices="field.indices"
    :label-position="labelPosition"
    :label-width="labelWidth"
    :disabled="forcedDisabled"
    :readonly="forcedReadonly"
    @unresolved="(node, name) => $emit('unresolved', node, name)"
  />
</template>
