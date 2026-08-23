<script setup lang="ts">
/**
 * Дискриминированное объединение: переключатель ветки и поля выбранного варианта.
 *
 * Объединение — **структура**, а не контрол, поэтому оно ветвится здесь, рядом с
 * объектом и повторителем, а не записью в реестре рендереров. Запись отдала бы
 * один `GrFormField` с одной подписью на группу полей.
 *
 * Дискриминатор рисуется тем же контролом, что и любое перечисление: до порога
 * — переключателями, дальше — списком. Пользователю незачем знать, что за этим
 * стоит объединение схем, а не обычное поле «способ доставки».
 */
import { computed } from 'vue'

import GrFormField from '@feugene/granularity/components/GrFormField'
import GrFormSection from '@feugene/granularity/components/GrFormSection'
import GrRadioGroup from '@feugene/granularity/components/GrRadioGroup'
import GrSelect from '@feugene/granularity/components/GrSelect'

import { defaultValueFor, unionOptions, unionVariantFor } from '../../model'
import type { GrSchemaUnionNode } from '../../model'
import type { GrUiColumns } from '../../ui-schema'

import { useSchemaForm } from './context'
import { columnsToClass, schemaGridClass } from './grSchemaFormStyles'
import SchemaObjectNode from './SchemaObjectNode.vue'

/** До этого числа веток удобнее переключатели: все варианты видны сразу. */
const RADIO_LIMIT = 5

const props = withDefaults(defineProps<{
  node: GrSchemaUnionNode
  path: string
  name: string
  indices?: number[]
  columns?: GrUiColumns
  headingLevel?: 2 | 3 | 4 | 5 | 6
}>(), {
  indices: undefined,
  columns: undefined,
  headingLevel: 3,
})

const form = useSchemaForm()

const options = computed(() => unionOptions(props.node))
const discriminator = computed(() => props.node.discriminator ?? '')
const tagName = computed(() => `${props.name}.${discriminator.value}`)

const current = computed(() => {
  const value = form?.valueAt(props.name)

  return value !== null && typeof value === 'object' ? value as Record<string, unknown> : undefined
})

/**
 * Тег ветки. `undefined` — ветка не выбрана.
 *
 * Контролам выбора пустота отдаётся пустой строкой: их модель не принимает ни
 * `null`, ни `undefined`, а пустая строка ни одному тегу не равна, поэтому
 * ничего не выделяется. В саму форму при этом не пишется ничего — это про
 * отображение, а не про значение.
 */
const tag = computed<string | number | undefined>(() => {
  const value = current.value?.[discriminator.value]

  return typeof value === 'string' || typeof value === 'number' ? value : undefined
})
const variant = computed(() => unionVariantFor(props.node, tag.value))

const ui = computed(() => form?.ui.value.fields?.[tagName.value.replace(props.name, props.path)])
const gridClass = computed(() => [schemaGridClass, columnsToClass(props.columns)])
const hasHeading = computed(() => Boolean(props.node.title))

/**
 * Подпись переключателя видима только там, где заголовка раздела нет: иначе
 * «Доставка» стояло бы дважды подряд — заголовком и подписью поля. Диктору она
 * нужна в обоих случаях, поэтому уходит в `aria-label`.
 */
const switcherLabel = computed(() => ui.value?.label ?? props.node.title)

/**
 * Смена ветки переписывает значение целиком.
 *
 * Ключи, которые есть и в новой ветке, переживают переключение — у вариантов
 * обычно совпадает половина полей, и терять введённое при каждом клике незачем.
 * Чужие ключи отбрасываются: схема на них ругнётся, а пользователь не поймёт,
 * откуда взялась ошибка в поле, которого он не видит.
 */
function switchTo(next: unknown): void {
  const target = unionVariantFor(props.node, next)

  if (!target)
    return

  const previous = current.value ?? {}
  const value: Record<string, unknown> = {}

  for (const field of target.fields) {
    value[field.key] = field.key === discriminator.value
      ? next
      : (field.key in previous ? previous[field.key] : defaultValueFor(field))
  }

  form?.setValueAt(props.name, value)
}
</script>

<template>
  <component
    :is="hasHeading ? GrFormSection : 'div'"
    v-bind="hasHeading ? { title: node.title, description: node.description, headingLevel } : {}"
    data-gr-schema-union
  >
    <div :class="gridClass">
      <GrFormField
        :name="tagName"
        :label="hasHeading ? undefined : switcherLabel"
        :hint="ui?.hint"
        required
        class="col-span-full"
      >
        <GrRadioGroup
          v-if="options.length <= RADIO_LIMIT"
          :model-value="tag ?? ''"
          :options="options"
          :aria-label="hasHeading ? switcherLabel : undefined"
          @update:model-value="switchTo"
        />
        <GrSelect
          v-else
          :model-value="tag ?? ''"
          :options="options"
          :placeholder="ui?.placeholder"
          :aria-label="hasHeading ? switcherLabel : undefined"
          @update:model-value="switchTo"
        />
      </GrFormField>

      <SchemaObjectNode
        v-if="variant"
        :node="variant"
        :path="path"
        :name="name"
        :indices="indices"
        :columns="columns"
        :heading-level="headingLevel"
        :omit="[discriminator]"
        plain
        class="col-span-full"
      />
    </div>
  </component>
</template>
