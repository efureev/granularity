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
import GrSchemaAdditionalFields from './GrSchemaAdditionalFields.vue'
import SchemaNodeSwitch from './SchemaNodeSwitch.vue'
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
  /**
   * Ключи, которые рисует кто-то другой.
   *
   * Нужно объединению: дискриминатором управляет его переключатель, и второе
   * поле с тем же именем спорило бы с ним за значение.
   */
  omit?: readonly string[]
}>(), {
  indices: undefined,
  columns: undefined,
  headingLevel: 3,
  plain: false,
  omit: undefined,
})

const form = useSchemaForm()

const fields = computed(() => {
  const all = form?.fieldsOf(props.name, props.path, props.indices ?? []) ?? []
  const omit = props.omit

  return omit && omit.length > 0 ? all.filter(field => !omit.includes(field.node.key)) : all
})

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
        <SchemaNodeSwitch
          :field="field"
          :columns="columns"
          :heading-level="headingLevel"
        />
      </template>

      <GrSchemaAdditionalFields
        v-if="node.additional && node.additionalValue"
        :node="node"
        :path="path"
        :name="name"
        :indices="indices"
        class="col-span-full"
      />
    </div>
  </GrFormSection>

  <div v-else :class="gridClass" data-gr-schema-object>
    <template v-for="field in fields" :key="field.name">
      <SchemaNodeSwitch
        :field="field"
        :columns="columns"
        :heading-level="headingLevel"
      />
    </template>

    <GrSchemaAdditionalFields
      v-if="node.additional && node.additionalValue"
      :node="node"
      :path="path"
      :name="name"
      :indices="indices"
      class="col-span-full"
    />
  </div>
</template>
