<script setup lang="ts">
/**
 * Объектный узел схемы: заголовок раздела и сетка его полей.
 *
 * Не публичный компонент, а внутренний: объектный узел — это `GrFormSection`
 * плюс N полей, и отдельная публичная поверхность не дала бы ничего сверх этих
 * двух строк, зато оплатила бы subpath, страницу доки и запись в реестрах.
 *
 * Живёт в директории семейства, как `GrSidebarGroup` у сайдбара: общий SFC
 * внутри одного дескриптора попадает в `dist/components/GrSchemaForm/**`,
 * который пресет сканирует, — поле `group` нужно только тем, кто делит SFC
 * между **разными** дескрипторами.
 */
import { computed } from 'vue'

import GrFormSection from '@feugene/granularity/components/GrFormSection'

import type { GrSchemaObjectNode } from '../../model'
import type { GrUiColumns } from '../../ui-schema'

import { useSchemaForm } from './context'
import GrSchemaArrayField from './GrSchemaArrayField.vue'
import GrSchemaField from './GrSchemaField.vue'
import { columnsToClass, schemaGridClass } from './grSchemaFormStyles'

const props = withDefaults(defineProps<{
  node: GrSchemaObjectNode
  path: string
  name: string
  indices?: number[]
  columns?: GrUiColumns
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** Без заголовка узел рисуется просто сеткой — так вложенность не плодит рамки. */
  plain?: boolean
}>(), {
  indices: undefined,
  columns: undefined,
  headingLevel: 3,
  plain: false,
})

const form = useSchemaForm()

const fields = computed(() =>
  form?.fieldsOf(props.name, props.path, props.indices ?? []) ?? [])

/** Настройки повторителя живут в `uiSchema` под шаблонным путём массива. */
function arrayUi(templatePath: string) {
  return form?.ui.value.fields?.[templatePath]?.array
}

const gridClass = computed(() => [schemaGridClass, columnsToClass(props.columns)])
const hasHeading = computed(() => !props.plain && Boolean(props.node.title))
</script>

<template>
  <GrFormSection
    v-if="hasHeading"
    :title="node.title"
    :description="node.description"
    :heading-level="headingLevel"
    data-gr-schema-object
  >
    <div :class="gridClass">
      <template v-for="field in fields" :key="field.name">
        <GrSchemaArrayField
          v-if="field.node.kind === 'array' && field.node.item.kind === 'object'"
          :node="field.node"
          :path="field.templatePath"
          :name="field.name"
          :indices="field.indices"
          :ui="arrayUi(field.templatePath)"
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
        />
      </template>
    </div>
  </GrFormSection>

  <div v-else :class="gridClass" data-gr-schema-object>
    <template v-for="field in fields" :key="field.name">
      <GrSchemaArrayField
        v-if="field.node.kind === 'array' && field.node.item.kind === 'object'"
        :node="field.node"
        :path="field.templatePath"
        :name="field.name"
        :indices="field.indices"
        :ui="arrayUi(field.templatePath)"
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
      />
    </template>
  </div>
</template>
